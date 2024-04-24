import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils'
import { createNewComment } from '../models/CommentModel';
import { getEventById } from '../models/EventModel';


async function postNewComment(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { commentBody, eventId } = req.body;

    if (!isLoggedIn) {
        res.redirect('/login'); // not logged in
        return;
    }

    const event = await getEventById(eventId);

    if (!event) {
        res.redirect(`/users/${authenticatedUser.userId}`); // event doesn't exist
        return;
    }

    let joinedEvent = false;
    for (const user of event.joinedUsers) {
        if (user.userId === authenticatedUser.userId) {
            joinedEvent = true;
            break;
        }
    }

    if (!joinedEvent) {
        res.redirect(`/events/${eventId}`);
        return;
    }

    try {
        await createNewComment(commentBody, eventId, authenticatedUser.userId);
        res.redirect(`/events/${eventId}`);
    } catch (err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
}

export { postNewComment }