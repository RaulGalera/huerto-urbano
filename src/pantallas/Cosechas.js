import { useState } from 'react';
import { Text } from 'react-native';
import ListaEditable from '../componentes/ListaEditable';
import Chips from '../componentes/Chips';
import { estilos } from '../estilos';
import { hoy, useDatos } from '../datos';
import { claveCultivo, cultivosDe, nombrePor, numero, ordenarPorFecha, textoSiembra, verFecha } from '../util';
import { t } from '../idioma';

export default function Cosechas() {
  const { datos } = useDatos();
  const campos = [
    { clave: 'siembraId', etiqueta: t('Siembra'), tipo: 'desplegable', obligatorio: true, opciones: ordenarPorFecha(datos.siembras).map((s) => ({ valor: s.id, texto: textoSiembra(s, datos.parcelas) })) },
    { clave: 'fecha', etiqueta: t('Fecha'), tipo: 'fecha', obligatorio: true },
    { clave: 'kilos', etiqueta: t('Kilos'), tipo: 'numero', obligatorio: true },
    { clave: 'notas', etiqueta: t('Notas'), tipo: 'largo' },
  ];

  const [verdura, setVerdura] = useState('todas');

  function siembra(c) {
    return datos.siembras.find((x) => x.id === c.siembraId);
  }

  const verduras = cultivosDe(datos.siembras.filter((s) => datos.cosechas.some((c) => c.siembraId === s.id)));
  const verduraActiva = verduras.some((v) => v.id === verdura) ? verdura : 'todas';
  const items = ordenarPorFecha(verduraActiva === 'todas' ? datos.cosechas : datos.cosechas.filter((c) => siembra(c) && claveCultivo(siembra(c).cultivo) === verduraActiva));
  const kilos = items.reduce((a, c) => a + (Number(c.kilos) || 0), 0);
  const cabecera = (
    <>
      {verduras.length > 1 ? <Chips opciones={[{ id: 'todas', texto: t('Todas') }, ...verduras]} valor={verduraActiva} onCambiar={setVerdura} abajo={10} /> : null}
      {items.length ? (
        <Text style={[estilos.tarjetaTexto, { marginTop: 0, marginBottom: 10 }]}>
          {items.length} {t(items.length === 1 ? 'cosecha' : 'cosechas')} - {numero(kilos)} {t('kg en total')}
        </Text>
      ) : null}
    </>
  );

  return (
    <ListaEditable
      tipo="cosechas"
      icono="basket"
      titulo={t('Cosechas')}
      textoNuevo={t('Nueva cosecha')}
      tituloEditar={t('Editar cosecha')}
      campos={campos}
      nuevo={() => ({ siembraId: undefined, fecha: hoy(), kilos: '', notas: '' })}
      cabecera={cabecera}
      items={items}
      renderTitulo={(c) => (siembra(c) ? siembra(c).cultivo : t('Siembra borrada')) + ' - ' + numero(c.kilos) + ' kg'}
      renderTexto={(c) => [(siembra(c) ? nombrePor(datos.parcelas, siembra(c).parcelaId) + ' - ' : '') + verFecha(c.fecha)]}
    />
  );
}
