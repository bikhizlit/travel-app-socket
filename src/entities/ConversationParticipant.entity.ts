import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/BaseEntity';
import { Conversation } from './Conversation.entity';
import { User } from './User.entity';

@Entity('conversation_participants')
@Index(['conversationId', 'userId'], { unique: true })
@Index(['userId'])
export class ConversationParticipant extends BaseEntity {
  @ManyToOne(() => Conversation, (c) => c.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @Column()
  conversationId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ default: false })
  muted!: boolean;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt?: Date;
}