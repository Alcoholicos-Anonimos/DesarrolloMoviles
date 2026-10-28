import Ionicons from "@react-native-vector-icons/ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tamaniosIconos,
  tipografia,
} from "@/styles/theme";

type Props = {
  visible: boolean;
  onCerrar: () => void;
  onEscaneado: (texto: string) => void;
};

export function ModalEscanearQR({ visible, onCerrar, onEscaneado }: Props) {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  // La cámara dispara la lectura muchas veces seguidas: nos quedamos con la primera.
  const [yaEscaneo, setYaEscaneo] = useState(false);

  const insets = useSafeAreaInsets();
  const tema = useColorScheme() === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  // Cada vez que se abre, vuelve a estar listo para leer.
  useEffect(() => {
    if (visible) setYaEscaneo(false);
  }, [visible]);

  const alLeer = ({ data }: { data: string }) => {
    if (yaEscaneo) return;
    setYaEscaneo(true);
    onEscaneado(data.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCerrar}>
      <View style={styles.pantalla}>
        {/* Todavía no sabemos si hay permiso: no mostramos nada */}
        {permiso === null ? null : !permiso.granted ? (
          <View style={styles.centro}>
            <Ionicons
              name="camera-outline"
              size={tamaniosIconos.extraGrande}
              color={colores.textoSecundario}
            />
            <Text style={styles.textoPermiso}>
              Necesitamos la cámara para leer el código QR del reclamo.
            </Text>
            <Pressable
              style={styles.botonPermiso}
              onPress={() =>
                permiso.canAskAgain
                  ? solicitarPermiso()
                  : Linking.openSettings()
              }
            >
              <Text style={styles.textoBotonPermiso}>
                {permiso.canAskAgain ? "Permitir cámara" : "Abrir configuración"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* La cámara solo existe mientras el modal está abierto */}
            {visible && (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={yaEscaneo ? undefined : alLeer}
              />
            )}
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.marco} />
              <Text style={styles.textoAyuda}>
                Apuntá al código QR del reclamo
              </Text>
            </View>
          </>
        )}

        <Pressable
          style={[styles.botonCerrar, { top: insets.top + espaciados.medio }]}
          onPress={onCerrar}
          hitSlop={8}
          accessibilityLabel="Cerrar escáner"
        >
          <Ionicons
            name="close"
            size={tamaniosIconos.grande}
            color={colores.blanco}
          />
        </Pressable>
      </View>
    </Modal>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    pantalla: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    centro: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: espaciados.muyGrande,
      gap: espaciados.grande,
    },
    textoPermiso: {
      ...tipografia.texto,
      color: colores.texto,
      textAlign: "center",
    },
    botonPermiso: {
      backgroundColor: colores.primario,
      borderRadius: radios.pequeno,
      paddingVertical: espaciados.medio,
      paddingHorizontal: espaciados.extraGrande,
    },
    textoBotonPermiso: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      gap: espaciados.grande,
    },
    marco: {
      width: 240,
      height: 240,
      borderWidth: 3,
      borderColor: colores.blanco,
      borderRadius: radios.medio,
    },
    textoAyuda: {
      ...tipografia.textoSecundario,
      color: colores.blanco,
      backgroundColor: colores.fondoModal,
      borderRadius: radios.pequeno,
      paddingVertical: espaciados.pequeno,
      paddingHorizontal: espaciados.medio,
    },
    botonCerrar: {
      position: "absolute",
      right: espaciados.grande,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colores.fondoModal,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
