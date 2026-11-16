import { z } from 'zod';

/**
 * Esquemas reutilizables en varios módulos.
 * Cada módulo (noticias, categorías, auth...) crea su propio archivo en esta carpeta.
 */

/** Valida un :id en la URL y lo convierte a número entero positivo */
export const esquemaIdParam = z.object({
  id: z.coerce.number({ message: 'El id debe ser un número' })
    .int({ message: 'El id debe ser un número entero' })
    .positive({ message: 'El id debe ser mayor que 0' }),
});

/** Paginación opcional: ?pagina=1&limite=10 */
export const esquemaPaginacion = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
});

// Tipos de TypeScript inferidos automáticamente de los esquemas
export type IdParam = z.infer<typeof esquemaIdParam>;
export type Paginacion = z.infer<typeof esquemaPaginacion>;
