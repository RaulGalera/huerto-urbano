import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE_ANTIGUA = 'huerto_datos_v1';

export function claveDatos(usuarioId) {
  return 'huerto_datos_' + usuarioId;
}

export async function leerDatos(usuarioId) {
  const texto = await AsyncStorage.getItem(claveDatos(usuarioId));
  return texto ? { ...vacio, ...JSON.parse(texto) } : vacio;
}

export const vacio = {
  temporadas: [],
  parcelas: [],
  siembras: [],
  riegos: [],
  cosechas: [],
};

const DatosContext = createContext(null);

export function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function hoy() {
  return new Date().toISOString().slice(0, 10);
}

export function DatosProvider({ usuarioId, migrar, children }) {
  const [datos, setDatos] = useState(vacio);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let texto = await AsyncStorage.getItem(claveDatos(usuarioId));
        if (!texto && migrar) {
          texto = await AsyncStorage.getItem(CLAVE_ANTIGUA);
          if (texto) await AsyncStorage.removeItem(CLAVE_ANTIGUA);
        }
        if (texto) setDatos({ ...vacio, ...JSON.parse(texto) });
      } finally {
        setCargado(true);
      }
    })();
  }, [usuarioId, migrar]);

  useEffect(() => {
    if (cargado) AsyncStorage.setItem(claveDatos(usuarioId), JSON.stringify(datos));
  }, [datos, cargado, usuarioId]);

  function reemplazar(nuevos) {
    setDatos({ ...vacio, ...nuevos });
  }

  function guardar(tipo, item) {
    setDatos((d) => {
      const lista = d[tipo];
      const existe = lista.some((x) => x.id === item.id);
      const nueva = existe
        ? lista.map((x) => (x.id === item.id ? item : x))
        : [...lista, { ...item, id: nuevoId() }];
      return { ...d, [tipo]: nueva };
    });
  }

  function borrar(tipo, id) {
    setDatos((d) => {
      const n = { ...d, [tipo]: d[tipo].filter((x) => x.id !== id) };
      if (tipo === 'parcelas') {
        const siembrasBorradas = n.siembras.filter((s) => s.parcelaId === id).map((s) => s.id);
        n.siembras = n.siembras.filter((s) => s.parcelaId !== id);
        n.riegos = n.riegos.filter((r) => r.parcelaId !== id);
        n.cosechas = n.cosechas.filter((c) => !siembrasBorradas.includes(c.siembraId));
      }
      if (tipo === 'temporadas') {
        const siembrasBorradas = n.siembras.filter((s) => s.temporadaId === id).map((s) => s.id);
        n.siembras = n.siembras.filter((s) => s.temporadaId !== id);
        n.cosechas = n.cosechas.filter((c) => !siembrasBorradas.includes(c.siembraId));
      }
      if (tipo === 'siembras') {
        n.cosechas = n.cosechas.filter((c) => c.siembraId !== id);
      }
      return n;
    });
  }

  return (
    <DatosContext.Provider value={{ datos, guardar, borrar, reemplazar, cargado }}>
      {children}
    </DatosContext.Provider>
  );
}

export function useDatos() {
  return useContext(DatosContext);
}
