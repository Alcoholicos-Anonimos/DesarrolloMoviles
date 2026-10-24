import React, { memo, useState } from 'react';
import { Image, View } from 'react-native';
import { Marker } from 'react-native-maps';

const iconos: Record<string, any> = {
  'tip-bache': require('../assets/images/tipos/warning-outline.png'),
  'tip-luz': require('../assets/images/tipos/flash-off-outline.png'),
  'tip-rama': require('../assets/images/tipos/leaf-outline.png'),
  'tip-basura': require('../assets/images/tipos/trash-outline.png'),
  'tip-agua': require('../assets/images/tipos/water-outline.png'),
  'tip-otro': require('../assets/images/tipos/ellipsis-horizontal-outline.png'),
};

export const MarcadorReporte = memo(({ reporte, color, onPress }: any) => {
  const [tracks, setTracks] = useState(true);

  return (
    <Marker
      coordinate={{
        latitude: reporte.coordenadas.latitud,
        longitude: reporte.coordenadas.longitud,
      }}
      tracksViewChanges={tracks}
      onPress={(e) => {
        e.stopPropagation();
        onPress(reporte);
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#fff',
        }}
      >
        <Image
          source={iconos[reporte.tipoId] ?? iconos['tip-otro']}
          style={{ width: 16, height: 16, tintColor: '#fff' }}
          onLoad={() => setTimeout(() => setTracks(false), 100)}
        />
      </View>
    </Marker>
  );
});