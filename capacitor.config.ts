import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ponyinvest.app',
  appName: 'PONY Invest',
  webDir: 'out',
  // L'app charge votre site Vercel directement
  // Remplacez l'URL ci-dessous par votre vraie URL Vercel
  server: {
    url: 'https://pony-invest.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#1e1b4b',
    preferredContentMode: 'mobile',
    scheme: 'PONY Invest',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1e1b4b',
      showSpinner: true,
      spinnerColor: '#facc15',
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e1b4b',
    },
  },
};

export default config;
