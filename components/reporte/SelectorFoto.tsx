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

type Props = {
  foto: string | null;
  onFotoChange: (uri: string | null) => void;
};

export function SelectorFoto({ foto, onFotoChange }: Props) {
  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

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
      onFotoChange(resultado.assets[0].uri);
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
      onFotoChange(resultado.assets[0].uri);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Foto (obligatoria)</Text>

      {foto ? (
        <Pressable onPress={() => onFotoChange(null)}>
          <Image source={{ uri: foto }} style={styles.fotoPreview} />
          <Text style={styles.textoCambiarFoto}>
            Tocá la foto para sacar otra
          </Text>
        </Pressable>
      ) : (
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
    fotoPreview: {
      width: "100%",
      height: 180,
      borderRadius: radios.medio,
      backgroundColor: colores.superficie,
    },
    textoCambiarFoto: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      textAlign: "center",
      marginTop: espaciados.pequeno,
    },
  });
};
