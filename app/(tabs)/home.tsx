import { Video } from 'expo-av';
import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as idb from 'idb';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RecordedVideo {
  uri: string;
}

export default function VideoRecordingScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<RecordedVideo | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [canStopRecording, setCanStopRecording] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const openDB = async () => {
    try {
      const db = await idb.openDB('VideoStorage', 1, {
        upgrade(db) {
          db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
        },
      });
      return db;
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw error;
    }
  };

  const saveVideoToIndexedDB = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      if (blob.size === 0) throw new Error('Empty video blob');
      const db = await openDB();
      const timestamp = new Date().toISOString();
      await db.put('videos', { id: timestamp, uri, data: blob });
      Alert.alert('Success', 'Video saved to local storage');
    } catch (error) {
      console.error('Failed to save video:', error);
      Alert.alert('Error', 'Failed to save video');
    }
  };

  useEffect(() => {
    (async () => {
      console.log("")
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!microphonePermission?.granted) await requestMicrophonePermission();
      if (!mediaLibraryPermission?.granted) await requestMediaLibraryPermission();
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current && isCameraReady && !isRecording) {
      try {
        setIsRecording(true);
        setCanStopRecording(false);
        setTimeout(() => setCanStopRecording(true), 1000);
        const video = await cameraRef.current.recordAsync();
        if (video?.uri) {
          setRecordedVideo(video);
          await saveVideoToIndexedDB(video.uri);
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Error', 'Failed to record video.');
      } finally {
        setIsRecording(false);
        setCanStopRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording && canStopRecording) {
      cameraRef.current.stopRecording();
    } else if (!canStopRecording) {
      Alert.alert('Wait', 'Please wait at least 1 second before stopping.');
    }
  };

  const submitVideo = async () => {
    if (!recordedVideo) {
      Alert.alert('Error', 'No video to submit');
      return;
    }
    try {
      if (mediaLibraryPermission?.granted) {
        await MediaLibrary.saveToLibraryAsync(recordedVideo.uri);
        Alert.alert('Success', 'Video submitted!', [{ text: 'OK', onPress: () => setRecordedVideo(null) }]);
      } else {
        Alert.alert('Error', 'Media library permission is required');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit video');
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    setIsCameraReady(false);
  };

  const flipCamera = () => {
    setCameraType(prev => (prev === 'back' ? 'front' : 'back'));
    setIsCameraReady(false);
  };

  const retrieveVideos = async () => {
    try {
      const db = await openDB();
      const videos = await db.getAll('videos');
      Alert.alert('Stored Videos', `Found ${videos.length} videos in storage`);
    } catch (error) {
      console.error('Retrieve error:', error);
    }
  };

  if (!cameraPermission || !microphonePermission || !mediaLibraryPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !microphonePermission.granted || !mediaLibraryPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera, mic, and media permissions are required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
            await requestMediaLibraryPermission();
          }}
        >
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {recordedVideo ? (
        <View style={styles.container}>
          <Video
            style={styles.video}
            source={{ uri: recordedVideo.uri }}
            useNativeControls
            isLooping
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={retakeVideo}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={submitVideo}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={retrieveVideos}>
              <Text style={styles.buttonText}>View Stored</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <CameraView
            style={styles.camera}
            facing={cameraType}
            ref={cameraRef}
            onCameraReady={() => setIsCameraReady(true)}
            onMountError={error => {
              console.error('Camera error:', error);
              Alert.alert('Error', `Camera failed: ${error.message}`);
            }}
          />
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setIsCameraReady(false)}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={!isCameraReady || (isRecording && !canStopRecording)}
            >
              <View style={[styles.recordButtonInner, isRecording && styles.recordingButtonInner]} />
            </TouchableOpacity>
            {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
            {!isCameraReady && !isRecording && <Text style={styles.recordingText}>Camera loading...</Text>}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    gap: 10,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  recordingContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordingButton: {
    backgroundColor: 'rgba(255,0,0,0.5)',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
