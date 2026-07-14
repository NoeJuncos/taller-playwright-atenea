import { test, expect, request } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import TestData from '../data/testData.json';

let registerPage: RegisterPage;
const email = `${TestData.registro.emailDinamico.prefijo}${Date.now()}${TestData.registro.emailDinamico.sufijo}`;

test.beforeEach(async ({ page }) => {
  registerPage = new RegisterPage(page);
  await registerPage.visitarPaginaRegistro();
});

test('TC-1 Verificar elementos visibles en la página de registro', async () => {
  await test.step('Verificar que los elementos principales del formulario sean visibles', async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
  });
});

test('TC-2 Verificar botón de registro deshabilitado inicialmente', async () => {
  await test.step('Validar que el botón de registro esté deshabilitado al iniciar', async () => {
    await expect(registerPage.registerButton).toBeDisabled();
  });
});

test('TC-3 Verificar botón habilitado al completar todos los campos', async () => {
  await test.step('Completar el formulario con datos válidos', async () => {
    await registerPage.completarFormularioRegistro(TestData.registro.usuarioValido);
  });

  await test.step('Validar que el botón de registro se habilite', async () => {
    await expect(registerPage.registerButton).toBeEnabled();
  });
});

test('TC-4 Verificar redireccionamiento al login', async ({ page }) => {
  await test.step('Hacer clic en el botón de login', async () => {
    await registerPage.hacerClickEnBotonLogin();
  });

  await test.step('Verificar que la navegación redirija a la página de login', async () => {
    await expect(page).toHaveURL(TestData.registro.mensajesEsperadosRegistro.urlLogin);
  });
});

test('TC-5 Verificar registro exitoso con datos válidos', async ({ page }) => {
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

test('TC-6 Verificar correo electrónico ya existente', async ({ page }) => {
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
  
  test('TC-8 Verificar registro exitoso verificando respuesta de API', async ({ page }) => {
  await test.step('Completar el formulario de registro con datos válidos', async () => {
    const usuario = { ...TestData.registro.usuarioValido, email };
    await registerPage.completarFormularioRegistro(usuario);
  });

  await test.step('Hacer clic en el botón de registro y verificar la respuesta de la API', async () => {
    // Es como decir: quedate atento que en algún momento va a llegar una respuesta de la API, y cuando llegue guardamela en responsePromise
    const responsePromise = page.waitForResponse('http://localhost:6007/api/auth/signup');
    // La acción que ejecutará la solicitud
    await registerPage.hacerClickEnBotonRegistro();
    // Esperar a que la respuesta de la API esté disponible
    const response = await responsePromise;
    const responseBody = await response.json();

    expect(response.status()).toBe(201);
    expect(responseBody).toHaveProperty('token');
    expect(typeof responseBody.token).toBe('string');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toEqual(expect.objectContaining({
      id: expect.any(String),
      firstName: TestData.registro.usuarioValido.nombre,
      lastName: TestData.registro.usuarioValido.apellido,
      email: expect.stringContaining(TestData.registro.emailDinamico.prefijo),
    }));
    await expect(page.getByText(TestData.registro.mensajesEsperadosRegistro.registroExitoso)).toBeVisible();
  });
});

  test('TC-9 Generar signup desde la API con datos válidos', async ({ request }) => {
    await test.step('Enviar solicitud POST a la API de registro con datos válidos', async () => {
      // Realizo la solicitud POST a la API con esos datos como header y data
      // El await es: esperá a que haga la solicitud y me devuelva la respuesta
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
    await test.step('Verificar que la respuesta de la API sea exitosa y contenga los datos esperados', async () => {
      // Guarda la respuesta en formato JSON para poder hacer las validaciones
      const responseBody = await response.json();
      expect(response.status()).toBe(201);
      expect(responseBody).toHaveProperty('token');
      expect(typeof responseBody.token).toBe('string');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toEqual(expect.objectContaining({
        id: expect.any(String),
        firstName: TestData.registro.usuarioValido.nombre,
        lastName: TestData.registro.usuarioValido.apellido,
        email: expect.stringContaining(TestData.registro.emailDinamico.prefijo),
      }));
    });
  });
});

  test('TC-10 Simular error con page.route', async ({ page }) => {
    await test.step('Interceptar la solicitud de registro y simular un error 500', async () => {
      await page.route('**/api/auth/signup', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' }),
        });
      });

    await test.step('Completar el formulario de registro y hacer clic en el botón de registro', async () => {
      await registerPage.firstNameInput.fill(TestData.registro.usuarioValido.nombre);
      await registerPage.lastNameInput.fill(TestData.registro.usuarioValido.apellido);
      const email = `${TestData.registro.emailDinamico.prefijo}${Date.now()}${TestData.registro.emailDinamico.sufijo}`;
      await registerPage.emailInput.fill(email);
      await registerPage.passwordInput.fill(TestData.registro.usuarioValido.password);
      await registerPage.hacerClickEnBotonRegistro();
    
    await expect(page.getByText('Internal Server Error')).toBeVisible();
    });
  });
})