import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StatusBar as RNStatusBar, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DatosProvider, useDatos } from './src/datos';
import { CuentaProvider, useCuenta } from './src/cuenta';
import Login from './src/pantallas/Login';
import Perfil from './src/pantallas/Perfil';
import { colores } from './src/estilos';
import Resumen from './src/pantallas/Resumen';
import Parcelas from './src/pantallas/Parcelas';
import Siembras from './src/pantallas/Siembras';
import Riegos from './src/pantallas/Riegos';
import Cosechas from './src/pantallas/Cosechas';
import Temporadas from './src/pantallas/Temporadas';

const pestanas = [
  { clave: 'resumen', texto: 'Inicio', icono: 'home', Pantalla: Resumen },
  { clave: 'parcelas', texto: 'Parcelas', icono: 'grid', Pantalla: Parcelas },
  { clave: 'siembras', texto: 'Siembras', icono: 'leaf', Pantalla: Siembras },
  { clave: 'riegos', texto: 'Riegos', icono: 'water', Pantalla: Riegos },
  { clave: 'cosechas', texto: 'Cosechas', icono: 'basket', Pantalla: Cosechas },
  { clave: 'temporadas', texto: 'Temp.', icono: 'calendar', Pantalla: Temporadas },
];

function Contenido() {
  const { cargado } = useDatos();
  const [actual, setActual] = useState('resumen');
  const [perfil, setPerfil] = useState(false);
  const { Pantalla } = pestanas.find((p) => p.clave === actual);

  if (!cargado) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={colores.verde} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Pantalla onPerfil={() => setPerfil(true)} />
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colores.borde, backgroundColor: colores.blanco, paddingTop: 10, paddingBottom: 12 }}>
        {pestanas.map((p) => {
          const activo = p.clave === actual;
          return (
            <Pressable key={p.clave} onPress={() => setActual(p.clave)} style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name={activo ? p.icono : p.icono + '-outline'} size={22} color={activo ? colores.verde : colores.gris} />
              <Text style={{ fontSize: 11, marginTop: 3, fontWeight: activo ? '700' : '400', color: activo ? colores.verde : colores.gris }}>{p.texto}</Text>
            </Pressable>
          );
        })}
      </View>
      {perfil ? <Perfil onCerrar={() => setPerfil(false)} /> : null}
    </View>
  );
}

function Sesion() {
  const { cargado, usuario, usuarios } = useCuenta();
  if (!cargado) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={colores.verde} size="large" />
      </View>
    );
  }
  if (!usuario) return <Login />;
  return (
    <DatosProvider key={usuario.id} usuarioId={usuario.id} migrar={usuarios[0] && usuarios[0].id === usuario.id}>
      <Contenido />
    </DatosProvider>
  );
}

export default function App() {
  return (
    <CuentaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colores.fondo, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' }}>
          <Sesion />
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </CuentaProvider>
  );
}
