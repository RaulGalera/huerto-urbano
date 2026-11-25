import { consejoRiego, describirCodigo } from '../src/tiempo';

const dia = (lluvia, maxima) => ({ lluvia, maxima, minima: 5 });

test('aconseja no regar si va a llover bastante', () => {
  expect(consejoRiego([dia(1, 20), dia(2.5, 18), dia(10, 18)]).tipo).toBe('lluvia');
});

test('solo mira los dos proximos dias', () => {
  expect(consejoRiego([dia(0, 20), dia(0, 20), dia(30, 20)]).tipo).toBe('normal');
});

test('avisa de calor y de helada', () => {
  expect(consejoRiego([dia(0, 33), dia(0, 25)]).tipo).toBe('calor');
  expect(consejoRiego([dia(0, 1), dia(0, 2)]).tipo).toBe('helada');
});

test('traduce los codigos del tiempo', () => {
  expect(describirCodigo(0).texto).toBe('Despejado');
  expect(describirCodigo(63).texto).toBe('Lluvia');
  expect(describirCodigo(95).texto).toBe('Tormenta');
});
