import { fechaLocal } from './util';

const LISTAS = ['temporadas', 'parcelas', 'siembras', 'riegos', 'cosechas'];

export function exportarCopia(datos) {
  const copia = { app: 'huerto-urbano', version: 1, fecha: fechaLocal() };
  LISTAS.forEach((l) => {
    copia[l] = datos[l] || [];
  });
  return JSON.stringify(copia);
}

export function importarCopia(texto) {
  let obj;
  try {
    obj = JSON.parse(String(texto).trim());
  } catch (e) {
    throw new Error('El texto no es una copia valida');
  }
  if (!obj || obj.app !== 'huerto-urbano') throw new Error('El texto no es una copia de esta app');
  const datos = {};
  LISTAS.forEach((l) => {
    const lista = obj[l] || [];
    if (!Array.isArray(lista) || lista.some((x) => !x || typeof x.id !== 'string')) throw new Error('La copia esta danada');
    datos[l] = lista;
  });
  return datos;
}

export function filtrar(items, texto, aTexto) {
  const t = quitarAcentos(texto.trim().toLowerCase());
  if (!t) return items;
  return items.filter((x) => quitarAcentos(aTexto(x).toLowerCase()).includes(t));
}

function quitarAcentos(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
