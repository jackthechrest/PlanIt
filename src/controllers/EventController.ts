import { Request, Response } from 'express';
import { getUserById, getUserByUsername } from '../models/UserModel';
import { addNewEvent, addUserToEvent, banUserFromEvent, getEventById, getEventStatusForUser, inviteUserToEvent, removeUserFromEvent, unbanUserFromEvent, uninviteUserFromEvent } from '../models/EventModel';
import { parseDatabaseError } from '../utils/db-utils';
import { getFriendListById, getFriendStatus } from '../models/FriendListModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';

async function renderEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user not found
    return;
  }

  const friendStatus = await getFriendStatus(authenticatedUser.userId, event.owner.userId);
  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (event.visibilityLevel === "Friends Only" && friendStatus !== "FRIEND") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (event.visibilityLevel === "Invite Only" && eventStatus !== "INVITED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (friendStatus === "I BLOCKED" || friendStatus === "THEY BLOCKED" || eventStatus === "BANNED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  let joined = false;
  if (eventStatus === "JOINED") {
    joined = true;
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('event', { event, viewingUser, owningUser: event.owner, joined, hasUnread });
}

async function registerEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login');
    return;
  }

  const currentUser = await getUserById(authenticatedUser.userId);

  const {
    eventName,
    startYear,
    startMonth,
    startDay,
    startHour,
    startMinute,
    stopYear,
    stopMonth,
    stopDay,
    stopHour,
    stopMinute,
  } = req.body as EventRequest;
  const startDate = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
  const stopDate = new Date(stopYear, stopMonth - 1, stopDay, stopHour, stopMinute);

  try {
    await addNewEvent(eventName, startDate, stopDate, currentUser.userId);
    res.redirect(`/users/${authenticatedUser.userId}}/calendar`);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function joinEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);
  const friendStatus = await getFriendStatus(authenticatedUser.userId, event.owner.userId);

  if (eventStatus === "OWNER" || eventStatus === "JOINED") {
    res.redirect(`/events/${eventID}`); // user trying to join own event or has already joined
    return;
  }

  if (event.visibilityLevel === "Friends Only" && friendStatus !== "FRIEND") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (event.visibilityLevel === "Invite Only" && eventStatus !== "INVITED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (friendStatus === "I BLOCKED" || friendStatus === "THEY BLOCKED" || eventStatus === "BANNED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  await addUserToEvent(eventID, authenticatedUser.userId);
  res.redirect(`/events/${eventID}`);
}

async function leaveEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }  

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (eventStatus !== "JOINED") {
    res.redirect(`/events/${eventID}`); // user is not in the event
    return;
  }

  await removeUserFromEvent(eventID, authenticatedUser.userId);
  res.redirect(`/events/${eventID}`);
}

async function renderJoinedPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }  

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);
  const friendStatus = await getFriendStatus(authenticatedUser.userId, event.owner.userId);

  if (event.visibilityLevel === "Friends Only" && friendStatus !== "FRIEND") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (event.visibilityLevel === "Invite Only" && eventStatus !== "INVITED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (friendStatus === "I BLOCKED" || friendStatus === "THEY BLOCKED" || eventStatus === "BANNED") {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('joined', { viewingUser, owner: event.owner, event, hasUnread });
}

async function renderInvitePage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  if (event.owner.userId !== authenticatedUser.userId) {
    res.redirect(`/events/${eventID}`); // user is not owner of event
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const friendList = await getFriendListById(`FL<+>${authenticatedUser.userId}`);

  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('invite', {user, friends: friendList.friends, event, hasUnread})
}

async function inviteToEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID, username } = req.body;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  const targetedUser = await getUserByUsername(username);
  const requestEventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (!targetedUser || requestEventStatus !== "OWNER" || targetedUser.userId === authenticatedUser.userId) {
    res.redirect(`/events/${eventID}/invite`); // targeted user doesn't exist, user is not the event owner, or user trying to invite themself
    return;
  }

  const targetEventStatus = await getEventStatusForUser(eventID, targetedUser.userId);

  if (targetEventStatus !== "NONE") {
    res.redirect(`/events/${eventID}/invite`);
    return;
  }


  await inviteUserToEvent(eventID, targetedUser.userId);
  res.redirect(`/events/${eventID}/invite`);
}

async function uninviteFromEvent(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID, targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  const targetedUser = await getUserById(targetUserId);
  const requestEventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (!targetedUser || requestEventStatus !== "OWNER" || targetUserId === authenticatedUser.userId) {
    res.redirect(`/events/${eventID}/invite`); // targeted user doesn't exist, user is not the event owner, or user trying to uninvite themself
    return;
  }

  const targetEventStatus = await getEventStatusForUser(eventID, targetUserId);

  if (targetEventStatus !== "INVITED") {
    res.redirect(`/events/${eventID}/invite`);
    return;
  }

  await uninviteUserFromEvent(eventID, targetedUser.userId);
  res.redirect(`/events/${eventID}/invite`);
}

async function renderInvitedPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }  

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (eventStatus !== "OWNER") {
    res.redirect(`/events/${eventID}`);
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('invited', {event, user, hasUnread});
}

async function banUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID, targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  const requestEventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (requestEventStatus !== "OWNER" || targetUserId === authenticatedUser.userId) {
    res.redirect(`/events/${eventID}`); // trying to ban user on event that isn't theirs/ban themself
    return;
  }

  const targetUser = await getUserById(targetUserId);
  const targetEventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (!targetUser || targetEventStatus === "BANNED") {
    res.redirect(`/events/${eventID}/banned`);
  }

  await banUserFromEvent(eventID, targetUserId);
  res.redirect(`/events/${eventID}/joined`);
}

async function unbanUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID, targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (eventStatus !== "OWNER" || targetUserId === authenticatedUser.userId) {
    res.redirect(`/events/${eventID}`); // trying to unban user on event that isn't theirs/unban themself
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/events/${eventID}/banned`);
  }

  await unbanUserFromEvent(eventID, targetUserId);
  res.redirect(`/events/${eventID}/banned`);
}

async function renderBannedPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { eventID } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const event = await getEventById(eventID);

  if (!event) {
    res.redirect(`/users/${authenticatedUser.userId}`); // event does not exist
    return;
  }  

  const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

  if (eventStatus !== "OWNER") {
    res.redirect(`/events/${eventID}`);
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('banned', {event, user, hasUnread});
}

export { registerEvent, renderEvent, joinEvent, leaveEvent, renderJoinedPage, 
        renderInvitePage, inviteToEvent, renderInvitedPage, uninviteFromEvent, banUser, unbanUser, renderBannedPage };
