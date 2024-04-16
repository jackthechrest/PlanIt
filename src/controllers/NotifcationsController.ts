import { Request, Response } from 'express';
import { getAllOtherNotificationsForUserId } from '../models/NotificationsModel';
import { getUserById } from '../models/UserModel';

async function renderNotifications(req: Request, res: Response): Promise<void> {
    const { authenticatedUser, isLoggedIn } = req.session;

    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    // Get the user account
    let user = await getUserById(authenticatedUser.userId);

    const notifications = await getAllOtherNotificationsForUserId(authenticatedUser.userId);
    
    res.render('notifications', {user, notifications: notifications})
}

export { renderNotifications };