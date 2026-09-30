import Ionicons from "@react-native-vector-icons/ionicons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import {
  espaciados,
  obtenerColores,
  radios,
  tipografia,
} from "../../styles/theme";

const MAXIMO_FOTOS = 2;

type Props = {
  fotos: string[];
  onFotosChange: (fotos: string[]) => void;
};

export function SelectorFoto({ fotos, onFotosChange }: Props) {
  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  const agregarFoto = (uri: string) => {
    onFotosChange([...fotos, uri]);
  };

  const quitarFoto = (uri: string) => {
    onFotosChange(fotos.filter((f) => f !== uri));
  };

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a la cámara para sacar la foto.",
      );
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!resultado.canceled) {
      agregarFoto(resultado.assets[0].uri);
    }
  };

  const elegirDeGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus fotos para elegir una.",
      );
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
    });
    if (!resultado.canceled) {
      agregarFoto(resultado.assets[0].uri);
    }
  };

  const quedaLugar = fotos.length < MAXIMO_FOTOS;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Foto (obligatoria)</Text>

      {fotos.length > 0 && (
        <View style={styles.filaPreview}>
          {fotos.map((uri) => (
            <Pressable
              key={uri}
              onPress={() => quitarFoto(uri)}
              style={styles.previewWrapper}
            >
              <Image source={{ uri }} style={styles.fotoPreview} />
              <View style={styles.botonQuitar}>
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={colores.peligro}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {quedaLugar && (
        <View style={styles.filaBotonesGrandes}>
          <Pressable style={styles.botonGrande} onPress={tomarFoto}>
            <Ionicons name="camera-outline" size={24} color={colores.texto} />
            <Text style={styles.botonGrandeText}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.botonGrande} onPress={elegirDeGaleria}>
            <Ionicons name="images-outline" size={24} color={colores.texto} />
            <Text style={styles.botonGrandeText}>Galeria</Text>
          </Pressable>
        </View>
      )}

      {fotos.length > 0 && (
        <Text style={styles.textoAyuda}>
          {quedaLugar
            ? "Tocá una foto para sacarla"
            : "Máximo 2 fotos. Tocá una para sacarla."}
        </Text>
      )}
    </View>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    section: {
      marginTop: espaciados.grande,
    },
    sectionTitle: {
      ...tipografia.tituloSeccion,
      color: colores.texto,
      marginBottom: espaciados.medio,
    },
    filaBotonesGrandes: {
      flexDirection: "row",
      gap: espaciados.pequeno,
    },
    botonGrande: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.medio,
      paddingVertical: espaciados.muyGrande,
      alignItems: "center",
      gap: espaciados.pequeno,
    },
    botonGrandeText: {
      ...tipografia.texto,
      color: colores.texto,
    },
    filaPreview: {
      flexDirection: "row",
      gap: espaciados.pequeno,
      marginBottom: espaciados.medio,
    },
    previewWrapper: {
      position: "relative",
      flex: 1,
    },
    fotoPreview: {
      width: "100%",
      height: 140,
      borderRadius: radios.medio,
      backgroundColor: colores.superficie,
    },
    botonQuitar: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: colores.fondo,
      borderRadius: 999,
    },
    textoAyuda: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginTop: espaciados.pequeno,
    },
  });
};
