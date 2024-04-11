import { Entity, PrimaryGeneratedColumn, Column, Relation, JoinTable,
    OneToMany, ManyToOne, ManyToMany, OneToOne} from 'typeorm';

import { Event} from "./Event";
import { Comment } from "./Comment";

@Entity()
export class Report{
    @PrimaryGeneratedColumn('uuid')
    reportID: string;

    @Column({default: "false"})
    isReported: Boolean;

    @Column({ default: false })
    hasBeenAddressed: boolean;
  
    @Column({ })
    isValid: boolean;

    // relationships
    /*
    ReportedEvent: One-One w/ Event
    ReportedComment: One-One w/ Comments
    */
}
