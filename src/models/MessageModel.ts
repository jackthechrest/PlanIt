import { AppDataSource } from '../dataSource';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { getMessageThreadById } from './MessageThreadModel';

const messageRepository = AppDataSource.getRepository(Message);

async function getAllMessagesByThreadId(messageThreadId: string): Promise<Message[]> {

  const messages = await messageRepository.find();

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
  newMessage.receivingUser = receiver;
  newMessage.receivingUserId = receiver.userId;
  newMessage.receivingUsername = receiver.username;
  newMessage.body = body.substring(0, 100);

  newMessage = await messageRepository.save(newMessage);

  return newMessage;
}

export { getAllMessagesByThreadId, createNewMessage }