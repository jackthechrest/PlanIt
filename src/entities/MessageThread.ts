import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Message } from './Message';

@Entity()
export class MessageThread {
  //messageThreadId = user1Id <+> user2Id
  @PrimaryColumn()
  messageThreadId: string;

  @Column()
  user1Id: string;

  @Column()
  user1Username: string;

  @Column()
  user2Id: string;

  @Column()
  user2Username: string;

  @Column()
  lastDateSent: Date;

  @Column()
  lastSecondsSinceEnoch: number;

  @Column()
  lastDateString: string;

  @OneToMany(() => Message, (message) => message.thread, { cascade: ['insert', 'update'] })
  messages: Relation<Message>[];
}