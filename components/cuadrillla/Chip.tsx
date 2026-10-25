import { espaciados, obtenerColores, radios, tipografia } from "@/styles/theme";
import { Pressable, StyleSheet, Text, } from "react-native";

type Estilos = ReturnType<typeof crearEstilos>;
type Colores = ReturnType<typeof obtenerColores>;

  
export function Chip({ texto, activo,  onPress, estilos, }: {
  texto: string;
  activo: boolean;
  onPress: () => void;
  estilos: Estilos;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const crearEstilos = (c: Colores) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: radios.pequeno,
      paddingVertical: espaciados.pequeno,
      paddingHorizontal: espaciados.medio,
    },
    chipActivo: {
      backgroundColor: c.primario,
      borderColor: c.primario,
    },
    chipTexto: {
      ...tipografia.textoPequeno,
      color: c.texto,
    },
    chipTextoActivo: {
      color: c.blanco,
    },
   
  });