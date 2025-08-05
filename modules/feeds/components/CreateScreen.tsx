import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";

import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";

export default function CreateScreen() {
  const router = useRouter();
  const { currentUser } = useAppStore();

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
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

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleShare = async () => {
    if (!selectedImage?.base64) {
      Alert.alert("Please select an image first.");
      return;
    }

    if (!currentUser?.serverId) {
      Alert.alert(
        "Error",
        "Could not find user authentication information."
      );
      return;
    }

    setIsSharing(true);
    try {
      const fileExt =
        selectedImage.uri.split(".").pop()?.toLowerCase() ??
        "jpg";
      const fileName = `${currentUser.serverId}/${new Date().toISOString()}.${fileExt}`;

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from("posts")
          .upload(fileName, decode(selectedImage.base64), {
            contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
          });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      const { error: functionError } =
        await supabase.functions.invoke("create-post", {
          body: {
            image_url: imageUrl,
            caption: caption,
          },
        });

      if (functionError) throw functionError;

      Alert.alert("Success!", "Your post has been shared.");
      router.back();
    } catch (error) {
      console.error("Error sharing post:", error);
      Alert.alert(
        "Error",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-3"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              className="text-gray-900 dark:text-white"
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            New Post
          </Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-30 h-30 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Ionicons
              name="camera"
              size={48}
              className="text-gray-600 dark:text-gray-400"
            />
          </View>

          <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
            Add a Photo
          </Text>

          <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-8 leading-6">
            Choose a photo from your gallery to share with
            your friends
          </Text>

          <TouchableOpacity
            onPress={pickImage}
            className="bg-blue-500 px-8 py-4 rounded-3xl flex-row items-center active:bg-blue-600"
          >
            <Ionicons
              name="image"
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="text-white text-base font-semibold">
              Select Photo
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <Ionicons
              name="close"
              size={24}
              className="text-gray-900 dark:text-white"
            />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            New Post
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            disabled={isSharing || !caption.trim()}
            className={`px-5 py-2 rounded-2xl ${
              !caption.trim() || isSharing
                ? "bg-gray-300 dark:bg-gray-700 opacity-50"
                : "bg-blue-500 active:bg-blue-600"
            }`}
          >
            {isSharing ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Text className="text-white text-sm font-semibold">
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Image Preview */}
          <View className="m-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
            <Image
              source={{ uri: selectedImage.uri }}
              className="w-full aspect-square"
              contentFit="cover"
            />

            {/* Remove Image Button */}
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-black/60 p-2 rounded-full active:bg-black/80"
            >
              <Ionicons
                name="close"
                size={16}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View className="mx-4 mb-6">
            <Text className="text-base font-medium text-gray-900 dark:text-white mb-2">
              Caption
            </Text>

            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a caption..."
                placeholderTextColor="#9CA3AF"
                className="text-base text-gray-900 dark:text-white min-h-[100px]"
                style={{ textAlignVertical: "top" }}
                multiline
                maxLength={500}
              />

              <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {caption.length}/500
                </Text>

                {caption.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setCaption("")}
                  >
                    <Text className="text-xs text-blue-500 font-medium">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
