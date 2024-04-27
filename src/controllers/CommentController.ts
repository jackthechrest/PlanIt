import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils'
import { createNewComment, getCommentById } from '../models/CommentModel';
import { getEventById, getEventStatusForUser } from '../models/EventModel';
import { getFriendStatus } from '../models/FriendListModel';
import { getUserById } from '../models/UserModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';


async function postNewComment(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { commentText, eventId } = req.body;

    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    const event = await getEventById(eventId);

    if (!event) {
        res.redirect(`/users/${authenticatedUser.userId}`); // event doesn't exist
        return;
    }

    if (!authenticatedUser.isAdmin) {
        const friendStatus = await getFriendStatus(authenticatedUser.userId, event.owner.userId);
        const eventStatus = await getEventStatusForUser(eventId, authenticatedUser.userId);

        if (eventStatus === "BANNED" || friendStatus === "I BLOCKED" || friendStatus ==="THEY BLOCKED") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }

        if (event.visibilityLevel === "Friends Only" && friendStatus !== "FRIEND") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }

        if (event.visibilityLevel === "Invite Only" && eventStatus !== "INVITED") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }
    }

    try {
        await createNewComment(commentText, eventId, authenticatedUser.userId);
        res.redirect(`/events/${eventId}`);
    } catch (err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
}

async function renderComment(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { eventID, commentId } = req.params;

    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    const event = await getEventById(eventID);
    const comment = await getCommentById(commentId);

    if (!event || !comment) {
        res.redirect(`/users/${authenticatedUser.userId}`); // comment doesn't exist
        return;
    }

    if (!authenticatedUser.isAdmin) {
        const friendStatus = await getFriendStatus(authenticatedUser.userId, event.owner.userId);
        const eventStatus = await getEventStatusForUser(eventID, authenticatedUser.userId);

        if (eventStatus === "BANNED" || friendStatus === "I BLOCKED" || friendStatus ==="THEY BLOCKED") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }

        if (event.visibilityLevel === "Friends Only" && friendStatus !== "FRIEND") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }

        if (event.visibilityLevel === "Invite Only" && eventStatus !== "INVITED") {
            res.redirect(`/users/${authenticatedUser.userId}`);
            return;
        }
    }

    const viewingUser = await getUserById(authenticatedUser.userId);
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

    res.render(`comment`, { comment, viewingUser, hasUnread });
}

export { postNewComment, renderComment }