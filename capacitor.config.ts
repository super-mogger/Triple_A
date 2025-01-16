import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.triplea.gymapp',
  appName: 'Triple A',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'localhost'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: '182821274121-n4t68k3qvah6hc4ckbtim4mjm8mn3abm.apps.googleusercontent.com',
      serverClientId: '182821274121-ocsan4k3v23atjk1ha96m0krsrib1t1j.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      returnURL: 'com.triplea.gymapp:/oauth2redirect'
    }
  }
};

export default config;
