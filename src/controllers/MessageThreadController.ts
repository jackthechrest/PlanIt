import { Request, Response } from 'express';
import { getUserById } from '../models/UserModel';
import { getAllMessagesThreadsForUserId, getMessageThreadById, setThreadRead } from '../models/MessageThreadModel'; 
import { getAllMessagesByThreadId } from '../models/MessageModel';
import { hasUnreadNotifications } from '../models/NotificationsModel';
import { getFriendStatus } from '../models/FriendListModel';

async function renderAllMessageThreads(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
  
    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }

    const user = await getUserById(authenticatedUser.userId)
    const messageThreads = await getAllMessagesThreadsForUserId(authenticatedUser.userId);
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);

    res.render('messages', { user, messageThreads, hasUnread, });
}

async function renderSingleMessageThread(req: Request, res: Response): Promise<void> {
    const { isLoggedIn, authenticatedUser } = req.session;
    const { messageThreadId } = req.params;

  
    if (!isLoggedIn) {
      res.redirect('/login'); // not logged in
      return;
    }

    const messageThread = await getMessageThreadById(messageThreadId);

    if (!messageThread) {
        res.redirect('/send'); // message thread does not exist
        return;
    }

    if (authenticatedUser.userId !== messageThread.user1Id && authenticatedUser.userId !== messageThread.user2Id) {
        res.redirect('/send'); // user is trying to view someone else's messages
        return;
    }

    // find the other user id
    let otherUserId = messageThread.user1Id;

    if (authenticatedUser.userId === messageThread.user1Id) {
        otherUserId = messageThread.user2Id;
    }

    // get users
    const user = await getUserById(authenticatedUser.userId);
    const otherUser = await getUserById(otherUserId);

    if (!otherUser) {
        res.redirect('/messages'); // other user does not exist
        return;
    }

    await setThreadRead(messageThreadId, authenticatedUser.userId);

    const messages = await getAllMessagesByThreadId(messageThreadId, authenticatedUser.userId);
    const hasUnread = await hasUnreadNotifications(authenticatedUser.userId);
    const friendStatus = await getFriendStatus(authenticatedUser.userId, otherUser.userId);

    res.render('messageThread', { user, otherUser, messageThread, messages, hasUnread, friendStatus });
}

export { renderAllMessageThreads, renderSingleMessageThread }