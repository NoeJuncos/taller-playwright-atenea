import { APIRequestContext, expect } from '@playwright/test';

export class BackendUtils {

    static async crearUsuario(request: APIRequestContext, usuario: any, esNuevo: boolean = true) {
        let email: string;

        if (esNuevo) {
            email = `${usuario.emailDinamico.prefijo}${Date.now()}${usuario.emailDinamico.sufijo}`;
        } else {
            email= usuario.email;
        }
        
        const response = await request.post('http://localhost:6007/api/auth/signup', {
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/json',
            },
            data: {
                firstName: usuario.usuarioValido.nombre,
                lastName: usuario.usuarioValido.apellido,
                email: email,
                password: usuario.usuarioValido.password
            }
        });
        expect(response.status()).toBe(201);
        return { email: email, password: usuario.usuarioValido.password };

    }

}