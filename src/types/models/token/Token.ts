import { TokenContent } from './TokenContent';

export interface Token extends TokenContent {
    iat: number;
    exp: number;
}
