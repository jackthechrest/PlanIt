import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addNewUser, deleteUserById, getUserByEmail, getUserById, getUserByUsername } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';
import { getFollowById } from '../models/FollowModel';
import { getFriendStatus } from '../models/FriendListModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, displayName, email, password } = req.body as RegisterRequest;

  const user = await getUserByUsername(username);
  if (user) {
    res.sendStatus(409);
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
  
  // Get the user account
  let user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  const viewingUser = await getUserById(authenticatedUser.userId);
  const targetFollow = await getFollowById(user.userId + viewingUser.userId);
  const friendStatus = await getFriendStatus(viewingUser.userId, user.userId);

  res.render('profilePage', {
    user,
    viewingUser: viewingUser,
    loggedIn: isLoggedIn,
    following: targetFollow,
    friendStatus: friendStatus,
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
  if (!user) {
    res.redirect('/users/' + authenticatedUser.userId); // 404 Not Found - email doesn't exist
    return;
  }

  if (authenticatedUser.userId !== user.userId) {
    res.redirect('/users/' + authenticatedUser.userId); // trying to delete someone elses account
    return;
  }

  const { passwordHash } = user;

  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect('/users/' + authenticatedUser.userId); // 404 not found - user w/ email/password doesn't exist
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
  const { isLoggedIn } = req.session;
  const { targetUserId } = req.params;

  const user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  res.render('settings', { user });
}

async function renderDelete(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;
  const { targetUserId } = req.params;

  const user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  res.render('delete', { user });
}

async function renderCalendar(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;
  const { targetUserId } = req.params;

  const user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  res.redirect('/calendar');
}

async function renderSearch(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;
  const { targetUserId } = req.params;

  const user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  res.render('search', { user });
}

async function renderMessages(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;
  const { targetUserId } = req.params as UserIdParam;

  const user = await getUserById(targetUserId);

  if (!isLoggedIn || !user) {
    res.redirect('/login');
    return;
  }

  res.render('messages', { user });
}

export { registerUser, logIn, getUserProfileData, deleteAccount, logoRedirect, 
         renderSettings, renderDelete, renderCalendar, renderSearch, renderMessages };
