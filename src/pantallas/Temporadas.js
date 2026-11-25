import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { numero, ordenarPorFecha, verFecha } from '../util';
import { useCuenta } from '../cuenta';
import { calcularBeneficio, euros } from '../calculos';

export default function Temporadas() {
  const { datos } = useDatos();
  const { config } = useCuenta();

  function balance(t) {
    const ids = datos.siembras.filter((s) => s.temporadaId === t.id).map((s) => s.id);
    const kilos = datos.cosechas.filter((c) => ids.includes(c.siembraId)).reduce((a, c) => a + (Number(c.kilos) || 0), 0);
    if (!ids.length) return null;
    return ids.length + (ids.length === 1 ? ' siembra' : ' siembras') + ' - ' + numero(kilos) + ' kg - ' + euros(calcularBeneficio(datos, config, t).beneficio);
  }
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
      renderTexto={(t) => [verFecha(t.inicio) + ' - ' + verFecha(t.fin), balance(t)]}
      renderDato={(t) => (t.inicio <= f && f <= t.fin ? { texto: 'Actual', color: colores.verde } : null)}
      avisoBorrar="Se borraran tambien las siembras y cosechas de esta temporada. Continuar?"
    />
  );
}
