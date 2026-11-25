import * as Location from 'expo-location';

export async function ubicacionActual() {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (permiso.status !== 'granted') throw new Error('Sin permiso de ubicacion');
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const latitud = Math.round(pos.coords.latitude * 10000) / 10000;
  const longitud = Math.round(pos.coords.longitude * 10000) / 10000;
  let nombre = 'Mi ubicacion';
  try {
    const lugares = await Location.reverseGeocodeAsync({ latitude: latitud, longitude: longitud });
    if (lugares && lugares[0]) nombre = lugares[0].city || lugares[0].subregion || lugares[0].region || nombre;
  } catch (e) {
    nombre = 'Mi ubicacion';
  }
  return { nombre, latitud, longitud, gps: true };
}
