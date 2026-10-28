import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Network from "expo-network";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { router, Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { configurarAvisos } from "@/src/servicios/avisos";
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
    configurarAvisos();

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
    
  useEffect(() => {
    const suscripcion = Notifications.addNotificationResponseReceivedListener(
      (respuesta) => {
        const reporteId = respuesta.notification.request.content.data?.reporteId;
        if (typeof reporteId === "string") {
          router.push({ pathname: "/reclamos/[id]", params: { id: reporteId } });
        }
      },
    );
    return () => suscripcion.remove();
  }, []);

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
          <Stack.Screen name="auth/iniciosesion" options={{ headerShown: false }} />
          <Stack.Screen name="auth/registro" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={esVecino}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="reclamos/nuevo-reporte" options={{ headerShown: false }} />
          <Stack.Screen name="avisos" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={esOperador}>
          <Stack.Screen name="(tabs-operador)" options={{ headerShown: false }} />
        </Stack.Protected>

       
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
