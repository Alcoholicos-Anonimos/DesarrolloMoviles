import Ionicons from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

import {
  obtenerColores,
  espaciados,
  radios,
  tipografia,
  pesosFuente,
} from "@/styles/theme";

export default function HomeScreen() {
  const [texto, setTexto] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  const colorScheme = useColorScheme();

  const colores = obtenerColores(
    colorScheme === "dark" ? "dark" : "light"
  );

  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contenido}>

        <Text style={styles.titulo}>
          Iniciar sesión
        </Text>

        {/* EMAIL */}
        <View style={styles.campo}>
          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribí tu email"
            placeholderTextColor={colores.textoSuave}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.campo}>
          <Text style={styles.label}>
            Contraseña
          </Text>

          <View style={styles.inputContraseña}>
            <TextInput
              style={styles.inputTextoContraseña}
              value={contraseña}
              onChangeText={setContraseña}
              placeholder="Escribí tu contraseña"
              placeholderTextColor={colores.textoSuave}
              secureTextEntry={!mostrarContraseña}
            />

            <Pressable
              onPress={() =>
                setMostrarContraseña(!mostrarContraseña)
              }
              style={styles.botonOjo}
            >
              <Ionicons
                name={mostrarContraseña ? "eye-off" : "eye"}
                size={20}
                color={colores.textoSecundario}
              />
            </Pressable>
          </View>
        </View>

        {/* BOTÓN */}
        <Pressable
          style={({ pressed }) => [
            styles.boton,
            pressed && styles.botonPresionado,
          ]}
        >
          <Text style={styles.textoBoton}>
            Iniciar sesión
          </Text>

          {/* onPress: aquí se consultará a la API */}
        </Pressable>

      </View>
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
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: espaciados.extraGrande,
    },

    titulo: {
      ...tipografia.tituloPantalla,
      color: colores.texto,
      textAlign: "center",
      marginBottom: espaciados.muyGrande,
    },

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

    inputContraseña: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      borderRadius: radios.pequeno,
    },

    inputTextoContraseña: {
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

    boton: {
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      alignItems: "center",
      marginTop: espaciados.medio,
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