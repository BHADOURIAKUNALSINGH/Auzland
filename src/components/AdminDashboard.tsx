import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NewUser } from '../types';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, signOut, getAuthHeader } = useAuth();
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (field: keyof NewUser, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newUser.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Call protected backend endpoint to create user in Cognito
      const authHeaders = await getAuthHeader();
      
      const requestBody = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
        // Group is automatically assigned by Lambda to "View-access"
      };
      
      // Log the request being sent
      console.log('Sending request to Lambda:', {
        url: 'https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/create_view_user',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: requestBody
      });
      
      const response = await fetch('https://868qsxaw23.execute-api.us-east-2.amazonaws.com/Prod/create_view_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders, // Include JWT token for authentication
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Lambda Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log the successful response to console
      console.log('Lambda success response:', {
        status: response.status,
        result: result,
        fullResponse: response
      });
      
      setMessage({ 
        type: 'success', 
        text: `User ${newUser.username} created successfully with View-access role!` 
      });
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      setShowAddUserForm(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create user. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <nav className="admin-nav">
        <div className="nav-brand">
          <h2>Admin Dashboard</h2>
        </div>
        <div className="nav-user">
          <span className="username">Admin: {user?.username}</span>
          <button onClick={handleSignOut} className="signout-button">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Administrator Control Panel</h1>
          <p>You have <strong>edit-access</strong> permissions to manage users and system settings.</p>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <div className="card-icon">👥</div>
            <h3>User Management</h3>
            <p>Add new users with view-only access to the application.</p>
            <button 
              onClick={() => setShowAddUserForm(true)}
              className="primary-button"
            >
              Add New User
            </button>
          </div>

          <div className="admin-card">
            <div className="card-icon" aria-hidden>OV</div>
            <h3>System Overview</h3>
            <p>Monitor user activity and system performance.</p>
            <button className="secondary-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="admin-card">
            <div className="card-icon" aria-hidden>ST</div>
            <h3>Settings</h3>
            <p>Configure application settings and permissions.</p>
            <button className="secondary-button" disabled>
              Coming Soon
            </button>
          </div>
        </div>

        <div className="user-info-section">
          <h3>Your Admin Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Username:</label>
              <span>{user?.username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span className="role-badge admin">Administrator</span>
            </div>
            <div className="info-item">
              <label>Groups:</label>
              <span>{user?.groups?.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Temporary Debug Section - Remove after testing */}
        <div className="debug-section" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Debug: JWT Token (for testing)</h3>
          <p><strong>Copy this token to test your Lambda endpoint:</strong></p>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid #ddd',
            wordBreak: 'break-all',
            fontSize: '12px',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {user?.username ? 'Loading token...' : 'Not logged in'}
          </div>
          <button 
            onClick={async () => {
              try {
                const authHeaders = await getAuthHeader();
                const token = authHeaders.Authorization?.replace('Bearer ', '') || 'No token found';
                // Create a temporary element to copy to clipboard
                const textArea = document.createElement('textarea');
                textArea.value = token;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Token copied to clipboard!');
              } catch (error: any) {
                console.error('Error getting token:', error);
                alert('Error getting token: ' + (error.message || 'Unknown error'));
              }
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Copy Token to Clipboard
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                onClick={() => setShowAddUserForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="modal-form">
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={newUser.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || !newUser.username || !newUser.email || !newUser.password || !newUser.confirmPassword}
                >
                  {isLoading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
