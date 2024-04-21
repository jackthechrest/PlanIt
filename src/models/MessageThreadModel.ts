import { Like, Or } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { MessageThread } from '../entities/MessageThread';
import { User } from '../entities/User';
import { hasUnreadMessages } from './MessageModel';

const messageThreadRepository = AppDataSource.getRepository(MessageThread);

async function getAllMessagesThreadsForUserId(userId: string): Promise<MessageThread[]> {
  const messageThreads = await messageThreadRepository.findBy({ messageThreadId: Or(Like(`${userId}%`), Like(`%${userId}`))
  });
  return messageThreads;
}

async function getMessageThreadById(messageThreadId: string): Promise<MessageThread | null> {
  const messageThread = await messageThreadRepository.findOne({ where: { messageThreadId }, 
    relations: [
      'messages',
    ],
  });
  return messageThread;
}

async function createMessageThread(user1: User, user2: User): Promise<MessageThread | null> {
  let newMessageThread = new MessageThread();
  newMessageThread.messageThreadId = user1.userId + '<+>' + user2.userId;
  newMessageThread.user1Id = user1.userId;
  newMessageThread.user1Username = user1.username;
  newMessageThread.user1DisplayName = user1.displayName;
  newMessageThread.user1PictureOptions = user1.pictureOptions;
  newMessageThread.user2Id = user2.userId;
  newMessageThread.user2Username = user2.username;
  newMessageThread.user2DisplayName = user2.displayName;
  newMessageThread.user2PictureOptions = user2.pictureOptions;
  newMessageThread.lastDateSent = new Date();
  newMessageThread.lastDateString = newMessageThread.lastDateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  newMessageThread.lastSecondsSinceEnoch = newMessageThread.lastDateSent.getTime() / 1000;

  newMessageThread = await messageThreadRepository.save(newMessageThread);

  return newMessageThread;
}

async function updateMessageThread(messageThreadId: string, updatedDate: Date, userId: string): Promise<MessageThread> {
  let updatedMessageThread = await getMessageThreadById(messageThreadId);
  updatedMessageThread.lastDateSent = updatedDate;
  updatedMessageThread.lastDateString = updatedDate.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  updatedMessageThread.lastSecondsSinceEnoch = updatedDate.getTime() / 1000;

  if (userId === updatedMessageThread.user1Id) {
    updatedMessageThread.user1BeenRead = false;
  } else if (userId === updatedMessageThread.user2Id) {
    updatedMessageThread.user2BeenRead = false;
  }

  updatedMessageThread = await messageThreadRepository.save(updatedMessageThread);

  return updatedMessageThread;
}

async function setThreadRead(messageThreadId: string, userId: string): Promise<void> {
  let updatedMessageThread = await getMessageThreadById(messageThreadId);

  if (userId === updatedMessageThread.user1Id) {
    updatedMessageThread.user1BeenRead = true;
  } else if (userId === updatedMessageThread.user2Id) {
    updatedMessageThread.user2BeenRead = true;
  }

  await messageThreadRepository.save(updatedMessageThread);
}

async function hasUnreadMessageThreads(userId: string): Promise<boolean> {
  const messageThreads = await messageThreadRepository.findBy({ messageThreadId: Or(Like(`${userId}<+>%`), Like(`%<+>${userId}`))
  });

  let unreadMessage = false;

  for (const thread of messageThreads) {
    unreadMessage = await hasUnreadMessages(thread.messageThreadId, userId);
    if (unreadMessage === true) {
      return true;
    } 
  }

  return unreadMessage;
}

async function updateMessageThreads(userId: string, displayName: string, profileBackground: ProfileColors, profileHead: ProfileColors, profileBody: ProfileColors): Promise<void> {
  const messageThreads = await messageThreadRepository.findBy({ messageThreadId: Or(Like(`${userId}<+>%`), Like(`%<+>${userId}`))});

  for (const thread of messageThreads) {
    if (userId === thread.user1Id) {
      if (displayName.length !== 0) {
        thread.user1DisplayName = displayName;
      }

      if (profileBackground !== "no change") {
        thread.user1PictureOptions[0] = profileBackground;
      }
    
      if (profileHead !== "no change") {
        thread.user1PictureOptions[1] = profileHead;
      }
    
      if (profileBody !== "no change") {
        thread.user1PictureOptions[2] = profileBody;
      }
    } else if (userId === thread.user2Id) {
      if (displayName.length !== 0) {
        thread.user2DisplayName = displayName;
      }

      if (profileBackground !== "no change") {
        thread.user2PictureOptions[0] = profileBackground;
      }
    
      if (profileHead !== "no change") {
        thread.user2PictureOptions[1] = profileHead;
      }
    
      if (profileBody !== "no change") {
        thread.user2PictureOptions[2] = profileBody;
      }
    }
    await messageThreadRepository.save(thread);
  }
}

async function removeMessageThreadData(requestingUserId: string): Promise<void> {
  const messageThreads = await getAllMessagesThreadsForUserId(requestingUserId);

  for (const messageThread of messageThreads) {
    let threadId = messageThread.messageThreadId;
    await messageThreadRepository
    .createQueryBuilder('messageThread')
    .delete()
    .where('messageThreadId = :threadId', { threadId })
    .execute();
  }
}

export { getAllMessagesThreadsForUserId, getMessageThreadById, createMessageThread, 
         updateMessageThread, setThreadRead, hasUnreadMessageThreads, updateMessageThreads, removeMessageThreadData }