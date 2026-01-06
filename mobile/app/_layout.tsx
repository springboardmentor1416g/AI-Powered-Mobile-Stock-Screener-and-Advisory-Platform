import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// 1. Import the AuthProvider we created
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    // 2. Wrap EVERYTHING in AuthProvider
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        
        {/* Landing Page */}
        <Stack.Screen name="index" />
        
        {/* Login/Register Screens */}
        <Stack.Screen name="(auth)" /> 

        {/* Main App (Tabs) */}
        <Stack.Screen name="(tabs)" />

        {/* Results Screen */}
        <Stack.Screen 
          name="results" 
          options={{ presentation: 'card' }} 
        />
      </Stack>
    </AuthProvider>
  );
}