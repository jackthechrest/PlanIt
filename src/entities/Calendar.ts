import { Entity, PrimaryGeneratedColumn, Column, Relation,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { Calendar} from "./Calendar ";
import { Event } from "./Event";
import { Comment } from "./Comment";
import { Follow } from "./Follow";


@Entity()
export class Calendar{
    @PrimaryGeneratedColumn('uuid')
    calendarId: string;
    
    // relationships
    @OneToOne(() => "User")
    @JoinTable()
    personalCalendar: User[];
}

export { Calendar }