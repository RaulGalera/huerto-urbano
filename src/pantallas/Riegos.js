import { useState } from 'react';
import { Text } from 'react-native';
import ListaEditable from '../componentes/ListaEditable';
import Chips from '../componentes/Chips';
import { hoy, useDatos } from '../datos';
import { colores, estilos } from '../estilos';
import { nombrePor, numero, ordenarPorFecha, verFecha } from '../util';

export default function Riegos() {
  const { datos } = useDatos();
  const [filtroGuardado, setFiltro] = useState('todas');
  const filtro = datos.parcelas.some((p) => p.id === filtroGuardado) ? filtroGuardado : 'todas';
  const filtros = [{ id: 'todas', texto: 'Todas' }, ...datos.parcelas.map((p) => ({ id: p.id, texto: p.nombre }))];
  const items = ordenarPorFecha(filtro === 'todas' ? datos.riegos : datos.riegos.filter((r) => r.parcelaId === filtro));
  const litros = items.reduce((a, r) => a + (Number(r.litros) || 0), 0);
  const cabecera = (
    <>
      <Chips opciones={filtros} valor={filtro} onCambiar={setFiltro} abajo={10} />
      <Text style={[estilos.tarjetaTexto, { marginTop: 0, marginBottom: 10 }]}>
        {items.length} {items.length === 1 ? 'riego' : 'riegos'} - {numero(litros, 0)} litros en total
      </Text>
    </>
  );
  const campos = [
    { clave: 'parcelaId', etiqueta: 'Parcela', tipo: 'desplegable', obligatorio: true, opciones: datos.parcelas.map((p) => ({ valor: p.id, texto: p.nombre })) },
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', obligatorio: true },
    { clave: 'litros', etiqueta: 'Litros', tipo: 'numero' },
    {
      clave: 'metodo',
      etiqueta: 'Metodo',
      tipo: 'chips',
      opciones: [
        { valor: 'Manguera', texto: 'Manguera' },
        { valor: 'Regadera', texto: 'Regadera' },
        { valor: 'Goteo', texto: 'Goteo' },
      ],
    },
  ];
  return (
    <ListaEditable
      tipo="riegos"
      icono="water"
      titulo="Riegos"
      textoNuevo="Registrar riego"
      tituloEditar="Editar riego"
      campos={campos}
      cabecera={cabecera}
      nuevo={() => ({ parcelaId: filtro !== 'todas' ? filtro : datos.parcelas.length === 1 ? datos.parcelas[0].id : undefined, fecha: hoy(), litros: '', metodo: 'Manguera' })}
      items={items}
      renderTitulo={(r) => nombrePor(datos.parcelas, r.parcelaId)}
      renderTexto={(r) => [verFecha(r.fecha) + (r.litros !== '' && r.litros !== undefined ? ' - ' + numero(r.litros, Number.isInteger(r.litros) ? 0 : 1) + ' litros' : '')]}
      renderDato={(r) => (r.metodo ? { texto: r.metodo, color: colores.gris } : null)}
    />
  );
}
