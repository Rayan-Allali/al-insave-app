import { baseUrl } from "@/constants/baseApi";
import { useConnectionAwareAction } from "@/hooks/useConnectionAwareAction";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function UploadVideo() {
  const [cameraPermission, setCameraPermission] = useState();
  const [micPermission, setMicPermission] = useState();
  const [cameraMode, setCameraMode] = useState("video");
  const [facing, setFacing] = useState("back");
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef(null);

  const { runAction } = useConnectionAwareAction();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const micPermission = await Camera.requestMicrophonePermissionsAsync();
      setCameraPermission(cameraPermission.status === "granted");
      setMicPermission(micPermission.status === "granted");
    })();
  }, []);

  if (cameraPermission === undefined || micPermission === undefined) {
    return <Text>Requesting permissions...</Text>;
  } else if (!cameraPermission) {
    return <Text>Permission for camera not granted.</Text>;
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const recordVideo = async () => {
    try {
      setRecording(true);

      const recorded = await cameraRef.current?.recordAsync({ maxDuration: 30 });
      const videoUri = recorded?.uri;

      if (!videoUri) throw new Error("Failed to record video.");

      const filename = `video_${Date.now()}.mp4`;
      const savedPath = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({
        from: videoUri,
        to: savedPath,
      });

      console.log("✅ Video saved locally:", savedPath);

      const uploadVideo = async () => {
        const formData = new FormData();
        formData.append("videoUrl", {
          uri: savedPath,
          name: filename,
          type: "video/mp4",
        } );

        try {
          
          console.log("baseUrl ",baseUrl)
          const response = await axios.post(`${baseUrl}/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("response stauts",response.status )
          if (response.status === 200) {
            Alert.alert("✅ Video uploaded!");
          } else {
            Alert.alert("⚠️ Upload failed. Video is saved locally.");
          }
        } catch (err) {
          console.error(err);
          Alert.alert("❌ Upload error. Video is saved locally.");
        }
      };

      const saveForLater = async () => {
        Alert.alert("📴 Offline: Video saved for later upload.");
      };

      await runAction(uploadVideo, saveForLater);
    } catch (error) {
      console.error("❌ Upload error:", error?.message || error);
      console.error("Recording error:", error);
      Alert.alert("⚠️ Recording failed.");
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    cameraRef.current?.stopRecording();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        mode={cameraMode}
        zoom={zoom}
      >
        <Slider
          style={{ width: "100%", height: 40, position: "absolute", top: "75%" }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="cyan"
          maximumTrackTintColor="white"
          value={zoom}
          onValueChange={(value) => setZoom(value)}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCameraMode("video")}
          >
            <Ionicons name="videocam-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.shutterContainer}>
          {recording ? (
            <TouchableOpacity style={styles.button} onPress={stopRecording}>
              <Ionicons name="stop-circle-outline" size={40} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={recordVideo}>
              <Ionicons name="play-circle-outline" size={40} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 20,
  },
  shutterContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
});
