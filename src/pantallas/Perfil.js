import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos, tam } from '../estilos';
import { useCuenta } from '../cuenta';
import { useDatos } from '../datos';
import { buscarCiudad, CIUDAD_POR_DEFECTO } from '../tiempo';
import { ubicacionActual } from '../ubicacion';
import Admin from './Admin';
import { exportarCopia, importarCopia } from '../copia';
import { IDIOMAS, t } from '../idioma';
import Chips from '../componentes/Chips';
import Legal from './Legal';
import { DIAS_AVISO_RIEGO, HORA_AVISO, pedirPermiso, probarAviso, programarAvisos } from '../avisos';
import { fechaLocal } from '../util';
import { csvCosechas, csvRiegos, csvSiembras } from '../csv';
import { compartirTexto } from '../archivos';

export default function Perfil({ onCerrar }) {
  const { usuario, esAdmin, salir, cambiarContrasena, cambiarIdioma, cambiarTema, cambiarTexto, cambiarAvisos, cambiarNombre, borrarMiCuenta } = useCuenta();
  const [nombre, setNombre] = useState(usuario.nombre);
  const [avisoNombre, setAvisoNombre] = useState(null);
  const [claveBorrar, setClaveBorrar] = useState('');
  const [avisoBorrar, setAvisoBorrar] = useState('');
  const [verLegal, setVerLegal] = useState(false);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [avisoRiego, setAvisoRiego] = useState('');
  const [avisoCsv, setAvisoCsv] = useState(null);
  const { datos, guardarAjustes, reemplazar } = useDatos();
  const [textoCopia, setTextoCopia] = useState('');
  const [avisoCopia, setAvisoCopia] = useState(null);
  const ciudad = (datos.ajustes && datos.ajustes.ciudad) || null;
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [avisoCiudad, setAvisoCiudad] = useState('');

  async function usarGps() {
    setAvisoCiudad(t('Buscando tu ubicacion...'));
    try {
      const u = await ubicacionActual();
      guardarAjustes({ ciudad: u });
      setResultados([]);
      setAvisoCiudad(t('Ubicacion guardada:') + ' ' + u.nombre);
    } catch (e) {
      setAvisoCiudad(t('No se pudo usar el GPS. Revisa el permiso de ubicacion.'));
    }
  }

  async function buscar() {
    if (busqueda.trim().length < 2) return;
    setAvisoCiudad(t('Buscando...'));
    try {
      const lista = await buscarCiudad(busqueda);
      setResultados(lista);
      setAvisoCiudad(lista.length ? '' : t('No se ha encontrado esa ciudad'));
    } catch (e) {
      setAvisoCiudad(t('No se pudo buscar. Revisa la conexion.'));
    }
  }

  async function exportarCsv(tipo) {
    const generar = { siembras: csvSiembras, riegos: csvRiegos, cosechas: csvCosechas }[tipo];
    const nombre = tipo + '-' + fechaLocal() + '.csv';
    try {
      const r = await compartirTexto(generar(datos), nombre, 'text/csv');
      setAvisoCsv({ texto: r === 'descargado' ? t('Archivo descargado:') + ' ' + nombre : t('Archivo listo:') + ' ' + nombre, color: colores.verde });
    } catch (e) {
      setAvisoCsv({ texto: t('No se pudo exportar el archivo'), color: colores.rojo });
    }
  }

  async function exportar() {
    const texto = exportarCopia(datos);
    const nombre = 'huerto-' + fechaLocal() + '.json';
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;
      a.click();
      URL.revokeObjectURL(url);
      setAvisoCopia({ texto: t('Copia descargada:') + ' ' + nombre, color: colores.verde });
      return;
    }
    try {
      await Share.share({ title: nombre, message: texto });
    } catch (e) {
      setAvisoCopia({ texto: t('No se pudo compartir la copia'), color: colores.rojo });
    }
  }

  function restaurar() {
    let nuevos;
    try {
      nuevos = importarCopia(textoCopia);
    } catch (e) {
      setAvisoCopia({ texto: t(e.message), color: colores.rojo });
      return;
    }
    const hacer = () => {
      reemplazar(nuevos);
      setTextoCopia('');
      setAvisoCopia({ texto: t('Datos restaurados'), color: colores.verde });
    };
    const pregunta = t('Se cambiaran tus datos actuales por los de la copia. Continuar?');
    if (Platform.OS === 'web') {
      if (window.confirm(pregunta)) hacer();
    } else {
      Alert.alert(t('Restaurar copia'), pregunta, [
        { text: t('Cancelar'), style: 'cancel' },
        { text: t('Restaurar'), onPress: hacer },
      ]);
    }
  }

  function guardarNombre() {
    const error = cambiarNombre(usuario.id, nombre);
    setAvisoNombre(error ? { texto: t(error), color: colores.rojo } : { texto: t('Nombre guardado'), color: colores.verde });
  }

  function quitarAvisos() {
    if (usuario.avisos) programarAvisos(datos, false).catch(() => {});
  }

  function salirDeLaCuenta() {
    quitarAvisos();
    salir();
  }

  function borrarCuenta() {
    const pregunta = t('Se borrara tu cuenta y todos tus datos. No se puede deshacer. Continuar?');
    const hacer = () => {
      const error = borrarMiCuenta(claveBorrar);
      if (error) setAvisoBorrar(t(error));
      else quitarAvisos();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(pregunta)) hacer();
    } else {
      Alert.alert(t('Borrar mi cuenta'), pregunta, [
        { text: t('Cancelar'), style: 'cancel' },
        { text: t('Borrar'), style: 'destructive', onPress: hacer },
      ]);
    }
  }

  function guardarContrasena() {
    const error = cambiarContrasena(usuario.id, actual, nueva);
    setMensaje(error ? { texto: t(error), color: colores.rojo } : { texto: t('Contrasena cambiada'), color: colores.verde });
    if (!error) {
      setActual('');
      setNueva('');
    }
  }

  async function cambiarRiego(valor) {
    setAvisoRiego('');
    if (valor === 'no') {
      cambiarAvisos(usuario.id, false);
      return;
    }
    try {
      const permitido = await pedirPermiso();
      if (permitido) cambiarAvisos(usuario.id, true);
      else setAvisoRiego(t('Sin permiso para mostrar avisos. Activalo en los ajustes del movil.'));
    } catch (e) {
      setAvisoRiego(t('No se pudieron activar los avisos.') + ' ' + String((e && e.message) || e));
    }
  }

  async function probarRiego() {
    try {
      await probarAviso(datos);
      setAvisoRiego(t('Te llegara un aviso en unos segundos.'));
    } catch (e) {
      setAvisoRiego(t('No se pudieron activar los avisos.') + ' ' + String((e && e.message) || e));
    }
  }

  return (
    <Modal visible animationType="none" onRequestClose={onCerrar}>
      <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingTop: 48, paddingBottom: 40 }}>
        <Pressable accessibilityRole="button" onPress={onCerrar} hitSlop={10} style={[estilos.fila, { marginBottom: 8, alignSelf: 'flex-start' }]}>
          <Ionicons name="chevron-back" size={18} color={colores.verde} />
          <Text style={{ color: colores.verde, fontSize: tam(14) }}>{t('Volver')}</Text>
        </Pressable>
        <Text style={estilos.titulo} accessibilityRole="header">{t('Mi cuenta')}</Text>

        <View style={[estilos.tarjeta, estilos.fila, { gap: 12 }]}>
          <Ionicons name="person-circle" size={48} color={colores.verde} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{usuario.nombre}</Text>
            <Text style={estilos.tarjetaTexto}>@{usuario.usuario} - {t(esAdmin ? 'Administrador' : 'Usuario')}</Text>
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Mis datos')}</Text>
          <Text style={estilos.etiqueta}>{t('Nombre')}</Text>
          <TextInput style={estilos.input} value={nombre} onChangeText={setNombre} accessibilityLabel={t('Nombre')} />
          {avisoNombre ? <Text style={{ color: avisoNombre.color, marginTop: 8 }}>{avisoNombre.texto}</Text> : null}
          <Pressable accessibilityRole="button" style={[estilos.botonSecundario, { marginTop: 12 }]} onPress={guardarNombre}>
            <Text style={estilos.botonSecundarioTexto}>{t('Guardar nombre')}</Text>
          </Pressable>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Idioma de la app')}</Text>
          <View style={{ marginTop: 10 }}>
            <Chips opciones={IDIOMAS} valor={usuario.idioma || 'es'} onCambiar={(i) => cambiarIdioma(usuario.id, i)} abajo={0} />
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Apariencia')}</Text>
          <View style={{ marginTop: 10 }}>
            <Chips
              opciones={[
                { id: 'sistema', texto: t('Como el movil') },
                { id: 'claro', texto: t('Claro') },
                { id: 'oscuro', texto: t('Oscuro') },
              ]}
              valor={usuario.tema || 'sistema'}
              onCambiar={(v) => cambiarTema(usuario.id, v)}
              abajo={0}
            />
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Tamano del texto')}</Text>
          <Text style={estilos.tarjetaTexto}>{t('Agranda las letras de toda la app.')}</Text>
          <View style={{ marginTop: 10 }}>
            <Chips
              opciones={[
                { id: 'normal', texto: t('Normal') },
                { id: 'grande', texto: t('Grande') },
                { id: 'enorme', texto: t('Muy grande') },
              ]}
              valor={usuario.texto || 'normal'}
              onCambiar={(v) => cambiarTexto(usuario.id, v)}
              abajo={0}
            />
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Avisos de riego')}</Text>
          <Text style={estilos.tarjetaTexto}>
            {Platform.OS === 'web'
              ? t('Los avisos solo funcionan en el movil.')
              : t('Te avisamos a las') + ' ' + HORA_AVISO + ':00 ' + t('si una parcela lleva') + ' ' + DIAS_AVISO_RIEGO + ' ' + t('dias o mas sin regar.')}
          </Text>
          {Platform.OS === 'web' ? null : (
            <View style={{ marginTop: 10 }}>
              <Chips
                opciones={[
                  { id: 'no', texto: t('Desactivados') },
                  { id: 'si', texto: t('Activados') },
                ]}
                valor={usuario.avisos ? 'si' : 'no'}
                onCambiar={cambiarRiego}
                abajo={0}
              />
              {usuario.avisos ? (
                <Pressable accessibilityRole="button" style={[estilos.botonSecundario, { marginTop: 12 }]} onPress={probarRiego}>
                  <Text style={estilos.botonSecundarioTexto}>{t('Probar aviso')}</Text>
                </Pressable>
              ) : null}
              {avisoRiego ? <Text style={[estilos.tarjetaTexto, { marginTop: 10 }]}>{avisoRiego}</Text> : null}
            </View>
          )}
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Cambiar contrasena')}</Text>
          <Text style={estilos.etiqueta}>{t('Contrasena actual')}</Text>
          <TextInput accessibilityLabel={t('Contrasena actual')} style={estilos.input} value={actual} onChangeText={setActual} secureTextEntry autoCapitalize="none" />
          <Text style={estilos.etiqueta}>{t('Contrasena nueva')}</Text>
          <TextInput accessibilityLabel={t('Contrasena nueva')} style={estilos.input} value={nueva} onChangeText={setNueva} secureTextEntry autoCapitalize="none" />
          {mensaje ? <Text style={{ color: mensaje.color, marginTop: 10 }}>{mensaje.texto}</Text> : null}
          <Pressable accessibilityRole="button" style={[estilos.botonSecundario, { marginTop: 14 }]} onPress={guardarContrasena}>
            <Text style={estilos.botonSecundarioTexto}>{t('Guardar contrasena')}</Text>
          </Pressable>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Ubicacion del huerto')}</Text>
          <Text style={estilos.tarjetaTexto}>
            {t('Se usa para el tiempo y la lluvia. Ahora:')} {ciudad ? ciudad.nombre + (ciudad.gps ? ' (GPS)' : '') : CIUDAD_POR_DEFECTO.nombre + ' ' + t('(por defecto)')}
          </Text>
          <View style={[estilos.fila, { gap: 8, marginTop: 10 }]}>
            <TextInput
              style={[estilos.input, { flex: 1 }]}
              value={busqueda}
              onChangeText={setBusqueda}
              onSubmitEditing={buscar}
              accessibilityLabel={t('Ubicacion del huerto')}
              placeholder={t('Ej: Valencia')}
              placeholderTextColor={colores.gris}
            />
            <Pressable style={[estilos.boton, { paddingHorizontal: 14, height: 44 }]} onPress={buscar} accessibilityRole="button" accessibilityLabel={t('Buscar')}>
              <Ionicons name="search" size={20} color={colores.blanco} />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10 }]} onPress={usarGps}>
            <Ionicons name="navigate-outline" size={18} color={colores.verde} />
            <Text style={estilos.botonSecundarioTexto}>{t('Usar mi ubicacion (GPS)')}</Text>
          </Pressable>
          {avisoCiudad ? <Text style={[estilos.tarjetaTexto, { marginTop: 8 }]}>{avisoCiudad}</Text> : null}
          {resultados.map((c) => (
            <Pressable accessibilityRole="button"
              key={c.latitud + ',' + c.longitud}
              style={[estilos.fila, { gap: 8, paddingVertical: 10 }]}
              onPress={() => {
                guardarAjustes({ ciudad: { nombre: c.nombre, latitud: c.latitud, longitud: c.longitud } });
                setResultados([]);
                setBusqueda('');
                setAvisoCiudad(t('Ubicacion guardada:') + ' ' + c.nombre);
              }}
            >
              <Ionicons name="location-outline" size={18} color={colores.verde} />
              <Text style={{ color: colores.texto }}>
                {c.nombre} <Text style={{ color: colores.gris }}>{c.detalle}</Text>
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Exportar a Excel')}</Text>
          <Text style={estilos.tarjetaTexto}>{t('Archivos CSV que se abren con Excel o Google Sheets.')}</Text>
          <View style={[estilos.fila, { gap: 8, marginTop: 10, flexWrap: 'wrap' }]}>
            {[
              ['siembras', 'Siembras'],
              ['riegos', 'Riegos'],
              ['cosechas', 'Cosechas'],
            ].map(([tipo, texto]) => (
              <Pressable accessibilityRole="button" key={tipo} style={[estilos.botonSecundario, estilos.fila, { gap: 6, flexGrow: 1, justifyContent: 'center', paddingHorizontal: 12 }]} onPress={() => exportarCsv(tipo)} accessibilityLabel={t('Exportar') + ' ' + t(texto)}>
                <Ionicons name="document-text-outline" size={16} color={colores.verde} />
                <Text style={estilos.botonSecundarioTexto}>{t(texto)}</Text>
              </Pressable>
            ))}
          </View>
          {avisoCsv ? <Text style={{ color: avisoCsv.color, marginTop: 10 }}>{avisoCsv.texto}</Text> : null}
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Copia de seguridad')}</Text>
          <Text style={estilos.tarjetaTexto}>{t('Guarda tus temporadas, parcelas, siembras, riegos y cosechas para no perderlas.')}</Text>
          <Pressable accessibilityRole="button" style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10 }]} onPress={exportar}>
            <Ionicons name="download-outline" size={18} color={colores.verde} />
            <Text style={estilos.botonSecundarioTexto}>{t('Exportar mis datos')}</Text>
          </Pressable>
          <Text style={estilos.etiqueta}>{t('Para restaurar, pega aqui el texto de la copia')}</Text>
          <TextInput
            style={[estilos.input, { height: 80, paddingTop: 10, textAlignVertical: 'top' }]}
            value={textoCopia}
            onChangeText={setTextoCopia}
            accessibilityLabel={t('Para restaurar, pega aqui el texto de la copia')}
            multiline
            autoCapitalize="none"
            placeholder='{"app":"huerto-urbano", ...}'
            placeholderTextColor={colores.gris}
          />
          <Pressable accessibilityRole="button" style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10 }]} onPress={restaurar}>
            <Ionicons name="refresh-outline" size={18} color={colores.verde} />
            <Text style={estilos.botonSecundarioTexto}>{t('Restaurar copia')}</Text>
          </Pressable>
          {avisoCopia ? <Text style={{ color: avisoCopia.color, marginTop: 8 }}>{avisoCopia.texto}</Text> : null}
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tarjetaTitulo} accessibilityRole="header">{t('Privacidad')}</Text>
          <Pressable style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10 }]} onPress={() => setVerLegal(true)} accessibilityRole="button">
            <Ionicons name="shield-checkmark-outline" size={18} color={colores.verde} />
            <Text style={estilos.botonSecundarioTexto}>{t('Privacidad y aviso legal')}</Text>
          </Pressable>
          <Text style={[estilos.etiqueta, { marginTop: 16 }]}>{t('Para borrar tu cuenta escribe tu contrasena')}</Text>
          <TextInput style={estilos.input} value={claveBorrar} onChangeText={setClaveBorrar} secureTextEntry autoCapitalize="none" accessibilityLabel={t('Contrasena')} />
          {avisoBorrar ? <Text style={{ color: colores.rojo, marginTop: 8 }}>{avisoBorrar}</Text> : null}
          <Pressable style={[estilos.botonSecundario, estilos.fila, { gap: 8, marginTop: 10, borderColor: colores.rojo }]} onPress={borrarCuenta} accessibilityRole="button">
            <Ionicons name="trash-outline" size={18} color={colores.rojo} />
            <Text style={[estilos.botonSecundarioTexto, { color: colores.rojo }]}>{t('Borrar mi cuenta')}</Text>
          </Pressable>
        </View>
        {verLegal ? <Legal onCerrar={() => setVerLegal(false)} /> : null}

        {esAdmin ? <Admin /> : null}

        <Pressable accessibilityRole="button" style={[estilos.boton, estilos.fila, { gap: 8, backgroundColor: colores.rojo, marginTop: 10 }]} onPress={salirDeLaCuenta}>
          <Ionicons name="log-out-outline" size={20} color={colores.blanco} />
          <Text style={estilos.botonTexto}>{t('Cerrar sesion')}</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}
