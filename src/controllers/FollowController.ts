import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { getFollowById, addFollow, removeFollow } from '../models/FollowModel';
import { parseDatabaseError } from '../utils/db-utils';

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
  const requestingUser = await getUserById(authenticatedUser.userId);
  const followData = await getFollowById(targetUser.userId + requestingUser.userId);

  if (!targetUser || followData) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user is already following them
    return;
  }

  // add follow
  try {
    await addFollow(requestingUser.userId, targetUserId);
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
  const requestingUser = await getUserById(authenticatedUser.userId);
  const followData = await getFollowById(targetUser.userId + requestingUser.userId);

  if (!targetUser || !followData) {
    res.redirect(`/users/${authenticatedUser.userId}`); // target user doesn't exist or user isn't following them
    return;
  }

  // unfollow
  await removeFollow(authenticatedUser.userId, targetUserId);
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

  res.render('following', { user: targetUser });
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

  res.render('followers', { user: targetUser });
}

export { followUser, unfollowUser, renderFollowingPage, renderFollowersPage };
