import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as usuarioModel from '../models/usuarioModel.js';
import * as planModel from '../models/planModel.js';
import { ErrorConflicto, ErrorNoAutenticado, ErrorNoEncontrado, ErrorSolicitud } from '../utils/errores.js';
import type { RespuestaAuth, TokenPayload, UsuarioBD, UsuarioPublico } from '../types/usuario.js';
import type { DatosLogin, DatosRegistro } from '../validators/authValidator.js';

// Rondas de bcrypt: 10 es el valor usado en clase (más rondas = más seguro pero más lento)
const RONDAS_BCRYPT = 10;

/** Quita el hash de la contraseña antes de enviar el usuario al frontend */
export function aUsuarioPublico(usuario: UsuarioBD): UsuarioPublico {
  const { contrasena_hash: _hash, ...publico } = usuario;
  return publico;
}

/** Firma un JWT con el id y el rol del usuario */
function generarToken(usuario: UsuarioBD): string {
  const payload: TokenPayload = { id: usuario.id, rol: usuario.rol };
  return jwt.sign(payload, env.jwt.secreto, { expiresIn: env.jwt.expiraEn as SignOptions['expiresIn'] });
}

export async function registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
  // Se revisa antes para dar un mensaje claro (la BD igual lo impide con UNIQUE)
  if (await usuarioModel.buscarPorCorreo(datos.correo)) {
    throw new ErrorConflicto('Ya existe una cuenta registrada con ese correo');
  }
  if (!(await planModel.existeActivo(datos.planId))) {
    throw new ErrorSolicitud('El plan de suscripción seleccionado no existe');
  }

  // Nunca se guarda la contraseña en texto plano, solo su hash
  const contrasenaHash = await bcrypt.hash(datos.contrasena, RONDAS_BCRYPT);
  const id = await usuarioModel.crear({
    nombre: datos.nombre,
    correo: datos.correo,
    contrasenaHash,
    rol: datos.rol,
    planId: datos.planId,
  });

  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) throw new Error('El usuario recién creado no se encontró');
  return { token: generarToken(usuario), usuario: aUsuarioPublico(usuario) };
}

export async function iniciarSesion(datos: DatosLogin): Promise<RespuestaAuth> {
  const usuario = await usuarioModel.buscarPorCorreo(datos.correo);

  // Mismo mensaje si falla el correo o la contraseña, para no revelar qué cuentas existen
  const credencialesValidas = usuario !== null
    && await bcrypt.compare(datos.contrasena, usuario.contrasena_hash);
  if (!usuario || !credencialesValidas) {
    throw new ErrorNoAutenticado('Correo o contraseña incorrectos');
  }
  if (!usuario.activo) {
    throw new ErrorNoAutenticado('La cuenta está desactivada');
  }

  return { token: generarToken(usuario), usuario: aUsuarioPublico(usuario) };
}

/** Datos actualizados del usuario que inició sesión (se leen de la BD, no del token) */
export async function obtenerPerfil(id: number): Promise<UsuarioPublico> {
  const usuario = await usuarioModel.buscarPorId(id);
  if (!usuario) throw new ErrorNoEncontrado('El usuario ya no existe');
  if (!usuario.activo) throw new ErrorNoAutenticado('La cuenta está desactivada');
  return aUsuarioPublico(usuario);
}
