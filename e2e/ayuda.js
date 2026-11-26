const { expect } = require('@playwright/test');

async function preparar(page) {
  await page.route('**/api.open-meteo.com/**', (r) => r.fulfill({ json: {} }));
  await page.route('**/geocoding-api.open-meteo.com/**', (r) => r.fulfill({ json: { results: [] } }));
  await page.goto('/');
}

async function saltarBienvenida(page) {
  const saltar = page.getByRole('button', { name: 'Saltar' });
  await saltar.waitFor({ timeout: 10000 }).catch(() => {});
  if (await saltar.isVisible()) await saltar.click();
}

async function entrar(page, usuario, contrasena) {
  await page.getByLabel('Usuario').fill(usuario);
  await page.getByLabel('Contrasena', { exact: true }).fill(contrasena);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await saltarBienvenida(page);
  await expect(page.getByText('Mi huerto')).toBeVisible();
}

async function registrar(page, nombre, usuario, contrasena) {
  await page.getByRole('button', { name: 'No tengo cuenta, quiero registrarme' }).click();
  await page.getByLabel('Nombre').fill(nombre);
  await page.getByLabel('Usuario').fill(usuario);
  await page.getByLabel('Contrasena', { exact: true }).fill(contrasena);
  await page.getByLabel('Repetir contrasena').fill(contrasena);
  await page.getByRole('checkbox', { name: 'Tengo 14 anos o mas' }).click();
  await page.getByRole('checkbox', { name: /He leido y acepto/ }).click();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await saltarBienvenida(page);
  await expect(page.getByText('Mi huerto')).toBeVisible();
}

async function pestana(page, nombre) {
  await page.getByRole('tab', { name: nombre }).click();
}

module.exports = { preparar, entrar, registrar, pestana };
