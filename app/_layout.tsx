import '../global.css';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from '../context/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "setimmediate";

// Initialize Convex Client with the production URL
const convex = new ConvexReactClient('https://compassionate-mockingbird-459.convex.cloud', {
  unsavedChangesWarning: false,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(
    Platform.OS === 'web' 
      ? {} 
      : {
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        }
  );

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="property/[id]" />
            <Stack.Screen name="post-property" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}
