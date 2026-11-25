import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { CIUDAD_POR_DEFECTO, consejoRiego, describirCodigo, obtenerTiempo } from '../tiempo';
import { ubicacionActual } from '../ubicacion';
import { t } from '../idioma';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function nombreDia(fecha, i) {
  if (i === 0) return t('Hoy');
  if (i === 1) return t('Manana');
  return t(DIAS[new Date(fecha + 'T12:00:00').getDay()]);
}

function textoConsejo(c) {
  if (c.tipo === 'lluvia') return t('Van a caer unos') + ' ' + c.mm + ' ' + t('mm en dos dias. Puedes saltarte el riego.');
  return t(c.texto);
}

function redondear(n) {
  return Math.round(n);
}

export default function Tiempo({ ciudad, onUbicacion }) {
  const lugar = ciudad || CIUDAD_POR_DEFECTO;
  const [estado, setEstado] = useState({ cargando: true });
  const [avisoGps, setAvisoGps] = useState('');

  function usarGps() {
    setAvisoGps(t('Buscando tu ubicacion...'));
    ubicacionActual()
      .then((u) => {
        setAvisoGps('');
        if (onUbicacion) onUbicacion(u);
      })
      .catch(() => setAvisoGps(t('No se pudo usar el GPS. Revisa el permiso de ubicacion.')));
  }


  const cargar = useCallback(() => {
    setEstado({ cargando: true });
    obtenerTiempo(lugar.latitud, lugar.longitud)
      .then((r) => setEstado({ tiempo: r }))
      .catch(() => setEstado({ error: true }));
  }, [lugar.latitud, lugar.longitud]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const consejo = estado.tiempo ? consejoRiego(estado.tiempo.dias) : null;
  const colorConsejo = consejo && consejo.tipo === 'lluvia' ? colores.verde : consejo && consejo.tipo !== 'normal' ? colores.naranja : colores.gris;

  return (
    <View style={[estilos.tarjeta, { marginTop: 16 }]}>
      <View style={[estilos.fila, { justifyContent: 'space-between' }]}>
        <View style={[estilos.fila, { gap: 8, flex: 1 }]}>
          <Ionicons name="partly-sunny-outline" size={20} color={colores.verde} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto }} numberOfLines={1}>
            {t('Tiempo en') + ' ' + lugar.nombre + (lugar.gps ? ' (GPS)' : '')}
          </Text>
        </View>
        <Pressable onPress={cargar} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('Actualizar el tiempo')}>
          <Ionicons name="refresh" size={18} color={colores.gris} />
        </Pressable>
      </View>
      {!ciudad ? (
        <>
          <Pressable style={[estilos.fila, { gap: 6, marginTop: 6, alignSelf: 'flex-start' }]} onPress={usarGps} accessibilityRole="button" hitSlop={8}>
            <Ionicons name="navigate-outline" size={14} color={colores.verde} />
            <Text style={{ fontSize: 13, color: colores.verde, fontWeight: '600' }}>{t('Usar mi ubicacion (GPS)')}</Text>
          </Pressable>
          {avisoGps ? <Text style={[estilos.tarjetaTexto, { marginTop: 6 }]}>{avisoGps}</Text> : null}
        </>
      ) : null}

      {estado.cargando ? <ActivityIndicator color={colores.verde} style={{ marginTop: 12 }} /> : null}
      {estado.error ? <Text style={[estilos.tarjetaTexto, { color: colores.rojo }]}>{t('No se pudo cargar el tiempo. Revisa la conexion.')}</Text> : null}

      {estado.tiempo ? (
        <>
          <View style={[estilos.fila, { gap: 10, marginTop: 12 }]}>
            <Ionicons name={describirCodigo(estado.tiempo.actual.codigo).icono} size={36} color={colores.verde} />
            <View>
              <Text style={{ fontSize: 26, fontWeight: '700', color: colores.texto }}>{Math.round(estado.tiempo.actual.temperatura)} C</Text>
              <Text style={estilos.tarjetaTexto}>{t('Ahora:')} {t(describirCodigo(estado.tiempo.actual.codigo).texto)}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 6 }}>
            {estado.tiempo.dias.map((d, i) => {
              const c = describirCodigo(d.codigo);
              return (
                <View key={d.fecha} style={{ flex: 1, alignItems: 'center', backgroundColor: colores.fondo, borderRadius: 8, paddingVertical: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colores.texto }}>{nombreDia(d.fecha, i)}</Text>
                  <Ionicons name={c.icono} size={26} color={colores.verde} style={{ marginVertical: 4 }} />
                  <Text style={{ fontSize: 13, color: colores.texto }}>
                    {redondear(d.maxima)} / {redondear(d.minima)} C
                  </Text>
                  <View style={[estilos.fila, { gap: 2, marginTop: 4 }]}>
                    <Ionicons name="water-outline" size={12} color={colores.gris} />
                    <Text style={{ fontSize: 11, color: colores.gris }}>
                      {d.lluvia.toFixed(1).replace('.', ',')} mm{d.probabilidad === null ? '' : ' - ' + d.probabilidad + '%'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={[estilos.fila, { gap: 6, marginTop: 12 }]}>
            <Ionicons name={consejo.tipo === 'lluvia' ? 'umbrella-outline' : 'information-circle-outline'} size={18} color={colorConsejo} />
            <Text style={{ flex: 1, fontSize: 14, color: colores.texto }}>{textoConsejo(consejo)}</Text>
          </View>
          <Text style={[estilos.tarjetaTexto, { fontSize: 11, marginTop: 10 }]}>{t('Datos:')} {estado.tiempo.modelo} {t('via')} Open-Meteo</Text>
        </>
      ) : null}
    </View>
  );
}
