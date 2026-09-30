import Ionicons from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/contexto/AuthContext";

import {
  obtenerColores,
  espaciados,
  radios,
  tipografia,
  pesosFuente,
  tamaniosIconos,
} from "@/styles/theme";

// Formato básico de email: algo@algo.algo
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InicioSesionScreen() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);
  const { iniciarSesion } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingresar = async () => {
    setError(null);

    if (!email.trim() || !contrasena) {
      setError("Completá el email y la contraseña.");
      return;
    }
    if (!EMAIL_VALIDO.test(email.trim())) {
      setError("El email no tiene un formato válido.");
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(email, contrasena);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  const olvideContrasena = () => {
    Alert.alert("Próximamente", "La recuperación de contraseña todavía no está disponible.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          {/* ENCABEZADO */}
          <View style={styles.encabezado}>
            <View style={styles.logo}>
              <Ionicons name="megaphone" size={tamaniosIconos.extraGrande} color={colores.blanco} />
            </View>
            <Text style={styles.titulo}>Reporte Ciudadano</Text>
            <Text style={styles.subtitulo}>Municipalidad de Gualeguaychú</Text>
          </View>

          {/* EMAIL */}
          <View style={styles.campo}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nombre@mail.com"
              placeholderTextColor={colores.textoSuave}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.campo}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContrasena}>
              <TextInput
                style={styles.inputTextoContrasena}
                value={contrasena}
                onChangeText={setContrasena}
                placeholder="Tu contraseña"
                placeholderTextColor={colores.textoSuave}
                secureTextEntry={!mostrarContrasena}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.botonOjo}
                hitSlop={8}
              >
                <Ionicons
                  name={mostrarContrasena ? "eye-off" : "eye"}
                  size={tamaniosIconos.medio}
                  color={colores.textoSecundario}
                />
              </Pressable>
            </View>
          </View>

          {/* OLVIDÉ MI CONTRASEÑA */}
          <Pressable style={styles.botonOlvido} hitSlop={8} onPress={olvideContrasena}>
            <Text style={styles.textoEnlace}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {/* MENSAJE DE ERROR */}
          {error && <Text style={styles.textoError}>{error}</Text>}

          {/* BOTÓN PRINCIPAL */}
          <Pressable
            onPress={ingresar}
            disabled={cargando}
            style={({ pressed }) => [
              styles.boton,
              (pressed || cargando) && styles.botonPresionado,
            ]}
          >
            {cargando ? (
              <ActivityIndicator color={colores.blanco} />
            ) : (
              <Text style={styles.textoBoton}>Ingresar</Text>
            )}
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    contenido: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: espaciados.extraGrande,
      paddingVertical: espaciados.enorme,
    },

    // Encabezado
    encabezado: {
      alignItems: "center",
      marginBottom: espaciados.enorme,
    },
    logo: {
      width: 64,
      height: 64,
      borderRadius: radios.grande,
      backgroundColor: colores.primario,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: espaciados.grande,
    },
    titulo: {
      ...tipografia.tituloPantalla,
      color: colores.texto,
      textAlign: "center",
    },
    subtitulo: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      textAlign: "center",
      marginTop: espaciados.xs,
    },

    // Campos
    campo: {
      marginBottom: espaciados.grande,
    },
    label: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
      marginBottom: espaciados.pequeno,
    },
    input: {
      ...tipografia.texto,
      color: colores.texto,
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      borderRadius: radios.pequeno,
      paddingHorizontal: espaciados.medio,
      paddingVertical: espaciados.medio,
    },
    inputContrasena: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      borderRadius: radios.pequeno,
    },
    inputTextoContrasena: {
      ...tipografia.texto,
      color: colores.texto,
      flex: 1,
      paddingHorizontal: espaciados.medio,
      paddingVertical: espaciados.medio,
    },
    botonOjo: {
      paddingHorizontal: espaciados.medio,
      paddingVertical: espaciados.medio,
    },

    // Link
    botonOlvido: {
      alignSelf: "flex-end",
      marginBottom: espaciados.grande,
    },
    textoEnlace: {
      ...tipografia.textoSecundario,
      color: colores.enlace,
      fontWeight: pesosFuente.medio,
    },

    // Error
    textoError: {
      ...tipografia.textoSecundario,
      color: colores.textoPeligro,
      textAlign: "center",
      marginBottom: espaciados.medio,
    },

    // Botón principal
    boton: {
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      alignItems: "center",
      minHeight: 44,
      justifyContent: "center",
    },
    botonPresionado: {
      opacity: 0.7,
    },
    textoBoton: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },

  });
};