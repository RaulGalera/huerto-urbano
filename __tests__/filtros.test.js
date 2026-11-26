import { aplicarFiltros, valoresFiltros } from '../src/componentes/Filtros';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const filtros = [
  { clave: 'parcela', opciones: [{ id: 'p1' }, { id: 'p2' }], aplica: (x, id) => x.parcela === id },
  { clave: 'temporada', opciones: [{ id: 't1' }, { id: 't2' }], defecto: 't2', aplica: (x, id) => x.temporada === id },
];
const items = [
  { id: 1, parcela: 'p1', temporada: 't1' },
  { id: 2, parcela: 'p2', temporada: 't2' },
  { id: 3, parcela: 'p1', temporada: 't2' },
];

test('usa el valor por defecto y todas cuando no hay nada elegido', () => {
  expect(valoresFiltros(filtros, {})).toEqual({ parcela: 'todas', temporada: 't2' });
});

test('ignora valores que ya no existen', () => {
  expect(valoresFiltros(filtros, { parcela: 'borrada', temporada: 'todas' })).toEqual({ parcela: 'todas', temporada: 'todas' });
});

test('aplica varios filtros a la vez', () => {
  expect(aplicarFiltros(items, filtros, { parcela: 'p1', temporada: 't2' }).map((x) => x.id)).toEqual([3]);
  expect(aplicarFiltros(items, filtros, { parcela: 'todas', temporada: 'todas' })).toHaveLength(3);
});
