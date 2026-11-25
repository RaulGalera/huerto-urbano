import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import Bienvenida from '../src/componentes/Bienvenida';
import Graficas from '../src/componentes/Graficas';
import Chips from '../src/componentes/Chips';
import Casilla from '../src/componentes/Casilla';
import Login from '../src/pantallas/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CuentaProvider, useCuenta } from '../src/cuenta';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const datos = {
  temporadas: [{ id: 't1', nombre: 'Primavera', inicio: '2026-03-01', fin: '2026-06-30' }],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1', gastos: '0' }],
  siembras: [{ id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1', fecha: '2026-03-10' }],
  riegos: [{ id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: '300' }],
  cosechas: [{ id: 'c1', siembraId: 's1', fecha: '2026-06-01', kilos: '12' }],
};
const config = { precios: { tomate: 2 }, precioAgua: 0, impuestos: 0 };

describe('Bienvenida', () => {
  test('pasa por los tres pasos y termina', async () => {
    const onFin = jest.fn();
    await render(<Bienvenida onFin={onFin} />);
    expect(screen.getByText('Crea una temporada')).toBeTruthy();
    await fireEvent.press(screen.getByText('Siguiente'));
    expect(screen.getByText('Apunta lo que haces')).toBeTruthy();
    await fireEvent.press(screen.getByText('Siguiente'));
    expect(screen.getByText('Mira el inicio')).toBeTruthy();
    expect(screen.queryByText('Saltar')).toBeNull();
    await fireEvent.press(screen.getByText('Empezar'));
    expect(onFin).toHaveBeenCalledTimes(1);
  });

  test('se puede saltar', async () => {
    const onFin = jest.fn();
    await render(<Bienvenida onFin={onFin} />);
    await fireEvent.press(screen.getByText('Saltar'));
    expect(onFin).toHaveBeenCalledTimes(1);
  });
});

describe('Graficas', () => {
  test('cambia de grafica con los chips', async () => {
    await render(<Graficas datos={datos} config={config} temporada={datos.temporadas[0]} />);
    expect(screen.getByText('12,0 kg')).toBeTruthy();
    await fireEvent.press(screen.getByText('Agua por parcela'));
    expect(screen.getByText('Bancal 1')).toBeTruthy();
    expect(screen.getByText('300 L')).toBeTruthy();
    await fireEvent.press(screen.getByText('Beneficio por temporada'));
    expect(screen.getByText('24,00 EUR')).toBeTruthy();
  });

  test('avisa si no hay datos', async () => {
    const vacio = { ...datos, siembras: [], riegos: [], cosechas: [] };
    await render(<Graficas datos={vacio} config={config} temporada={datos.temporadas[0]} />);
    expect(screen.getByText('Sin datos para esta grafica.')).toBeTruthy();
  });
});

test('Chips avisa de la opcion pulsada', async () => {
  const onCambiar = jest.fn();
  await render(<Chips opciones={[{ id: 'a', texto: 'Uno' }, { id: 'b', texto: 'Dos' }]} valor="a" onCambiar={onCambiar} />);
  await fireEvent.press(screen.getByText('Dos'));
  expect(onCambiar).toHaveBeenCalledWith('b');
});

test('Casilla cambia de estado', async () => {
  const onCambiar = jest.fn();
  await render(<Casilla marcada={false} onCambiar={onCambiar} texto="Acepto" />);
  const casilla = screen.getByRole('checkbox');
  expect(casilla.props.accessibilityState.checked).toBe(false);
  await fireEvent.press(casilla);
  expect(onCambiar).toHaveBeenCalledWith(true);
});

describe('Login', () => {
  beforeEach(() => AsyncStorage.clear());

  function Prueba() {
    const { cargado, usuario } = useCuenta();
    if (!cargado) return null;
    return usuario ? <Text>Dentro {usuario.nombre}</Text> : <Login />;
  }

  async function escribir(etiqueta, texto) {
    return fireEvent.changeText(screen.getByLabelText(etiqueta), texto);
  }

  test('no deja entrar con una contrasena mala', async () => {
    await render(<CuentaProvider><Prueba /></CuentaProvider>);
    await screen.findByText('Entrar');
    await escribir('Usuario', 'admin');
    await escribir('Contrasena', 'mala123');
    await fireEvent.press(screen.getByText('Entrar'));
    expect(screen.queryByText(/Dentro/)).toBeNull();
  });

  test('el admin inicial puede entrar', async () => {
    await render(<CuentaProvider><Prueba /></CuentaProvider>);
    await screen.findByText('Entrar');
    await escribir('Usuario', 'admin');
    await escribir('Contrasena', 'admin123');
    await fireEvent.press(screen.getByText('Entrar'));
    expect(await screen.findByText('Dentro Administrador')).toBeTruthy();
  });

  test('el registro pide la edad y aceptar la privacidad', async () => {
    await render(<CuentaProvider><Prueba /></CuentaProvider>);
    await fireEvent.press(await screen.findByText('No tengo cuenta, quiero registrarme'));
    await escribir('Nombre', 'Ana');
    await escribir('Usuario', 'ana');
    await escribir('Contrasena', 'secreta1');
    await escribir('Repetir contrasena', 'secreta1');
    await fireEvent.press(screen.getByText('Crear cuenta'));
    expect(screen.getByText('Tienes que tener 14 anos o mas para registrarte')).toBeTruthy();
    await fireEvent.press(screen.getByText('Tengo 14 anos o mas'));
    await fireEvent.press(screen.getByText('He leido y acepto la politica de privacidad y las condiciones de uso'));
    await fireEvent.press(screen.getByText('Crear cuenta'));
    expect(await screen.findByText('Dentro Ana')).toBeTruthy();
  });
});
