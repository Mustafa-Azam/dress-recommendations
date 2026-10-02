import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PhotoSource = 'camera' | 'library';

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
};

/**
 * Opens the camera or photo library and returns the chosen image URI,
 * or null if the person cancelled or refused permission.
 */
export async function pickPhoto(source: PhotoSource): Promise<string | null> {
  if (source === 'camera' && Platform.OS !== 'web') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Allow camera access for Dress Recommendations in the Settings app, or choose a photo from your library instead.'
      );
      return null;
    }
  }

  const result =
    source === 'camera' && Platform.OS !== 'web'
      ? await ImagePicker.launchCameraAsync(OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(OPTIONS);

  if (result.canceled || result.assets.length === 0) {
    return null;
  }
  return result.assets[0].uri;
}
