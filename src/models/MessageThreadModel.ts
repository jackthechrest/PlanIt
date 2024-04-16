import { Like, Or } from 'typeorm';
import { AppDataSource } from '../dataSource';
import { MessageThread } from '../entities/MessageThread';
import { User } from '../entities/User';

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
  newMessageThread.user2Id = user2.userId;
  newMessageThread.user2Username = user2.username;
  newMessageThread.lastDateSent = new Date();
  newMessageThread.lastDateString = newMessageThread.lastDateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  newMessageThread.lastSecondsSinceEnoch = newMessageThread.lastDateSent.getTime() / 1000;

  newMessageThread = await messageThreadRepository.save(newMessageThread);

  return newMessageThread;
}

async function updateMessageThread(messageThreadId: string, updatedDate: Date): Promise<MessageThread> {
  let updatedMessageThread = await getMessageThreadById(messageThreadId);
  updatedMessageThread.lastDateSent = updatedDate;
  updatedMessageThread.lastDateString = updatedDate.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  updatedMessageThread.lastSecondsSinceEnoch = updatedDate.getTime() / 1000;

  updatedMessageThread = await messageThreadRepository.save(updatedMessageThread);

  return updatedMessageThread;
}

export { getAllMessagesThreadsForUserId, getMessageThreadById, createMessageThread, updateMessageThread }