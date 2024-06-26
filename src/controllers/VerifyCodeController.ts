import { Request, Response } from 'express';
import argon2 from 'argon2';
import { parseDatabaseError } from '../utils/db-utils';
import { sendEmail } from '../services/emailService';
import { getUserById, setVerifiedByUserId } from '../models/UserModel';
import { generateVerifyCode } from '../models/VerifyCodeModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';

async function sendVerification(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;

    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }
  
    const user = await getUserById(authenticatedUser.userId);
    if (!user) {
      res.redirect('/login');
      return;
    }
    try {
      const verifyCode = await generateVerifyCode(user.userId);

      if (!user.verifiedEmail && verifyCode) {
        await sendEmail(user.email, 'PlanIt: Verify Your Email', 
          `Hello, ${user.username}.
          \nWe have received a request to verify this email.  Here is the code:
          \n\n${verifyCode}
          \n\n If you did not request this, your account may be compromised.
          \nPlease reply to this email if this is the case.
          \n\nBest,\nPlanIt Administration`);
      }

      const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

      res.render('verify', { user, hasUnread, });
    } catch (err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
  }
  
  async function verifyEmail(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { verifyCode } = req.body as VerifyRequest;

    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }
  
    const user = await getUserById(authenticatedUser.userId);
    if (!user) {
      res.redirect('/login');
      return;
    }
  
    const { codeHash } = user.code;
    if (!(await argon2.verify(codeHash, verifyCode))) {
      res.redirect('/verify');
      return;
    }

    await setVerifiedByUserId(user.userId);
    await sendEmail(user.email, 'PlanIt: Your Email is Verified!', 
      `Hello, ${user.username}.
      \nThe verification code was entered, so this email has been verified!
      \nIf you did not request this, your account may be compromised.
      \nPlease reply to this email if this is the case.
      \n\nBest,\nPlanIt Administration`);
  
    res.redirect(`/users/${user.userId}`);
  }

export { sendVerification, verifyEmail }