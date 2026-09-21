import type { Request } from 'express';
import type { User } from '../../domain/entities/User';
export type AuthenticatedRequest = Request & { authenticatedUser?: User };
