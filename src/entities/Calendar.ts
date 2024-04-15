import { Entity, PrimaryGeneratedColumn, Relation, JoinTable, ManyToMany, OneToOne, JoinColumn} from 'typeorm';

import { User} from "./User";
import { Event } from "./Event";

@Entity()
export class Calendar{
    @PrimaryGeneratedColumn('uuid')
    calendarId: string;
    
    // relationships
    @OneToOne(() => User, (User) => User.personalCalendar)
    @JoinColumn()
    personalCalendar: User[];

    @ManyToMany(() => Event, (Event) => Event.ScheduledEvents)
    @JoinTable()
    scheduledEvent: Relation<Event>[]; 
}
