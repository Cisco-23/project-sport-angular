import { Level } from './level.enum';
import { Role } from './role.enum';

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  birthDate: string;
  age?: number;
  gender: string;
  level: Level;
  role?: Role;
}
