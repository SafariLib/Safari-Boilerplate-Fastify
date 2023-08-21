import { ERoles } from '../../enums/ERoles';

export interface TokenContent {
    id: number;
    username: string;
    role: ERoles;
}
