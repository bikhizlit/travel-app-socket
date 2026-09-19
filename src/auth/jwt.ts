import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { Role, Plan } from '../common/types';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  plan: Plan;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}