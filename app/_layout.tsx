import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Network from "expo-network";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/contexto/AuthContext";
import {
  inicializarBaseDeDatos,
  sincronizarPendientes,
} from "@/src/servicios/colaOffline";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const teniaConexion = useRef(true);

  useEffect(() => {
    inicializarBaseDeDatos();

    // Chequea el estado de red cada 5 segundos.
    const intervalo = setInterval(async () => {
      const estado = await Network.getNetworkStateAsync();
      const hayConexionAhora = !!estado.isConnected;

      // Recién sincronizamos en el momento exacto en que pasa de "sin señal" a "con señal".
      if (hayConexionAhora && !teniaConexion.current) {
        sincronizarPendientes();
      }

      teniaConexion.current = hayConexionAhora;
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <AuthProvider>
      <NavegacionRaiz />
    </AuthProvider>
  );
}

function NavegacionRaiz() {
  const colorScheme = useColorScheme();
  const { usuario, cargandoSesion } = useAuth();

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
        <Stack.Protected guard={!usuario}>
          <Stack.Screen name="iniciosesion" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={esVecino}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="nuevo-reporte" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={esOperador}>
          <Stack.Screen name="bandeja" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
