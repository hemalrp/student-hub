import * as WebBrowser from "expo-web-browser"; // ← ADD THIS
import React, { useEffect } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

// Required for iOS OAuth redirect handling
WebBrowser.maybeCompleteAuthSession();            // ← ADD THIS

// ----------------------
// Mock tasks (your UI)
// ----------------------
type Task = {
  id: string;
  title: string;
  course: string;
  type: "assignment" | "event";
  dueDate: string;
  source: string;
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Math Homework 3",
    course: "Algebra II",
    type: "assignment",
    dueDate: "2026-01-05T23:59:00",
    source: "Google Classroom",
  },
  {
    id: "2",
    title: "History Quiz",
    course: "World History",
    type: "event",
    dueDate: "2026-01-06T09:00:00",
    source: "Canvas",
  },
];

// ----------------------
// MAIN SCREEN
// ----------------------
export default function HomeScreen() {
  console.log("THIS FILE IS RUNNING");

  // Expo deep link for redirect
  const redirectTo = "studenthub://auth/callback";


const signInWithGoogle = async () => {
  console.log("Redirecting to:", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.log("SUPABASE LOGIN ERROR:", error);
  } else {
    console.log("SUPABASE LOGIN STARTED:", data);

    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  }
};



  // Listen for auth changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        console.log("AUTH EVENT:", event);
        console.log("SESSION:", session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={signInWithGoogle} />

      <Text style={styles.header}>Upcoming Tasks</Text>

      <FlatList
        data={mockTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.course}>{item.course}</Text>
            <Text style={styles.meta}>
              {item.type.toUpperCase()} •{" "}
              {new Date(item.dueDate).toLocaleString()}
            </Text>
            <Text style={styles.source}>{item.source}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#020617",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: "#e5e7eb",
    fontWeight: "600",
  },
  course: {
    fontSize: 14,
    color: "#9ca3af",
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  source: {
    fontSize: 12,
    color: "#22c55e",
    marginTop: 4,
  },
});
