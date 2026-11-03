// Galería de modelos guardados (sobre el almacén local).

const CLAVE = 'galeria';

export function listarModelos(almacen) {
  const lista = almacen.leer(CLAVE, []);
  return Array.isArray(lista) ? lista.filter((m) => m && typeof m.id === 'string' && m.datos) : [];
}

/**
 * Guarda un modelo serializado. Si ya existe uno con el mismo nombre, lo reemplaza.
 * @returns {{ok: boolean, entrada?: object}}
 */
export function guardarModelo(almacen, datos, ahora = new Date()) {
  const lista = listarModelos(almacen);
  const nombre = (datos.nombre || '').trim();
  const existente = lista.find((m) => m.datos.nombre === nombre);
  const entrada = {
    id: existente?.id ?? `m${ahora.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    fecha: ahora.toISOString(),
    datos: { ...datos, nombre, fecha: ahora.toISOString() },
  };
  const nueva = existente ? lista.map((m) => (m.id === existente.id ? entrada : m)) : [entrada, ...lista];
  const ok = almacen.escribir(CLAVE, nueva);
  return ok ? { ok, entrada } : { ok };
}

export function eliminarModelo(almacen, id) {
  const lista = listarModelos(almacen).filter((m) => m.id !== id);
  return almacen.escribir(CLAVE, lista);
}
