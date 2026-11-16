-- =====================================================================
-- GlobalNews - Esquema de la base de datos (PostgreSQL)
-- Crea todas las tablas, relaciones, restricciones e índices.
-- ATENCIÓN: al inicio se eliminan las tablas existentes, así que
-- ejecutar este script BORRA todos los datos. Úselo solo para (re)crear la base.
-- =====================================================================

DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS publicaciones_publicitarias CASCADE;
DROP TABLE IF EXISTS paquetes_pauta CASCADE;
DROP TABLE IF EXISTS noticia_palabra_clave CASCADE;
DROP TABLE IF EXISTS palabras_clave CASCADE;
DROP TABLE IF EXISTS noticias CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS planes_suscripcion CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP FUNCTION IF EXISTS fn_actualizar_fecha CASCADE;

-- ---------------------------------------------------------------------
-- Función de apoyo: actualiza la columna actualizado_en en cada UPDATE
-- ---------------------------------------------------------------------
CREATE FUNCTION fn_actualizar_fecha() RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. Roles del sistema: cliente, publicitario, administrador
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(150)
);

-- ---------------------------------------------------------------------
-- 2. Planes de suscripción (el usuario elige uno de 3 al registrarse)
-- ---------------------------------------------------------------------
CREATE TABLE planes_suscripcion (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(50)   NOT NULL UNIQUE,
  descripcion    VARCHAR(255),
  precio_mensual NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio_mensual >= 0),
  activo         BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 3. Usuarios: la contraseña se guarda solo como hash (bcrypt)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  correo          VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol_id          INTEGER      NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  -- Puede ser NULL para administradores, que no necesitan suscripción
  plan_id         INTEGER      REFERENCES planes_suscripcion(id) ON UPDATE CASCADE ON DELETE SET NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. Categorías de noticias
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(60)  NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. Noticias: imagen/portada, categoría principal y ubicación para el mapa
-- ---------------------------------------------------------------------
CREATE TABLE noticias (
  id               SERIAL PRIMARY KEY,
  titulo           VARCHAR(200)  NOT NULL,
  resumen          VARCHAR(400),
  contenido        TEXT          NOT NULL,
  imagen_url       VARCHAR(500)  NOT NULL,
  -- RESTRICT: no se puede borrar una categoría que todavía tiene noticias
  categoria_id     INTEGER       NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  -- Si se elimina el administrador que la creó, la noticia se conserva
  autor_id         INTEGER       REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
  ubicacion_nombre VARCHAR(150),
  latitud          NUMERIC(9,6)  CHECK (latitud  BETWEEN -90  AND 90),
  longitud         NUMERIC(9,6)  CHECK (longitud BETWEEN -180 AND 180),
  publicada        BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- La latitud y la longitud van juntas: las dos o ninguna
  CONSTRAINT chk_noticias_coordenadas CHECK ((latitud IS NULL) = (longitud IS NULL))
);

-- ---------------------------------------------------------------------
-- 6. Palabras clave (temas de interés) y su relación muchos a muchos con noticias
-- ---------------------------------------------------------------------
CREATE TABLE palabras_clave (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE noticia_palabra_clave (
  noticia_id       INTEGER NOT NULL REFERENCES noticias(id)       ON DELETE CASCADE,
  palabra_clave_id INTEGER NOT NULL REFERENCES palabras_clave(id) ON DELETE CASCADE,
  PRIMARY KEY (noticia_id, palabra_clave_id)
);

-- ---------------------------------------------------------------------
-- 7. Paquetes de pauta que puede comprar el cliente publicitario
-- ---------------------------------------------------------------------
CREATE TABLE paquetes_pauta (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(80)   NOT NULL UNIQUE,
  descripcion   VARCHAR(255),
  precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  duracion_dias INTEGER       NOT NULL CHECK (duracion_dias > 0),
  activo        BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 8. Publicaciones del cliente publicitario
--    Flujo de estados: pendiente_pago -> pendiente_revision -> aprobada / rechazada
-- ---------------------------------------------------------------------
CREATE TABLE publicaciones_publicitarias (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER      NOT NULL REFERENCES usuarios(id)       ON UPDATE CASCADE ON DELETE CASCADE,
  paquete_id     INTEGER      NOT NULL REFERENCES paquetes_pauta(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  tipo           VARCHAR(30)  NOT NULL
                 CHECK (tipo IN ('ficha_negocio', 'anuncio_producto', 'publirreportaje')),
  titulo         VARCHAR(200) NOT NULL,
  contenido      TEXT         NOT NULL,
  imagen_url     VARCHAR(500),
  enlace_url     VARCHAR(500),
  estado         VARCHAR(30)  NOT NULL DEFAULT 'pendiente_pago'
                 CHECK (estado IN ('pendiente_pago', 'pendiente_revision', 'aprobada', 'rechazada')),
  motivo_rechazo VARCHAR(255),
  -- Administrador que aprobó o rechazó la publicación
  revisado_por   INTEGER      REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
  fecha_revision TIMESTAMPTZ,
  fecha_inicio   DATE,
  fecha_fin      DATE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_publicaciones_fechas CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

-- ---------------------------------------------------------------------
-- 9. Pagos de las publicaciones (una publicación tiene como máximo un pago)
-- ---------------------------------------------------------------------
CREATE TABLE pagos (
  id                     SERIAL PRIMARY KEY,
  publicacion_id         INTEGER       NOT NULL UNIQUE REFERENCES publicaciones_publicitarias(id) ON DELETE CASCADE,
  usuario_id             INTEGER       NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
  monto                  NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
  metodo                 VARCHAR(30)   NOT NULL DEFAULT 'tarjeta',
  estado                 VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente', 'completado', 'fallido')),
  referencia_transaccion VARCHAR(100),
  creado_en              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Triggers para mantener actualizado_en al día
-- ---------------------------------------------------------------------
CREATE TRIGGER trg_usuarios_actualizado
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha();
CREATE TRIGGER trg_noticias_actualizado
  BEFORE UPDATE ON noticias FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha();
CREATE TRIGGER trg_publicaciones_actualizado
  BEFORE UPDATE ON publicaciones_publicitarias FOR EACH ROW EXECUTE FUNCTION fn_actualizar_fecha();

-- ---------------------------------------------------------------------
-- Índices para las consultas más frecuentes
-- ---------------------------------------------------------------------
CREATE INDEX idx_usuarios_rol             ON usuarios(rol_id);
CREATE INDEX idx_noticias_categoria       ON noticias(categoria_id);
CREATE INDEX idx_noticias_fecha           ON noticias(creado_en DESC);
CREATE INDEX idx_npc_palabra              ON noticia_palabra_clave(palabra_clave_id);
CREATE INDEX idx_publicaciones_estado     ON publicaciones_publicitarias(estado);
CREATE INDEX idx_publicaciones_usuario    ON publicaciones_publicitarias(usuario_id);
-- Búsqueda por texto en título y contenido (en español)
CREATE INDEX idx_noticias_busqueda ON noticias
  USING GIN (to_tsvector('spanish', titulo || ' ' || contenido));
