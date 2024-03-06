import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation, OneToOne } from 'typeorm';
import { Follow } from './Follow';
import { VerifyCode } from './VerifyCode';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isPro: boolean;

  @Column({ default: false })
  isAdmin: boolean;


  /*
  @Column({default: ""})
  biography: string

  @Column({default: username})
  displayName

  @Column({unique: true})
  email: string

  @Column({default: false})
  verifiedEmail: boolean

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

  // Email Verification
  @OneToOne(() => VerifyCode, (code) => code.user, { cascade: ['insert', 'update'] })
  code: Relation<VerifyCode>;


/*
  friends 		many-many
personalCalendar	one-one
joinedEvents		many-many
ownedEvents		one-many
Commenter		one-many
targetedUser		one-many
RequestingUser		one-many 
*/
}