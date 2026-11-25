import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { useCuenta } from '../cuenta';
import { hoy, leerDatos, useDatos, vacio } from '../datos';
import { crearDatosEjemplo } from '../ejemplo';
import { normalizar, preciosIniciales } from '../precios';
import { numero } from '../util';
import { t } from '../idioma';

function confirmar(mensaje, accion) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensaje)) accion();
    return;
  }
  Alert.alert(t('Confirmar'), mensaje, [
    { text: t('Cancelar'), style: 'cancel' },
    { text: t('Aceptar'), style: 'destructive', onPress: accion },
  ]);
}

function Seccion({ icono, titulo, children }) {
  return (
    <View style={estilos.tarjeta}>
      <View style={[estilos.fila, { gap: 8, marginBottom: 6 }]}>
        <Ionicons name={icono} size={20} color={colores.naranja} />
        <Text style={estilos.tarjetaTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

function aTexto(n) {
  return String(n).replace('.', ',');
}

function aNumero(texto) {
  const n = Number(String(texto).replace(',', '.'));
  return isNaN(n) || n < 0 ? null : n;
}

export default function Admin() {
  const { usuarios, usuario, config, guardarConfig, cambiarRol, borrarUsuario } = useCuenta();
  const { datos, reemplazar } = useDatos();
  const [precios, setPrecios] = useState(() => Object.entries(config.precios).map(([k, v]) => ({ cultivo: k, precio: aTexto(v) })));
  const [agua, setAgua] = useState(aTexto(config.precioAgua));
  const [impuestos, setImpuestos] = useState(aTexto(config.impuestos));
  const [nuevoCultivo, setNuevoCultivo] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let vivo = true;
    Promise.all(usuarios.map((u) => leerDatos(u.id))).then((todos) => {
      if (!vivo) return;
      const suma = (campo) => todos.reduce((a, d) => a + d[campo].length, 0);
      const kilos = todos.reduce((a, d) => a + d.cosechas.reduce((b, c) => b + (Number(c.kilos) || 0), 0), 0);
      const litros = todos.reduce((a, d) => a + d.riegos.reduce((b, r) => b + (Number(r.litros) || 0), 0), 0);
      setStats({ parcelas: suma('parcelas'), siembras: suma('siembras'), kilos, litros, porUsuario: todos.map((d) => d.parcelas.length) });
    });
    return () => {
      vivo = false;
    };
  }, [usuarios, datos]);

  function avisar(texto, error) {
    setMensaje({ texto, color: error ? colores.rojo : colores.verde });
  }

  function guardarPrecios() {
    const lista = {};
    for (const p of precios) {
      const n = aNumero(p.precio);
      if (n === null) return avisar(t('Precio no valido en') + ' ' + p.cultivo, true);
      lista[p.cultivo] = n;
    }
    const a = aNumero(agua);
    const i = aNumero(impuestos);
    if (a === null) return avisar(t('Precio del agua no valido'), true);
    if (i === null || i > 100) return avisar(t('Impuestos tiene que estar entre 0 y 100'), true);
    guardarConfig({ ...config, precios: lista, precioAgua: a, impuestos: i });
    avisar(t('Precios guardados'));
  }

  function anadirCultivo() {
    const c = normalizar(nuevoCultivo);
    const n = aNumero(nuevoPrecio);
    if (!c || n === null) return avisar(t('Escribe el cultivo y un precio valido'), true);
    setPrecios([...precios.filter((p) => p.cultivo !== c), { cultivo: c, precio: aTexto(n) }]);
    setNuevoCultivo('');
    setNuevoPrecio('');
    avisar(t('Cultivo anadido. Pulsa Guardar precios para confirmar.'));
  }

  function restaurar() {
    confirmar(t('Volver a los precios por defecto?'), () => {
      setPrecios(Object.entries(preciosIniciales).map(([k, v]) => ({ cultivo: k, precio: aTexto(v) })));
      avisar(t('Precios restaurados. Pulsa Guardar precios para confirmar.'));
    });
  }

  return (
    <View style={{ marginTop: 6 }}>
      <View style={[estilos.fila, { gap: 8, marginBottom: 12, marginTop: 6 }]}>
        <Ionicons name="construct" size={22} color={colores.naranja} />
        <Text style={[estilos.titulo, { marginBottom: 0, fontSize: 20 }]}>{t('Modo admin')}</Text>
      </View>

      {mensaje ? <Text style={{ color: mensaje.color, marginBottom: 10 }}>{mensaje.texto}</Text> : null}

      <Seccion icono="stats-chart" titulo={t('Estadisticas de la app')}>
        {stats ? (
          <>
            <Text style={estilos.tarjetaTexto}>{t('Usuarios registrados:')} {usuarios.length}</Text>
            <Text style={estilos.tarjetaTexto}>{t('Parcelas en total:')} {stats.parcelas}</Text>
            <Text style={estilos.tarjetaTexto}>{t('Siembras en total:')} {stats.siembras}</Text>
            <Text style={estilos.tarjetaTexto}>{t('Kilos cosechados entre todos:')} {numero(stats.kilos)} kg</Text>
            <Text style={estilos.tarjetaTexto}>{t('Agua usada entre todos:')} {numero(stats.litros, 0)} L</Text>
          </>
        ) : (
          <Text style={estilos.tarjetaTexto}>{t('Cargando...')}</Text>
        )}
      </Seccion>

      <Seccion icono="pricetags" titulo={t('Precios de mercado (EUR/kg)')}>
        <Text style={[estilos.tarjetaTexto, { marginBottom: 8 }]}>{t('Se usan para calcular el beneficio de todos los usuarios.')}</Text>
        {precios
          .slice()
          .sort((a, b) => a.cultivo.localeCompare(b.cultivo))
          .map((p) => (
            <View key={p.cultivo} style={[estilos.fila, { gap: 8, marginTop: 6 }]}>
              <Text style={{ flex: 1, textTransform: 'capitalize', color: colores.texto }}>{p.cultivo}</Text>
              <TextInput
                style={[estilos.input, { width: 90, height: 38, textAlign: 'right' }]}
                value={p.precio}
                keyboardType="decimal-pad"
                onChangeText={(v) => setPrecios(precios.map((x) => (x.cultivo === p.cultivo ? { ...x, precio: v } : x)))}
              />
              <Pressable hitSlop={8} onPress={() => setPrecios(precios.filter((x) => x.cultivo !== p.cultivo))} accessibilityRole="button" accessibilityLabel={t('Quitar') + ' ' + p.cultivo}>
                <Ionicons name="close-circle-outline" size={22} color={colores.rojo} />
              </Pressable>
            </View>
          ))}
        <View style={[estilos.fila, { gap: 8, marginTop: 12 }]}>
          <TextInput style={[estilos.input, { flex: 1, height: 38 }]} value={nuevoCultivo} onChangeText={setNuevoCultivo} placeholder={t('Nuevo cultivo')} placeholderTextColor={colores.gris} />
          <TextInput style={[estilos.input, { width: 90, height: 38, textAlign: 'right' }]} value={nuevoPrecio} onChangeText={setNuevoPrecio} placeholder="EUR/kg" placeholderTextColor={colores.gris} keyboardType="decimal-pad" />
          <Pressable hitSlop={8} onPress={anadirCultivo} accessibilityRole="button" accessibilityLabel={t('Anadir cultivo')}>
            <Ionicons name="add-circle" size={26} color={colores.verde} />
          </Pressable>
        </View>

        <Text style={estilos.etiqueta}>{t('Precio del agua (EUR por m3)')}</Text>
        <TextInput style={estilos.input} value={agua} onChangeText={setAgua} keyboardType="decimal-pad" />
        <Text style={estilos.etiqueta}>{t('Impuestos sobre el beneficio (%)')}</Text>
        <TextInput style={estilos.input} value={impuestos} onChangeText={setImpuestos} keyboardType="decimal-pad" />

        <Pressable style={[estilos.boton, { marginTop: 16 }]} onPress={guardarPrecios}>
          <Text style={estilos.botonTexto}>{t('Guardar precios')}</Text>
        </Pressable>
        <Pressable style={{ alignItems: 'center', marginTop: 12 }} onPress={restaurar}>
          <Text style={{ color: colores.gris }}>{t('Restaurar precios por defecto')}</Text>
        </Pressable>
      </Seccion>

      <Seccion icono="people" titulo={t('Usuarios')}>
        {usuarios.map((u, i) => (
          <View key={u.id} style={[estilos.fila, { gap: 8, marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colores.texto, fontWeight: '600' }}>
                {u.nombre} {u.id === usuario.id ? t('(tu)') : ''}
              </Text>
              <Text style={estilos.tarjetaTexto}>
                @{u.usuario} - {t(u.rol === 'admin' ? 'Admin' : 'Usuario')} - {stats ? stats.porUsuario[i] : 0} {t('parcelas')}
              </Text>
            </View>
            <Pressable
              style={{ borderWidth: 1, borderColor: colores.borde, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 }}
              onPress={() => {
                const error = cambiarRol(u.id, u.rol === 'admin' ? 'usuario' : 'admin');
                avisar(t(error || 'Rol cambiado'), !!error);
              }}
            >
              <Text style={{ fontSize: 12, color: colores.texto }}>{t(u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin')}</Text>
            </Pressable>
            {u.id !== usuario.id ? (
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('Borrar usuario') + ' ' + u.usuario}
                onPress={() =>
                  confirmar(t('Borrar a') + ' ' + u.usuario + ' ' + t('y todos sus datos?'), () => {
                    const error = borrarUsuario(u.id);
                    avisar(t(error || 'Usuario borrado'), !!error);
                  })
                }
              >
                <Ionicons name="trash-outline" size={20} color={colores.rojo} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </Seccion>

      <Seccion icono="flask" titulo={t('Herramientas')}>
        <Text style={[estilos.tarjetaTexto, { marginBottom: 12 }]}>
          {t('Carga un huerto de ejemplo con temporadas, parcelas, siembras, riegos y cosechas. Viene bien para ensenar la app.')}
        </Text>
        <Pressable
          style={[estilos.botonSecundario, estilos.fila, { gap: 8 }]}
          onPress={() =>
            confirmar(t('Se sustituiran tus datos por los de ejemplo. Continuar?'), () => {
              reemplazar(crearDatosEjemplo(hoy()));
              avisar(t('Datos de ejemplo cargados'));
            })
          }
        >
          <Ionicons name="sparkles-outline" size={18} color={colores.texto} />
          <Text style={estilos.botonSecundarioTexto}>{t('Cargar datos de ejemplo')}</Text>
        </Pressable>
        <Pressable
          style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10 }]}
          onPress={() =>
            confirmar(t('Se borraran todos tus datos. Continuar?'), () => {
              reemplazar(vacio);
              avisar(t('Datos borrados'));
            })
          }
        >
          <Ionicons name="trash-outline" size={18} color={colores.rojo} />
          <Text style={[estilos.botonSecundarioTexto, { color: colores.rojo }]}>{t('Borrar mis datos')}</Text>
        </Pressable>
      </Seccion>
    </View>
  );
}
