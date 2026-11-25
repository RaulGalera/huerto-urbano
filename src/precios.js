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

export function precioDe(config, cultivo) {
  const n = normalizar(cultivo);
  const precios = config.precios || {};
  if (precios[n] !== undefined) return precios[n];
  const singular = n.replace(/es$/, '').replace(/s$/, '');
  if (precios[singular] !== undefined) return precios[singular];
  return null;
}
