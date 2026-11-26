import { actualizarPrecios, configInicial, FUENTES, origenPrecio, preciosIniciales, preciosReales } from '../src/precios';
import { cultivos } from '../src/cultivos';

test('cada precio tiene una fuente conocida y fecha si es oficial', () => {
  Object.values(preciosReales).forEach((p) => {
    expect(FUENTES[p.fuente]).toBeDefined();
    expect(p.precio).toBeGreaterThan(0);
    if (p.fuente !== 'aprox') expect(p.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  expect(configInicial.precios).toBe(preciosIniciales);
  expect(preciosIniciales.tomate).toBe(2.12);
});

test('todos los cultivos del catalogo tienen precio', () => {
  Object.keys(cultivos).forEach((k) => expect(preciosIniciales[k]).toBeDefined());
});

test('actualiza los precios viejos y respeta los cambiados a mano', () => {
  const nuevos = actualizarPrecios({ tomate: 2.2, lechuga: 9, kiwi: 3 });
  expect(nuevos.tomate).toBe(2.12);
  expect(nuevos.lechuga).toBe(9);
  expect(nuevos.kiwi).toBe(3);
  expect(nuevos.ajo).toBe(1.69);
});

test('dice de donde sale cada precio', () => {
  expect(origenPrecio('tomate', 2.12)).toMatchObject({ nombre: 'Mercamadrid (Mercasa)', fecha: '2026-11-24' });
  expect(origenPrecio('tomate', 3)).toEqual({ aMano: true });
  expect(origenPrecio('kiwi', 3)).toBeNull();
});
