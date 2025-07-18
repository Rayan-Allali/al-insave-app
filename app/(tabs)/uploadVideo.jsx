import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function UploadVideo() {
  const [cameraPermission, setCameraPermission] = useState();
  const [micPermission, setMicPermission] = useState();
  const [cameraMode, setCameraMode] = useState("video");
  const [facing, setFacing] = useState("back");
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  let cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();
      setCameraPermission(cameraPermission.status === "granted");
      setMicPermission(microphonePermission.status === "granted");
    })();
  }, []);

  if (
    cameraPermission === undefined ||
    micPermission === undefined
  ) {
    return <Text>Requesting permissions...</Text>;
  } else if (!cameraPermission) {
    return <Text>Permission for camera not granted.</Text>;
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const recordVideo = async () => {
    try {
      setRecording(true);

      const recorded = await cameraRef.current.recordAsync({ maxDuration: 30 });
      const videoUri = recorded.uri;

      // Generate a unique file name and path inside app's document directory
      const filename = `video_${Date.now()}.mp4`;
      const newPath = FileSystem.documentDirectory + filename;

      // Copy video to app storage
      await FileSystem.copyAsync({
        from: videoUri,
        to: newPath,
      });

      console.log("✅ Video saved to:", newPath);

      // Optionally: Navigate or do something else with the saved path
      // router.push({ pathname: '/Video', params: { uri: newPath } });

    } catch (error) {
      console.error("Recording error:", error);
    } finally {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    cameraRef.current.stopRecording();
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
  message: { textAlign: "center", paddingBottom: 10 },
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
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "white",
  },
  btn: { justifyContent: "center", margin: 10, elevation: 5 },
  imageContainer: { height: "95%", width: "100%" },
  preview: { alignSelf: "stretch", flex: 1, width: "auto" },
  text: { fontSize: 24, fontWeight: "bold", color: "white" },
});
