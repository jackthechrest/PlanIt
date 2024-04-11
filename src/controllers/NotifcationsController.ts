import { Request, Response } from 'express';
import { getAllOtherNotificationsForUserId } from '../models/NotificationsModel';
import { getUserById } from '../models/UserModel';

async function renderNotifications(req: Request, res: Response): Promise<void> {
    const { authenticatedUser, isLoggedIn } = req.session;
    const { targetUserId } = req.params;

    // Get the user account
    let user = await getUserById(targetUserId);

    if (!isLoggedIn || !user) {
        res.redirect('/login');
        return;
    }

    if (authenticatedUser.userId !== user.userId) {
        res.redirect(`/users/${authenticatedUser.userId}`);
        return;
    }

    const notifications = await getAllOtherNotificationsForUserId(targetUserId);
    
    res.render('notifications', {user, notifications})
}

export { renderNotifications };