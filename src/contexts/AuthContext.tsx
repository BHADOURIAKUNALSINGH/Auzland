// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
// Ensure Amplify is configured before any auth APIs are used
import '../aws-config';
import { Amplify } from 'aws-amplify';
import awsConfig from '../aws-config';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  confirmSignIn, // for NEW_PASSWORD_REQUIRED
} from 'aws-amplify/auth';
import { AuthContextType, User, NewUser } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// --- Helpers ---------------------------------------------------------

/** Get Cognito groups from the ID token payload */
const getUserGroups = async (): Promise<string[]> => {
  try {
    const session = await fetchAuthSession();
    
    const groups = (session.tokens?.idToken?.payload?.['cognito:groups'] as string[] | undefined) ?? [];
    
    return groups;
  } catch (error) {
    console.error('Error in getUserGroups:', error);
    return [];
  }
};

/** Get the raw ID token string for Authorization header */
const getIdTokenString = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    
    // Check if token is expired
    if (session.tokens?.idToken?.payload?.exp) {
      const expiryTime = session.tokens.idToken.payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      if (timeUntilExpiry <= 0) {
        throw new Error('Authentication token has expired. Please sign in again.');
      }
      
      if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        console.warn('Token will expire soon:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');
      }
    }
    
    const tokenString = session.tokens?.idToken?.toString() ?? null;
    
    return tokenString;
  } catch (error) {
    throw error;
  }
};

// --- Provider --------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const ensureAmplifyConfigured = () => {
    try {
      const configured = (Amplify as any).getConfig?.();
      if (!configured?.Auth?.Cognito?.userPoolId || !configured?.Auth?.Cognito?.userPoolClientId) {
        Amplify.configure(awsConfig as any);
      }
    } catch {}
  };

  useEffect(() => {
    ensureAmplifyConfigured();
    checkAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthState = async () => {
    try {
      const current = await getCurrentUser(); // throws if not signed in
      const groups = await getUserGroups();
      
      // Get user attributes to extract email
      const session = await fetchAuthSession();
      const email = session.tokens?.idToken?.payload?.email as string || current.username;
      
      setUser({ username: current.username, email, groups });
      setIsAuthenticated(true);
    } catch (error: any) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    ensureAmplifyConfigured();
    const res = await amplifySignIn({ username, password });

    // If user was created in console, Cognito will require a new password
    if (res.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      const err: any = new Error('NEW_PASSWORD_REQUIRED');
      err.code = 'NEW_PASSWORD_REQUIRED';
      throw err; // Ask UI to collect a new password, then call completeNewPassword()
    }

    if (!res.isSignedIn) {
      throw new Error(`Additional auth step required: ${res.nextStep.signInStep}`);
    }

    // Signed in — load profile & groups
    const groups = await getUserGroups();
    
    // Get user attributes to extract email
    const session = await fetchAuthSession();
    const email = session.tokens?.idToken?.payload?.email as string || username;
    
    setUser({ username, email, groups });
    setIsAuthenticated(true);
  };

  /** Complete the NEW_PASSWORD_REQUIRED challenge */
  const completeNewPassword = async (newPassword: string) => {
    ensureAmplifyConfigured();
    await confirmSignIn({ challengeResponse: newPassword });
    const current = await getCurrentUser();
    const groups = await getUserGroups();
    
    // Get user attributes to extract email
    const session = await fetchAuthSession();
    const email = session.tokens?.idToken?.payload?.email as string || current.username;
    
    setUser({ username: current.username, email, groups });
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    ensureAmplifyConfigured();
    await amplifySignOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const signUp = async (userData: NewUser) => {
    ensureAmplifyConfigured();
    await amplifySignUp({
      username: userData.username,
      password: userData.password,
      options: { userAttributes: { email: userData.email } },
    });
  };

  const confirmSignUp = async (username: string, code: string) => {
    ensureAmplifyConfigured();
    return amplifyConfirmSignUp({ username, confirmationCode: code });
  };

  const forgotPassword = async (username: string) => {
    ensureAmplifyConfigured();
    return resetPassword({ username });
  };

  const confirmForgotPassword = async (username: string, code: string, newPassword: string) => {
    ensureAmplifyConfigured();
    return confirmResetPassword({ username, confirmationCode: code, newPassword });
  };

  // Expose a convenience method for APIs
  const getAuthHeader = async (): Promise<Record<string, string>> => {
    ensureAmplifyConfigured();
    
    try {
      const idToken = await getIdTokenString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      const authHeader = { Authorization: `Bearer ${idToken}` };
      
      return authHeader;
    } catch (error: any) {
      // If token is expired, suggest re-authentication
      if (error.message?.includes('expired')) {
        // You could trigger a re-authentication flow here
      }
      
      throw error;
    }
  };



  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    forgotPassword,
    confirmForgotPassword,
    completeNewPassword,
    getAuthHeader,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
