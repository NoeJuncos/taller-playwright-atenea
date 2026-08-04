import { test as setup, expect } from '@playwright/test'
import { BackendUtils } from '../utils/backendUtils';
import TestData from '../data/testData.json'
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { ModalCrearCuenta } from '../pages/modalCrearCuenta';
import fs from 'fs/promises';
import path from 'path';

//Genero la variable de LoginPage y de DashboardPage
let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let modalCrearCuenta: ModalCrearCuenta
// Genero la constante de en dónde se va a guardar el archivo de los usuarios
const usuarioEnviaAuthFile = 'playwright/.auth/usuarioEnvia.json';
const usuarioRecibeAuthFile = 'playwright/.auth/usuarioRecibe.json';
const usuarioEnviaDataFile = 'playwright/.auth/usuarioEnvia.data.json';

// Instancio las clases y las inicializo, y va a la página de Login
setup.beforeEach(async ({ page }) => {
    // Me aseguro de que la carpeta playwright/.auth/ exista antes de escribir ahí.
    // En un checkout limpio (como en CI) esta carpeta no existe todavía, porque está en .gitignore.
    await fs.mkdir(path.resolve(__dirname, '..', 'playwright/.auth'), { recursive: true });

    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    modalCrearCuenta = new ModalCrearCuenta(page);
    await loginPage.visitarPaginaLogin();
})
// Envío el request para crear el usuario a través de la API
setup('Generar usuario que envía dinero', async ({ page, request }) => {
    const nuevoUsuario = await BackendUtils.crearUsuario(request, TestData.registro);

    // Guardo los datos del nuevo usuario para poder usarlos en los tests de transacciones
    await fs.writeFile(path.resolve(__dirname, '..', usuarioEnviaDataFile), JSON.stringify(nuevoUsuario, null, 2))

    await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);
    await dashboardPage.botonAgregarCuenta.click();
    await modalCrearCuenta.seleccionarTipoDeCuenta('Débito');
    await modalCrearCuenta.ingresarMontoInicial('5000');
    await modalCrearCuenta.botonCrearCuenta.click();
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    await page.context().storageState({ path: usuarioEnviaAuthFile });
})

setup('Crear y loguearse con usuario que recibe dinero', async ({ page, request }) => {
    const nuevoUsuario = await BackendUtils.crearUsuario(request, TestData.registro.usuarioValido, false);
    await loginPage.completarYHacerClickBotonLogin(nuevoUsuario);
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await dashboardPage.botonAgregarCuenta.click();
    await modalCrearCuenta.seleccionarTipoDeCuenta('Débito');
    await modalCrearCuenta.ingresarMontoInicial('1');
    await modalCrearCuenta.botonCrearCuenta.click();
    await expect(page.getByText('¡Cuenta creada exitosamente!')).toBeVisible();
    await page.context().storageState({ path: usuarioRecibeAuthFile });

})