import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { blockUserById, getFriendListById, removeFriend, replyFriendRequest, sendFriendRequest, unblockUserById } from '../models/FriendListModel';

async function friendRequestUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;
  
  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser || targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user is trying to friend themself
    return;
  }

  await sendFriendRequest(authenticatedUser.userId, targetUserId);

  res.redirect(`/users/${targetUserId}`);
}

async function respondFriendRequest(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId, action } = req.params;

  const targetUser = await getUserById(targetUserId);
  
  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  if (!targetUser || targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user is trying to friend themself
    return;
  }

  // only reply to friend request if the appropriate actions are used
  if (action === "ACCEPT" || action === "DECLINE") {
    await replyFriendRequest(authenticatedUser.userId, targetUserId, action);
  }

  res.redirect(`/notifications`);
}

async function renderFriendsPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;
  
  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist
    return;
  }

  // get friend list data
  const friendList = await getFriendListById(`FL<+>${targetUserId}`);
  
  res.render('friends', { user: targetUser, friends: friendList.friends });
}

async function unfriendUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;
  
  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser || targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user is trying to unfriend themself
    return;
  }

  await removeFriend(authenticatedUser.userId, targetUserId);
  res.redirect(`/users/${targetUserId}`);
}

async function blockUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  if (targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`) // user is trying to block themself
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`) // target user doesn't exist
    return;
  }

  await blockUserById(authenticatedUser.userId, targetUserId);

  res.redirect(`/users/${targetUserId}`);
}

async function unblockUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  if (targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to unblock themself
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`) // target user doesn't exist
    return;
  }

  await unblockUserById(authenticatedUser.userId, targetUserId);

  res.redirect(`/users/${targetUserId}`);
}

async function renderBlockedPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;
  
  if (!isLoggedIn) {
    res.redirect(`/login`); // not logged in
    return;
  }

  if (targetUserId !== authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to view someone else's block list
    return;
  }

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist
    return;
  }

  // get block list data
  const friendList = await getFriendListById(`FL<+>${targetUserId}`);
  
  res.render('blocked', { user: targetUser, blockedUsers: friendList.blockedUsers });
}

export { friendRequestUser, respondFriendRequest, renderFriendsPage, unfriendUser, blockUser, unblockUser, renderBlockedPage } 