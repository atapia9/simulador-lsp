// Ayudas mínimas para crear elementos del DOM sin framework.

/**
 * Crea un elemento. Atributos:
 *   class, text, html (solo para SVG de confianza), on<Evento>: función,
 *   true → atributo vacío, false/null → se omite.
 */
export function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const hijo of hijos.flat(Infinity)) {
    if (hijo == null || hijo === false) continue;
    el.append(hijo instanceof Node ? hijo : String(hijo));
  }
  return el;
}

/** true si el foco está en un campo de texto (para no robar atajos). */
export function escribiendo(ev) {
  const t = ev.target;
  return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
}

/** Descarga un Blob o data URL con el nombre dado. */
export function descargar(contenido, nombre) {
  const url = typeof contenido === 'string' ? contenido : URL.createObjectURL(contenido);
  const a = h('a', { href: url, download: nombre });
  document.body.append(a);
  a.click();
  a.remove();
  if (typeof contenido !== 'string') setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nombre de archivo seguro a partir de un texto. */
export function nombreArchivo(texto, ext) {
  const base =
    String(texto || 'modelo')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'modelo';
  return `${base}.${ext}`;
}
