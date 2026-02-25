import { Level } from './level.enum';
import { Role } from './role.enum';

export interface User {
  id?: string; // Opcional porque al registrarse aún no lo tenemos
  name: string;
  email: string;
  password?: string; // Opcional porque solo se usa al hacer Login/Registro
  age: number;
  gender: string;
  level: Level;
  role?: Role; // Opcional porque tu backend lo asigna automáticamente
}
