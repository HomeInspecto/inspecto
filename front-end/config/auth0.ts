import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

const getAuth0Config = () => {
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || extra.auth0Domain || '',
    clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || extra.auth0ClientId || '',
  };
};

const config = getAuth0Config();

if (!config.domain || !config.clientId) {
  console.warn(
    'Auth0 configuration missing. Please set EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID in your environment or app.json'
  );
}

// Get the redirect URI for Auth0
const redirectUri = Linking.createURL('callback', {});

export const auth0Config = {
  ...config,
  redirectUri,
  authorizationEndpoint: `https://${config.domain}/authorize`,
  tokenEndpoint: `https://${config.domain}/oauth/token`,
  revocationEndpoint: `https://${config.domain}/oauth/revoke`,
};
