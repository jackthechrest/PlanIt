import { Column, Entity, OneToOne, PrimaryColumn, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class VerifyCode {
  // codeId = 'VC<+>'userId
  @PrimaryColumn()
  codeId: string;

  @Column({ nullable: true})
  codeHash: string;

  @Column({ nullable: true })
  timeSent: Date;

  @OneToOne(() => User, (user) => user.code, { cascade: ['insert', 'update'], onDelete: "CASCADE", })
  user: Relation<User>;
}