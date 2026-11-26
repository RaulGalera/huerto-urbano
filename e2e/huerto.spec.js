const { test, expect } = require('@playwright/test');
const { preparar, entrar, registrar, pestana } = require('./ayuda');

test.beforeEach(async ({ page }) => {
  await preparar(page);
});

test('el admin entra y ve el inicio', async ({ page }) => {
  await entrar(page, 'admin', 'admin123');
  await expect(page.getByRole('tab', { name: 'Inicio' })).toHaveAttribute('aria-selected', 'true');
});

test('no deja entrar con una contrasena mala', async ({ page }) => {
  await page.getByLabel('Usuario').fill('admin');
  await page.getByLabel('Contrasena', { exact: true }).fill('mala');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText(/incorrect/i)).toBeVisible();
});

test('un usuario nuevo crea una parcela y la riega', async ({ page }) => {
  await registrar(page, 'Ana', 'ana', 'clave123');
  await pestana(page, 'Parcelas');
  await page.getByRole('button', { name: /Nueva parcela/ }).click();
  await page.getByLabel('Nombre').fill('Bancal de prueba');
  await page.getByLabel('Superficie (m2)').fill('4');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Bancal de prueba')).toBeVisible();

  await pestana(page, 'Inicio');
  await page.getByRole('button', { name: /Regar hoy/ }).first().click();
  await pestana(page, 'Riegos');
  await expect(page.getByText('Bancal de prueba').first()).toBeVisible();
});

test('la grafica de agua por mes muestra el total y el coste', async ({ page }) => {
  await entrar(page, 'admin', 'admin123');
  await page.getByLabel('Mi cuenta').click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /Cargar datos de ejemplo/ }).click();
  await page.getByRole('button', { name: 'Volver' }).first().click();
  await page.getByRole('button', { name: 'Agua por mes' }).click();
  await expect(page.getByText(/Coste del agua/)).toBeVisible();
  await page.getByRole('button', { name: 'Agua por parcela' }).click();
  await expect(page.getByText(/L\/m2/).first()).toBeVisible();
});

test('se puede agrandar el texto de la app', async ({ page }) => {
  await entrar(page, 'admin', 'admin123');
  const titulo = page.getByRole('heading', { name: 'Mi huerto' });
  const antes = await titulo.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  await page.getByLabel('Mi cuenta').click();
  await page.getByRole('button', { name: 'Muy grande' }).click();
  await page.getByRole('button', { name: 'Volver' }).first().click();
  const despues = await page.getByRole('heading', { name: 'Mi huerto' }).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(despues).toBeGreaterThan(antes);
});

test('se puede cambiar la app a ingles', async ({ page }) => {
  await entrar(page, 'admin', 'admin123');
  await page.getByLabel('Mi cuenta').click();
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
});
