import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne, ManyToMany, JoinColumn } from 'typeorm';
import { Follow } from './Follow';
import { VerifyCode } from './VerifyCode';
import { FriendList } from './FriendList';
import { Notifications } from './Notifications';
import { Message } from './Message';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({default: ""})
  displayName: string;

  @Column({unique: true})
  email: string

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({default: ""})
  biography: string

  @Column({default: false})
  verifiedEmail: boolean

  /*
  // need to add profile picture functionality
  @Column()
  profilePic: string
*/

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

  // Email Verification
  @OneToOne(() => VerifyCode, (verifyCode) => verifyCode.user, { cascade: ['insert', 'update'] })
  @JoinColumn()
  code: Relation<VerifyCode>;

  // Notifications
  @OneToMany(() => Notifications, (notifications) => notifications.forUser, { cascade: ['insert', 'update'] } )
  notifications: Relation<User>[];

  @OneToMany(() => Message, (message) => message.sender, { cascade: ['insert', 'update'] } )
  sentMessages: Relation<Message>[];
/*
personalCalendar	one-one
joinedEvents		many-many
ownedEvents		one-many
Commenter		one-many
targetedUser		one-many
RequestingUser		one-many 
*/
}