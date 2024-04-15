import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { VerifyCode } from './VerifyCode';
import { FriendList } from './FriendList';
import { Notifications } from './Notifications';
import { Message } from './Message';
import { Calendar } from './Calendar';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({default: ""})
  displayName: string;

  @Column({unique: true})
  email: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: "" })
  biography: string;

  @Column({ default: false })
  verifiedEmail: boolean;

  @Column({ default: 0 })
  warningCount: number;

  
  // need to add profile picture functionality
  @Column()
  profilePic: string;

  // Relationships
  @ManyToMany(() => User)
  @JoinTable()
  friends: User[];

  @OneToOne(() => Calendar, (Calendar) => Calendar.personalCalendar)
  personalCalendar: Calendar;

  // Friends
  @OneToOne(() => FriendList, (friendList) => friendList.owner, { cascade: ['insert', 'update'] })
  @JoinColumn()
  selfFriendList: Relation<FriendList>;

  @ManyToMany(() => FriendList, (friendList) => friendList.friends, { cascade: ['insert', 'update'] })
  otherFriendLists: Relation<FriendList>[];

  @ManyToMany(() => FriendList, (friendList) => friendList.pendingFriends, { cascade: ['insert', 'update'] })
  unconfirmedFriendLists: Relation<FriendList>[];

  // Email Verification
  @OneToOne(() => VerifyCode, (verifyCode) => verifyCode.user, { cascade: ['insert', 'update'] })
  @JoinColumn()
  code: Relation<VerifyCode>;

  // Notifications
  @OneToMany(() => Notifications, (notifications) => notifications.receivingUser, { cascade: ['insert', 'update'] } )
  receivedNotifications: Relation<User>[];

  @OneToMany(() => Notifications, (notifications) => notifications.sendingUser, { cascade: ['insert', 'update'] } )
  sentNotifications: Relation<User>[];

  @OneToMany(() => Message, (message) => message.sender, { cascade: ['insert', 'update'] } )
  sentMessages: Relation<Message>[];

  // Event Related
  @OneToMany(() => Event, (event) => event.ownedEvents)
  ownedEvents: Relation<Event>[];

  @ManyToMany(() => Event, (event) => event.joinedEvents)
  joinedEvents: Relation<Event>[];

  //Comments
  @OneToMany(() => Comment, (comment) => comment.commenter)
  commenter: Relation<Comment>[];
/*
Commenter		one-many 
*/
}
