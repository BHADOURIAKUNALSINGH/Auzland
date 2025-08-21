// aws-config.ts
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_7IJ59c8cn',
      userPoolClientId: '463hbb63gijfd3dcaskdcmb1va',
      region: 'us-east-2',
      signUpVerificationMethod: 'code' as const,
      // Enable SRP authentication
      authenticationFlowType: 'USER_SRP_AUTH',
      // optional if you want email login only
      loginWith: { email: true, phone: false, username: false }
    }
  }
};

Amplify.configure(awsConfig);

// Debug: verify that Amplify got the Auth config at runtime
try {
  const configured = (Amplify as any).getConfig?.();
  // eslint-disable-next-line no-console
  console.log('Amplify Auth configured:', configured?.Auth?.Cognito || configured?.Auth);
} catch {}

export default awsConfig;
