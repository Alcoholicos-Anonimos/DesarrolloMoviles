import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/contexto/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavegacionRaiz />
    </AuthProvider>
  );
}

function NavegacionRaiz() {
  const colorScheme = useColorScheme();
  const { usuario, cargandoSesion } = useAuth();

  // Mientras se lee la sesión guardada, mostramos una ruedita
  if (cargandoSesion) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const esVecino = usuario?.rol === "vecino";
  const esOperador = usuario?.rol === "operador";

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Sin sesión */}
        <Stack.Protected guard={!usuario}>
          <Stack.Screen name="iniciosesion" options={{ headerShown: false }} />
          <Stack.Screen name="registro" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Vecino */}
        <Stack.Protected guard={esVecino}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="nuevo-reporte" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Operador */}
        <Stack.Protected guard={esOperador}>
          <Stack.Screen name="bandeja" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Login obligatorio (acordado con Germán en el foro): no hay pantallas sin sesión salvo el login */}
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}