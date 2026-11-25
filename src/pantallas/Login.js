import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { useCuenta } from '../cuenta';

function Campo({ etiqueta, valor, onCambio, secreto, ejemplo }) {
  return (
    <View>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={estilos.input}
        value={valor}
        onChangeText={onCambio}
        secureTextEntry={secreto}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={ejemplo}
        placeholderTextColor={colores.gris}
      />
    </View>
  );
}

export default function Login() {
  const { entrar, registrar } = useCuenta();
  const [modo, setModo] = useState('entrar');
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');

  function enviar() {
    if (modo === 'entrar') {
      setError(entrar(usuario, contrasena) || '');
      return;
    }
    if (contrasena !== repetir) {
      setError('Las contrasenas no coinciden');
      return;
    }
    setError(registrar(nombre, usuario, contrasena) || '');
  }

  function cambiarModo() {
    setModo(modo === 'entrar' ? 'registro' : 'entrar');
    setError('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, width: '100%', maxWidth: 480, alignSelf: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colores.verdeClaro, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="leaf" size={42} color={colores.verde} />
          </View>
          <Text style={[estilos.titulo, { marginTop: 14, marginBottom: 4 }]}>Huerto Urbano</Text>
          <Text style={estilos.tarjetaTexto}>{modo === 'entrar' ? 'Inicia sesion para ver tu huerto' : 'Crea tu cuenta'}</Text>
        </View>

        {modo === 'registro' ? <Campo etiqueta="Nombre" valor={nombre} onCambio={setNombre} ejemplo="Ej: Raul" /> : null}
        <Campo etiqueta="Usuario" valor={usuario} onCambio={setUsuario} ejemplo="Ej: raul" />
        <Campo etiqueta="Contrasena" valor={contrasena} onCambio={setContrasena} secreto />
        {modo === 'registro' ? <Campo etiqueta="Repetir contrasena" valor={repetir} onCambio={setRepetir} secreto /> : null}

        {error ? <Text style={{ color: colores.rojo, marginTop: 14 }}>{error}</Text> : null}

        <Pressable style={[estilos.boton, { marginTop: 24 }]} onPress={enviar}>
          <Text style={estilos.botonTexto}>{modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}</Text>
        </Pressable>
        <Pressable style={{ marginTop: 18, alignItems: 'center', padding: 6 }} onPress={cambiarModo}>
          <Text style={{ color: colores.verde, fontWeight: '600' }}>
            {modo === 'entrar' ? 'No tengo cuenta, quiero registrarme' : 'Ya tengo cuenta, quiero entrar'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
