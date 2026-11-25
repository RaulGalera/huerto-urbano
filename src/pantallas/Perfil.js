import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { useCuenta } from '../cuenta';
import { useDatos } from '../datos';
import { buscarCiudad, CIUDAD_POR_DEFECTO } from '../tiempo';
import Admin from './Admin';

export default function Perfil({ onCerrar }) {
  const { usuario, esAdmin, salir, cambiarContrasena } = useCuenta();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const { datos, guardarAjustes } = useDatos();
  const ciudad = (datos.ajustes && datos.ajustes.ciudad) || null;
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [avisoCiudad, setAvisoCiudad] = useState('');

  async function buscar() {
    if (busqueda.trim().length < 2) return;
    setAvisoCiudad('Buscando...');
    try {
      const lista = await buscarCiudad(busqueda);
      setResultados(lista);
      setAvisoCiudad(lista.length ? '' : 'No se ha encontrado esa ciudad');
    } catch (e) {
      setAvisoCiudad('No se pudo buscar. Revisa la conexion.');
    }
  }

  function guardarContrasena() {
    const error = cambiarContrasena(usuario.id, actual, nueva);
    setMensaje(error ? { texto: error, color: colores.rojo } : { texto: 'Contrasena cambiada', color: colores.verde });
    if (!error) {
      setActual('');
      setNueva('');
    }
  }

  return (
    <Modal visible animationType="none" onRequestClose={onCerrar}>
      <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingTop: 48, paddingBottom: 40 }}>
        <Pressable onPress={onCerrar} hitSlop={10} style={[estilos.fila, { marginBottom: 8, alignSelf: 'flex-start' }]}>
          <Ionicons name="chevron-back" size={18} color={colores.verde} />
          <Text style={{ color: colores.verde, fontSize: 14 }}>Volver</Text>
        </Pressable>
        <Text style={estilos.titulo}>Mi cuenta</Text>

        <View style={[estilos.tarjeta, estilos.fila, { gap: 12 }]}>
          <Ionicons name="person-circle" size={48} color={colores.verde} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.tarjetaTitulo}>{usuario.nombre}</Text>
            <Text style={estilos.tarjetaTexto}>@{usuario.usuario} - {esAdmin ? 'Administrador' : 'Usuario'}</Text>
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo}>Cambiar contrasena</Text>
          <Text style={estilos.etiqueta}>Contrasena actual</Text>
          <TextInput style={estilos.input} value={actual} onChangeText={setActual} secureTextEntry autoCapitalize="none" />
          <Text style={estilos.etiqueta}>Contrasena nueva</Text>
          <TextInput style={estilos.input} value={nueva} onChangeText={setNueva} secureTextEntry autoCapitalize="none" />
          {mensaje ? <Text style={{ color: mensaje.color, marginTop: 10 }}>{mensaje.texto}</Text> : null}
          <Pressable style={[estilos.botonSecundario, { marginTop: 14 }]} onPress={guardarContrasena}>
            <Text style={estilos.botonSecundarioTexto}>Guardar contrasena</Text>
          </Pressable>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo}>Ubicacion del huerto</Text>
          <Text style={estilos.tarjetaTexto}>
            Se usa para el tiempo y la lluvia. Ahora: {ciudad ? ciudad.nombre : CIUDAD_POR_DEFECTO.nombre + ' (por defecto)'}
          </Text>
          <View style={[estilos.fila, { gap: 8, marginTop: 10 }]}>
            <TextInput
              style={[estilos.input, { flex: 1 }]}
              value={busqueda}
              onChangeText={setBusqueda}
              onSubmitEditing={buscar}
              placeholder="Ej: Valencia"
              placeholderTextColor={colores.gris}
            />
            <Pressable style={[estilos.boton, { paddingHorizontal: 14, height: 44 }]} onPress={buscar}>
              <Ionicons name="search" size={20} color={colores.blanco} />
            </Pressable>
          </View>
          {avisoCiudad ? <Text style={[estilos.tarjetaTexto, { marginTop: 8 }]}>{avisoCiudad}</Text> : null}
          {resultados.map((c) => (
            <Pressable
              key={c.latitud + ',' + c.longitud}
              style={[estilos.fila, { gap: 8, paddingVertical: 10 }]}
              onPress={() => {
                guardarAjustes({ ciudad: { nombre: c.nombre, latitud: c.latitud, longitud: c.longitud } });
                setResultados([]);
                setBusqueda('');
                setAvisoCiudad('Ubicacion guardada: ' + c.nombre);
              }}
            >
              <Ionicons name="location-outline" size={18} color={colores.verde} />
              <Text style={{ color: colores.texto }}>
                {c.nombre} <Text style={{ color: colores.gris }}>{c.detalle}</Text>
              </Text>
            </Pressable>
          ))}
        </View>

        {esAdmin ? <Admin /> : null}

        <Pressable style={[estilos.boton, estilos.fila, { gap: 8, backgroundColor: colores.rojo, marginTop: 10 }]} onPress={salir}>
          <Ionicons name="log-out-outline" size={20} color={colores.blanco} />
          <Text style={estilos.botonTexto}>Cerrar sesion</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}
