import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { nombrePor, numero, ordenarPorFecha, textoSiembra, verFecha } from '../util';

export default function Cosechas() {
  const { datos } = useDatos();
  const campos = [
    { clave: 'siembraId', etiqueta: 'Siembra', tipo: 'desplegable', obligatorio: true, opciones: ordenarPorFecha(datos.siembras).map((s) => ({ valor: s.id, texto: textoSiembra(s, datos.parcelas) })) },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true },
    { clave: 'kilos', etiqueta: 'Kilos', tipo: 'numero', obligatorio: true },
    { clave: 'notas', etiqueta: 'Notas', tipo: 'largo' },
  ];

  function siembra(c) {
    return datos.siembras.find((x) => x.id === c.siembraId);
  }

  return (
    <ListaEditable
      tipo="cosechas"
      icono="basket"
      titulo="Cosechas"
      textoNuevo="Nueva cosecha"
      tituloEditar="Editar cosecha"
      campos={campos}
      nuevo={() => ({ siembraId: undefined, fecha: hoy(), kilos: '', notas: '' })}
      items={ordenarPorFecha(datos.cosechas)}
      renderTitulo={(c) => (siembra(c) ? siembra(c).cultivo : 'Siembra borrada') + ' - ' + numero(c.kilos) + ' kg'}
      renderTexto={(c) => [(siembra(c) ? nombrePor(datos.parcelas, siembra(c).parcelaId) + ' - ' : '') + verFecha(c.fecha)]}
    />
  );
}
