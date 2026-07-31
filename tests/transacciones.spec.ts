import { test, expect, request } from '@playwright/test';
import { DashboardPage } from '../pages/dashboardPage';
import { ModalEnviarTransferencia } from '../pages/modalEnviarTransferencia';
import testData from '../data/testData.json';
import fs from 'fs/promises';
import { json } from 'stream/consumers';

let dashboardPage: DashboardPage;
let modalEnviarTransferencia: ModalEnviarTransferencia;

const testUsuarioEnvia = test.extend({
    storageState: require.resolve('../playwright/.auth/usuarioEnvia.json')
})

const testUsuarioRecibe = test.extend({
    storageState: require.resolve('../playwright/.auth/usuarioRecibe.json')
})

test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    modalEnviarTransferencia = new ModalEnviarTransferencia(page);
    await dashboardPage.visitarPaginaDashboard();
})

testUsuarioEnvia('TC-12 Verificar transacción exitosa', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await dashboardPage.botonEnviarDinero.click();
    await modalEnviarTransferencia.completarFormularioEnvioTransferenciaYClickBotonEnviar(testData.registro.usuarioValido.email, '100');
    await expect(page.getByText('Transferencia enviada a ' + testData.registro.usuarioValido.email)).toBeVisible;

})

testUsuarioRecibe('TC-13 Verificar que el usuario reciba la transferencia', async ({ page }) => {
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await expect(page.getByText('Transferencia de ').first()).toBeVisible;

})

// Test unificado que envía dinero por API y verifica en UI
testUsuarioRecibe('TC-14 Verificar transferencia recibida (enviada por API)', async ({ page, request }) => {
    // #1 Preparación para lectura de datos y TOKEN de remitente
    // Leemos el archivo de datos del usuario que envía para obtener su email
    const usuarioEnviaData = require.resolve('../playwright/.auth/usuarioEnvia.data.json'); // Le damos la ruta
    const usuarioEnviaContenidoData = await fs.readFile(usuarioEnviaData, 'utf-8'); // Esperamos que lo lea
    const datosUsuarioEnvia = JSON.parse(usuarioEnviaContenidoData); // Agarro el objeto JS y lo convierte en JSON
    const emailUsuarioEnvia = datosUsuarioEnvia.email; // Saco el email

    // Me aseguro de que el email no sea nulo y exista, que esté definido
    expect(emailUsuarioEnvia, 'El email del usuario que envía no se leyó correctamente desde el archivo').toBeDefined();

    // Leemos el archivo de autenticación del remitente para obtener su JWT
    const usuarioEnviaAuth = require.resolve('../playwright/.auth/usuarioEnvia.json');
    const usuarioEnviaContenidoAuth = await fs.readFile(usuarioEnviaAuth, 'utf-8');
    const datosUsuarioEnviaAuth = JSON.parse(usuarioEnviaContenidoAuth);
    const jwtUsuarioEnvia = datosUsuarioEnviaAuth.origins[0]?.localStorage.find((item: { name: string; value: string }) => item.name === 'jwt');
    //Quiero encontrar un objeto cuyo nombre sea jwt, y devolver el valor
    //Los signos de pregunta son operadores de operamiento opcional, mecanismo que nos da seguridad para que nuestro código no se rompa
    //porque pueda ser que dentro de origins no exista, o algo así; si en algún punto no existe, el programa se detiene y tira un type error
    expect(jwtUsuarioEnvia, 'El JWT del usuario que envía no se leyó correctamente desde el archivo').toBeDefined();
    const jwt = jwtUsuarioEnvia.value;

    // #2 Acción: obtener cuenta y enviar transferencia vía API
    // Obtener cuenta del remitente para saber el ID de origen
    const respuestaCuentas = await request.get('http://localhost:6007/api/accounts', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }

    });
    expect(respuestaCuentas.ok(), `La API para obtener cuentas falló: ${respuestaCuentas.status()}`).toBeTruthy();  // El .ok tira bien en un rango de 200 a 299
    // Busco las cuentas, que están en formato JSON
    const cuentas = await respuestaCuentas.json();
    // Verifico que el usuario tenga al menos 1 cuenta
    expect(cuentas.length, 'No se encontraron cuentas para el usuario').toBeGreaterThan(0);
    const idCuentaOrigen = cuentas[0]._id; // Guardo el id de la primera cuenta
    const montoAleatorio = Math.floor(Math.random() * 100) + 1; // Genero un monto aleatorio entre 1 y 100
    console.log(`Enviando transferencia de $${montoAleatorio} desde la cuenta ${idCuentaOrigen} a ${testData.registro.usuarioValido.email}`);

    // Ahora, con todos los datos, podemos enviar la transferencia de una cuenta a la otra
    const respuestaTransferencia = await request.post('http://localhost:6007/api/transactions/transfer', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: {
            fromAccountId: idCuentaOrigen,
            toEmail: testData.registro.usuarioValido.email,
            amount: montoAleatorio
        }
    });
    // Esperamos a que la respuesta del envío del dinero esté bien
    expect(respuestaTransferencia.ok(), `La API para transferir dinero falló: ${respuestaTransferencia.status()}`).toBeTruthy();

    // #3 Comprobar que el monto llegó al destinatario por UI
    // Recargo la página porque estoy logueado, me mandaron dinero pero no lo veo
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    // Verificamos que se muestren los datos
    await expect(dashboardPage.elementosListaTransferencia.first()).toContainText(emailUsuarioEnvia);
    // Para validar el monto, debemos primero convertirlo a expresión regular
    const montoRegex = new RegExp(String(montoAleatorio.toFixed(2)));
    await expect(dashboardPage.montosListaTransferencia.first()).toContainText(montoRegex);

})