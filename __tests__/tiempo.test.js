import { combinarPrevision, consejoRiego, describirCodigo, juntarLluvias, lluviaReciente } from '../src/tiempo';

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

const precisa = {
  current: { temperature_2m: 9.3, weather_code: 1 },
  daily: {
    time: ['2026-11-25', '2026-11-26', '2026-11-27'],
    weather_code: [63, 3, 3],
    temperature_2m_max: [11.2, 9, 8.4],
    temperature_2m_min: [5.7, 1.8, 1.5],
    precipitation_sum: [3.2, 0, 0],
    precipitation_probability_max: [null, null, null],
  },
};

const general = {
  current: { temperature_2m: 9.9, weather_code: 1 },
  daily: {
    time: ['2026-11-25', '2026-11-26', '2026-11-27'],
    weather_code: [61, 2, 45],
    temperature_2m_max: [12.3, 11.4, 11.3],
    temperature_2m_min: [5.5, 2.8, 0.3],
    precipitation_sum: [2, 0, 0],
    precipitation_probability_max: [85, 0, 0],
  },
};

test('usa el modelo de alta resolucion y toma la probabilidad del general', () => {
  const t = combinarPrevision(precisa, general);
  expect(t.actual.temperatura).toBe(9.3);
  expect(t.dias[0]).toMatchObject({ maxima: 11.2, lluvia: 3.2, codigo: 63, probabilidad: 85 });
  expect(t.modelo).toContain('AROME');
});

test('si falta el modelo de alta resolucion usa el general', () => {
  const t = combinarPrevision(null, general);
  expect(t.dias[0].maxima).toBe(12.3);
  expect(t.modelo).toBe('Open-Meteo');
});

test('sin probabilidad disponible la deja vacia', () => {
  expect(combinarPrevision(precisa, null).dias[0].probabilidad).toBeNull();
});

test('separa la lluvia de los dias pasados de la prevision', () => {
  const conPasado = {
    current: { time: '2026-11-26T11:00', temperature_2m: 9, weather_code: 1 },
    daily: {
      time: ['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'],
      weather_code: [63, 61, 3, 3],
      temperature_2m_max: [10, 11, 9, 8],
      temperature_2m_min: [5, 5, 2, 1],
      precipitation_sum: [7.5, 1, 0, 0],
      precipitation_probability_max: [90, 60, 0, 0],
    },
  };
  const r = combinarPrevision(null, conPasado);
  expect(r.dias.map((d) => d.fecha)).toEqual(['2026-11-26', '2026-11-27']);
  expect(r.lluvias).toEqual({ '2026-11-24': 7.5, '2026-11-25': 1 });
});

test('junta las lluvias guardadas y borra las de hace mas de un mes', () => {
  const r = juntarLluvias({ '2026-10-01': 9, '2026-11-20': 2 }, { '2026-11-20': 6, '2026-11-25': 0 }, '2026-11-26');
  expect(r).toEqual({ '2026-11-20': 6, '2026-11-25': 0 });
  expect(lluviaReciente(r)).toEqual({ fecha: '2026-11-20', mm: 6 });
  expect(lluviaReciente({ '2026-11-25': 2 })).toBeNull();
});
