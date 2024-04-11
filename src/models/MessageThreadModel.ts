import { AppDataSource } from '../dataSource';
import { MessageThread } from '../entities/MessageThread';
import { User } from '../entities/User';

const messageThreadRepository = AppDataSource.getRepository(MessageThread);

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

  newMessageThread = await messageThreadRepository.save(newMessageThread);

  return newMessageThread;
}

export { getMessageThreadById, createMessageThread}