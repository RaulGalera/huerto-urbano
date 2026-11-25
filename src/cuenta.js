import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './sha256';
import { configInicial } from './precios';

const CLAVE_USUARIOS = 'huerto_usuarios';
const CLAVE_SESION = 'huerto_sesion';
const CLAVE_CONFIG = 'huerto_config';

export const ADMIN_INICIAL = { usuario: 'admin', contrasena: 'admin123' };

const CuentaContext = createContext(null);

function idNuevo() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function cifrar(usuario, contrasena) {
  return sha256('huerto:' + usuario.toLowerCase() + ':' + contrasena);
}

export function CuentaProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [config, setConfig] = useState(configInicial);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [u, s, c] = await Promise.all([
          AsyncStorage.getItem(CLAVE_USUARIOS),
          AsyncStorage.getItem(CLAVE_SESION),
          AsyncStorage.getItem(CLAVE_CONFIG),
        ]);
        let lista = u ? JSON.parse(u) : [];
        if (lista.length === 0) {
          lista = [
            {
              id: idNuevo(),
              usuario: ADMIN_INICIAL.usuario,
              nombre: 'Administrador',
              clave: cifrar(ADMIN_INICIAL.usuario, ADMIN_INICIAL.contrasena),
              rol: 'admin',
              creado: new Date().toISOString(),
            },
          ];
          await AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
        }
        setUsuarios(lista);
        if (s && lista.some((x) => x.id === s)) setSesion(s);
        if (c) {
          const guardada = JSON.parse(c);
          setConfig({ ...configInicial, ...guardada, precios: { ...(guardada.precios || configInicial.precios) } });
        }
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  function guardarUsuarios(lista) {
    setUsuarios(lista);
    AsyncStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
  }

  function entrar(usuario, contrasena) {
    const u = usuarios.find((x) => x.usuario.toLowerCase() === usuario.trim().toLowerCase());
    if (!u || u.clave !== cifrar(u.usuario, contrasena)) return 'Usuario o contrasena incorrectos';
    setSesion(u.id);
    AsyncStorage.setItem(CLAVE_SESION, u.id);
    return null;
  }

  function registrar(nombre, usuario, contrasena, idioma = 'es') {
    const limpio = usuario.trim();
    if (!nombre.trim() || !limpio || !contrasena) return 'Rellena todos los campos';
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(limpio)) return 'El usuario debe tener de 3 a 20 letras o numeros, sin espacios';
    if (contrasena.length < 6) return 'La contrasena debe tener al menos 6 caracteres';
    if (usuarios.some((x) => x.usuario.toLowerCase() === limpio.toLowerCase())) return 'Ese usuario ya existe';
    const nuevo = { id: idNuevo(), usuario: limpio, nombre: nombre.trim(), clave: cifrar(limpio, contrasena), rol: 'usuario', idioma, creado: new Date().toISOString() };
    guardarUsuarios([...usuarios, nuevo]);
    setSesion(nuevo.id);
    AsyncStorage.setItem(CLAVE_SESION, nuevo.id);
    return null;
  }

  function salir() {
    setSesion(null);
    AsyncStorage.removeItem(CLAVE_SESION);
  }

  function cambiarContrasena(id, actual, nueva) {
    const u = usuarios.find((x) => x.id === id);
    if (!u || u.clave !== cifrar(u.usuario, actual)) return 'La contrasena actual no es correcta';
    if (nueva.length < 6) return 'La contrasena nueva debe tener al menos 6 caracteres';
    guardarUsuarios(usuarios.map((x) => (x.id === id ? { ...x, clave: cifrar(x.usuario, nueva) } : x)));
    return null;
  }

  function cambiarIdioma(id, idioma) {
    guardarUsuarios(usuarios.map((x) => (x.id === id ? { ...x, idioma } : x)));
  }

  function cambiarRol(id, rol) {
    const admins = usuarios.filter((x) => x.rol === 'admin');
    if (rol !== 'admin' && admins.length === 1 && admins[0].id === id) return 'Tiene que quedar al menos un administrador';
    guardarUsuarios(usuarios.map((x) => (x.id === id ? { ...x, rol } : x)));
    return null;
  }

  function borrarUsuario(id) {
    if (id === sesion) return 'No puedes borrar tu propio usuario';
    guardarUsuarios(usuarios.filter((x) => x.id !== id));
    AsyncStorage.removeItem('huerto_datos_' + id);
    return null;
  }

  function guardarConfig(nueva) {
    setConfig(nueva);
    AsyncStorage.setItem(CLAVE_CONFIG, JSON.stringify(nueva));
  }

  const usuario = usuarios.find((x) => x.id === sesion) || null;

  return (
    <CuentaContext.Provider
      value={{ usuarios, usuario, esAdmin: usuario ? usuario.rol === 'admin' : false, config, cargado, entrar, registrar, salir, cambiarContrasena, cambiarIdioma, cambiarRol, borrarUsuario, guardarConfig }}
    >
      {children}
    </CuentaContext.Provider>
  );
}

export function useCuenta() {
  return useContext(CuentaContext);
}
