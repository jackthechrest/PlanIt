import { Column, Entity } from 'typeorm';
import { Notifications } from './Notifications';

@Entity()
export class Report extends Notifications{
  // offendingContentId = U(user)/E(event)/C(comment) + the content's id
  @Column()
  offendingContentId: string;

  @Column({ default: false })
  hasBeenAddressed: boolean;

  @Column({ default: false })
  isValid: boolean;
}
