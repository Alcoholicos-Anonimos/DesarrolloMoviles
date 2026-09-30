import { StyleSheet } from "react-native";

export const coloresClaros = {
  fondo: "#FFFFFF",
  superficie: "#F5F5F5",
  superficieSecundaria: "#EEEEEE",

  texto: "#111111",
  textoSecundario: "#666666",
  textoSuave: "#888780",

  borde: "#C9C7BD",
  bordeSuave: "#DDDDDD",

  primario: "#26215C",

  peligro: "#C0392B",
  peligroSuave: "#FDECEC",
  textoPeligro: "#C0392B",

  error: "#791F1F",

  advertencia: "#854F0B",
  fondoAdvertencia: "#FAEEDA",
  textoAdvertencia: "#633806",

  enlace: "#0C447C",

  blanco: "#FFFFFF",
  negro: "#000000",

  transparente: "transparent",
  fondoModal: "rgba(0,0,0,0.5)",
};

export const coloresOscuros = {
  fondo: "#121212",
  superficie: "#1E1E1E",
  superficieSecundaria: "#262626",

  texto: "#F3F4F6",
  textoSecundario: "#9CA3AF",
  textoSuave: "#888780",

  borde: "#444444",
  bordeSuave: "#333333",

  primario: "#26215C",

  peligro: "#C0392B",
  peligroSuave: "#3A1414",
  textoPeligro: "#E74C3C",

  error: "#791F1F",

  advertencia: "#854F0B",
  fondoAdvertencia: "#FAEEDA",
  textoAdvertencia: "#633806",

  enlace: "#7DB7E8",

  blanco: "#FFFFFF",
  negro: "#000000",

  transparente: "transparent",
  fondoModal: "rgba(0,0,0,0.5)",
};

export const espaciados = {
  xs: 4,
  pequeno: 8,
  medio: 12,
  grande: 16,
  extraGrande: 20,
  muyGrande: 24,
  enorme: 32,
};

export const radios = {
  pequeno: 8,
  medio: 12,
  grande: 16,
  redondo: 30,
};

export const tamaniosFuente = {
  pequeno: 12,
  secundario: 13,
  normal: 14,
  grande: 16,
  titulo: 20,
  tituloPantalla: 24,
};

export const tamaniosIconos = {
  pequeno: 14,
  medio: 20,
  grande: 24,
  extraGrande: 32,
};

export const pesosFuente = {
  normal: "400" as const,
  medio: "500" as const,
  seminegrita: "600" as const,
  negrita: "700" as const,
};

export const tipografia = {
  tituloPantalla: {
    fontSize: tamaniosFuente.tituloPantalla,
    fontWeight: pesosFuente.negrita,
  },

  titulo: {
    fontSize: tamaniosFuente.titulo,
    fontWeight: pesosFuente.negrita,
  },

  tituloSeccion: {
    fontSize: tamaniosFuente.grande,
    fontWeight: pesosFuente.medio,
  },

  texto: {
    fontSize: tamaniosFuente.normal,
    fontWeight: pesosFuente.normal,
  },

  textoSecundario: {
    fontSize: tamaniosFuente.secundario,
    fontWeight: pesosFuente.normal,
  },

  textoPequeno: {
    fontSize: tamaniosFuente.pequeno,
    fontWeight: pesosFuente.normal,
  },
};

export const estilosComunes = StyleSheet.create({
  pantalla: {
    flex: 1,
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
  },

  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export const coloresEstadoClaros = {
  recibido: {
    fondo: "#E6F1FB",
    texto: "#0C447C",
  },

  en_revision: {
    fondo: "#FAEEDA",
    texto: "#633806",
  },

  asignado: {
    fondo: "#FAEEDA",
    texto: "#633806",
  },

  resuelto: {
    fondo: "#EAF3DE",
    texto: "#27500A",
  },

  rechazado: {
    fondo: "#FCEBEB",
    texto: "#791F1F",
  },
};
export const coloresEstadoOscuros = {
  recibido: {
    fondo: "#0C2A3F",
    texto: "#7DB7E8",
  },

  en_revision: {
    fondo: "#3A2A12",
    texto: "#E5B567",
  },

  asignado: {
    fondo: "#3A2A12",
    texto: "#E5B567",
  },

  resuelto: {
    fondo: "#203315",
    texto: "#9BCB6B",
  },

  rechazado: {
    fondo: "#3A1414",
    texto: "#E74C3C",
  },
};

export const obtenerColores = (tema: "light" | "dark") => {
  return tema === "light" ? coloresClaros : coloresOscuros;
};

export const obtenerColoresEstado = (tema: "light" | "dark") => {
  return tema === "light" ? coloresEstadoClaros : coloresEstadoOscuros;
};

export const estiloMapaOscuro = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242424" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#BDBDBD" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242424" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#172A35" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#303030" }],
  },
];
