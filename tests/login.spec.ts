import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
const email = `${TestData.registro.emailDinamico.prefijo}${Date.now()}${TestData.registro.emailDinamico.sufijo}`;

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
  dashboardPage = new DashboardPage(page);
  await loginPage.visitarPaginaLogin();
});

test('TC-7: Verificar inicio de sesión exitoso con credenciales válidas', async () => {
  await test.step('Completar el formulario de inicio de sesión y hacer clic en el botón de login', async () => {
    await loginPage.completarYHacerClickBotonLogin(TestData.login.usuarioValidoLogin);
    await expect(loginPage.page.getByText(TestData.login.mensajesEsperadosLogin.loginExitoso)).toBeVisible();
    await expect(dashboardPage.dashboardTitle).toBeVisible();
});
})

test('TC-11 Loguear con nuevo usuario creado por backend', async ({ page, request }) => {

  const nuevoUsuario = await BackendUtils.crearUsuario(request, TestData.registro);

  const responsePromiseLogin = page.waitForResponse('http://localhost:6007/api/auth/login');
  await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);

  const responseLogin = await responsePromiseLogin;
  const responseBodyLoginJson = await responseLogin.json();

  expect(responseLogin.status()).toBe(200);
  expect(responseBodyLoginJson).toHaveProperty('token');
  expect(typeof responseBodyLoginJson.token).toBe('string');
  expect(responseBodyLoginJson).toHaveProperty('user');
  expect(responseBodyLoginJson.user).toEqual(expect.objectContaining({
     id: expect.any(String),
     firstName: TestData.registro.usuarioValido.nombre,
     lastName: TestData.registro.usuarioValido.apellido,
     email: nuevoUsuario.email,
   }));
  await expect(loginPage.page.getByText(TestData.login.mensajesEsperadosLogin.loginExitoso)).toBeVisible();
  await expect(dashboardPage.dashboardTitle).toBeVisible();

});