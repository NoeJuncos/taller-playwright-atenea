import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import TestData from '../data/testData.json';

let registerPage: RegisterPage;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
});

test('TC-1 Verificación de elementos visibles en la página de registro', async () => {
  await test.step('Verificar que los elementos principales del formulario sean visibles', async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
  });
});

test('TC-2 Verificación de botón de registro deshabilitado inicialmente', async () => {
  await test.step('Validar que el botón de registro esté deshabilitado al iniciar', async () => {
    await expect(registerPage.registerButton).toBeDisabled();
  });
});

test('TC-3 Verificación de botón habilitado al completar todos los campos', async () => {
  await test.step('Completar el formulario con datos válidos', async () => {
    await registerPage.completarFormularioRegistro(TestData.registro.usuarioValido);
  });

  await test.step('Validar que el botón de registro se habilite', async () => {
    await expect(registerPage.registerButton).toBeEnabled();
  });
});

test('TC-4 Verificación de redireccionamiento al login', async ({ page }) => {
  await test.step('Hacer clic en el botón de login', async () => {
    await registerPage.hacerClickEnBotonLogin();
  });

  await test.step('Verificar que la navegación redirija a la página de login', async () => {
    await expect(page).toHaveURL(TestData.registro.mensajesEsperadosRegistro.urlLogin);
  });
});

test('TC-5 Registro exitoso con datos válidos', async ({ page }) => {
  const usuarioConEmailDinamico = {
    ...TestData.registro.usuarioValido,
    email: `${TestData.registro.emailDinamico.prefijo}${Date.now()}${TestData.registro.emailDinamico.sufijo}`
  };

  await test.step('Preparar un usuario con email dinámico', async () => {
    // Se usa el objeto creado para el registro
  });

  await test.step('Completar y enviar el formulario de registro', async () => {
    await registerPage.completarYHacerClickBotonRegistro(usuarioConEmailDinamico);
  });

  await test.step('Confirmar que se muestre el mensaje de registro exitoso', async () => {
    await expect(page.getByText(TestData.registro.mensajesEsperadosRegistro.registroExitoso)).toBeVisible();
  });
});

test('TC-6 Verificación de correo electrónico ya existente', async ({ page }) => {
  const email = `${TestData.registro.emailDinamico.prefijo}${Date.now()}${TestData.registro.emailDinamico.sufijo}`;
  const usuario = { ...TestData.registro.usuarioValido, email };

  await test.step('Preparar un usuario para el caso de correo ya existente', async () => {
    // Se usa el objeto creado para el registro duplicado
  });

  await test.step('Registrar al usuario por primera vez', async () => {
    await registerPage.completarYHacerClickBotonRegistro(usuario);
  });

  await test.step('Volver a la página de registro y registrar nuevamente', async () => {
    await registerPage.visitarPaginaRegistro();
    await registerPage.completarYHacerClickBotonRegistro(usuario);
  });

  await test.step('Verificar que aparezca el mensaje de correo ya existente y no el de éxito', async () => {
    await expect(page.getByText(TestData.registro.mensajesEsperadosRegistro.emailYaExistente)).toBeVisible();
    await expect(page.getByText(TestData.registro.mensajesEsperadosRegistro.registroExitoso)).not.toBeVisible();
  });
});