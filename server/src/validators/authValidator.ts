import { z } from 'zod';

/**
 * Registro: el usuario elige ser "cliente" o "publicitario".
 * El rol administrador NO se puede elegir al registrarse.
 */
export const esquemaRegistro = z.object({
  nombre: z.string().trim()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .max(100, { message: 'El nombre no puede superar los 100 caracteres' }),
  correo: z.string().trim().toLowerCase()
    .pipe(z.email({ message: 'Introduce un correo electrónico válido' })),
  contrasena: z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(72, { message: 'La contraseña no puede superar los 72 caracteres' }) // límite de bcrypt
    .regex(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número' }),
  confirmarContrasena: z.string().min(1, { message: 'Confirma tu contraseña' }),
  planId: z.coerce.number().int().positive({ message: 'Seleccione un plan de suscripción' }),
  rol: z.enum(['cliente', 'publicitario'], { message: 'El rol debe ser cliente o publicitario' })
    .default('cliente'),
})
  // Igual que en el material de clase: las dos contraseñas deben coincidir
  .refine((datos) => datos.contrasena === datos.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  });

export const esquemaLogin = z.object({
  correo: z.string().trim().toLowerCase()
    .pipe(z.email({ message: 'Introduce un correo electrónico válido' })),
  contrasena: z.string().min(1, { message: 'La contraseña es obligatoria' }),
});

export type DatosRegistro = z.infer<typeof esquemaRegistro>;
export type DatosLogin = z.infer<typeof esquemaLogin>;
