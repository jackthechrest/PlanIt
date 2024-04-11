import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  notificationId: string;

  // link to redirect to in notification page
  @Column({nullable: true})
  link: string;

  @Column()
  type: NotificationType;

  @Column()
  dateSent: Date;

  @Column()
  dateString: string;

  // utilized for all notifications
  @Column({default: false})
  beenOpened: boolean;

  @Column({default: false})
  beenRead: boolean;

  // only utilized for friend requests
  @Column({default: false})
  respondedTo: boolean;

  @ManyToOne(() => User, (user) => user.receivedNotifications, { cascade: ['insert', 'update'], onDelete: "CASCADE", } )
  receivingUser: Relation<User>;

  @Column()
  receivingUserId: string;

  @Column()
  receivingUsername: string;


  @ManyToOne(() => User, (user) => user.sentNotifications, { cascade: ['insert', 'update'], onDelete: "CASCADE", } )
  sendingUser: Relation<User>;

  @Column()
  sendingUserId: string;

  @Column()
  sendingUsername: string;
}