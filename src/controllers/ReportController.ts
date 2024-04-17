import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { getAllPendingReports } from '../models/ReportModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';

async function renderReports(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    const user = await getUserById(authenticatedUser.userId);
  
    if (!isLoggedIn || !user) {
        res.redirect('/login');
        return;
    }
  
    if (!authenticatedUser.isAdmin) {
        res.redirect(`/users/${authenticatedUser.userId}`);
        return;
    }

    const pendingReports = await getAllPendingReports();
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);
  
    res.render('reports', { user, pendingReports, hasUnread, } );
}

export { renderReports }