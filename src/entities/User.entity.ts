import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/BaseEntity';
import { Role } from '../common/types';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 191 })
  email!: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 191 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: ['user', 'guide', 'coordinator', 'vendor', 'admin'],
    default: 'user',
  })
  role!: Role;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
    default: null,
  })
  gender!: Gender;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    nullable: true,
  })
  fitnessLevel?: FitnessLevel;

  @Column({ type: 'json', nullable: true })
  trekExperience?: { years?: number; previousTreks?: string[] } | null;

  @Column({ type: 'int', nullable: true })
  budgetMinNpr?: number;

  @Column({ type: 'int', nullable: true })
  budgetMaxNpr?: number;

  @Column({ type: 'simple-array', nullable: true })
  interests?: string[];

  @Column({ type: 'date', nullable: true })
  preferredStart?: string;

  @Column({ type: 'date', nullable: true })
  preferredEnd?: string;

  @Column({ type: 'boolean', default: false })
  onboardingCompleted!: boolean;
}