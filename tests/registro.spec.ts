import { test, expect } from '@playwright/test';

test('TC-1 Verificación de elementos visuales en la página de registro', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="lastName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByTestId('boton-registrarse')).toBeVisible();
});

test('TC-2 Verificación de botón de registro deshabilitado por', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByTestId('boton-registrarse')).toBeDisabled();
});

test('TC-3 Verificación de botón de registro habilitado al completar todos los campos', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Noe');
  await page.locator('input[name="lastName"]').fill('Juncos');
  await page.locator('input[name="email"]').fill('noejuncos@test.com');
  await page.locator('input[name="password"]').fill('123456');
  await expect(page.getByTestId('boton-registrarse')).toBeEnabled();
});

test('TC-4 Verificación de redireccionamiento de la página de inicio de sesión', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByTestId('boton-login-header-signup')).toBeVisible();
  await page.getByTestId('boton-login-header-signup').click();
  await expect(page).toHaveURL('http://localhost:3000/login');
});

test('TC-5 Verificación de registro exitoso con datos válidos', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Noe');
  await page.locator('input[name="lastName"]').fill('Juncos');
  await page.locator('input[name="email"]').fill('noejuncos'+Date.now().toString()+'@test.com');
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect (page.getByText('Registro exitoso!')).toBeVisible();

});

test('TC-6 Verificación de correo electrónico ya existente', async ({ page }) => {
  const email = 'noejuncos'+Date.now().toString()+'@test.com';
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Noe');
  await page.locator('input[name="lastName"]').fill('Juncos');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await page.goto('http://localhost:3000/');
  await page.locator('input[name="firstName"]').fill('Noe');
  await page.locator('input[name="lastName"]').fill('Juncos');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('123456');
  await page.getByTestId('boton-registrarse').click();
  await expect (page.getByText('Email already in use')).toBeVisible();
  await expect (page.getByText('Registro exitoso!')).not.toBeVisible();
});