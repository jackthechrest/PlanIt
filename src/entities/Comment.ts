import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation} from 'typeorm';
import {User} from "./User";
import {Event} from "./Event"


@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    commentId: string;

    @Column({ length: 100 })
    commentText: string;

    @Column()
    commentDate: Date;

    @Column()
    commentSecondsSinceEnoch: number;
  
    @Column()
    commentDateString: string;

    //relationships
    @ManyToOne(() => User, (user) => user.comments, {cascade: ['insert', 'update'], onDelete: "CASCADE",})
    commenter: Relation<User>;

    @ManyToOne(() => Event, (event) => event.comments, {cascade: ['insert', 'update'], onDelete: "CASCADE",})
    commentUnder: Relation<Event>;
}