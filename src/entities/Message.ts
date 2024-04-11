import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { Notifications } from './Notifications';
import { MessageThread } from './MessageThread';

@Entity()
export class Message extends Notifications {
    @Column()
    body: string;
        
    @ManyToOne(() => MessageThread, (messageThread) => messageThread.messages, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
    thread: Relation<MessageThread>;
}