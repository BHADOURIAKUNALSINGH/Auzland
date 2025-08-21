# AWS Cognito Authentication App

A React-based authentication application that uses AWS Cognito for user management with role-based access control. The app supports two user roles: `edit-access` (administrators) and `view-access` (regular users).

## 🚀 Features

- **AWS Cognito Integration**: Secure authentication using AWS Cognito User Pools
- **Role-Based Access Control**: Two distinct user roles with different permissions
- **Modern UI**: Clean, responsive design with smooth animations
- **User Management**: Administrators can create new view-access users
- **Secure Authentication**: JWT-based authentication with automatic token refresh

## 🏗️ Architecture

### User Roles

1. **edit-access** (Administrators)
   - Full access to the application
   - Can create new users with view-access role
   - Access to admin dashboard with user management tools

2. **view-access** (Regular Users)
   - Read-only access to the application
   - Cannot modify data or create new users
   - Limited to viewing content and their user information

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Account with Cognito User Pool
- AWS CLI configured (optional, for advanced management)

## 📋 AWS Cognito Setup

### 1. Create Cognito User Pool

1. Go to AWS Console → Cognito → User Pools
2. Click "Create a user pool"
3. Choose "Cognito user pool sign-in options"
4. Select "Username" and "Email"
5. Configure password requirements as needed
6. Choose "No advanced security features" for simplicity
7. Create the user pool

### 2. Create User Pool Groups

1. In your user pool, go to "Groups"
2. Create two groups:

   **edit-access Group:**
   - Group name: `edit-access`
   - Description: `Administrators with full access`
   - IAM role: Leave empty for now

   **view-access Group:**
   - Group name: `view-access`
   - Description: `Regular users with read-only access`
   - IAM role: Leave empty for now

### 3. Create App Client

1. Go to "App integration" → "App clients and analytics"
2. Click "Create app client"
3. Choose "Confidential client"
4. Enable "Generate client secret"
5. Save the Client ID and Client Secret

### 4. Create Admin User

1. Go to "Users and groups" → "Users"
2. Click "Create user"
3. Fill in the form:
   - Username: `admin` (or your preferred admin username)
   - Email: Your email address
   - Temporary password: Set a secure password
4. After creating, click on the user
5. Go to "Groups" tab
6. Add the user to the `edit-access` group

## ⚙️ Configuration

### 1. Update AWS Configuration

Edit `src/aws-config.ts` with your Cognito details:

```typescript
const awsConfig = {
  Auth: {
    region: 'YOUR_AWS_REGION', // e.g., 'us-east-1'
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_USER_POOL_CLIENT_ID',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
  }
};
```

### 2. Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxxx
REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Then update `src/aws-config.ts`:

```typescript
const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || 'YOUR_USER_POOL_ID',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || 'YOUR_USER_POOL_CLIENT_ID',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH',
  }
};
```

## 🚀 Installation & Running

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## 🔐 Usage

### First Time Setup

1. **Login as Admin**: Use the admin credentials you created in Cognito
2. **Create View Users**: Use the admin dashboard to create new users with view-access role
3. **Test Roles**: Log out and test with different user accounts

### Admin Workflow

1. Login with edit-access credentials
2. Access admin dashboard
3. Click "Add New User" to create view-access users
4. Fill in username, email, and password
5. New users will be created with view-access role

### User Workflow

1. Login with view-access credentials
2. View dashboard showing their role and permissions
3. Cannot access admin features or create new users

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Login.tsx              # Login form component
│   ├── Dashboard.tsx          # View-access user dashboard
│   ├── AdminDashboard.tsx     # Edit-access admin dashboard
│   ├── Login.css              # Login component styles
│   ├── Dashboard.css          # Dashboard component styles
│   └── AdminDashboard.css     # Admin dashboard styles
├── contexts/
│   └── AuthContext.tsx        # Authentication context and logic
├── types/
│   └── index.ts               # TypeScript type definitions
├── aws-config.ts              # AWS Cognito configuration
├── App.tsx                    # Main app component with routing
├── App.css                    # App-level styles
└── index.tsx                  # App entry point
```

## 🔧 Customization

### Adding New User Roles

1. Create new group in Cognito
2. Add role check in `App.tsx`:

```typescript
const hasEditAccess = user?.groups?.includes('edit-access');
const hasNewRole = user?.groups?.includes('new-role');

if (hasEditAccess) {
  return <AdminDashboard />;
} else if (hasNewRole) {
  return <NewRoleDashboard />;
} else {
  return <Dashboard />;
}
```

### Styling

- Modify CSS files in the `components/` directory
- Update color schemes and layouts as needed
- Responsive design is already implemented

## 🚨 Security Considerations

- **Client-Side Validation**: All validation is client-side for UX; implement server-side validation for production
- **Token Management**: AWS Amplify handles JWT token refresh automatically
- **Group Permissions**: User groups are managed in AWS Cognito console
- **Password Policies**: Configure strong password requirements in Cognito

## 🐛 Troubleshooting

### Common Issues

1. **"User not found" error**
   - Verify username exists in Cognito User Pool
   - Check if user is confirmed

2. **"Incorrect username or password"**
   - Verify password is correct
   - Check if user account is locked

3. **"User is not authorized"**
   - Ensure user is added to appropriate group
   - Check group names match exactly

4. **Cognito configuration errors**
   - Verify region, user pool ID, and client ID
   - Check if app client is properly configured

### Debug Mode

Enable console logging by checking browser console for detailed error messages.

## 📚 Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
1. Check the troubleshooting section
2. Review AWS Cognito documentation
3. Open an issue in the repository
4. Contact the development team
