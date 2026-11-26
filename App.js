import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DatosProvider, useDatos } from './src/datos';
import { CuentaProvider, useCuenta } from './src/cuenta';
import Login from './src/pantallas/Login';
import Perfil from './src/pantallas/Perfil';
import Bienvenida from './src/componentes/Bienvenida';
import { colores, ponerTema } from './src/estilos';
import Resumen from './src/pantallas/Resumen';
import Parcelas from './src/pantallas/Parcelas';
import Siembras from './src/pantallas/Siembras';
import Riegos from './src/pantallas/Riegos';
import Cosechas from './src/pantallas/Cosechas';
import Temporadas from './src/pantallas/Temporadas';
import { ponerIdioma, t } from './src/idioma';
import { programarAvisos } from './src/avisos';

const pestanas = [
  { clave: 'resumen', texto: 'Inicio', icono: 'home', Pantalla: Resumen },
  { clave: 'parcelas', texto: 'Parcelas', icono: 'grid', Pantalla: Parcelas },
  { clave: 'siembras', texto: 'Siembras', icono: 'leaf', Pantalla: Siembras },
  { clave: 'riegos', texto: 'Riegos', icono: 'water', Pantalla: Riegos },
  { clave: 'cosechas', texto: 'Cosechas', icono: 'basket', Pantalla: Cosechas },
  { clave: 'temporadas', texto: 'Temp.', icono: 'calendar', Pantalla: Temporadas },
];

function Contenido({ perfil, setPerfil }) {
  const { cargado, datos } = useDatos();
  const { usuario, marcarBienvenida } = useCuenta();
  const avisos = usuario ? usuario.avisos : undefined;

  useEffect(() => {
    if (!cargado || avisos === undefined) return;
    programarAvisos(datos, avisos).catch(() => {});
  }, [cargado, datos, avisos]);
  const [actual, setActual] = useState('resumen');
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
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colores.borde, backgroundColor: colores.superficie, paddingTop: 10, paddingBottom: 12 }}>
        {pestanas.map((p) => {
          const activo = p.clave === actual;
          return (
            <Pressable key={p.clave} onPress={() => setActual(p.clave)} style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name={activo ? p.icono : p.icono + '-outline'} size={22} color={activo ? colores.verde : colores.gris} />
              <Text style={{ fontSize: 11, marginTop: 3, fontWeight: activo ? '700' : '400', color: activo ? colores.verde : colores.gris }}>{t(p.texto)}</Text>
            </Pressable>
          );
        })}
      </View>
      {perfil ? <Perfil onCerrar={() => setPerfil(false)} /> : null}
      {usuario && !usuario.bienvenida ? <Bienvenida onFin={() => marcarBienvenida(usuario.id)} /> : null}
    </View>
  );
}

function Sesion({ perfil, setPerfil }) {
  const { cargado, usuario, usuarios } = useCuenta();
  if (usuario) ponerIdioma(usuario.idioma || 'es');
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
      <Contenido key={usuario.idioma || 'es'} perfil={perfil} setPerfil={setPerfil} />
    </DatosProvider>
  );
}

export function elegirTema(preferencia, sistema) {
  if (preferencia === 'claro' || preferencia === 'oscuro') return preferencia;
  return sistema === 'dark' ? 'oscuro' : 'claro';
}

function Marco() {
  const { usuario } = useCuenta();
  const sistema = useColorScheme();
  const [perfil, setPerfil] = useState(false);
  const id = usuario ? usuario.id : null;
  useEffect(() => {
    setPerfil(false);
  }, [id]);
  const actual = elegirTema(usuario && usuario.tema, sistema);
  ponerTema(actual);
  return (
    <SafeAreaView key={actual} style={{ flex: 1, backgroundColor: colores.fondo }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' }}>
        <Sesion perfil={perfil} setPerfil={setPerfil} />
      </View>
      <StatusBar style={actual === 'oscuro' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CuentaProvider>
        <Marco />
      </CuentaProvider>
    </SafeAreaProvider>
  );
}
