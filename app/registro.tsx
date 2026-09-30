import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tamaniosIconos,
  tipografia,
} from "@/styles/theme";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LARGO_MINIMO_CONTRASENA = 6;

export default function RegistroScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [repetirContrasena, setRepetirContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);
  const { registrarse } = useAuth();

  const registrar = async () => {
    setError(null);

    // 1. Validaciones antes de llamar al servicio
    if (!nombre.trim() || !email.trim() || !contrasena) {
      setError("Completá nombre, email y contraseña.");
      return;
    }
    if (!EMAIL_VALIDO.test(email.trim())) {
      setError("El email no tiene un formato válido.");
      return;
    }
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
      setError(`La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
      return;
    }
    if (contrasena !== repetirContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // 2. Registro. Si sale bien, el contexto guarda la sesión y Stack.Protected
    //    lleva al vecino a sus pantallas solo (no navegamos a mano).
    setCargando(true);
    try {
      await registrarse({
        nombre,
        email,
        telefono: telefono.trim() ? telefono.trim() : null, // opcional: vacío = null
        contrasena,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  // Al escribir en cualquier campo se borra el error anterior
  const cambiar = (setter: (texto: string) => void) => (texto: string) => {
    setter(texto);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Volver">
            <Ionicons name="arrow-back" size={tamaniosIconos.grande} color={colores.texto} />
          </Pressable>
          <Text style={styles.headerTitulo}>Crear cuenta</Text>
        </View>

        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          {/* NOMBRE */}
          <View style={styles.campo}>
            <Text style={styles.label}>Nombre y apellido</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={cambiar(setNombre)}
              placeholder="Ej: Norma Pereyra"
              placeholderTextColor={colores.textoSuave}
              autoComplete="name"
              editable={!cargando}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.campo}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={cambiar(setEmail)}
              placeholder="nombre@mail.com"
              placeholderTextColor={colores.textoSuave}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!cargando}
            />
          </View>

          {/* TELÉFONO (opcional) */}
          <View style={styles.campo}>
            <Text style={styles.label}>Teléfono (opcional)</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={cambiar(setTelefono)}
              placeholder="Ej: 3446-412233"
              placeholderTextColor={colores.textoSuave}
              keyboardType="phone-pad"
              autoComplete="tel"
              editable={!cargando}
            />
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.campo}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContrasena}>
              <TextInput
                style={styles.inputTextoContrasena}
                value={contrasena}
                onChangeText={cambiar(setContrasena)}
                placeholder={`Al menos ${LARGO_MINIMO_CONTRASENA} caracteres`}
                placeholderTextColor={colores.textoSuave}
                secureTextEntry={!mostrarContrasena}
                autoCapitalize="none"
                editable={!cargando}
              />
              <Pressable
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
                style={styles.botonOjo}
                hitSlop={8}
                accessibilityLabel={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Ionicons
                  name={mostrarContrasena ? "eye-off" : "eye"}
                  size={tamaniosIconos.medio}
                  color={colores.textoSecundario}
                />
              </Pressable>
            </View>
          </View>

          {/* REPETIR CONTRASEÑA */}
          <View style={styles.campo}>
            <Text style={styles.label}>Repetir contraseña</Text>
            <TextInput
              style={styles.input}
              value={repetirContrasena}
              onChangeText={cambiar(setRepetirContrasena)}
              placeholder="Escribila de nuevo"
              placeholderTextColor={colores.textoSuave}
              secureTextEntry={!mostrarContrasena}
              autoCapitalize="none"
              editable={!cargando}
              onSubmitEditing={registrar}
              returnKeyType="go"
            />
          </View>

          {/* MENSAJE DE ERROR */}
          {error && <Text style={styles.textoError}>{error}</Text>}

          {/* BOTÓN */}
          <Pressable
            onPress={registrar}
            disabled={cargando}
            style={({ pressed }) => [styles.boton, (pressed || cargando) && styles.botonPresionado]}
          >
            {cargando ? (
              <ActivityIndicator color={colores.blanco} />
            ) : (
              <Text style={styles.textoBoton}>Crear cuenta</Text>
            )}
          </Pressable>

          {/* YA TENGO CUENTA */}
          <View style={styles.filaEnlace}>
            <Text style={styles.textoSecundario}>¿Ya tenés cuenta?</Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.textoEnlace}>Iniciá sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colores.fondo },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: espaciados.grande,
      gap: espaciados.grande,
    },
    headerTitulo: { ...tipografia.titulo, color: colores.texto },
    contenido: {
      paddingHorizontal: espaciados.extraGrande,
      paddingBottom: espaciados.enorme,
    },
    campo: { marginBottom: espaciados.grande },
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
    textoError: {
      ...tipografia.textoSecundario,
      color: colores.textoPeligro,
      textAlign: "center",
      marginBottom: espaciados.medio,
    },
    boton: {
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      marginTop: espaciados.pequeno,
    },
    botonPresionado: { opacity: 0.7 },
    textoBoton: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
    filaEnlace: {
      flexDirection: "row",
      justifyContent: "center",
      gap: espaciados.xs,
      marginTop: espaciados.muyGrande,
    },
    textoSecundario: { ...tipografia.textoSecundario, color: colores.textoSecundario },
    textoEnlace: {
      ...tipografia.textoSecundario,
      color: colores.enlace,
      fontWeight: pesosFuente.medio,
    },
  });
};
