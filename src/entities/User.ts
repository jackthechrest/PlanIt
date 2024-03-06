import { Entity, PrimaryGeneratedColumn, Column, Relation,
  OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { Calendar} from "./Calendar ";
import { Event } from "./Event";
import { Comment } from "./Comment";
import { Follow } from "./Follow";


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({default: ""})
  biography: string;

  @Column({default: username})
  displayName;

  @Column({unique: true})
  email: string;

  @Column({default: false})
  verifiedEmail: boolean;

  // need to add profile picture functionality
  @Column()
  profilePic: string;

  // Relationships
  @ManyToMany(() => User)
  @JoinTable()
  friends: User[];

  @OneToOne(() => Calendar)
  personalCalendar: Calendar;

  @ManyToMany(() => Event)
  @JoinTable()
  joinedEvents: Event[];

  @OneToMany(() => Event, (Event) => Event.owner)
  ownedEvents: Event[];

  @OneToMany(() => Comment, (Comment) => Comment.Commenter)
  Commenter: Comment[];

  @OneToMany(() => Follow, (Follow) => Follow.targetedUser)
  targetedUser: Follow[];

  @OneToMany(() => Follow, (Follow) => Follow.RequestingUser)
  requestingUser: Follow[];
}

export {User};