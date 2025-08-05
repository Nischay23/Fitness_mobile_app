import React, {
  createContext,
  useContext,
  useEffect,
} from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/stores/appStore";
import { findUserByServerId } from "@/db/actions/userActions";

interface AuthContextType {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(
  null
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }
  return context;
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    setCurrentUser,
    setOnboardingComplete,
    setLoading,
    setSupabaseUser,
    setSupabaseProfile,
  } = useAppStore();

  useEffect(() => {
    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`Supabase auth event: ${event}`);
          setLoading(true);

          try {
            const supabaseUser = session?.user;

            if (supabaseUser) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", supabaseUser.id)
                .single();

              if (setSupabaseProfile) {
                setSupabaseProfile(profile);
              }
              const localUser = await findUserByServerId(
                supabaseUser.id
              );

              if (localUser) {
                console.log(
                  "Local user found. Welcome back!"
                );
                setCurrentUser(localUser);
                setOnboardingComplete(true);
                router.replace("/(tabs)");
              } else {
                console.log(
                  "New user detected. Starting onboarding..."
                );
                setSupabaseUser(supabaseUser);
                setCurrentUser(null);
                setOnboardingComplete(false);
                router.replace("/onboarding");
              }
            } else {
              console.log("User logged out.");
              setCurrentUser(null);
              setOnboardingComplete(false);
              router.replace("/login" as any);
            }
          } catch (error) {
            console.error(
              "Auth state change error:",
              error
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setOnboardingComplete(false);
      router.replace("/login" as any);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
