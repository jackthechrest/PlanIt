import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable, ManyToOne, ManyToMany, OneToMany} from 'typeorm';

import { User } from "./User";
import { Comment } from "./Comment"

@Entity()
export class Event{
    @PrimaryGeneratedColumn('uuid')
    eventID: string;

    @Column()
    startDate: Date;

    @Column()
    stopDate: Date;

    @Column()
    description: string;

    @Column()
    location: string;

    @Column()
    visibility_level: string;

    // relationships
    @ManyToOne(() => User, (user) => user.ownedEvents, { cascade: ['insert', 'update'], onDelete: "CASCADE",})
    ownedEvents: Relation<User>;

    @ManyToMany(() => User, (user) => user.joinedEvents, { cascade: ['insert', 'update'], onDelete: "SET NULL"} )
    @JoinTable()
    joinedEvents: Relation<User>[];

    @OneToMany(() => Comment, (comment) => comment.commentUnder, { cascade: ['insert', 'update'] } )
    comments: Relation<Comment>[];
}