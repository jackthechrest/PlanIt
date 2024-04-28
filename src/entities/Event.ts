import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable, ManyToOne, ManyToMany, OneToMany} from 'typeorm';

import { User } from "./User";
import { Comment } from "./Comment"

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    eventID: string;

    @Column({ length: 100 })
    eventName: string;
    
    @Column()
    startDate: Date;

    @Column()
    stopDate: Date;

    @Column({ default: "", length: 100 })
    description: string;

    @Column({ length: 100 })
    location: string;

    @Column()
    visibilityLevel: EventVisibility;

    // relationships
    @ManyToOne(() => User, (user) => user.ownedEvents, { cascade: ['insert', 'update'], onDelete: "CASCADE",})
    owner: Relation<User>;

    @ManyToMany(() => User, (user) => user.joinedEvents, { cascade: ['insert', 'update'], onDelete: "CASCADE"} )
    @JoinTable()
    joinedUsers: Relation<User>[];

    @ManyToMany(() => User, (user) => user.invitedEvents, { cascade: ['insert', 'update'], onDelete: "CASCADE"} )
    @JoinTable()
    invitedUsers: Relation<User>[];

    @ManyToMany(() => User, (user) => user.bannedEvents, { cascade: ['insert', 'update'], onDelete: "CASCADE"} )
    @JoinTable()
    bannedUsers: Relation<User>[];

    @OneToMany(() => Comment, (comment) => comment.commentUnder, { cascade: ['insert', 'update'] } )
    comments: Relation<Comment>[];
}