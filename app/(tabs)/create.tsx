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
  ScrollView,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Add this import
import { COLORS } from "@/constants/theme";

export default function CreateScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets(); // Add this hook

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSharing, setIsSharing] = useState(false);

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

  const takePhoto = async () => {
    const permissionResult =
      await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const uploadImage = async (
    imageAsset: ImagePicker.ImagePickerAsset
  ) => {
    if (!imageAsset.base64) {
      throw new Error("No image data");
    }

    const fileExt = imageAsset.uri.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, decode(imageAsset.base64), {
        contentType: `image/${fileExt}`,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleShare = async () => {
    if (!caption.trim() && !selectedImage) {
      Alert.alert(
        "Nothing to Share",
        "Please add a caption or select an image."
      );
      return;
    }

    setIsSharing(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { data, error } =
        await supabase.functions.invoke("create-post", {
          body: {
            content: caption.trim(),
            image_url: imageUrl,
          },
        });

      if (error) throw error;

      // Reset form
      setCaption("");
      setSelectedImage(null);

      Alert.alert("Success", "Your post has been shared!", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Error",
        "Failed to share your post. Please try again."
      );
    } finally {
      setIsSharing(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header with proper safe area handling */}
      <View
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          shadowColor: isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.text.primary,
            }}
          >
            Create Post
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            disabled={
              isSharing ||
              (!caption.trim() && !selectedImage)
            }
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor:
                (!caption.trim() && !selectedImage) ||
                isSharing
                  ? colors.surface
                  : colors.primary,
              opacity:
                (!caption.trim() && !selectedImage) ||
                isSharing
                  ? 0.6
                  : 1,
            }}
          >
            {isSharing ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Text
                style={{
                  fontWeight: "600",
                  color:
                    !caption.trim() && !selectedImage
                      ? colors.text.secondary
                      : "white",
                }}
              >
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Caption Input */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What's on your mind? Share your fitness journey..."
              placeholderTextColor={colors.text.secondary}
              style={{
                fontSize: 16,
                lineHeight: 24,
                minHeight: 96,
                color: colors.text.primary,
                textAlignVertical: "top",
              }}
              multiline
              maxLength={500}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                }}
              >
                {caption.length}/500
              </Text>
            </View>
          </View>

          {/* Image Section */}
          {selectedImage ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{ width: "100%", height: 320 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Ionicons
                name="image-outline"
                size={48}
                color={colors.text.secondary}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  marginBottom: 16,
                  color: colors.text.primary,
                }}
              >
                Add a photo to your post
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: isDark
                      ? colors.surface
                      : "#f8f9fa",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="images-outline"
                      size={20}
                      color={colors.text.secondary}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: "600",
                        color: colors.text.primary,
                      }}
                    >
                      Gallery
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={takePhoto}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: isDark
                      ? colors.surface
                      : "#f8f9fa",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={colors.text.secondary}
                    />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: "600",
                        color: colors.text.primary,
                      }}
                    >
                      Camera
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tips Section */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="bulb-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                Sharing Tips
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: colors.text.secondary,
              }}
            >
              • Share your workout achievements{"\n"}• Post
              healthy meal ideas{"\n"}• Inspire others with
              your progress{"\n"}• Ask questions and get
              advice
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
