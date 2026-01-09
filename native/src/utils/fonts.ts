import { useFonts } from 'expo-font';
import {
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold
} from '@expo-google-fonts/open-sans';

export function useAppFonts() {
  const [fontsLoaded, error] = useFonts({
    'OpenSans-Regular': OpenSans_400Regular,
    'OpenSans-Medium': OpenSans_500Medium,
    'OpenSans-SemiBold': OpenSans_600SemiBold,
    'OpenSans-Bold': OpenSans_700Bold,
  });

  if (error) {
    console.error('Error loading fonts:', error);
  }

  return fontsLoaded;
}

