import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class Follow {
  // followId is targetedUserId + requestingUserId
  @PrimaryColumn()
  followId: string;

  @Column()
  targetedUserId: string;

  @Column()
  targetedUsername: string;

  @ManyToOne(() => User, (user) => user.followers, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  targetedUser: Relation<User>;

  @Column()
  requestingUserId: string;

  @Column()
  requestingUsername: string;

  @ManyToOne(() => User, (user) => user.following, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  requestingUser: Relation<User>;
}
