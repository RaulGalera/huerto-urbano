export const preciosIniciales = {
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

export const configInicial = {
  precioAgua: 2.0,
  impuestos: 0,
  precios: preciosIniciales,
};

export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buscarEnCatalogo(catalogo, nombre) {
  const n = normalizar(nombre);
  const opciones = [n, n.replace(/s$/, ''), n.replace(/es$/, '')];
  const clave = opciones.find((o) => catalogo[o] !== undefined);
  return clave === undefined ? null : catalogo[clave];
}

export function precioDe(config, cultivo) {
  return buscarEnCatalogo(config.precios || {}, cultivo);
}
