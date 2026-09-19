import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/BaseEntity';

export type ConversationType = 'direct' | 'coordinator' | 'group';

@Entity('conversations')
@Index(['type'])
export class Conversation extends BaseEntity {
  @Column({ type: 'enum', enum: ['direct', 'coordinator', 'group'] })
  type!: ConversationType;

  @Column({ length: 200, nullable: true })
  title?: string;

  @Column({ nullable: true })
  trekId?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @OneToMany('ConversationParticipant', 'conversation')
  participants?: unknown[];

  @OneToMany('Message', 'conversation')
  messages?: unknown[];
}