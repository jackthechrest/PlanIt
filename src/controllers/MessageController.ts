import { Request, Response } from 'express';
import { getUserById, getUserByUsername } from '../models/UserModel';
import { createNewMessage } from '../models/MessageModel';
import { createMessageThread, getMessageThreadById, updateMessageThread } from '../models/MessageThreadModel';
import { parseDatabaseError } from '../utils/db-utils';
import { getFriendListById, getFriendStatus } from '../models/FriendListModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';

async function sendMessage(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { username, body } = req.body;
  
    if (!isLoggedIn) {
      res.redirect('/login');
      return;
    }

    if (username === authenticatedUser.username) {
        res.redirect(`/users/${authenticatedUser.userId}`); // user is trying to message themself
        return;
    }

    const receiver = await getUserByUsername(username);

    if (!receiver) {
        res.redirect(`/users/${authenticatedUser.userId}`); // targeted user does not exist
        return;
    }

    // check that sender and receiver are friends
    const sender = await getUserById(authenticatedUser.userId);
    const friendStatus = await getFriendStatus(authenticatedUser.userId, receiver.userId);

    if (friendStatus !== "FRIEND") {
        res.redirect('/send');  // users are not friends
        return;
    }

    let messageThread = await getMessageThreadById(`${authenticatedUser.userId}<+>${receiver.userId}`);

    if (!messageThread) {
        messageThread = await getMessageThreadById(`${receiver.userId}<+>${authenticatedUser.userId}`);
        if (!messageThread) {
            try {
                messageThread = await createMessageThread(sender, receiver);
            } catch (err) {
                console.error(err);
                const databaseErrorMessage = parseDatabaseError(err);
                res.status(500).json(databaseErrorMessage);
            }
        }
    }

    try {
        const newMessage = await createNewMessage(messageThread.messageThreadId, sender, receiver, body);
        await updateMessageThread(messageThread.messageThreadId, newMessage.dateSent, receiver.userId);
        res.redirect(`/messages/${messageThread.messageThreadId}`);
    } catch (err) {
        console.error(err);
        const databaseErrorMessage = parseDatabaseError(err);
        res.status(500).json(databaseErrorMessage);
    }
}

async function renderCreateMessageThread(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }

    const user = await getUserById(authenticatedUser.userId);
    const friendList = await getFriendListById(`FL<+>${authenticatedUser.userId}`);

    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

    res.render('send', { user, friends: friendList.friends, hasUnread, });
}

export { sendMessage, renderCreateMessageThread }