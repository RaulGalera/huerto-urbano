export const CIUDAD_POR_DEFECTO = { nombre: 'Madrid', latitud: 40.4168, longitud: -3.7038 };

const CODIGOS = [
  [0, 'Despejado', 'sunny-outline'],
  [3, 'Nubes y claros', 'partly-sunny-outline'],
  [48, 'Niebla', 'cloud-outline'],
  [57, 'Llovizna', 'rainy-outline'],
  [67, 'Lluvia', 'rainy-outline'],
  [77, 'Nieve', 'snow-outline'],
  [82, 'Chubascos', 'rainy-outline'],
  [86, 'Nieve', 'snow-outline'],
  [99, 'Tormenta', 'thunderstorm-outline'],
];

export function describirCodigo(codigo) {
  const c = CODIGOS.find(([max]) => codigo <= max) || CODIGOS[CODIGOS.length - 1];
  return { texto: c[1], icono: c[2] };
}

export async function buscarCiudad(nombre) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search?count=5&language=es&name=' + encodeURIComponent(nombre.trim());
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo buscar la ciudad');
  const j = await r.json();
  return (j.results || []).map((x) => ({
    nombre: x.name,
    detalle: [x.admin1, x.country].filter(Boolean).join(', '),
    latitud: x.latitude,
    longitud: x.longitude,
  }));
}

export const DIAS_PASADOS = 3;

function urlPrevision(latitud, longitud, modelo) {
  return (
    'https://api.open-meteo.com/v1/forecast?latitude=' +
    latitud +
    '&longitude=' +
    longitud +
    '&current=temperature_2m,weather_code' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max' +
    '&timezone=auto&forecast_days=3&past_days=' + DIAS_PASADOS +
    (modelo ? '&models=' + modelo : '')
  );
}

async function pedir(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo obtener el tiempo');
  return r.json();
}

function valor(lista, i, otro) {
  const v = lista && lista[i];
  return v === null || v === undefined ? otro : v;
}

export function combinarPrevision(precisa, general) {
  const base = precisa || general;
  const respaldo = general || precisa;
  const todos = base.daily.time.map((fecha, i) => ({
    fecha,
    codigo: valor(base.daily.weather_code, i, valor(respaldo.daily.weather_code, i, 0)),
    maxima: valor(base.daily.temperature_2m_max, i, valor(respaldo.daily.temperature_2m_max, i, 0)),
    minima: valor(base.daily.temperature_2m_min, i, valor(respaldo.daily.temperature_2m_min, i, 0)),
    lluvia: valor(base.daily.precipitation_sum, i, valor(respaldo.daily.precipitation_sum, i, 0)),
    probabilidad: valor(respaldo.daily.precipitation_probability_max, i, null),
  }));
  const hoyLugar = base.current.time ? String(base.current.time).slice(0, 10) : null;
  const dias = hoyLugar ? todos.filter((d) => d.fecha >= hoyLugar) : todos;
  const lluvias = {};
  if (hoyLugar) todos.filter((d) => d.fecha < hoyLugar).forEach((d) => (lluvias[d.fecha] = d.lluvia));
  return {
    actual: {
      temperatura: valor([base.current.temperature_2m], 0, respaldo.current.temperature_2m),
      codigo: valor([base.current.weather_code], 0, respaldo.current.weather_code),
    },
    dias,
    lluvias,
    modelo: precisa ? 'AROME (Meteo-France)' : 'Open-Meteo',
  };
}

export async function obtenerTiempo(latitud, longitud) {
  const [precisa, general] = await Promise.all([
    pedir(urlPrevision(latitud, longitud, 'meteofrance_seamless')).catch(() => null),
    pedir(urlPrevision(latitud, longitud)).catch(() => null),
  ]);
  if (!precisa && !general) throw new Error('No se pudo obtener el tiempo');
  const valida = precisa && precisa.daily && precisa.daily.temperature_2m_max && precisa.daily.temperature_2m_max[0] !== null ? precisa : null;
  return combinarPrevision(valida, general);
}

export const LLUVIA_SUFICIENTE = 3;
export const LLUVIA_COMO_RIEGO = 5;
const DIAS_GUARDADOS = 30;

export function juntarLluvias(antes, nuevas, hoy) {
  const limite = new Date(hoy + 'T00:00:00Z');
  limite.setUTCDate(limite.getUTCDate() - DIAS_GUARDADOS);
  const desde = limite.toISOString().slice(0, 10);
  const todas = { ...(antes || {}), ...(nuevas || {}) };
  const r = {};
  Object.keys(todas)
    .filter((f) => f >= desde)
    .sort()
    .forEach((f) => (r[f] = todas[f]));
  return r;
}

export function lluviaReciente(lluvias) {
  const fechas = Object.keys(lluvias || {}).filter((f) => lluvias[f] >= LLUVIA_COMO_RIEGO).sort();
  if (!fechas.length) return null;
  const fecha = fechas[fechas.length - 1];
  return { fecha, mm: lluvias[fecha] };
}

export function consejoRiego(dias) {
  const proximos = dias.slice(0, 2);
  const lluvia = proximos.reduce((a, d) => a + d.lluvia, 0);
  const maxima = Math.max(...proximos.map((d) => d.maxima));
  if (lluvia >= LLUVIA_SUFICIENTE) {
    return { tipo: 'lluvia', mm: lluvia.toFixed(1).replace('.', ','), texto: 'Van a caer unos ' + lluvia.toFixed(1).replace('.', ',') + ' mm en dos dias. Puedes saltarte el riego.' };
  }
  if (maxima >= 30) {
    return { tipo: 'calor', texto: 'Hace calor. Riega a primera hora o al atardecer.' };
  }
  if (maxima <= 2) {
    return { tipo: 'helada', texto: 'Puede helar. Protege los cultivos y riega poco.' };
  }
  return { tipo: 'normal', texto: 'No se espera lluvia. Sigue con el riego normal.' };
}
