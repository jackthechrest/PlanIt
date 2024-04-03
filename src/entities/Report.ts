import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable, default,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { Event} from "./Event";
import { Comment } from "./Comment";

@Entity()
export class Report{
    @PrimaryGeneratedColumn('uuid')
    reportID: string;

    @Column({default: "false"})
    isReported: Boolean;
    isValid: Boolean;

    // relationships
    /*
    ReportedEvent: One-One w/ Event
    ReportedComment: One-One w/ Comments
    */
}
