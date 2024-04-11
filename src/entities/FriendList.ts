import { Entity, JoinTable, ManyToMany, OneToOne, PrimaryColumn, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class FriendList {
  // friendListId = 'FL<+>' + userId (owner)
  @PrimaryColumn()
  friendListId: string;

  @OneToOne(() => User, (user) => user.selfFriendList, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  owner: Relation<User>;

  @ManyToMany(() => User, (user) => user.otherFriendLists, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  @JoinTable()
  friends: Relation<User>[];

  @ManyToMany(() => User, (user) => user.unconfirmedFriendLists, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  @JoinTable()
  pendingFriends: Relation<User>[];
}