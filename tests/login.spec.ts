import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import TestData from '../data/testData.json';

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
    await test.step('Enviar solicitud POST a la API de registro con datos válidos', async () => {
      const response = await request.post('http://localhost:6007/api/auth/signup', {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/json',
        },
        data: {
          firstName: TestData.registro.usuarioValido.nombre,
          lastName: TestData.registro.usuarioValido.apellido,
          email: email,
          password: TestData.registro.usuarioValido.password
        }
      });

    await test.step('Verificar que la respuesta de la API sea exitosa', async () => {
      expect(response.status()).toBe(201);

    await test.step('Completar el formulario de inicio de sesión con el nuevo usuario y hacer clic en el botón de login', async () => {

      const responsePromiseLogin = page.waitForResponse('http://localhost:6007/api/auth/login');
      await loginPage.completarYHacerClickBotonLogin({ email: email, password: TestData.registro.usuarioValido.password });

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
        email: email,
      }));
    });
      await expect(loginPage.page.getByText(TestData.login.mensajesEsperadosLogin.loginExitoso)).toBeVisible();
      await expect(dashboardPage.dashboardTitle).toBeVisible();
    });
    });
})
