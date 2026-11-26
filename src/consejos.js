import { cultivos } from './cultivos';
import { claveEnCatalogo } from './precios';
import { t } from './idioma';

const AMIGAS = [
  ['tomate', 'lechuga'],
  ['tomate', 'zanahoria'],
  ['tomate', 'cebolla'],
  ['tomate', 'ajo'],
  ['tomate', 'puerro'],
  ['pimiento', 'cebolla'],
  ['pimiento', 'zanahoria'],
  ['berenjena', 'judia verde'],
  ['lechuga', 'zanahoria'],
  ['lechuga', 'rabano'],
  ['lechuga', 'fresa'],
  ['lechuga', 'pepino'],
  ['lechuga', 'brocoli'],
  ['zanahoria', 'cebolla'],
  ['zanahoria', 'puerro'],
  ['zanahoria', 'rabano'],
  ['zanahoria', 'guisante'],
  ['zanahoria', 'judia verde'],
  ['fresa', 'ajo'],
  ['fresa', 'cebolla'],
  ['fresa', 'espinaca'],
  ['pepino', 'judia verde'],
  ['calabacin', 'judia verde'],
  ['patata', 'judia verde'],
  ['patata', 'haba'],
  ['acelga', 'cebolla'],
  ['guisante', 'rabano'],
];

const ENEMIGAS = [
  ['tomate', 'patata'],
  ['tomate', 'pepino'],
  ['tomate', 'brocoli'],
  ['tomate', 'coliflor'],
  ['judia verde', 'cebolla'],
  ['judia verde', 'ajo'],
  ['judia verde', 'puerro'],
  ['guisante', 'cebolla'],
  ['guisante', 'ajo'],
  ['haba', 'cebolla'],
  ['haba', 'ajo'],
  ['patata', 'calabaza'],
  ['patata', 'pepino'],
  ['patata', 'calabacin'],
  ['fresa', 'coliflor'],
  ['fresa', 'brocoli'],
];

export function claveCultivoCatalogo(nombre) {
  return claveEnCatalogo(cultivos, nombre);
}

function estaEn(lista, a, b) {
  return lista.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function relacion(a, b) {
  const ka = claveCultivoCatalogo(a);
  const kb = claveCultivoCatalogo(b);
  if (!ka || !kb || ka === kb) return null;
  if (estaEn(ENEMIGAS, ka, kb)) return 'enemiga';
  if (estaEn(AMIGAS, ka, kb)) return 'amiga';
  return null;
}

export function familiaDe(nombre) {
  const k = claveCultivoCatalogo(nombre);
  return k ? cultivos[k].familia : null;
}

export function temporadaAnterior(temporadas, id) {
  const actual = temporadas.find((x) => x.id === id);
  if (!actual) return null;
  const antes = temporadas.filter((x) => x.inicio < actual.inicio).sort((a, b) => (a.inicio < b.inicio ? 1 : -1));
  return antes[0] || null;
}

function unicos(lista) {
  const vistos = {};
  return lista.filter((x) => {
    const k = x.trim().toLowerCase();
    if (vistos[k]) return false;
    vistos[k] = true;
    return true;
  });
}

export function repiteFamilia(datos, siembra) {
  const familia = familiaDe(siembra.cultivo);
  if (!familia || !siembra.parcelaId || !siembra.temporadaId) return null;
  const anterior = temporadaAnterior(datos.temporadas, siembra.temporadaId);
  if (!anterior) return null;
  const antes = datos.siembras.filter((s) => s.id !== siembra.id && s.parcelaId === siembra.parcelaId && s.temporadaId === anterior.id && familiaDe(s.cultivo) === familia);
  if (!antes.length) return null;
  return { familia, temporada: anterior.nombre, cultivos: unicos(antes.map((s) => s.cultivo)) };
}

export function vecinas(datos, siembra) {
  const amigas = [];
  const enemigas = [];
  datos.siembras
    .filter((s) => s.id !== siembra.id && s.parcelaId === siembra.parcelaId && s.temporadaId === siembra.temporadaId)
    .forEach((s) => {
      const r = relacion(siembra.cultivo, s.cultivo);
      if (r === 'amiga') amigas.push(s.cultivo);
      if (r === 'enemiga') enemigas.push(s.cultivo);
    });
  return { amigas: unicos(amigas), enemigas: unicos(enemigas) };
}

function yaEsta(lista) {
  return t(lista.length === 1 ? 'que ya esta en esta parcela.' : 'que ya estan en esta parcela.');
}

export function consejosSiembra(datos, siembra) {
  if (!siembra || !siembra.cultivo || !siembra.parcelaId) return [];
  const lista = [];
  const rep = repiteFamilia(datos, siembra);
  if (rep) {
    lista.push({
      tono: 'mal',
      texto: t('Rotacion: en esta parcela hubo') + ' ' + rep.cultivos.join(', ') + ' (' + t(rep.familia) + ') ' + t('en') + ' ' + rep.temporada + '. ' + t('Mejor cambiar de familia para no cansar la tierra.'),
    });
  }
  const v = vecinas(datos, siembra);
  if (v.enemigas.length) lista.push({ tono: 'mal', texto: t('Se lleva mal con') + ' ' + v.enemigas.join(', ') + ', ' + yaEsta(v.enemigas) });
  if (v.amigas.length) lista.push({ tono: 'bien', texto: t('Se lleva bien con') + ' ' + v.amigas.join(', ') + ', ' + yaEsta(v.amigas) });
  return lista;
}
