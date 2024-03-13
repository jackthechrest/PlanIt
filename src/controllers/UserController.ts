import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addNewUser, getUserByEmail, getUserByUsername } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';

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
      `Thank you for joining PlanIt!\nMake sure to read up on the rules and verify your email!
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

  res.redirect('/loggedin');
}

export { registerUser, logIn };
