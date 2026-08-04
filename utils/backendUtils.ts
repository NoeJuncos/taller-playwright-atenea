import { APIRequestContext, expect } from '@playwright/test';

export class BackendUtils {

    static async crearUsuario(request: APIRequestContext, datos: any, esNuevo: boolean = true) {
        let email: string;
        let usuarioValido: any;

        if (esNuevo) {
            // datos es el objeto "registro" completo: { usuarioValido, emailDinamico, ... }
            usuarioValido = datos.usuarioValido;
            email = `${datos.emailDinamico.prefijo}${Date.now()}${datos.emailDinamico.sufijo}`;
        } else {
            // datos ya es el objeto usuarioValido desanidado: { nombre, apellido, email, password }
            usuarioValido = datos;
            email = datos.email;
        }

        const response = await request.post('http://localhost:6007/api/auth/signup', {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/json',
            },
            data: {
                firstName: usuarioValido.nombre,
                lastName: usuarioValido.apellido,
                email: email,
                password: usuarioValido.password
            }
        });
        expect(response.status()).toBe(201);
        return { email: email, password: usuarioValido.password };

    }

}