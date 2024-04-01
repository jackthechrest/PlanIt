import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

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
    /*
    OwnedEvents: One-Many w/ User
    JoinedEvents: Many-Many w/ user
    ScheduledEvents: Many-Many w/ Calendar
    */
}