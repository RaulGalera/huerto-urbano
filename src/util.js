export function nombrePor(lista, id, campo = 'nombre') {
  const x = lista.find((e) => e.id === id);
  return x ? x[campo] : 'Sin asignar';
}

export function diasDesde(fecha) {
  if (!fecha) return null;
  const a = new Date(fecha + 'T00:00:00');
  const b = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function ordenarPorFecha(lista, campo = 'fecha') {
  return [...lista].sort((a, b) => String(b[campo]).localeCompare(String(a[campo])));
}

export function verFecha(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [a, m, d] = iso.split('-');
  return d + '/' + m + '/' + a;
}

export function leerFecha(texto) {
  const r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(texto).trim());
  if (!r) return null;
  const d = Number(r[1]);
  const m = Number(r[2]);
  const a = Number(r[3]);
  const f = new Date(Date.UTC(a, m - 1, d));
  if (f.getUTCDate() !== d || f.getUTCMonth() !== m - 1) return null;
  return f.toISOString().slice(0, 10);
}

export function numero(n, decimales = 1) {
  return Number(n || 0).toFixed(decimales).replace('.', ',');
}

export function textoSiembra(s, parcelas) {
  return s.cultivo + ' - ' + nombrePor(parcelas, s.parcelaId);
}

export function ultimoRiego(riegos, parcelaId) {
  const r = ordenarPorFecha(riegos.filter((x) => x.parcelaId === parcelaId))[0];
  return r ? diasDesde(r.fecha) : null;
}

export function temporadaActual(temporadas, hoy) {
  return temporadas.find((t) => t.inicio <= hoy && hoy <= t.fin);
}

export function diasDelMes(anio, mes) {
  const primero = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
  const huecos = (primero + 6) % 7;
  const total = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const celdas = [];
  for (let i = 0; i < huecos; i++) celdas.push(null);
  for (let d = 1; d <= total; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}
