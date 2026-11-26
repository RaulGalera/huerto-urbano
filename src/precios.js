const preciosAntiguos = {
  tomate: 2.2,
  lechuga: 1.5,
  pimiento: 2.4,
  calabacin: 1.6,
  cebolla: 1.2,
  patata: 1.0,
  zanahoria: 1.1,
  berenjena: 2.0,
  pepino: 1.4,
  'judia verde': 3.5,
  fresa: 4.5,
  espinaca: 3.0,
  acelga: 2.0,
  ajo: 5.0,
  brocoli: 2.5,
  puerro: 2.0,
  haba: 3.0,
  guisante: 4.0,
  rabano: 2.0,
  melon: 1.5,
  sandia: 0.9,
  coliflor: 2.0,
  calabaza: 1.3,
};

export const VERSION_PRECIOS = 2;

export const FUENTES = {
  mercamadrid: { nombre: 'Mercamadrid (Mercasa)', tipo: 'precio mayorista' },
  mapa: { nombre: 'Ministerio de Agricultura', tipo: 'precio en origen' },
  aprox: { nombre: 'Aproximado', tipo: 'no sale en las fuentes oficiales' },
};

export const preciosReales = {
  tomate: { precio: 2.12, fuente: 'mercamadrid', fecha: '2026-11-24', nota: 'tomate verde' },
  lechuga: { precio: 0.88, fuente: 'mercamadrid', fecha: '2026-11-24', nota: 'por unidad' },
  pimiento: { precio: 2.76, fuente: 'mercamadrid', fecha: '2026-11-24', nota: 'pimiento verde' },
  cebolla: { precio: 0.6, fuente: 'mercamadrid', fecha: '2026-11-24' },
  patata: { precio: 0.58, fuente: 'mercamadrid', fecha: '2026-11-24' },
  'judia verde': { precio: 5.0, fuente: 'mercamadrid', fecha: '2026-11-24' },
  coliflor: { precio: 1.08, fuente: 'mercamadrid', fecha: '2026-11-24' },
  berenjena: { precio: 1.37, fuente: 'mercamadrid', fecha: '2026-09-11' },
  sandia: { precio: 0.57, fuente: 'mercamadrid', fecha: '2026-09-11' },
  calabacin: { precio: 0.37, fuente: 'mapa', fecha: '2026-10-25' },
  zanahoria: { precio: 0.27, fuente: 'mapa', fecha: '2026-10-25' },
  pepino: { precio: 0.81, fuente: 'mapa', fecha: '2026-10-25' },
  espinaca: { precio: 1.45, fuente: 'mapa', fecha: '2026-10-25' },
  acelga: { precio: 1.67, fuente: 'mapa', fecha: '2026-10-25' },
  ajo: { precio: 1.69, fuente: 'mapa', fecha: '2026-10-25' },
  brocoli: { precio: 0.63, fuente: 'mapa', fecha: '2026-10-25' },
  puerro: { precio: 0.67, fuente: 'mapa', fecha: '2026-10-25' },
  melon: { precio: 0.57, fuente: 'mapa', fecha: '2026-10-25', nota: 'piel de sapo' },
  fresa: { precio: 4.5, fuente: 'aprox' },
  haba: { precio: 3.0, fuente: 'aprox' },
  guisante: { precio: 4.0, fuente: 'aprox' },
  rabano: { precio: 2.0, fuente: 'aprox' },
  calabaza: { precio: 1.3, fuente: 'aprox' },
};

export const preciosIniciales = Object.fromEntries(Object.entries(preciosReales).map(([k, v]) => [k, v.precio]));

export const configInicial = {
  precioAgua: 2.0,
  impuestos: 0,
  precios: preciosIniciales,
  versionPrecios: VERSION_PRECIOS,
};

export function actualizarPrecios(guardados) {
  const nuevos = { ...guardados };
  Object.keys(preciosReales).forEach((k) => {
    if (nuevos[k] === undefined || nuevos[k] === preciosAntiguos[k]) nuevos[k] = preciosReales[k].precio;
  });
  return nuevos;
}

export function origenPrecio(cultivo, valor) {
  const r = preciosReales[cultivo];
  if (!r) return null;
  if (Number(valor) !== r.precio) return { aMano: true };
  return { ...r, ...FUENTES[r.fuente] };
}

export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function claveEnCatalogo(catalogo, nombre) {
  const n = normalizar(nombre);
  const opciones = [n, n.replace(/s$/, ''), n.replace(/es$/, '')];
  const clave = opciones.find((o) => catalogo[o] !== undefined);
  return clave === undefined ? null : clave;
}

export function buscarEnCatalogo(catalogo, nombre) {
  const clave = claveEnCatalogo(catalogo, nombre);
  return clave === null ? null : catalogo[clave];
}

export function precioDe(config, cultivo) {
  return buscarEnCatalogo(config.precios || {}, cultivo);
}
