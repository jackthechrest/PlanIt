import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { VerifyCode } from './VerifyCode';
import { FriendList } from './FriendList';
import { Notifications } from './Notifications';
import { Message } from './Message';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({default: "", length: 100 })
  displayName: string;

  @Column({unique: true})
  email: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: "", length: 100 })
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

  // Friends
  @OneToOne(() => FriendList, (friendList) => friendList.owner, { cascade: ['insert', 'update'] })
  @JoinColumn()
  selfFriendList: Relation<FriendList>;

  @ManyToMany(() => FriendList, (friendList) => friendList.friends, { cascade: ['insert', 'update'] })
  otherFriendLists: Relation<FriendList>[];

  @ManyToMany(() => FriendList, (friendList) => friendList.pendingFriends, { cascade: ['insert', 'update'] })
  unconfirmedFriendLists: Relation<FriendList>[];

  @ManyToMany(() => FriendList, (friendList) => friendList.blockedUsers, { cascade: ['insert', 'update'] })
  blockedFriendLists: Relation<FriendList>[];

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
}
