import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iptv.app',
  appName: 'IPTV Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
