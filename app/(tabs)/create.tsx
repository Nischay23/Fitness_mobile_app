import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export default function CreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastOpacity] = useState(new Animated.Value(0));

  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const showSuccessToast = () => {
    setShowToast(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowToast(false);
        // Navigate to feeds screen
        router.push("/(tabs)/feeds");
      });
    }, 1000);
  };

  const handleShare = async () => {
    if (!selectedImage?.base64) {
      return Alert.alert(
        "Error",
        "Please select an image to share."
      );
    }

    setIsSharing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error("User not found. Please log in.");

      console.log("Currently logged-in User ID:", user.id);

      // 2. Create a unique file name
      const fileExt =
        selectedImage.uri.split(".").pop()?.toLowerCase() ??
        "jpg";
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // 3. Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("posts")
          .upload(fileName, decode(selectedImage.base64), {
            contentType: `image/${fileExt}`,
            upsert: false,
          });

      if (uploadError) throw uploadError;

      // 4. Get the public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadData.path);

      // 5. Call the 'create-post' Edge Function
      const { error: functionError } =
        await supabase.functions.invoke("create-post", {
          body: {
            image_url: urlData.publicUrl,
            caption: caption,
          },
        });

      if (functionError) throw functionError;

      // 6. If successful, show toast and navigate to feeds
      setCaption(""); // Clear the caption
      setSelectedImage(null); // Clear the selected image
      showSuccessToast();
    } catch (error: any) {
      console.error("Share Post Error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to share post."
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
        style={styles.container}
      >
        <Stack.Screen
          options={{
            title: "Create Post",
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text.primary,
            headerTitleStyle: {
              color: colors.text.primary,
            },
          }}
        />
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            onPress={pickImage}
            style={[
              styles.imagePicker,
              {
                backgroundColor: colors.surface,
                borderColor: selectedImage
                  ? "transparent"
                  : colors.border,
                borderWidth: selectedImage ? 0 : 2,
              },
            ]}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.image}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="camera"
                  size={50}
                  color={colors.text.muted}
                />
                <Text
                  style={[
                    styles.imagePlaceholderText,
                    { color: colors.text.muted },
                  ]}
                >
                  Tap to select an image
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor={colors.text.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text.primary,
                borderColor: colors.border,
              },
            ]}
            multiline
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleShare}
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  opacity: isSharing ? 0.6 : 1,
                },
              ]}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator
                  color={colors.text.inverse}
                />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors.text.inverse },
                  ]}
                >
                  Share
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Toast Message */}
        {showToast && (
          <Animated.View
            style={[
              styles.toast,
              {
                backgroundColor: colors.primary,
                opacity: toastOpacity,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.text.inverse}
            />
            <Text
              style={[
                styles.toastText,
                { color: colors.text.inverse },
              ]}
            >
              Post created successfully!
            </Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Using StyleSheet for clarity
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120, // Extra padding to account for tab bar
  },
  imagePicker: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  input: {
    fontSize: 16,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "#4ADE80",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  toastText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
