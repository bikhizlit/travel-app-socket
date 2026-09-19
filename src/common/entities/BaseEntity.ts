import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * BaseEntity — UUID PK, audit timestamps, soft-delete.
 * Mirrored from travel-app-be. Do not modify locally.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 6 })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', precision: 6, nullable: true })
  deletedAt?: Date | null;
}