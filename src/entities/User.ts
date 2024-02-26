import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
//, OneToMany, ManyToOne, ManyToMany, Relation

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

  // Relationships
*/

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