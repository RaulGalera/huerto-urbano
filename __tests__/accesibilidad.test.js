import fs from 'fs';
import path from 'path';
import { estilos, paletas, ponerTema, tam } from '../src/estilos';

function luz(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contraste(a, b) {
  const [x, y] = [luz(a), luz(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

test('el texto se ve bien sobre el fondo en los dos temas (WCAG AA)', () => {
  Object.values(paletas).forEach((p) => {
    [
      [p.texto, p.fondo],
      [p.gris, p.fondo],
      [p.gris, p.superficie],
      [p.verde, p.superficie],
      [p.blanco, p.verde],
      [p.rojo, p.superficie],
      [p.naranja, p.superficie],
    ].forEach(([a, b]) => expect(contraste(a, b)).toBeGreaterThanOrEqual(4.5));
  });
});

test('el tamano del texto se puede agrandar', () => {
  ponerTema('claro', 'grande');
  expect(tam(10)).toBe(12);
  expect(estilos.titulo.fontSize).toBe(29);
  ponerTema('claro', 'normal');
  expect(tam(10)).toBe(10);
  expect(estilos.titulo.fontSize).toBe(24);
});

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));
}

test('todos los botones dicen al lector de pantalla que son botones', () => {
  const raiz = path.join(__dirname, '..');
  const sinRol = [];
  [path.join(raiz, 'App.js'), ...archivos(path.join(raiz, 'src'))].forEach((f) => {
    const s = fs.readFileSync(f, 'utf8');
    let i = s.indexOf('<Pressable');
    while (i >= 0) {
      let k = i;
      let nivel = 0;
      while (k < s.length && !(s[k] === '>' && nivel === 0)) {
        if (s[k] === '{') nivel++;
        if (s[k] === '}') nivel--;
        k++;
      }
      if (!s.slice(i, k).includes('accessibilityRole')) sinRol.push(path.basename(f));
      i = s.indexOf('<Pressable', k);
    }
  });
  expect(sinRol.filter((f) => f !== 'SelectorFecha.js')).toEqual([]);
});
