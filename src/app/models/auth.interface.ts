export interface Login {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  name?: string;
  role?: string;
}