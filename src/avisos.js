import { Platform } from 'react-native';
import { fechaLocal, ordenarPorFecha } from './util';
import { t } from './idioma';

export const DIAS_AVISO_RIEGO = 3;
export const HORA_AVISO = 9;
export const DIAS_PROGRAMADOS = 7;
const PREFIJO = 'riego-';
const CANAL = 'riego';

function diasEntre(desde, hasta) {
  return Math.round((new Date(hasta + 'T00:00:00') - new Date(desde + 'T00:00:00')) / 86400000);
}

export function sinRegar(datos, fecha) {
  return datos.parcelas
    .map((p) => {
      const r = ordenarPorFecha(datos.riegos.filter((x) => x.parcelaId === p.id && x.fecha <= fecha))[0];
      return { parcela: p, dias: r ? diasEntre(r.fecha, fecha) : null };
    })
    .filter((a) => a.dias === null || a.dias >= DIAS_AVISO_RIEGO);
}

export function textoAviso(lista) {
  const titulo = lista.length === 1 ? t('Toca regar') + ': ' + lista[0].parcela.nombre : t('Toca regar') + ': ' + lista.length + ' ' + t('parcelas');
  const cuerpo = lista
    .map((a) => a.parcela.nombre + ' (' + (a.dias === null ? t('nunca regada') : a.dias + ' ' + t('dias sin riego')) + ')')
    .join(', ');
  return { titulo, cuerpo };
}

export function planAvisos(datos, ahora) {
  const plan = [];
  for (let i = 0; i <= DIAS_PROGRAMADOS; i++) {
    const cuando = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i, HORA_AVISO, 0, 0);
    if (cuando <= ahora || plan.length >= DIAS_PROGRAMADOS) continue;
    const lista = sinRegar(datos, fechaLocal(cuando));
    if (lista.length) plan.push({ id: PREFIJO + fechaLocal(cuando), fecha: cuando, ...textoAviso(lista) });
  }
  return plan;
}

function modulo() {
  if (Platform.OS === 'web') return null;
  const N = require('expo-notifications');
  N.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  return N;
}

async function prepararCanal(N) {
  if (Platform.OS !== 'android') return;
  try {
    await N.setNotificationChannelAsync(CANAL, { name: t('Avisos de riego'), importance: N.AndroidImportance.DEFAULT });
  } catch (e) {}
}

export async function pedirPermiso() {
  const N = modulo();
  if (!N) return false;
  await prepararCanal(N);
  const actual = await N.getPermissionsAsync();
  if (actual.granted) return true;
  const nuevo = await N.requestPermissionsAsync();
  return !!nuevo.granted;
}

export async function programarAvisos(datos, activo) {
  const N = modulo();
  if (!N) return 0;
  const previos = await N.getAllScheduledNotificationsAsync();
  await Promise.all(
    previos.filter((p) => String(p.identifier).startsWith(PREFIJO)).map((p) => N.cancelScheduledNotificationAsync(p.identifier))
  );
  if (!activo) return 0;
  const permiso = await N.getPermissionsAsync();
  if (!permiso.granted) return 0;
  await prepararCanal(N);
  const plan = planAvisos(datos, new Date());
  for (const a of plan) {
    await N.scheduleNotificationAsync({
      identifier: a.id,
      content: { title: a.titulo, body: a.cuerpo },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: a.fecha, channelId: CANAL },
    });
  }
  return plan.length;
}

export async function probarAviso(datos) {
  const N = modulo();
  if (!N) return false;
  const lista = sinRegar(datos, fechaLocal(new Date()));
  const texto = lista.length ? textoAviso(lista) : { titulo: t('Avisos de riego'), cuerpo: t('Todas tus parcelas estan regadas.') };
  await prepararCanal(N);
  await N.scheduleNotificationAsync({
    content: { title: texto.titulo, body: texto.cuerpo },
    trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: CANAL },
  });
  return true;
}
