import { sha256 } from '../src/sha256';
import { comprobarClave, crearClave, esAntigua, nuevaSal } from '../src/claves';

test('la clave nueva lleva sal y se comprueba bien', () => {
  const c = crearClave('secreta1');
  expect(c.v).toBe(2);
  expect(c.sal).toHaveLength(32);
  expect(comprobarClave({ usuario: 'ana', ...c }, 'secreta1')).toBe(true);
  expect(comprobarClave({ usuario: 'ana', ...c }, 'otra')).toBe(false);
});

test('la misma contrasena da claves distintas con sal distinta', () => {
  expect(crearClave('secreta1').clave).not.toBe(crearClave('secreta1').clave);
  expect(nuevaSal()).not.toBe(nuevaSal());
});

test('sigue aceptando las claves antiguas para poder migrarlas', () => {
  const u = { usuario: 'Admin', clave: sha256('huerto:admin:admin123') };
  expect(esAntigua(u)).toBe(true);
  expect(comprobarClave(u, 'admin123')).toBe(true);
  expect(comprobarClave(u, 'mal')).toBe(false);
});
