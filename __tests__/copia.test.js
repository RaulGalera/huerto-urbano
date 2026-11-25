import { exportarCopia, filtrar, importarCopia } from '../src/copia';

const datos = {
  temporadas: [{ id: 't1', nombre: 'Primavera' }],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1' }],
  siembras: [],
  riegos: [],
  cosechas: [],
  ajustes: { ciudad: { nombre: 'Madrid' } },
};

test('exporta e importa la misma informacion', () => {
  const texto = exportarCopia(datos);
  const vuelta = importarCopia(texto);
  expect(vuelta.temporadas).toEqual(datos.temporadas);
  expect(vuelta.parcelas).toEqual(datos.parcelas);
  expect(vuelta.ajustes).toBeUndefined();
});

test('rechaza texto que no es una copia', () => {
  expect(() => importarCopia('hola')).toThrow('no es una copia valida');
  expect(() => importarCopia('{"a":1}')).toThrow('no es una copia de esta app');
  expect(() => importarCopia('{"app":"huerto-urbano","parcelas":[{"nombre":"x"}]}')).toThrow('danada');
});

test('filtra sin importar mayusculas ni acentos', () => {
  const lista = [{ n: 'Tomate cherry' }, { n: 'Calabacin' }, { n: 'Judia verde' }];
  expect(filtrar(lista, 'TOMATE', (x) => x.n)).toHaveLength(1);
  expect(filtrar(lista, 'calabacín', (x) => x.n)).toHaveLength(1);
  expect(filtrar(lista, '  ', (x) => x.n)).toHaveLength(3);
});
