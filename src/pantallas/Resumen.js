import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estiloChip, estilos } from '../estilos';
import { hoy, useDatos } from '../datos';
import { nombrePor, numero, ordenarPorFecha, temporadaActual, ultimoRiego } from '../util';
import { useCuenta } from '../cuenta';
import { calcularBeneficio, euros } from '../calculos';
import Tiempo from '../componentes/Tiempo';
import Graficas from '../componentes/Graficas';
import { estadoSiembra, nombreMes, paraSembrar } from '../cultivos';
import { t } from '../idioma';

const DIAS_AVISO_RIEGO = 3;

function Dato({ valor, texto }) {
  return (
    <View style={[estilos.tarjeta, { flex: 1, alignItems: 'center', paddingVertical: 12, marginBottom: 0 }]}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colores.verde }}>{valor}</Text>
      <Text style={[estilos.tarjetaTexto, { marginTop: 4 }]}>{texto}</Text>
    </View>
  );
}

function Linea({ texto, valor, color, negrita }) {
  return (
    <View style={[estilos.fila, { justifyContent: 'space-between', marginTop: 8 }]}>
      <Text style={{ fontSize: 14, color: colores.texto, fontWeight: negrita ? '700' : '400' }}>{texto}</Text>
      <Text style={{ fontSize: 14, color: color || colores.texto, fontWeight: negrita ? '700' : '600' }}>{valor}</Text>
    </View>
  );
}

export default function Resumen({ onPerfil }) {
  const { datos, guardar, guardarAjustes } = useDatos();
  const guardarUbicacion = useCallback((ciudad) => guardarAjustes({ ciudad }), [guardarAjustes]);
  const { usuario, config, esAdmin } = useCuenta();
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const actual = temporadaActual(temporadas, hoy());
  const [elegidaGuardada, setElegida] = useState(null);
  const elegida = temporadas.some((x) => x.id === elegidaGuardada) ? elegidaGuardada : actual ? actual.id : temporadas[0] ? temporadas[0].id : null;

  const siembras = datos.siembras.filter((s) => s.temporadaId === elegida);
  const cosechas = datos.cosechas.filter((c) => siembras.some((s) => s.id === c.siembraId));
  const totalKilos = cosechas.reduce((a, c) => a + (Number(c.kilos) || 0), 0);
  const listas = siembras.filter((s) => {
    const e = estadoSiembra(s, datos.cosechas, hoy());
    return e && e.lista;
  });
  const proximas = siembras
    .map((s) => ({ s, e: estadoSiembra(s, datos.cosechas, hoy()) }))
    .filter((x) => x.e && !x.e.cosechada && x.e.faltan > 0 && x.e.faltan <= 14)
    .sort((a, b) => a.e.faltan - b.e.faltan);
  const mes = Number(hoy().slice(5, 7));
  const sembrarAhora = paraSembrar(mes);
  const cuentas = calcularBeneficio(datos, config, datos.temporadas.find((x) => x.id === elegida));

  const avisos = datos.parcelas
    .map((p) => ({ parcela: p, dias: ultimoRiego(datos.riegos, p.id) }))
    .filter((a) => a.dias === null || a.dias >= DIAS_AVISO_RIEGO);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 30 }}>
      <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <View>
          <Text style={[estilos.titulo, { marginBottom: 0 }]}>{t('Mi huerto')}</Text>
          <Text style={estilos.tarjetaTexto}>{t('Hola,')} {usuario ? usuario.nombre : ''}</Text>
        </View>
        <Pressable onPress={onPerfil} hitSlop={10} style={[estilos.fila, { gap: 4 }]} accessibilityRole="button" accessibilityLabel={t('Mi cuenta')}>
          {esAdmin ? (
            <View style={{ backgroundColor: colores.naranja, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: colores.blanco, fontSize: 11, fontWeight: '700' }}>ADMIN</Text>
            </View>
          ) : null}
          <Ionicons name="person-circle-outline" size={34} color={colores.verde} />
        </Pressable>
      </View>

      <Text style={[estilos.etiqueta, { marginTop: 0 }]}>{t('Temporada')}</Text>
      {temporadas.length === 0 ? (
        <Text style={estilos.tarjetaTexto}>{t('Crea una temporada en la pestana Temp. para ver el resumen.')}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {temporadas.map((x) => {
            const e = estiloChip(x.id === elegida);
            return (
              <Pressable key={x.id} style={e.caja} onPress={() => setElegida(x.id)}>
                <Text style={e.texto}>{x.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {avisos.length > 0 ? (
        <View style={{ backgroundColor: colores.rojoClaro, borderRadius: 10, padding: 14, marginTop: 18, flexDirection: 'row' }}>
          <Ionicons name="alert-circle" size={22} color={colores.rojo} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colores.rojo, fontWeight: '600', fontSize: 14, marginBottom: 6 }}>
              {t('Parcelas sin regar')} ({DIAS_AVISO_RIEGO} {t('dias o mas')})
            </Text>
            {avisos.map((a) => (
              <View key={a.parcela.id} style={[estilos.fila, { justifyContent: 'space-between', marginTop: 6 }]}>
                <Text style={{ color: colores.texto, fontSize: 14, flex: 1 }}>
                  {a.parcela.nombre} - {a.dias === null ? t('nunca regada') : a.dias + ' ' + t('dias sin riego')}
                </Text>
                <Pressable
                  onPress={() => guardar('riegos', { parcelaId: a.parcela.id, fecha: hoy(), litros: '', metodo: 'Manguera' })}
                  style={[estilos.fila, { gap: 4, backgroundColor: colores.superficie, borderRadius: 14, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: colores.borde }]}
                >
                  <Ionicons name="water" size={14} color={colores.verde} />
                  <Text style={{ color: colores.verde, fontSize: 12, fontWeight: '600' }}>{t('Regar hoy')}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Tiempo ciudad={datos.ajustes && datos.ajustes.ciudad} onUbicacion={guardarUbicacion} />

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
        <Dato valor={datos.parcelas.length} texto={t('Parcelas')} />
        <Dato valor={siembras.length} texto={t('Siembras')} />
        <Dato valor={numero(totalKilos)} texto={t('Kilos totales')} />
      </View>

      <View style={[estilos.tarjeta, { marginTop: 16 }]}>
        <View style={[estilos.fila, { gap: 8, marginBottom: 4 }]}>
          <Ionicons name="calendar-outline" size={20} color={colores.verde} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto }}>{t('Calendario del huerto')}</Text>
        </View>
        {listas.length > 0 ? (
          listas.map((s) => (
            <View key={s.id} style={[estilos.fila, { gap: 6, marginTop: 8 }]}>
              <Ionicons name="checkmark-circle" size={18} color={colores.verde} />
              <Text style={{ color: colores.texto, fontSize: 14 }}>
                {s.cultivo} ({nombrePor(datos.parcelas, s.parcelaId)}) {t('lista para cosechar')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={estilos.tarjetaTexto}>{t('Ninguna siembra pendiente de cosechar.')}</Text>
        )}
        {proximas.map((x) => (
          <View key={x.s.id} style={[estilos.fila, { gap: 6, marginTop: 8 }]}>
            <Ionicons name="time-outline" size={18} color={colores.naranja} />
            <Text style={{ color: colores.texto, fontSize: 14 }}>
              {x.s.cultivo} {t('en')} {x.e.faltan} {t(x.e.faltan === 1 ? 'dia' : 'dias')}
            </Text>
          </View>
        ))}
        <Text style={[estilos.etiqueta, { marginTop: 14 }]}>{t('Para sembrar en')} {t(nombreMes(mes))}</Text>
        <Text style={{ color: colores.texto, fontSize: 14, textTransform: 'capitalize' }}>{sembrarAhora.join(', ')}</Text>
      </View>

      <Graficas datos={datos} config={config} temporada={datos.temporadas.find((x) => x.id === elegida)} />

      {elegida ? (
        <View style={[estilos.tarjeta, { paddingBottom: 18 }]}>
          <View style={[estilos.fila, { gap: 8, marginBottom: 4 }]}>
            <Ionicons name="cash-outline" size={20} color={colores.verde} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto }}>{t('Beneficio de la temporada')}</Text>
          </View>
          <Linea texto={t('Venta a precio de mercado')} valor={euros(cuentas.ingresos)} color={colores.verde} />
          <Linea texto={t('Agua') + ' (' + numero(cuentas.litros, 0) + ' L)'} valor={euros(-cuentas.agua)} color={colores.rojo} />
          <Linea texto={t('Gastos de las parcelas')} valor={euros(-cuentas.gastos)} color={colores.rojo} />
          {cuentas.impuestos > 0 ? (
            <Linea texto={t('Impuestos') + ' (' + numero(config.impuestos, 0) + '%)'} valor={euros(-cuentas.impuestos)} color={colores.rojo} />
          ) : null}
          <View style={{ height: 1, backgroundColor: colores.borde, marginTop: 10 }} />
          <Linea texto={t('Beneficio')} valor={euros(cuentas.beneficio)} color={cuentas.beneficio >= 0 ? colores.verde : colores.rojo} negrita />
          {cuentas.porParcela.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={[estilos.etiqueta, { marginTop: 0 }]}>{t('Por parcela')}</Text>
              {cuentas.porParcela.map((x) => (
                <Linea key={x.parcela.id} texto={x.parcela.nombre} valor={euros(x.beneficio)} color={x.beneficio >= 0 ? colores.verde : colores.rojo} />
              ))}
            </View>
          ) : null}
          {cuentas.sinPrecio.length > 0 ? (
            <Text style={[estilos.tarjetaTexto, { color: colores.naranja, marginTop: 12 }]}>
              {t('Sin precio de mercado:')} {cuentas.sinPrecio.join(', ')}. {t(esAdmin ? 'Anadelo en el modo admin.' : 'Pide al administrador que lo anada.')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
