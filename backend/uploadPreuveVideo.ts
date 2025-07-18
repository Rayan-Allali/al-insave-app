import { baseUrl } from '@/constants/baseApi';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

export const sendVideoToApi = async () => {
    
      console.log("baseUrl ",baseUrl)
  const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];

    const formData = new FormData();
    formData.append('video', {
      uri: asset.uri,
      name: asset.name || 'video.mp4',
      type: asset.mimeType || 'video/mp4',
    } as any);

    try {
      const response = await axios.post(`${baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("baseUrl ",baseUrl)
      if (response.status === 200) {
        Alert.alert('✅ Video uploaded!');
      } else {
        Alert.alert('⚠️ Upload failed.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Upload error');
    }
  } else {
    Alert.alert('⚠️ No video selected.');
  }
};