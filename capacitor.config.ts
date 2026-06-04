import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.ascend',
  appName: 'LifeOS ASCEND',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystoreAlias: 'lifeos-ascend',
    },
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
