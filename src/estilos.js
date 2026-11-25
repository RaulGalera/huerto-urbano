export const paletas = {
  claro: {
    verde: '#2f7d32',
    verdeClaro: '#e8f5e9',
    fondo: '#f6f7f2',
    superficie: '#ffffff',
    texto: '#1f2a1f',
    gris: '#6b7a6b',
    grisClaro: '#d9ddd2',
    borde: '#d5dccf',
    rojo: '#c62828',
    rojoClaro: '#fdecea',
    naranja: '#ef6c00',
    blanco: '#ffffff',
    sombra: 'rgba(0,0,0,0.35)',
  },
  oscuro: {
    verde: '#66bb6a',
    verdeClaro: '#1f3322',
    fondo: '#111511',
    superficie: '#1b211b',
    texto: '#e6ece6',
    gris: '#9aa89a',
    grisClaro: '#2c352c',
    borde: '#2f3a2f',
    rojo: '#ef7070',
    rojoClaro: '#3a1f1f',
    naranja: '#ffa040',
    blanco: '#0f140f',
    sombra: 'rgba(0,0,0,0.6)',
  },
};

export const colores = { ...paletas.claro };

let temaActual = 'claro';

function crearEstilos() {
  return {
    pantalla: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
    titulo: { fontSize: 24, fontWeight: '700', color: colores.texto, marginBottom: 14 },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    tarjetaTitulo: { fontSize: 15, fontWeight: '600', color: colores.texto },
    tarjetaTexto: { fontSize: 12, color: colores.gris, marginTop: 6 },
    boton: {
      backgroundColor: colores.verde,
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonTexto: { color: colores.blanco, fontWeight: '600', fontSize: 15 },
    botonSecundario: {
      height: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
    },
    botonSecundarioTexto: { color: colores.texto, fontWeight: '600', fontSize: 15 },
    etiqueta: { fontSize: 13, color: colores.gris, marginBottom: 6, marginTop: 12 },
    input: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      height: 44,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colores.texto,
    },
    vacio: { color: colores.gris, textAlign: 'center', marginTop: 30 },
    fila: { flexDirection: 'row', alignItems: 'center' },
  };
}

export const estilos = crearEstilos();

export function ponerTema(nombre) {
  const t = paletas[nombre] ? nombre : 'claro';
  if (t === temaActual) return;
  temaActual = t;
  Object.assign(colores, paletas[t]);
  Object.assign(estilos, crearEstilos());
}

export function tema() {
  return temaActual;
}

export function estiloChip(activo) {
  return {
    caja: {
      height: 32,
      paddingHorizontal: 14,
      borderRadius: 16,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: activo ? colores.verde : colores.borde,
      backgroundColor: activo ? colores.verde : colores.superficie,
    },
    texto: { fontSize: 13, fontWeight: activo ? '600' : '400', color: activo ? colores.blanco : colores.texto },
  };
}
