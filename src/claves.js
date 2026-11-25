import { sha256 } from './sha256';

export const VUELTAS = 2000;

function antigua(usuario, contrasena) {
  return sha256('huerto:' + usuario.toLowerCase() + ':' + contrasena);
}

export function nuevaSal() {
  const bytes = new Array(16);
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (c && c.getRandomValues) {
    const a = new Uint8Array(16);
    c.getRandomValues(a);
    a.forEach((b, i) => (bytes[i] = b));
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function derivar(sal, contrasena) {
  let h = sha256(sal + ':' + contrasena);
  for (let i = 1; i < VUELTAS; i++) h = sha256(sal + h);
  return h;
}

export function crearClave(contrasena, sal = nuevaSal()) {
  return { clave: derivar(sal, contrasena), sal, v: 2 };
}

export function comprobarClave(u, contrasena) {
  if (u.v === 2) return u.clave === derivar(u.sal, contrasena);
  return u.clave === antigua(u.usuario, contrasena);
}

export function esAntigua(u) {
  return u.v !== 2;
}
