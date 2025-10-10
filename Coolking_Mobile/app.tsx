import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppRouter from "@/src/router/AppRouter";
import { checkAndRefreshSession } from "@/src/services/auth/checkSession";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [checking, setChecking] = useState(true);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const handleNavigation = (ok: boolean) => {
    if (!navigationRef.current || !isNavigationReady) {
      console.log("⏳ Navigation not ready", {
        hasRef: !!navigationRef.current,
        isReady: isNavigationReady
      });
      return false;
    }

    try {
      const targetScreen = ok ? "HomeScreen" : "LoginScreen";
      console.log(`🎯 Navigating to ${targetScreen}`);
      
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: targetScreen }],
      });
      
      console.log("✅ Navigation completed");
      return true;
    } catch (error) {
      console.error("❌ Navigation failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const ok = await checkAndRefreshSession();
        if (isNavigationReady) {
          handleNavigation(ok);
        } else {
          console.log("⏳ Waiting for navigation to be ready");
        }
      } catch (error) {
        console.error("❌ Init error:", error);
      } finally {
        setChecking(false);
      }
    };

    init();
  }, [isNavigationReady]); // Re-run when navigation becomes ready

  if (checking) {
    // Hiện loading khi đang check token
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={(state) => {
        // Handle state changes if needed
      }}
      onReady={() => {
        setIsNavigationReady(true);
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppRouter />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
