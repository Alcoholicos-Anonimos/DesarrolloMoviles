import { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { reportesService } from "../../src/servicios/reportes";
import { TipoDeReporte } from "../../src/tipos";
import {
    espaciados,
    obtenerColores,
    radios,
    tipografia,
} from "../../styles/theme";

type Props = {
  tipoSeleccionado: string;
  onSeleccionar: (id: string) => void;
};

export function SelectorTipoProblema({
  tipoSeleccionado,
  onSeleccionar,
}: Props) {
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoDeReporte[]>([]);

  const colorScheme = useColorScheme();

  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    reportesService.obtenerTipos().then((tipos) => {
      setTiposDisponibles(tipos);
    });
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Qué pasa?</Text>
      <View style={styles.chipsContainer}>
        {tiposDisponibles.map((tipo) => {
          const estaSeleccionado = tipo.id === tipoSeleccionado;
          return (
            <Pressable
              key={tipo.id}
              onPress={() => onSeleccionar(tipo.id)}
              style={[styles.chip, estaSeleccionado && styles.chipSeleccionado]}
            >
              <Text
                style={[
                  styles.chipText,
                  estaSeleccionado && styles.chipTextSeleccionado,
                ]}
              >
                {tipo.nombre}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: espaciados.pequeno,
    },
    chip: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.redondo,
      paddingVertical: 10,
      paddingHorizontal: espaciados.grande,
    },
    chipSeleccionado: {
      backgroundColor: colores.peligroSuave,
      borderColor: colores.peligro,
    },
    chipText: {
      ...tipografia.texto,
      color: colores.texto,
    },
    chipTextSeleccionado: {
      ...tipografia.texto,
      color: colores.textoPeligro,
    },
  });
};
