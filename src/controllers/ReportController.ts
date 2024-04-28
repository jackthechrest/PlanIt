import { Request, Response } from 'express';
import { getUserById, incrementWarningCountForUser } from '../models/UserModel';
import { createReport, getAllPendingReports, getReportById, respondToReport } from '../models/ReportModel';
import { createNewNotification, hasUnreadNotifications } from '../models/NotificationsModel';
import { getEventById } from '../models/EventModel';
import { getCommentById } from '../models/CommentModel';

async function renderReports(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    if (!isLoggedIn) {
        res.redirect('/login');
        return;
    }
  
    if (!authenticatedUser.isAdmin) {
        res.redirect(`/users/${authenticatedUser.userId}`);
        return;
    }

      
    const user = await getUserById(authenticatedUser.userId);

    const pendingReports = await getAllPendingReports();
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);
  
    res.render('reports', { user, pendingReports, hasUnread, } );
}

async function sendReport(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { reportType, contentId } = req.params as ReportRequest;
  
    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    if (reportType !== "PROFILE" && reportType !== "EVENT"  && reportType !== "COMMENT") {
        res.redirect(`/users/${authenticatedUser.userId}`); // invalid report type
        return;
    }

    if (reportType === "PROFILE") {
        const user = await getUserById(contentId);
        if (!user || user.userId === authenticatedUser.userId) {
            res.redirect(`/users/${authenticatedUser.userId}`); // user doesn't exist or user is trying to report themself
            return;
        }
    }

    if (reportType === "EVENT") {
        const event = await getEventById(contentId);
        if (!event || event.owner.userId === authenticatedUser.userId) {
            res.redirect(`/users/${authenticatedUser.userId}`); // event doesn't exist or user is trying to report their own event
            return;
        }
    }

    if (reportType === "COMMENT") {
        const comment = await getCommentById(contentId);
        if (!comment || comment.commenter.userId === authenticatedUser.userId) {
            res.redirect(`/users/${authenticatedUser.userId}`); // comment doesn't exist or user is trying to report their own comment
            return;
        }
    }
    
    const report = await getReportById(`${reportType.charAt(0)}-${contentId}`);

    if (report) {
        res.redirect(`/users/${authenticatedUser.userId}`); // report already exists
        return;
    }

    await createReport(reportType, contentId);

    res.redirect(`/users/${authenticatedUser.userId}`);
}

async function respondReport(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { contentId, action } = req.params;
  
    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    if (!authenticatedUser.isAdmin) {
        res.redirect(`/users/${authenticatedUser.userId}`); // user is not admin
        return;
    }

    if (action !== "VALID" && action !== "INVALID") {
        res.redirect('/reports'); // invalid action
        return;
    }

    const report = await getReportById(contentId);

    if (!report) {
        res.redirect('/reports'); // report doesn't exist
        return;
    }

    let isValid = false;
    if (action === "VALID") {
        isValid = true;
        await createNewNotification(report.sendingUser.userId, report.receivingUser.userId, "WARNING")
        await incrementWarningCountForUser(report.sendingUser.userId)
    }
     
    await respondToReport(contentId, isValid);
    res.redirect('/reports');
}

export { renderReports, sendReport, respondReport }