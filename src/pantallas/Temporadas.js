import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { ordenarPorFecha, verFecha } from '../util';

export default function Temporadas() {
  const { datos } = useDatos();
  const f = hoy();
  const campos = [
    { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, ejemplo: 'Ej: Primavera 2026' },
    { clave: 'inicio', etiqueta: 'Fecha de inicio', tipo: 'fecha', obligatorio: true },
    { clave: 'fin', etiqueta: 'Fecha de fin', tipo: 'fecha', obligatorio: true },
  ];
  return (
    <ListaEditable
      tipo="temporadas"
      icono="calendar"
      titulo="Temporadas"
      textoNuevo="Nueva temporada"
      tituloEditar="Editar temporada"
      campos={campos}
      nuevo={() => ({ nombre: '', inicio: '', fin: '' })}
      items={ordenarPorFecha(datos.temporadas, 'inicio')}
      renderTitulo={(t) => t.nombre}
      renderTexto={(t) => [verFecha(t.inicio) + ' - ' + verFecha(t.fin)]}
      renderDato={(t) => (t.inicio <= f && f <= t.fin ? { texto: 'Actual', color: colores.verde } : null)}
      avisoBorrar="Se borraran tambien las siembras y cosechas de esta temporada. Continuar?"
    />
  );
}
