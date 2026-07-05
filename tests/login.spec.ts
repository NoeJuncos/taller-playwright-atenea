import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import TestData from '../data/testData.json';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;

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