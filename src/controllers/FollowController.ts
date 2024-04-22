import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { getFollowById, addFollow, removeFollow } from '../models/FollowModel';
import { parseDatabaseError } from '../utils/db-utils';
import { hasUnreadNotifications } from '../models/NotificationsModel';
import { getFriendStatus } from '../models/FriendListModel';

async function followUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  if (targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to follow themself
    return;
  }

  // get users and see if there is already a follow entity
  const targetUser = await getUserById(targetUserId);
  const followData = await getFollowById(targetUserId + authenticatedUser.userId);

  if (!targetUser || followData) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user is already following them
    return;
  }

  // see if user is blocked
  const friendStatus = await getFriendStatus(authenticatedUser.userId, targetUserId);

  if (friendStatus === "THEY BLOCKED" || friendStatus === "I BLOCKED") {
    res.redirect(`/users/${authenticatedUser.userId}`); // can't follow user that has blocked them or they need to unblock them first
    return;
  }

  // add follow
  try {
    await addFollow(authenticatedUser.userId, targetUserId);
    res.redirect(`/users/${targetUserId}`);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function unfollowUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  if (targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to unfollow themself
    return;
  }

  // get users and see if there is a follow entity
  const targetUser = await getUserById(targetUserId);
  const followData = await getFollowById(`${targetUserId}<+>${authenticatedUser.userId}`);

  if (!targetUser || !followData) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user isn't following them
    return;
  }

  // unfollow
  await removeFollow(authenticatedUser.userId, targetUserId);
  res.redirect(`/users/${targetUserId}`);
}

// remove a follower
async function removeFollower(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  if (targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to unfollow themself
    return;
  }

  // get user and see if there is a follow entity
  const targetUser = await getUserById(targetUserId);
  const followData = await getFollowById(`${authenticatedUser.userId}<+>${targetUserId}`);

  if (!targetUser || !followData) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user isn't following them
    return;
  }

  // remove follower
  await removeFollow(targetUserId, authenticatedUser.userId);
  res.redirect(`/users/${targetUserId}`);
}

async function renderFollowingPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('following', { user: targetUser, viewingUser, hasUnread, });
}

async function renderFollowersPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user does not exist
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('followers', { user: targetUser, viewingUser, hasUnread });
}

export { followUser, unfollowUser, removeFollower, renderFollowingPage, renderFollowersPage };
