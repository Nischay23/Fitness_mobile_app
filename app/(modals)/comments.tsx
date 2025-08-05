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
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  useColorScheme,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/constants/theme";

export default function CommentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = COLORS[colorScheme];

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
        .select(`*, author:profiles(*)`) // Join with profiles to get author info
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

      // Add the new comment to the top of the list instantly (Optimistic Update)
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
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Comments",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { color: colors.text.primary },
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          style={styles.commentsList}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Image
                source={{
                  uri:
                    item.author?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${item.author?.username?.charAt(0) || "U"}`,
                }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <Text
                  style={[
                    styles.commentUsername,
                    { color: colors.text.primary },
                  ]}
                >
                  {item.author?.username || "Unknown"}
                </Text>
                <Text
                  style={[
                    styles.commentText,
                    { color: colors.text.secondary },
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.text.muted },
                ]}
              >
                No comments yet. Be the first!
              </Text>
            </View>
          }
        />
      )}

      {/* Comment Input Box */}
      <View
        style={[
          styles.inputContainer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor={colors.text.muted}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              color: colors.text.primary,
            },
          ]}
          multiline
        />
        <Pressable
          onPress={handleAddComment}
          disabled={isPosting || !newComment.trim()}
          style={[
            styles.postButton,
            {
              backgroundColor: newComment.trim()
                ? colors.primary
                : colors.surface,
              opacity: isPosting ? 0.6 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.postButtonText,
              {
                color: newComment.trim()
                  ? colors.text.inverse
                  : colors.text.muted,
              },
            ]}
          >
            {isPosting ? "Posting..." : "Post"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#333",
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  commentUsername: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: "top",
  },
  postButton: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  postButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
