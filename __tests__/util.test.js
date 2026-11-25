import { leerFecha, numero, verFecha } from '../src/util';
import { normalizar, precioDe } from '../src/precios';

test('convierte fechas entre DD/MM/AAAA e ISO', () => {
  expect(verFecha('2026-03-05')).toBe('05/03/2026');
  expect(leerFecha('5/3/2026')).toBe('2026-03-05');
  expect(leerFecha('31/02/2026')).toBeNull();
  expect(leerFecha('hola')).toBeNull();
});

test('formatea numeros con coma', () => {
  expect(numero(2.25, 1)).toBe('2,3');
  expect(numero(3, 0)).toBe('3');
});

test('busca precios sin importar mayusculas, acentos ni plurales', () => {
  const config = { precios: { calabacin: 1.6, 'judia verde': 3.5 } };
  expect(normalizar('  Calabacín ')).toBe('calabacin');
  expect(precioDe(config, 'CALABACINES')).toBe(1.6);
  expect(precioDe(config, 'Judia  verde')).toBe(3.5);
  expect(precioDe({ precios: { tomate: 2 } }, 'Tomates')).toBe(2);
  expect(precioDe(config, 'kiwano')).toBeNull();
});
