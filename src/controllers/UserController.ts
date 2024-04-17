import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addNewUser, deleteUserById, getUserByEmail, getUserById, getUserByUsername } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';
import { getFollowById } from '../models/FollowModel';
import { getFriendStatus } from '../models/FriendListModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, displayName, email, password } = req.body as RegisterRequest;

  // don't let account be made if username or email is already taken
  let user = await getUserByUsername(username);
  if (user) {
    res.redirect('/register');
    return;
  }

  user = await getUserByEmail(email);
  if (user) {
    res.redirect('/register');
    return;
  }

  const passwordHash = await argon2.hash(password);

  try {
    await addNewUser(username, displayName, email, passwordHash);
    await sendEmail(email, 'Welcome to PlanIt!', 
      `Thank you for joining PlanIt, ` + username + `!
      \nMake sure to read up on the rules and verify your email!
      \n\nBest,\nPlanIt Administration`);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginRequest;

  const user = await getUserByEmail(email);
  if (!user) {
    res.redirect('/login');
    return;
  }

  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect('/login');
    return;
  }

  await req.session.clearSession();
  req.session.authenticatedUser = {
    userId: user.userId,
    username: user.username,
    isAdmin: user.isAdmin,
  };
  req.session.isLoggedIn = true;

  res.redirect(`/users/${user.userId}`);
}

async function getUserProfileData(req: Request, res: Response): Promise<void> {
  const { targetUserId } = req.params as UserIdParam;
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }
 
  // Get the user account
  let user = await getUserById(targetUserId);

  if (!user) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user not found
    return;
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const targetFollow = await getFollowById(user.userId + viewingUser.userId);
  const friendStatus = await getFriendStatus(viewingUser.userId, user.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('profilePage', {
    user,
    viewingUser,
    following: targetFollow,
    friendStatus,
    hasUnread,
  });
}

async function deleteAccount(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  const { email, password } = req.body as LoginRequest;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const user = await getUserByEmail(email);
  if (!user || authenticatedUser.userId !== user.userId) {
    res.redirect(`/users/${authenticatedUser.userId}`); // user not found or it is not the user's account
    return;
  }

  const { passwordHash } = user;

  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect(`/users/${authenticatedUser.userId}`); // Wrong password
  }

  await deleteUserById(authenticatedUser.userId);

  res.redirect('/index');
}

async function logoRedirect(req: Request, res: Response): Promise<void> {
  const {isLoggedIn, authenticatedUser} = req.session;

  // clicking on logo should take user to their profile if they're logged in
  // and to the index page otherwise
  if (isLoggedIn) {
    res.redirect(`/users/${authenticatedUser.userId}`);
    return;
  }
  res.redirect('/index');
}

async function renderSettings(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('settings', { user, hasUnread, });
}

async function renderDelete(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('delete', { user, hasUnread });
}

async function renderCalendar(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  res.redirect('/calendar');
}

async function renderSearch(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.redirect('/login'); // not logged in
    return;
  }

  const user = await getUserById(authenticatedUser.userId);
  const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

  res.render('search', { user, hasUnread, });
}

export { registerUser, logIn, getUserProfileData, deleteAccount, logoRedirect,
         renderSettings, renderDelete, renderCalendar, renderSearch, };
