import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation} from 'typeorm';
import {User} from "./User";


@Entity()
export class Comment{
    @PrimaryGeneratedColumn('uuid')
    commentId: string;

    @Column()
    commentText: string;

    @Column()
    commentTime: Date;

    //relationships
    @ManyToOne(() => User, (user) => user.commenter)
    commenter: Relation<User>;

    @ManyToOne(() => Event, (event) => event.commentUnder)
    commentUnder: Relation<Event>;
}