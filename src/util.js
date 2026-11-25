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
