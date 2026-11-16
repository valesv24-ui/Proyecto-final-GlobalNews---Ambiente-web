import { z } from 'zod';

// Configura Zod para que sus mensajes de error por defecto salgan en español.
// Los esquemas pueden seguir usando mensajes propios con { message: '...' }.
z.config(z.locales.es());
