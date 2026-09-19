import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../config/env';

import { User } from '../entities/User.entity';
import { Conversation } from '../entities/Conversation.entity';
import { ConversationParticipant } from '../entities/ConversationParticipant.entity';
import { Message } from '../entities/Message.entity';
import { Match } from '../entities/Match.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  synchronize: false,
  migrationsRun: false,
  connectTimeout: 10000,

  entities: [User, Conversation, ConversationParticipant, Message, Match],
  migrations: [],
});