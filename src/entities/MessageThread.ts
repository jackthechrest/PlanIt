import { Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Message } from './Message';

@Entity()
export class MessageThread {
  //messageThreadId = user1Id <+> user2Id
  @PrimaryColumn()
  messageThreadId: string;

  @OneToMany(() => Message, (message) => message.thread, { cascade: ['insert', 'update'] })
  messages: Relation<Message>[];
}