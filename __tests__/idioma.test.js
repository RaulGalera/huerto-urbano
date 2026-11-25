import fs from 'fs';
import path from 'path';
import { ponerIdioma, t } from '../src/idioma';

function archivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(path.join(dir, e.name)) : e.name.endsWith('.js') ? [path.join(dir, e.name)] : []));
}

test('traduce al ingles y vuelve al espanol', () => {
  ponerIdioma('en');
  expect(t('Parcelas')).toBe('Plots');
  expect(t('Texto sin traducir')).toBe('Texto sin traducir');
  ponerIdioma('es');
  expect(t('Parcelas')).toBe('Parcelas');
});

test('ningun archivo que usa t() tiene una variable que se llame t', () => {
  const raiz = path.join(__dirname, '..');
  const lista = [path.join(raiz, 'App.js'), ...archivos(path.join(raiz, 'src'))];
  const malos = lista.filter((f) => {
    const s = fs.readFileSync(f, 'utf8');
    if (!/import \{[^}]*\bt\b[^}]*\} from '[./]+(src\/)?idioma'/.test(s)) return false;
    return /\(\s*t\s*[,)]|\bt\s*=>|\b(const|let|var)\s+t\b|function \w+\(t\b/.test(s);
  });
  expect(malos).toEqual([]);
});
