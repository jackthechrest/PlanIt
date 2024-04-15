import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable, ManyToOne, ManyToMany, OneToMany} from 'typeorm';

import { Calendar} from "./Calendar";
import { User } from "./User";

@Entity()
export class Event{
    @PrimaryGeneratedColumn('uuid')
    eventID: string;

    @Column()
    startDate: Date;

    @Column()
    stopDate: Date;

    @Column()
    picture: string;

    @Column()
    description: string;

    @Column()
    location: string;

    @Column()
    visibility_level: string;

    // relationships
    @ManyToOne(() => User, (user) => user.ownedEvents)
    ownedEvents: Relation<User>;

    @ManyToMany(() => User, (user) => user.joinedEvents)
    @JoinTable()
    joinedEvents: Relation<User>[];

    @ManyToMany(() => Calendar)
    ScheduledEvents: Relation<Calendar>[];

    @OneToMany(() => Comment, (comment) => comment.commentUnder)
    commentUnder: Relation<Comment>[];
}