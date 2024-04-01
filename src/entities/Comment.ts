import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { Calendar} from "./Calendar";
import { User } from "./User";
import { Event } from "./Event";
import { Follow } from "./Follow";

@Entity()
export class Comment{
    @Column
    commentText: string;

    //relationships
    /*
    CommentUnder: Many-One w/ Event
    Commenter: Many-One w/ User
    */
}