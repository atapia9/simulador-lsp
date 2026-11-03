// Envoltura de localStorage. Si el navegador no permite guardar (modo
// privado, cookies bloqueadas, cuota llena), la app sigue funcionando en memoria.

const PREFIJO = 'simulador-lsp:';

function probarStorage(storage) {
  try {
    const s = storage ?? globalThis.localStorage;
    if (!s) return null;
    const k = PREFIJO + '__prueba';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

export function crearAlmacen(storage) {
  const s = probarStorage(storage);
  const memoria = new Map();

  return {
    disponible: s !== null,

    leer(clave, defecto = null) {
      try {
        const crudo = s ? s.getItem(PREFIJO + clave) : memoria.get(clave);
        return crudo == null ? defecto : JSON.parse(crudo);
      } catch {
        return defecto;
      }
    },

    /** Devuelve true si se guardó. */
    escribir(clave, valor) {
      const crudo = JSON.stringify(valor);
      try {
        if (s) s.setItem(PREFIJO + clave, crudo);
        else memoria.set(clave, crudo);
        return true;
      } catch {
        return false;
      }
    },

    borrar(clave) {
      try {
        if (s) s.removeItem(PREFIJO + clave);
        else memoria.delete(clave);
      } catch {
        /* nada que hacer */
      }
    },
  };
}
