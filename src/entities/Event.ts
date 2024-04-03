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
    @ManyToOne(() => User )
    OwnedEvent: Relation<User>

    @ManyToMany(() => User)
    JoinedEvent: Relation<User>[]

    @ManyToMany(() => Calendar)
    ScheduledEvents: Relation<Calendar>[]
}