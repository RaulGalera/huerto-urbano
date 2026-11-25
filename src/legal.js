export const VERSION_LEGAL = '2026-11-25';

export const RESPONSABLE = {
  nombre: 'Raul Galera',
  email: 'PENDIENTE: email de contacto',
  web: 'PENDIENTE: web para pedir el borrado de la cuenta',
};

const es = [
  {
    titulo: 'Politica de privacidad',
    parrafos: [
      'Responsable: ' + RESPONSABLE.nombre + '. Contacto: ' + RESPONSABLE.email + '.',
      'Que datos guardamos: tu nombre, tu usuario, tu contrasena cifrada con sal, el idioma y los datos del huerto que apuntas (temporadas, parcelas, siembras, riegos y cosechas). Si tu quieres, tambien la ciudad o la ubicacion del huerto.',
      'Para que: para que puedas usar la app, ver tus resumenes y calcular el beneficio. No hay publicidad, no se venden datos y no se usa inteligencia artificial.',
      'Base legal: la ejecucion del servicio que pides al registrarte (articulo 6.1.b del RGPD). La ubicacion solo se usa si tu la activas.',
      'Ubicacion: solo se pide cuando pulsas el boton de GPS. Se usa para pedir el tiempo a Open-Meteo, que recibe las coordenadas aproximadas pero no tu nombre. Puedes quitar el permiso en los ajustes del movil cuando quieras.',
      'Donde se guardan: en tu dispositivo y, cuando la app use su servidor, en Amazon Web Services (AWS) dentro de la Union Europea, region de Espana (eu-south-2). AWS actua como encargado del tratamiento con su contrato de proteccion de datos (DPA). La conexion va cifrada (HTTPS) y los datos se guardan cifrados.',
      'Cuanto tiempo: mientras tengas la cuenta. Si la borras, se borran tus datos en el momento y las copias de seguridad del servidor se eliminan en un maximo de 30 dias.',
      'Tus derechos: puedes ver y corregir tus datos (Mi cuenta), descargarlos (Exportar mis datos), borrar la cuenta (Borrar mi cuenta) y oponerte o limitar el tratamiento escribiendo a ' + RESPONSABLE.email + '. Si no te atendemos bien, puedes reclamar ante la Agencia Espanola de Proteccion de Datos (www.aepd.es).',
      'Menores: hay que tener 14 anos o mas. Si tienes menos, tienen que registrarte tus padres o tutores.',
      'Borrado sin la app: ' + RESPONSABLE.web + '.',
    ],
  },
  {
    titulo: 'Aviso legal',
    parrafos: [
      'Huerto Urbano es un proyecto de 2 DAM de ' + RESPONSABLE.nombre + '. Contacto: ' + RESPONSABLE.email + '.',
      'La app es gratuita y no vende nada. Cumple la Ley 34/2002 de servicios de la sociedad de la informacion (LSSI), el RGPD y la Ley Organica 3/2018 (LOPDGDD).',
    ],
  },
  {
    titulo: 'Condiciones de uso',
    parrafos: [
      'La app sirve para apuntar el trabajo de tu huerto. Los precios, el tiempo y las fechas de cosecha son orientativos.',
      'Eres responsable de lo que escribes y de guardar bien tu contrasena. No uses la app para nada ilegal.',
      'Podemos cambiar estas condiciones. Si cambian, te lo avisaremos en la app.',
    ],
  },
  {
    titulo: 'Accesibilidad',
    parrafos: [
      'La app intenta seguir las pautas WCAG 2.1 nivel AA: los botones con icono tienen nombre para lectores de pantalla, los textos se pueden ampliar con el tamano de letra del sistema y los colores tienen buen contraste.',
      'Si encuentras algun problema de accesibilidad, escribe a ' + RESPONSABLE.email + '.',
    ],
  },
];

const en = [
  {
    titulo: 'Privacy policy',
    parrafos: [
      'Controller: ' + RESPONSABLE.nombre + '. Contact: ' + RESPONSABLE.email + '.',
      'What we store: your name, username, salted encrypted password, language and the garden data you enter (seasons, plots, sowings, watering and harvests). If you want, also the city or location of the garden.',
      'Why: so you can use the app, see your summaries and calculate profit. There are no ads, data is not sold and no artificial intelligence is used.',
      'Legal basis: providing the service you ask for when you sign up (article 6.1.b GDPR). Location is only used if you turn it on.',
      'Location: only requested when you tap the GPS button. It is used to ask Open-Meteo for the weather, which receives approximate coordinates but not your name. You can remove the permission in your phone settings at any time.',
      'Where it is stored: on your device and, when the app uses its server, on Amazon Web Services (AWS) inside the European Union, Spain region (eu-south-2). AWS acts as data processor under its data processing addendum (DPA). The connection is encrypted (HTTPS) and data is stored encrypted.',
      'How long: while you keep your account. If you delete it, your data is deleted at once and server backups are removed within 30 days.',
      'Your rights: you can see and fix your data (My account), download it (Export my data), delete the account (Delete my account) and object or limit processing by writing to ' + RESPONSABLE.email + '. You can complain to the Spanish Data Protection Agency (www.aepd.es).',
      'Minors: you must be 14 or older. If you are younger, your parents or guardians must sign you up.',
      'Delete without the app: ' + RESPONSABLE.web + '.',
    ],
  },
  {
    titulo: 'Legal notice',
    parrafos: [
      'Huerto Urbano is a 2 DAM project by ' + RESPONSABLE.nombre + '. Contact: ' + RESPONSABLE.email + '.',
      'The app is free and sells nothing. It follows the Spanish LSSI (Law 34/2002), the GDPR and the LOPDGDD (Organic Law 3/2018).',
    ],
  },
  {
    titulo: 'Terms of use',
    parrafos: [
      'The app helps you log your garden work. Prices, weather and harvest dates are only a guide.',
      'You are responsible for what you write and for keeping your password safe. Do not use the app for anything illegal.',
      'These terms may change. If they do, you will be told in the app.',
    ],
  },
  {
    titulo: 'Accessibility',
    parrafos: [
      'The app tries to follow WCAG 2.1 level AA: icon buttons have names for screen readers, text grows with the system font size and colours have good contrast.',
      'If you find an accessibility problem, write to ' + RESPONSABLE.email + '.',
    ],
  },
];

export function textosLegales(idioma) {
  return idioma === 'en' ? en : es;
}
