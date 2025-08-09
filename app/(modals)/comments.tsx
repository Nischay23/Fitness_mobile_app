import React, {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  useColorScheme,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/theme";

export default function CommentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === "dark";

  const { post_id, post_author_id } = useLocalSearchParams<{
    post_id: string;
    post_author_id: string;
  }>();

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Function to fetch all comments for this post
  const fetchComments = useCallback(async () => {
    if (!post_id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`*, author:profiles(*)`)
        .eq("post_id", post_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [post_id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    try {
      const { data: createdComment, error } =
        await supabase.functions.invoke("create-comment", {
          body: { post_id: post_id, content: newComment },
        });
      if (error) throw error;

      setComments((currentComments) => [
        ...currentComments,
        createdComment,
      ]);
      setNewComment("");
    } catch (error: any) {
      Alert.alert("Error", "Could not post your comment.");
    } finally {
      setIsPosting(false);
    }
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
        backgroundColor={colors.background}
      />

      {/* Header */}
      <SafeAreaView
        style={{ backgroundColor: colors.background }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
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
                marginRight: 12,
              }}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Comments
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
              }}
            >
              <Image
                source={{
                  uri:
                    item.author?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${item.author?.username?.charAt(0) || "U"}&background=${isDark ? "374151" : "E5E7EB"}&color=${isDark ? "F9FAFB" : "1F2937"}`,
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                }}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {item.author?.username || "Unknown"}
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                paddingVertical: 64,
              }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={colors.text.secondary}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  textAlign: "center",
                  color: colors.text.secondary,
                  fontSize: 16,
                }}
              >
                No comments yet. Be the first!
              </Text>
            </View>
          }
        />
      )}

      {/* Comment Input */}
      <View
        style={{
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor={colors.text.secondary}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              maxHeight: 96,
              color: colors.text.primary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={isPosting || !newComment.trim()}
            style={{
              marginLeft: 12,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              backgroundColor: newComment.trim()
                ? colors.primary
                : colors.surface,
            }}
          >
            {isPosting ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Ionicons
                name="send"
                size={16}
                color={
                  newComment.trim()
                    ? "white"
                    : colors.text.secondary
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
