import { calcularBeneficio } from './calculos';

export const MESES_CORTOS = {
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function enTemporada(fecha, temporada) {
  return !temporada || (fecha >= temporada.inicio && fecha <= temporada.fin);
}

export function kilosPorCultivo(datos, temporada) {
  const siembras = datos.siembras.filter((s) => !temporada || s.temporadaId === temporada.id);
  const suma = {};
  datos.cosechas.forEach((c) => {
    const s = siembras.find((x) => x.id === c.siembraId);
    if (!s) return;
    const k = s.cultivo.trim().toLowerCase();
    if (!suma[k]) suma[k] = { nombre: s.cultivo.trim(), valor: 0 };
    suma[k].valor += Number(c.kilos) || 0;
  });
  return Object.values(suma).sort((a, b) => b.valor - a.valor);
}

export function kilosPorMes(datos, temporada) {
  const ids = new Set(datos.siembras.filter((s) => !temporada || s.temporadaId === temporada.id).map((s) => s.id));
  const suma = {};
  datos.cosechas.forEach((c) => {
    if (!ids.has(c.siembraId) || !c.fecha) return;
    const clave = c.fecha.slice(0, 7);
    suma[clave] = (suma[clave] || 0) + (Number(c.kilos) || 0);
  });
  return Object.keys(suma)
    .sort()
    .map((clave) => ({ clave, mes: Number(clave.slice(5, 7)), valor: suma[clave] }));
}

function riegosDe(datos, temporada) {
  return datos.riegos.filter((r) => enTemporada(r.fecha, temporada));
}

export function aguaPorParcela(datos, temporada) {
  const riegos = riegosDe(datos, temporada);
  return datos.parcelas
    .map((p) => {
      const valor = riegos.filter((r) => r.parcelaId === p.id).reduce((a, r) => a + (Number(r.litros) || 0), 0);
      const metros = Number(String(p.metros || '').replace(',', '.')) || 0;
      return { nombre: p.nombre, valor, porMetro: metros > 0 ? valor / metros : null };
    })
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

export function aguaPorMes(datos, temporada) {
  const suma = {};
  riegosDe(datos, temporada).forEach((r) => {
    if (!r.fecha) return;
    const clave = r.fecha.slice(0, 7);
    suma[clave] = (suma[clave] || 0) + (Number(r.litros) || 0);
  });
  return Object.keys(suma)
    .sort()
    .filter((clave) => suma[clave] > 0)
    .map((clave) => ({ clave, mes: Number(clave.slice(5, 7)), valor: suma[clave] }));
}

export function resumenAgua(datos, config, temporada) {
  const riegos = riegosDe(datos, temporada);
  const litros = riegos.reduce((a, r) => a + (Number(r.litros) || 0), 0);
  return { litros, riegos: riegos.length, coste: (litros / 1000) * (Number(config.precioAgua) || 0) };
}

export function beneficioPorTemporada(datos, config) {
  return [...datos.temporadas]
    .sort((a, b) => (a.inicio < b.inicio ? -1 : 1))
    .map((t) => ({ nombre: t.nombre, valor: calcularBeneficio(datos, config, t).beneficio }));
}
