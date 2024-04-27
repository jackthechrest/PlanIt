import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne, ManyToMany, JoinColumn } from 'typeorm';
import { VerifyCode } from './VerifyCode';
import { FriendList } from './FriendList';
import { Notifications } from './Notifications';
import { Event } from './Event';
import { Comment } from './Comment'
import { Follow } from './Follow';

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
  @Column('simple-array')
  pictureOptions: ProfileColors[];

  // Relationships
  // Follow
  @OneToMany(() => Follow, (follow) => follow.requestingUser, { cascade: ['insert', 'update'] })
  following: Relation<Follow>[];

  @OneToMany(() => Follow, (follow) => follow.targetedUser, { cascade: ['insert', 'update'] })
  followers: Relation<Follow>[];

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
  receivedNotifications: Relation<Notifications>[];

  @OneToMany(() => Notifications, (notifications) => notifications.sendingUser, { cascade: ['insert', 'update'] } )
  sentNotifications: Relation<Notifications>[];

  // Event Related
  @OneToMany(() => Event, (event) => event.owner, { cascade: ['insert', 'update'] } )
  ownedEvents: Relation<Event>[];

  @ManyToMany(() => Event, (event) => event.joinedUsers, { cascade: ['insert', 'update'] } )
  joinedEvents: Relation<Event>[];

  @ManyToMany(() => Event, (event) => event.joinedUsers, { cascade: ['insert', 'update'] } )
  invitedEvents: Relation<Event>[];

  @ManyToMany(() => Event, (event) => event.joinedUsers, { cascade: ['insert', 'update'] } )
  bannedEvents: Relation<Event>[];

  //Comments
  @OneToMany(() => Comment, (comment) => comment.commenter, { cascade: ['insert', 'update'] })
  comments: Relation<Comment>[];
}
