import React, { useEffect, useState } from 'react';
import './Callback.css';

const Callback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError(`Authentication error: ${error}`);
          setStatus('error');
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setStatus('error');
          return;
        }

        // Exchange code for tokens
        const tokenResponse = await exchangeCodeForTokens(code);
        
        // Store tokens in localStorage
        localStorage.setItem('idToken', tokenResponse.id_token);
        localStorage.setItem('accessToken', tokenResponse.access_token);
        localStorage.setItem('refreshToken', tokenResponse.refresh_token);
        
        // Decode JWT to get user info
        const userInfo = decodeJWT(tokenResponse.id_token);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Failed to complete authentication');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    const clientId = '463hbb63gijfd3dcaskdcmb1va'; // Your actual client ID
    const redirectUri = 'http://localhost:3000/callback';
    
    const response = await fetch('https://cognito-idp.us-east-2.amazonaws.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorData}`);
    }

    return response.json();
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return {};
    }
  };

  if (status === 'loading') {
    return (
      <div className="callback-container">
        <div className="callback-card">
          <div className="loading-spinner"></div>
          <h2>Completing Authentication...</h2>
          <p>Please wait while we complete your sign-in.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="callback-container">
        <div className="callback-card error">
          <div className="error-icon" aria-hidden>!</div>
          <h2>Authentication Failed</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-container">
      <div className="callback-card success">
        <div className="success-icon" aria-hidden>✓</div>
        <h2>Authentication Successful!</h2>
        <p>You have been successfully signed in.</p>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Callback;
