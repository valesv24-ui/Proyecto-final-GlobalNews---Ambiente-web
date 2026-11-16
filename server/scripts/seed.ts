import bcrypt from 'bcrypt';
import type { PoolClient } from 'pg';
import { pool } from '../src/config/db.js';

/**
 * Carga los datos iniciales y de prueba en la base de datos.
 * Uso: npm run db:seed   (requiere haber ejecutado antes npm run db:schema)
 *
 * Todo se ejecuta dentro de una transacción: si algo falla, no queda nada a medias.
 * Al inicio vacía las tablas, así que se puede ejecutar varias veces.
 */

// Contraseña de los usuarios de prueba (solo para desarrollo)
const CONTRASENA_DEMO = 'GlobalNews2026!';
const RONDAS_BCRYPT = 10;

// Inserta una fila y devuelve el id generado
async function insertar(cliente: PoolClient, sql: string, valores: unknown[]): Promise<number> {
  const resultado = await cliente.query<{ id: number }>(`${sql} RETURNING id`, valores);
  const fila = resultado.rows[0];
  if (!fila) throw new Error(`La inserción no devolvió un id: ${sql}`);
  return fila.id;
}

async function sembrar(): Promise<void> {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Vacía todas las tablas y reinicia los contadores de los id
    await cliente.query(`
      TRUNCATE pagos, publicaciones_publicitarias, paquetes_pauta, noticia_palabra_clave,
               palabras_clave, noticias, categorias, usuarios, planes_suscripcion, roles
      RESTART IDENTITY CASCADE
    `);

    // 1. Roles
    const rolCliente = await insertar(cliente,
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2)',
      ['cliente', 'Navega, busca y filtra las noticias publicadas']);
    const rolPublicitario = await insertar(cliente,
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2)',
      ['publicitario', 'Compra paquetes de pauta y publica anuncios sujetos a revisión']);
    const rolAdmin = await insertar(cliente,
      'INSERT INTO roles (nombre, descripcion) VALUES ($1, $2)',
      ['administrador', 'Gestiona noticias, categorías y aprueba publicaciones']);

    // 2. Los 3 planes de suscripción
    const planesSql = 'INSERT INTO planes_suscripcion (nombre, descripcion, precio_mensual) VALUES ($1, $2, $3)';
    const planBasico = await insertar(cliente, planesSql,
      ['Básico', 'Acceso a las noticias generales con publicidad', 0]);
    const planPremium = await insertar(cliente, planesSql,
      ['Premium', 'Todas las categorías, menos publicidad y boletín semanal', 4.99]);
    await insertar(cliente, planesSql,
      ['Plus', 'Todo lo de Premium, sin publicidad y con contenido exclusivo', 9.99]);

    // 3. Usuarios de prueba (uno por rol), con la contraseña cifrada con bcrypt
    const hash = await bcrypt.hash(CONTRASENA_DEMO, RONDAS_BCRYPT);
    const usuariosSql = 'INSERT INTO usuarios (nombre, correo, contrasena_hash, rol_id, plan_id) VALUES ($1, $2, $3, $4, $5)';
    const admin = await insertar(cliente, usuariosSql,
      ['Administrador GlobalNews', 'admin@globalnews.com', hash, rolAdmin, null]);
    await insertar(cliente, usuariosSql,
      ['Cliente Demo', 'cliente@globalnews.com', hash, rolCliente, planPremium]);
    const publicitario = await insertar(cliente, usuariosSql,
      ['Publicitario Demo', 'publicidad@globalnews.com', hash, rolPublicitario, planBasico]);

    // 4. Categorías
    const categorias: Record<string, number> = {};
    for (const [nombre, descripcion] of [
      ['Nacionales', 'Noticias de Costa Rica'],
      ['Internacionales', 'Lo que pasa en el mundo'],
      ['Deportes', 'Fútbol, atletismo y más'],
      ['Tecnología', 'Innovación, ciencia y tecnología'],
      ['Economía', 'Negocios, mercados y finanzas'],
      ['Entretenimiento', 'Cultura, cine y espectáculos'],
    ] as const) {
      categorias[nombre] = await insertar(cliente,
        'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2)', [nombre, descripcion]);
    }

    // 5. Palabras clave (temas de interés)
    const palabras: Record<string, number> = {};
    for (const nombre of ['San Carlos', 'educación', 'fútbol', 'inteligencia artificial', 'turismo', 'clima', 'empleo', 'música']) {
      palabras[nombre] = await insertar(cliente, 'INSERT INTO palabras_clave (nombre) VALUES ($1)', [nombre]);
    }

    // 6. Noticias de ejemplo con ubicación para el mapa
    interface NoticiaSemilla {
      titulo: string;
      resumen: string;
      contenido: string;
      categoria: string;
      ubicacion: string;
      latitud: number;
      longitud: number;
      palabras: string[];
    }
    const noticias: NoticiaSemilla[] = [
      {
        titulo: 'Ciudad Quesada inaugura nuevo centro de innovación tecnológica',
        resumen: 'El espacio ofrecerá cursos gratuitos de programación para jóvenes de la región.',
        contenido: 'El nuevo centro de innovación abrió sus puertas en Ciudad Quesada con laboratorios de cómputo y cursos de programación para estudiantes de la zona norte.',
        categoria: 'Tecnología', ubicacion: 'Ciudad Quesada, San Carlos', latitud: 10.323800, longitud: -84.430400,
        palabras: ['San Carlos', 'educación', 'inteligencia artificial'],
      },
      {
        titulo: 'Selección nacional se prepara para la próxima eliminatoria',
        resumen: 'El equipo concentra en el Proyecto Gol con nuevas convocatorias.',
        contenido: 'La selección nacional inició su concentración con miras a la eliminatoria. El cuerpo técnico incluyó a varios jugadores jóvenes en la convocatoria.',
        categoria: 'Deportes', ubicacion: 'San Rafael de Alajuela', latitud: 9.993900, longitud: -84.245300,
        palabras: ['fútbol'],
      },
      {
        titulo: 'Zona norte registra aumento de turistas durante la temporada',
        resumen: 'Hoteles de La Fortuna reportan alta ocupación.',
        contenido: 'Los hoteles y operadores turísticos de La Fortuna reportaron un aumento en la visitación, lo que impulsa el empleo local.',
        categoria: 'Economía', ubicacion: 'La Fortuna, San Carlos', latitud: 10.467800, longitud: -84.642700,
        palabras: ['San Carlos', 'turismo', 'empleo'],
      },
      {
        titulo: 'Pronostican lluvias fuertes en el Caribe y la zona norte',
        resumen: 'El Instituto Meteorológico emitió una alerta amarilla.',
        contenido: 'Las autoridades recomiendan precaución por el aumento de lluvias en el Caribe y la zona norte durante los próximos días.',
        categoria: 'Nacionales', ubicacion: 'San José', latitud: 9.928100, longitud: -84.090700,
        palabras: ['clima', 'San Carlos'],
      },
    ];
    for (const n of noticias) {
      const categoriaId = categorias[n.categoria];
      if (categoriaId === undefined) throw new Error(`Categoría no encontrada: ${n.categoria}`);
      const noticiaId = await insertar(cliente,
        `INSERT INTO noticias (titulo, resumen, contenido, imagen_url, categoria_id, autor_id, ubicacion_nombre, latitud, longitud)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [n.titulo, n.resumen, n.contenido, `https://picsum.photos/seed/globalnews${categoriaId}/800/450`,
         categoriaId, admin, n.ubicacion, n.latitud, n.longitud]);
      for (const palabra of n.palabras) {
        await cliente.query(
          'INSERT INTO noticia_palabra_clave (noticia_id, palabra_clave_id) VALUES ($1, $2)',
          [noticiaId, palabras[palabra]]);
      }
    }

    // 7. Paquetes de pauta
    const paquetesSql = 'INSERT INTO paquetes_pauta (nombre, descripcion, precio, duracion_dias) VALUES ($1, $2, $3, $4)';
    const paqueteSemanal = await insertar(cliente, paquetesSql,
      ['Semanal', 'Anuncio visible durante 7 días en la página principal', 15, 7]);
    await insertar(cliente, paquetesSql,
      ['Mensual', 'Anuncio visible durante 30 días con posición destacada', 50, 30]);
    await insertar(cliente, paquetesSql,
      ['Publirreportaje', 'Artículo patrocinado completo durante 15 días', 80, 15]);

    // 8. Una publicación pagada y pendiente de revisión, para probar la aprobación del administrador
    const publicacion = await insertar(cliente,
      `INSERT INTO publicaciones_publicitarias (usuario_id, paquete_id, tipo, titulo, contenido, estado)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [publicitario, paqueteSemanal, 'anuncio_producto', 'Café de altura de la zona norte',
       'Pruebe nuestro café 100% sancarleño, tostado artesanalmente.', 'pendiente_revision']);
    await cliente.query(
      `INSERT INTO pagos (publicacion_id, usuario_id, monto, metodo, estado, referencia_transaccion)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [publicacion, publicitario, 15, 'tarjeta', 'completado', 'DEMO-0001']);

    await cliente.query('COMMIT');
    console.log('Datos de prueba cargados correctamente.');
    console.log(`Usuarios: admin@globalnews.com, cliente@globalnews.com, publicidad@globalnews.com (contraseña: ${CONTRASENA_DEMO})`);
  } catch (error) {
    await cliente.query('ROLLBACK');
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error('Error al cargar los datos de prueba, no se guardó ningún cambio:', mensaje);
    process.exitCode = 1;
  } finally {
    cliente.release();
    await pool.end();
  }
}

sembrar();
