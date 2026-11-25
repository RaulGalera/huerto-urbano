import { buscarEnCatalogo } from './precios';

export const cultivos = {
  tomate: { dias: 80, meses: [2, 3, 4, 5] },
  lechuga: { dias: 50, meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  pimiento: { dias: 90, meses: [2, 3, 4, 5] },
  calabacin: { dias: 55, meses: [3, 4, 5, 6] },
  cebolla: { dias: 120, meses: [1, 2, 9, 10, 11] },
  patata: { dias: 100, meses: [2, 3, 4, 8] },
  zanahoria: { dias: 75, meses: [2, 3, 4, 5, 6, 7, 8, 9] },
  berenjena: { dias: 95, meses: [3, 4, 5] },
  pepino: { dias: 60, meses: [3, 4, 5, 6] },
  'judia verde': { dias: 60, meses: [4, 5, 6, 7] },
  fresa: { dias: 90, meses: [3, 4, 9, 10] },
  espinaca: { dias: 45, meses: [2, 3, 9, 10, 11] },
  acelga: { dias: 60, meses: [2, 3, 4, 5, 6, 7, 8, 9] },
  ajo: { dias: 180, meses: [10, 11, 12, 1] },
  brocoli: { dias: 85, meses: [6, 7, 8, 9] },
  puerro: { dias: 120, meses: [2, 3, 4, 8, 9] },
  haba: { dias: 120, meses: [10, 11, 12] },
  guisante: { dias: 70, meses: [10, 11, 12, 1, 2] },
  rabano: { dias: 30, meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  melon: { dias: 90, meses: [3, 4, 5] },
  sandia: { dias: 90, meses: [3, 4, 5] },
  coliflor: { dias: 100, meses: [6, 7, 8] },
  calabaza: { dias: 110, meses: [3, 4, 5] },
};

const NOMBRES_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function nombreMes(mes) {
  return NOMBRES_MES[mes - 1];
}

export function infoCultivo(nombre) {
  return buscarEnCatalogo(cultivos, nombre);
}

function sumarDias(iso, dias) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function diferenciaDias(desde, hasta) {
  return Math.round((new Date(hasta + 'T00:00:00Z') - new Date(desde + 'T00:00:00Z')) / 86400000);
}

export function fechaCosecha(siembra) {
  const info = infoCultivo(siembra.cultivo);
  if (!info || !siembra.fecha) return null;
  return sumarDias(siembra.fecha, info.dias);
}

export function estadoSiembra(siembra, cosechas, hoy) {
  const fecha = fechaCosecha(siembra);
  if (!fecha) return null;
  const faltan = diferenciaDias(hoy, fecha);
  const cosechada = cosechas.some((c) => c.siembraId === siembra.id);
  if (faltan > 0) return { fecha, faltan, lista: false, cosechada };
  return { fecha, faltan, lista: !cosechada, cosechada };
}

export function paraSembrar(mes) {
  return Object.keys(cultivos)
    .filter((k) => cultivos[k].meses.includes(mes))
    .sort();
}
