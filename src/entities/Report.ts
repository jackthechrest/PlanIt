import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation, JoinColumn, } from 'typeorm';

import { Event} from "./Event";
import { Comment } from "./Comment";

@Entity()
export class Report{
    @PrimaryGeneratedColumn('uuid')
    reportID: string;

    @Column({ default: false })
    isReported: Boolean;

    @Column({ default: false })
    hasBeenAddressed: boolean;
  
    @Column()
    isValid: boolean;

    // relationships
    @OneToOne(() => Event)
    @JoinColumn()
    reportedEvent: Relation<Event>;

    @OneToOne(() => Comment)
    @JoinColumn()
    reportedComment: Relation<Comment>;
}
