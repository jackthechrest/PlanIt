import { AppDataSource } from '../dataSource';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { getMessageThreadById, updateMessageThread } from './MessageThreadModel';

const messageRepository = AppDataSource.getRepository(Message);

async function getAllMessagesByThreadId(messageThreadId: string, receivingUserId: string): Promise<Message[]> {
  await messageRepository
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.thread', 'thread')
    .update(Message)
    .set({ beenRead: true })
    .where({ beenOpened: true })
    .andWhere('thread.messageThreadId = :messageThreadId', {messageThreadId})
    .andWhere({receivingUserId})
    .andWhere('type = \'MESSAGE\'')
    .execute();

  await messageRepository
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.thread', 'thread')
    .update(Message)
    .set({ beenOpened: true })
    .where({ beenOpened: false })
    .andWhere('thread.messageThreadId = :messageThreadId', {messageThreadId})
    .andWhere('type = \'MESSAGE\'')
    .andWhere({receivingUserId})
    .execute();

  const messages = await messageRepository.createQueryBuilder('message')
    .leftJoinAndSelect('message.thread', 'thread')
    .where('thread.messageThreadId = :messageThreadId', {messageThreadId})
    .andWhere('type = \'MESSAGE\'')
    .getMany();

  return messages;
}

async function createNewMessage(messageThreadId: string, sender: User, receiver: User, body: string): Promise<Message | null> {
  const messageThread = await getMessageThreadById(messageThreadId);

  let newMessage = new Message();
  newMessage.type = 'MESSAGE';
  newMessage.link = `/users/${sender.userId}`
  newMessage.dateSent = new Date();
  newMessage.dateString = newMessage.dateSent.toLocaleString('en-us', {month:'short', day:'numeric', year:'numeric', hour12:true, hour:'numeric', minute:'2-digit'});
  newMessage.secondsSinceEnoch = newMessage.dateSent.getTime() / 1000;
  newMessage.thread = messageThread;
  newMessage.sendingUser = sender;
  newMessage.sendingUserId = sender.userId;
  newMessage.sendingUsername = sender.username;
  newMessage.sendingDisplayName = sender.displayName;
  newMessage.sendingPictureOptions = sender.pictureOptions;
  newMessage.receivingUser = receiver;
  newMessage.receivingUserId = receiver.userId;
  newMessage.body = body.substring(0, 100);

  newMessage = await messageRepository.save(newMessage);

  await updateMessageThread(messageThreadId, newMessage.dateSent, receiver.userId);

  return newMessage;
}

async function hasUnreadMessages(messageThreadId: string, receivingUserId: string): Promise<boolean> {
  const messages = await messageRepository.createQueryBuilder('message')
  .leftJoinAndSelect('message.thread', 'thread')
  .where('thread.messageThreadId = :messageThreadId', {messageThreadId})
  .andWhere('type = \'MESSAGE\'')
  .andWhere({receivingUserId})
  .andWhere({beenOpened: false})
  .getMany();

  if (messages.length !== 0) {
    return true;
  }

  return false;
}

export { getAllMessagesByThreadId, createNewMessage, hasUnreadMessages }