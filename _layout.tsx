import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { FirebaseProvider } from "@/contexts/FirebaseContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{ headerBackTitle: "वापस", headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="bus-results"
        options={{
          headerShown: true,
          headerTitle: "बसें",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: "Inter_600SemiBold" },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="bus-detail"
        options={{
          headerShown: true,
          headerTitle: "बस विवरण",
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontFamily: "Inter_600SemiBold" },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <FirebaseProvider>{children}</FirebaseProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppProviders>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
