import { Customer, User } from '@prisma/client';
import { TokenContent } from '../../types';

export type VerifyUserOrAdminCredentials = (payload: { username: string; password: string }) => Promise<{
    tokenContent: TokenContent;
    user: Omit<User, 'password'> | Omit<Customer, 'password'>;
}>;

export type LogUserConnection = (user_id: number, ip: string, user_agent: string) => Promise<void>;
