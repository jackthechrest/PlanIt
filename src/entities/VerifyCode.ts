import { Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class VerifyCode {
  @PrimaryColumn()
  codeId: string;

  @Column({ nullable: true})
  codeHash: string;

  @Column({ nullable: true })
  timeSent: string;

  @OneToOne(() => User, (user) => user.code, { cascade: ['insert', 'update', 'remove'] })
  user: Relation<User>;
}