import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { getFriendListById, replyFriendRequest, sendFriendRequest } from '../models/FriendListModel';
import { setResponded } from '../models/NotificationsModel';

async function friendRequestUser(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;

  const targetUser = await getUserById(targetUserId);
  
  if (!isLoggedIn) {
    res.redirect(`/login`);
    return;
  }

  if (!targetUser || targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`);
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
    res.redirect(`/login`);
    return;
  }

  if (!targetUser || targetUserId === authenticatedUser.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  if (action === "ACCEPT" || action === "DECLINE") {
    await replyFriendRequest(authenticatedUser.userId, targetUserId, action);
  }
  
  await setResponded(targetUserId, authenticatedUser.userId);

  res.redirect(`/users/${authenticatedUser.userId}/other`);
}

async function renderFriendsPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { targetUserId } = req.params;
  
  const targetUser = await getUserById(targetUserId);
  
  if (!isLoggedIn) {
    res.redirect(`/login`);
    return;
  }

  if (!targetUser) {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }

  const friendList = await getFriendListById(`FL<+>${targetUserId}`);
  const friends = friendList.friends;
  const pendingFriends = friendList.pendingFriends;
  
  res.render('friends', { user: targetUser, friends, pendingFriends });
}

export { friendRequestUser, respondFriendRequest, renderFriendsPage } 