# Cumplimiento legal de Huerto Urbano

Este documento resume que leyes afectan a la app, que hace ya la app para cumplirlas y que tiene que hacer la API REST cuando este en AWS.

## Leyes y normas que se aplican

- RGPD (Reglamento UE 2016/679) y LOPDGDD (Ley Organica 3/2018): proteccion de datos personales.
- LSSI (Ley 34/2002): servicios de la sociedad de la informacion, aviso legal con los datos del responsable.
- Ley 11/2023 y Acta Europea de Accesibilidad (obligatoria desde el 28/06/2025 para muchos productos y servicios digitales). Las microempresas de servicios estan exentas, pero la app sigue las pautas WCAG 2.1 AA igualmente.
- Normas de Google Play y App Store: politica de privacidad, borrar la cuenta desde la app y desde una web, formulario de seguridad de datos.

## Que hace ya la app

- Registro con dos casillas obligatorias: tener 14 anos o mas (edad minima en Espana segun la LOPDGDD) y aceptar la politica de privacidad y las condiciones. Se guarda la version de los textos y la fecha en que se aceptaron.
- Pantalla "Privacidad y aviso legal" con politica de privacidad, aviso legal, condiciones de uso y accesibilidad, en espanol e ingles. Se abre desde el login y desde Mi cuenta (como mucho dos toques).
- Derechos del usuario dentro de la app: ver y corregir sus datos (nombre, contrasena, idioma), descargarlos (Exportar mis datos, portabilidad) y borrar la cuenta con todos sus datos (Borrar mi cuenta, pide la contrasena).
- Ubicacion: ya no se pide al abrir la app. Solo se pide si el usuario pulsa "Usar mi ubicacion (GPS)". A Open-Meteo solo le llegan coordenadas, nunca el nombre.
- Contrasenas guardadas con sal aleatoria y 2000 vueltas de SHA-256. Las cuentas antiguas se pasan al formato nuevo solas al iniciar sesion.
- No hay publicidad, ni analitica, ni SDK de terceros, ni IA.
- Accesibilidad: los botones que solo tienen icono llevan nombre para lectores de pantalla, las casillas se anuncian como casillas y los textos respetan el tamano de letra del sistema.

## Que falta antes de publicar

- Para publicar en Google Play hace falta una pagina web donde pedir el borrado de la cuenta sin la app. De momento se pide por email (ya puesto en `src/legal.js`).
- Rellenar el formulario de seguridad de datos de Google Play Console y la etiqueta de privacidad de App Store.

## Que tiene que cumplir la API REST en AWS

- Region de la UE, mejor Espana (eu-south-2) o Irlanda (eu-west-1). El DPA de AWS para el RGPD ya va incluido en sus condiciones, AWS es el encargado del tratamiento y nosotros el responsable.
- Todo por HTTPS (API Gateway o un balanceador con certificado de ACM). Nada por HTTP.
- Datos cifrados en reposo (RDS o DynamoDB con cifrado KMS activado, tambien las copias de seguridad).
- Contrasenas: el servidor no debe guardar la contrasena tal cual. Lo mejor es usar Amazon Cognito o, si se hace a mano, bcrypt o argon2. La app enviaria la contrasena solo por HTTPS.
- Autenticacion con token (JWT) que caduque. Cada usuario solo puede leer y escribir sus propios datos (comprobarlo en cada endpoint con el id del token, nunca con un id que mande la app).
- Endpoint para borrar la cuenta (por ejemplo `DELETE /usuarios/yo`) que borre al usuario y todos sus datos. Las copias de seguridad tienen que caducar en 30 dias como mucho, que es lo que dice la politica.
- Endpoint para exportar los datos (`GET /usuarios/yo/datos`) en JSON.
- Una pagina web sencilla para pedir el borrado sin tener la app instalada.
- Logs sin datos personales y que se borren solos (por ejemplo 90 dias en CloudWatch).
- Claves y secretos fuera del repositorio: en AWS Secrets Manager o en un `.env` que esta en el `.gitignore`. En la app solo puede ir la URL publica de la API, nunca una clave.
- Registro de actividades de tratamiento: un documento corto con que datos se tratan, para que, donde y cuanto tiempo (se puede sacar de la politica de privacidad).

## Fuentes

- AEPD, nota tecnica sobre apps moviles: https://www.aepd.es/guias/nota-tecnica-apps-moviles.pdf
- AEPD, consentimiento de menores: https://www.aepd.es/infografias/infografia-consentimiento-menores.pdf
- Google Play, borrado de cuentas: https://support.google.com/googleplay/android-developer/answer/13327111
- AWS, DPA y RGPD: https://docs.aws.amazon.com/es_es/whitepapers/latest/navigating-gdpr-compliance/aws-data-processing-addendum-dpa.html
- Ley 11/2023 (BOE): https://boe.es/boe/dias/2023/05/09/pdfs/BOE-A-2023-11022.pdf
