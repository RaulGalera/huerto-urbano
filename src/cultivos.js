import { buscarEnCatalogo } from './precios';

export const cultivos = {
  tomate: { familia: 'solanaceas', dias: 80, meses: [2, 3, 4, 5] },
  lechuga: { familia: 'compuestas', dias: 50, meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  pimiento: { familia: 'solanaceas', dias: 90, meses: [2, 3, 4, 5] },
  calabacin: { familia: 'cucurbitaceas', dias: 55, meses: [3, 4, 5, 6] },
  cebolla: { familia: 'aliaceas', dias: 120, meses: [1, 2, 9, 10, 11] },
  patata: { familia: 'solanaceas', dias: 100, meses: [2, 3, 4, 8] },
  zanahoria: { familia: 'umbeliferas', dias: 75, meses: [2, 3, 4, 5, 6, 7, 8, 9] },
  berenjena: { familia: 'solanaceas', dias: 95, meses: [3, 4, 5] },
  pepino: { familia: 'cucurbitaceas', dias: 60, meses: [3, 4, 5, 6] },
  'judia verde': { familia: 'leguminosas', dias: 60, meses: [4, 5, 6, 7] },
  fresa: { familia: 'rosaceas', dias: 90, meses: [3, 4, 9, 10] },
  espinaca: { familia: 'quenopodiaceas', dias: 45, meses: [2, 3, 9, 10, 11] },
  acelga: { familia: 'quenopodiaceas', dias: 60, meses: [2, 3, 4, 5, 6, 7, 8, 9] },
  ajo: { familia: 'aliaceas', dias: 180, meses: [10, 11, 12, 1] },
  brocoli: { familia: 'cruciferas', dias: 85, meses: [6, 7, 8, 9] },
  puerro: { familia: 'aliaceas', dias: 120, meses: [2, 3, 4, 8, 9] },
  haba: { familia: 'leguminosas', dias: 120, meses: [10, 11, 12] },
  guisante: { familia: 'leguminosas', dias: 70, meses: [10, 11, 12, 1, 2] },
  rabano: { familia: 'cruciferas', dias: 30, meses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  melon: { familia: 'cucurbitaceas', dias: 90, meses: [3, 4, 5] },
  sandia: { familia: 'cucurbitaceas', dias: 90, meses: [3, 4, 5] },
  coliflor: { familia: 'cruciferas', dias: 100, meses: [6, 7, 8] },
  calabaza: { familia: 'cucurbitaceas', dias: 110, meses: [3, 4, 5] },
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
