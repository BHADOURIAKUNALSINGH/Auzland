export interface User {
  username: string;
  email?: string;
  groups?: string[];
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: NewUser) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  forgotPassword: (username: string) => Promise<any>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<any>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  getAuthHeader: () => Promise<Record<string, string>>;
}

export interface PasswordChangeData {
  newPassword: string;
  confirmPassword: string;
}

export type UserRole = 'edit-access' | 'view-access';
