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
  SafeAreaView,
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
  const isDark = colorScheme === "dark";

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera permission is required to take photos.");
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

  const uploadImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    if (!imageAsset.base64) {
      throw new Error("No image data");
    }

    const fileExt = imageAsset.uri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, decode(imageAsset.base64), {
        contentType: `image/${fileExt}`,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleShare = async () => {
    if (!caption.trim() && !selectedImage) {
      Alert.alert("Nothing to Share", "Please add a caption or select an image.");
      return;
    }

    setIsSharing(true);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const { data, error } = await supabase.functions.invoke('create-post', {
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
        { text: "OK", onPress: () => router.push("/(tabs)") }
      ]);

    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert("Error", "Failed to share your post. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 items-center justify-center rounded-full"
          >
            <Ionicons 
              name="close" 
              size={20} 
              color={isDark ? '#D1D5DB' : '#6B7280'} 
            />
          </TouchableOpacity>

          <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Post
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            disabled={isSharing || (!caption.trim() && !selectedImage)}
            className={`px-4 py-2 rounded-full ${
              (!caption.trim() && !selectedImage) || isSharing
                ? (isDark ? 'bg-gray-700' : 'bg-gray-300')
                : 'bg-teal-500'
            }`}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`font-semibold ${
                (!caption.trim() && !selectedImage)
                  ? (isDark ? 'text-gray-400' : 'text-gray-500')
                  : 'text-white'
              }`}>
                Share
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Caption Input */}
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What's on your mind? Share your fitness journey..."
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              className={`text-base leading-6 min-h-24 ${isDark ? 'text-white' : 'text-gray-900'}`}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <View className="flex-row justify-between items-center mt-2">
              <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {caption.length}/500
              </Text>
            </View>
          </View>

          {/* Image Section */}
          {selectedImage ? (
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}>
              <View className="relative">
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  className="w-full h-80"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 mb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}>
              <View className="items-center">
                <Ionicons 
                  name="image-outline" 
                  size={48} 
                  color={isDark ? '#6B7280' : '#9CA3AF'} 
                  className="mb-4"
                />
                <Text className={`text-center font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add a photo to your post
                </Text>
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={pickImage}
                    className={`flex-1 py-3 px-4 rounded-xl border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons 
                        name="images-outline" 
                        size={20} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                      <Text className={`ml-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gallery
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takePhoto}
                    className={`flex-1 py-3 px-4 rounded-xl border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons 
                        name="camera-outline" 
                        size={20} 
                        color={isDark ? '#9CA3AF' : '#6B7280'} 
                      />
                      <Text className={`ml-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Camera
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Tips Section */}
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'} border`}>
            <View className="flex-row items-center mb-3">
              <Ionicons 
                name="bulb-outline" 
                size={20} 
                color="#00D4AA" 
              />
              <Text className="text-teal-500 text-sm font-semibold ml-2">
                Sharing Tips
              </Text>
            </View>
            <Text className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              • Share your workout achievements{'\n'}
              • Post healthy meal ideas{'\n'}
              • Inspire others with your progress{'\n'}
              • Ask questions and get advice
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
