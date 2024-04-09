import { AppDataSource } from '../dataSource';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { getMessageThreadById } from './MessageThreadModel';

const messageRepository = AppDataSource.getRepository(Message);

async function getAllMessagesByThreadId(messageThreadId: string): Promise<Message[]> {
  const messageThread = await getMessageThreadById(messageThreadId);

  const messages = await messageRepository
    .createQueryBuilder('message')
    .where('thread = :messageThread', {messageThread})
    .getMany();

  return messages;
}

async function createNewMessage(messageThreadId: string, sender: User, receiver: User, body: string): Promise<Message | null> {
  const messageThread = await getMessageThreadById(messageThreadId);

  let newMessage = new Message();
  newMessage.type = 'MESSAGE';
  newMessage.dateSent = new Date();
  newMessage.thread = messageThread;
  newMessage.sendingUser = sender;
  newMessage.receivingUser = receiver;
  newMessage.body = body;

  newMessage = await messageRepository.save(newMessage);

  return newMessage;
}

export { getAllMessagesByThreadId, createNewMessage }