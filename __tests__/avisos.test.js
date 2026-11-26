jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  getAllScheduledNotificationsAsync: jest.fn(async () => [{ identifier: 'riego-viejo' }, { identifier: 'otro' }]),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(),
}));

import * as N from 'expo-notifications';
import { planAvisos, programarAvisos, sinRegar, textoAviso } from '../src/avisos';
import { fechaLocal } from '../src/util';

const datos = {
  parcelas: [
    { id: 'a', nombre: 'Bancal 1' },
    { id: 'b', nombre: 'Bancal 2' },
    { id: 'c', nombre: 'Maceta' },
  ],
  riegos: [
    { id: 'r1', parcelaId: 'a', fecha: '2026-11-20' },
    { id: 'r2', parcelaId: 'a', fecha: '2026-11-24' },
    { id: 'r3', parcelaId: 'b', fecha: '2026-11-25' },
  ],
};

beforeEach(() => jest.clearAllMocks());

test('sinRegar usa el ultimo riego hasta esa fecha', () => {
  const lista = sinRegar(datos, '2026-11-27');
  expect(lista.map((a) => [a.parcela.id, a.dias])).toEqual([
    ['a', 3],
    ['c', null],
  ]);
  expect(sinRegar(datos, '2026-11-22').map((a) => a.parcela.id)).toEqual(['b', 'c']);
});

test('textoAviso con una y varias parcelas', () => {
  const una = textoAviso([{ parcela: { nombre: 'Bancal 1' }, dias: 4 }]);
  expect(una.titulo).toBe('Toca regar: Bancal 1');
  expect(una.cuerpo).toBe('Bancal 1 (4 dias sin riego)');
  const varias = textoAviso(sinRegar(datos, '2026-11-27'));
  expect(varias.titulo).toBe('Toca regar: 2 parcelas');
  expect(varias.cuerpo).toBe('Bancal 1 (3 dias sin riego), Maceta (nunca regada)');
});

test('planAvisos programa a las 9 de los proximos dias', () => {
  const ahora = new Date(2026, 10, 26, 10, 0, 0);
  const plan = planAvisos({ ...datos, parcelas: datos.parcelas.slice(0, 2) }, ahora);
  expect(plan[0].id).toBe('riego-2026-11-27');
  expect(plan[0].fecha.getHours()).toBe(9);
  expect(plan[0].titulo).toBe('Toca regar: Bancal 1');
  expect(plan[1].titulo).toBe('Toca regar: 2 parcelas');
  expect(plan.length).toBe(7);
  expect(fechaLocal(plan[6].fecha)).toBe('2026-12-03');
});

test('planAvisos incluye hoy si aun no son las 9', () => {
  const plan = planAvisos(datos, new Date(2026, 10, 26, 8, 0, 0));
  expect(plan[0].id).toBe('riego-2026-11-26');
});

test('programarAvisos cancela los anteriores y programa los nuevos', async () => {
  const total = await programarAvisos(datos, true);
  expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('riego-viejo');
  expect(total).toBe(7);
  expect(N.scheduleNotificationAsync).toHaveBeenCalledTimes(7);
});

test('programarAvisos desactivado solo cancela', async () => {
  const total = await programarAvisos(datos, false);
  expect(total).toBe(0);
  expect(N.cancelScheduledNotificationAsync).toHaveBeenCalledWith('riego-viejo');
  expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
});
