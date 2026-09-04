
import { useState } from 'react';
import { TextInput , Text, View, Pressable} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function HomeScreen() {
  const [texto, setTexto] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);

  return (
    <SafeAreaView>
      <View style={{ padding: 100 , alignItems: 'center'}}>
      
      {/* EMAIL */}
      <View style={{ padding: 20,alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Email</Text>
        <TextInput style={{ borderWidth: 1, padding: 10, width: '100%' }} 
        onChangeText={setTexto} 
        placeholder="Escribí tu email" />
      <View style={{ padding: 20 , flexDirection: 'row', alignItems: 'center'}}>
       </View>

    {/* PASSWORD */}
    <View style={{ padding: 20,alignItems: 'center',width: '100%' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Contraseña</Text>
     
      <View style={{  borderWidth: 1, flexDirection: 'row',   justifyContent: 'space-between'}}>
          <TextInput style={{  }}
           onChangeText={setContraseña} 
           placeholder="Escribí tu contraseña" 
           secureTextEntry={mostrarContraseña} />

          {/* Botoon OJITO para mostrar/ocultar contraseña */}
          <Pressable onPress={() => setMostrarContraseña(!mostrarContraseña)} >
            {/* Icono de ojo */}
            <Ionicons name={mostrarContraseña ? 'eye-off' : 'eye'} size={20} color="black" />
          </Pressable>
          </View>
      </View>
      </View>

        <Pressable style={{ padding: 15, backgroundColor: 'lightgray', borderRadius: 15, alignItems: 'center' }}>
          <Text>Iniciar sesión</Text>
          {/* onPress: aquí se consultará a la API si el usuario existe y la contraseña es correcta */}
        </Pressable>
      </View>

    </SafeAreaView>
  )
}


