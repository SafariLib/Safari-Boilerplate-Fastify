import { Customer, User } from '@prisma/client';
import { TokenContent } from '../../types';

export type VerifyCredentials = (
    payload: { username: string; password: string },
    entity: 'user' | 'customer',
) => Promise<{
    tokenContent: TokenContent;
    user: Omit<User, 'password'> | Omit<Customer, 'password'>;
}>;

export type LogUserConnection = (
    user_id: number,
    ip: string,
    user_agent: string,
    entity: 'user' | 'customer',
) => Promise<void>;
