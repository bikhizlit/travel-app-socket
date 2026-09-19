import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/BaseEntity';
import { User } from './User.entity';
import { Conversation } from './Conversation.entity';

export enum MatchStatus {
  SUGGESTED = 'suggested',
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('matches')
@Index(
  'uq_match_pair_intents',
  ['userAId', 'userBId', 'tripIntentAId', 'tripIntentBId'],
  { unique: true },
)
@Index(['userAId', 'status'])
@Index(['userBId', 'status'])
@Index(['status', 'score'])
@Index(['conversationId'])
export class Match extends BaseEntity {
  // ── Users ────────────────────────────────────────────────────

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userAId' })
  userA!: User;

  @Column({ type: 'varchar', length: 36, name: 'userAId' })
  userAId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userBId' })
  userB!: User;

  @Column({ type: 'varchar', length: 36, name: 'userBId' })
  userBId!: string;

  // ── Trip intents (FK columns only — TripIntent entity not mirrored) ──

  @Column({ type: 'varchar', length: 36, name: 'tripIntentAId' })
  tripIntentAId!: string;

  @Column({ type: 'varchar', length: 36, name: 'tripIntentBId' })
  tripIntentBId!: string;

  // ── Scoring ──────────────────────────────────────────────────

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    comment: 'Match score 0–100',
  })
  score!: string;

  @Column({
    type: 'json',
    nullable: false,
    comment: 'Per-signal score contributions',
  })
  scoreBreakdown!: Record<string, number>;

  @Column({
    type: 'json',
    nullable: false,
    comment: 'Human-readable match reasons',
  })
  reasons!: string[];

  // ── Lifecycle ────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SUGGESTED,
  })
  status!: MatchStatus;

  @Column({ type: 'varchar', length: 36, nullable: true })
  requestedByUserId!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  respondedByUserId!: string | null;

  @Column({ type: 'datetime', nullable: true })
  respondedAt!: Date | null;

  @Column({ type: 'datetime', nullable: true })
  expiresAt!: Date | null;

  // ── Conversation ─────────────────────────────────────────────

  @ManyToOne(() => Conversation, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation | null;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    name: 'conversationId',
  })
  conversationId!: string | null;

  // ── Denormalized trip info ───────────────────────────────────

  @Column({ type: 'varchar', length: 36, nullable: true })
  trekId?: string | null;

  @Column({ type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ type: 'date', nullable: true })
  endDate?: string | null;
}