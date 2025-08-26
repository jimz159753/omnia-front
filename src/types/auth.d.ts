export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthError {
  error: string;
  message: string;
}
