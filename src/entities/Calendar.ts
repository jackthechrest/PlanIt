import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { User} from "./User";
import { Event } from "./Event";

@Entity()
export class Calendar{
    @PrimaryGeneratedColumn('uuid')
    calendarId: string;
    
    // relationships
    @OneToOne(() => "User")
    @JoinTable()
    personalCalendar: User[];

    @ManyToMany(() => "Event")
    @JoinTable()
    scheduledEvent: Event[];    
}
