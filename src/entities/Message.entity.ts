import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/BaseEntity';
import { Conversation } from './Conversation.entity';
import { User } from './User.entity';

export type MessageType =
  | 'text'
  | 'image'
  | 'phone_share'
  | 'photo_share'
  | 'system';
export type ClientMessageType = Exclude<MessageType, 'system'>;

@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
export class Message extends BaseEntity {
  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @Column()
  conversationId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @Column({ nullable: true })
  senderId?: string;

  @Column({
    type: 'enum',
    enum: ['text', 'image', 'phone_share', 'photo_share', 'system'],
    default: 'text',
  })
  type!: MessageType;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'json', nullable: true })
  attachments?: { url: string; mime?: string; name?: string }[] | null;

  @Column({ default: false })
  edited!: boolean;
}