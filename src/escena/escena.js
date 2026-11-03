// Escena 3D: render, cámara, base con rejilla, raycasting y marcadores.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PH } from './formas.js';
import { crearMallaPieza, recolorear, posicionar, crearFantasma, marcarFantasma, crearMarcoSeleccion } from './piezas3d.js';
import { ANCHO_BASE, FONDO_BASE } from '../nucleo/constantes.js';

const MEDIO_X = ANCHO_BASE / 2;
const MEDIO_Z = FONDO_BASE / 2;

/** Revisa si el navegador puede crear un contexto WebGL. */
export function hayWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export class Escena {
  constructor(contenedor, { catalogo, reducirMovimiento = false, etiqueta = '' }) {
    this.catalogo = catalogo;
    this.contenedor = contenedor;
    this._sucio = true;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('tabindex', '0');
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.setAttribute('aria-label', etiqueta);
    renderer.domElement.classList.add('lienzo-3d');
    contenedor.append(renderer.domElement);
    this.renderer = renderer;
    this.canvas = renderer.domElement;

    const scene = new THREE.Scene();
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    camera.position.set(26, 28, 34);
    this.camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = !reducirMovimiento;
    controls.dampingFactor = 0.12;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 6;
    controls.maxDistance = 110;
    controls.update();
    controls.saveState();
    controls.addEventListener('change', () => (this._sucio = true));
    this.controls = controls;

    // Luces
    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.9));
    const sol = new THREE.DirectionalLight(0xffffff, 2.2);
    sol.position.set(18, 40, 14);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 100 });
    sol.shadow.bias = -0.0006;
    sol.shadow.normalBias = 0.02;
    scene.add(sol);

    // Base de 32 × 32 espigas
    this._matBase = new THREE.MeshStandardMaterial({ color: 0x5e9c5a, roughness: 0.6 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(ANCHO_BASE, 0.3, FONDO_BASE), this._matBase);
    base.position.y = -0.15;
    base.receiveShadow = true;
    base.userData.esBase = true;
    scene.add(base);
    this.base = base;

    const espiga = new THREE.CylinderGeometry(0.28, 0.28, 0.17, 16);
    espiga.translate(0, 0.085, 0);
    const espigas = new THREE.InstancedMesh(espiga, this._matBase, ANCHO_BASE * FONDO_BASE);
    const m = new THREE.Matrix4();
    let i = 0;
    for (let x = 0; x < ANCHO_BASE; x++) {
      for (let z = 0; z < FONDO_BASE; z++) {
        m.makeTranslation(x - MEDIO_X + 0.5, 0, z - MEDIO_Z + 0.5);
        espigas.setMatrixAt(i++, m);
      }
    }
    espigas.receiveShadow = true;
    scene.add(espigas);

    this.rejilla = new THREE.GridHelper(ANCHO_BASE, ANCHO_BASE, 0x2f5e2c, 0x2f5e2c);
    this.rejilla.position.y = 0.004;
    this.rejilla.material.transparent = true;
    this.rejilla.material.opacity = 0.45;
    scene.add(this.rejilla);

    this.grupoPiezas = new THREE.Group();
    scene.add(this.grupoPiezas);
    this.grupoPines = new THREE.Group();
    scene.add(this.grupoPines);

    this._mallas = new Map(); // id → { grupo, def, pieza }
    this._raycastables = null;
    this._fantasma = null;
    this._fantasmaTipo = null;
    this._marco = null;
    this._seleccion = null;
    this._raycaster = new THREE.Raycaster();
    this._plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this._redimensionar = this._redimensionar.bind(this);
    new ResizeObserver(this._redimensionar).observe(contenedor);
    this._redimensionar();

    renderer.setAnimationLoop(() => {
      const movio = controls.update();
      if (movio || this._sucio) {
        renderer.render(scene, camera);
        this._sucio = false;
      }
    });
  }

  _redimensionar() {
    const w = this.contenedor.clientWidth || 1;
    const h = this.contenedor.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this._sucio = true;
  }

  redibujar() {
    this._sucio = true;
  }

  establecerColores({ fondo, base, rejilla }) {
    this.scene.background = new THREE.Color(fondo);
    this._matBase.color.set(base);
    this.rejilla.material.color.set(rejilla);
    this._sucio = true;
  }

  // ---------- Piezas ----------

  agregarPieza(pieza) {
    const def = this.catalogo.get(pieza.tipo);
    const grupo = crearMallaPieza(def, pieza);
    this.grupoPiezas.add(grupo);
    this._mallas.set(pieza.id, { grupo, def, pieza: { ...pieza } });
    this._raycastables = null;
    this._sucio = true;
  }

  quitarPieza(id) {
    const e = this._mallas.get(id);
    if (!e) return;
    this.grupoPiezas.remove(e.grupo);
    this._mallas.delete(id);
    if (this._seleccion === id) this.seleccionar(null);
    this._raycastables = null;
    this._sucio = true;
  }

  actualizarPieza(pieza) {
    const e = this._mallas.get(pieza.id);
    if (!e) return this.agregarPieza(pieza);
    if (e.pieza.color !== pieza.color) recolorear(e.grupo, e.def, pieza.color);
    posicionar(e.grupo, e.def, pieza);
    e.pieza = { ...pieza };
    if (this._seleccion === pieza.id) this.seleccionar(pieza.id);
    this._sucio = true;
  }

  sincronizar(piezas) {
    for (const id of [...this._mallas.keys()]) this.quitarPieza(id);
    for (const p of piezas) this.agregarPieza(p);
  }

  ocultarPieza(id, oculta) {
    const e = this._mallas.get(id);
    if (e) e.grupo.visible = !oculta;
    if (this._marco) this._marco.visible = !oculta;
    this._raycastables = null;
    this._sucio = true;
  }

  seleccionar(id) {
    if (this._marco) {
      this.scene.remove(this._marco);
      this._marco.geometry.dispose();
      this._marco = null;
    }
    this._seleccion = id;
    const e = id != null ? this._mallas.get(id) : null;
    if (e) {
      this._marco = crearMarcoSeleccion(e.def, e.pieza);
      this.scene.add(this._marco);
    }
    this._sucio = true;
  }

  // ---------- Vista previa ----------

  mostrarFantasma(def, pos, valida) {
    if (this._fantasmaTipo !== def.id) {
      if (this._fantasma) this.scene.remove(this._fantasma);
      this._fantasma = crearFantasma(def);
      this._fantasmaTipo = def.id;
      this.scene.add(this._fantasma);
    }
    this._fantasma.visible = true;
    posicionar(this._fantasma, def, pos);
    marcarFantasma(this._fantasma, valida);
    this._sucio = true;
  }

  ocultarFantasma() {
    if (this._fantasma && this._fantasma.visible) {
      this._fantasma.visible = false;
      this._sucio = true;
    }
  }

  // ---------- Raycasting ----------

  _listaRaycast() {
    if (!this._raycastables) {
      this._raycastables = [];
      for (const { grupo } of this._mallas.values()) {
        if (grupo.visible) this._raycastables.push(...grupo.children);
      }
      this._raycastables.push(this.base);
    }
    return this._raycastables;
  }

  _lanzar(clienteX, clienteY) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((clienteX - r.left) / r.width) * 2 - 1, -((clienteY - r.top) / r.height) * 2 + 1);
    this._raycaster.setFromCamera(v, this.camera);
    return this._raycaster.intersectObjects(this._listaRaycast(), false);
  }

  /** Id de la pieza bajo el puntero, o null. */
  piezaEn(clienteX, clienteY) {
    const hit = this._lanzar(clienteX, clienteY).find((h) => h.object.userData.piezaId != null);
    return hit ? hit.object.userData.piezaId : null;
  }

  /**
   * Qué superficie hay bajo el puntero:
   *   { tipo: 'base', cx, cz }
   *   { tipo: 'arriba' | 'lado', id, cx, cz }
   * Si no toca nada, usa el plano y = 0 (puede quedar fuera de la base).
   */
  superficieEn(clienteX, clienteY) {
    const hits = this._lanzar(clienteX, clienteY);
    const hit = hits[0];
    if (hit && hit.object.userData.piezaId != null) {
      const id = hit.object.userData.piezaId;
      const e = this._mallas.get(id);
      const p = hit.point;
      const n = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
      const tope = (e.pieza.y + e.def.alto) * PH;
      if (n.y > 0.3 || p.y >= tope - 0.03) {
        return { tipo: 'arriba', id, cx: Math.floor(p.x + MEDIO_X), cz: Math.floor(p.z + MEDIO_Z) };
      }
      if (n.y < -0.5) return { tipo: 'base', cx: Math.floor(p.x + MEDIO_X), cz: Math.floor(p.z + MEDIO_Z) };
      return { tipo: 'lado', id, cx: Math.floor(p.x + n.x * 0.5 + MEDIO_X), cz: Math.floor(p.z + n.z * 0.5 + MEDIO_Z) };
    }
    if (hit) return { tipo: 'base', cx: Math.floor(hit.point.x + MEDIO_X), cz: Math.floor(hit.point.z + MEDIO_Z) };
    const punto = new THREE.Vector3();
    if (this._raycaster.ray.intersectPlane(this._plano, punto)) {
      return { tipo: 'base', cx: Math.floor(punto.x + MEDIO_X), cz: Math.floor(punto.z + MEDIO_Z) };
    }
    return null;
  }

  // ---------- Marcadores de significado ----------

  /** @param {Array<{id: number, numero: number}>} lista */
  actualizarPines(lista) {
    for (const hijo of [...this.grupoPines.children]) {
      this.grupoPines.remove(hijo);
      hijo.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
    }
    for (const { id, numero } of lista) {
      const e = this._mallas.get(id);
      if (!e) continue;
      const centro = new THREE.Box3().setFromObject(e.grupo).getCenter(new THREE.Vector3());
      const tope = (e.pieza.y + e.def.alto) * PH;
      const grupo = new THREE.Group();
      const linea = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.75, 0)]),
        new THREE.LineBasicMaterial({ color: 0x1f2937, depthTest: false, transparent: true, opacity: 0.7 }),
      );
      linea.renderOrder = 9;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texturaNumero(numero), depthTest: false, transparent: true }),
      );
      sprite.position.y = 1.15;
      sprite.scale.set(0.95, 0.95, 1);
      sprite.renderOrder = 10;
      grupo.add(linea, sprite);
      grupo.position.set(centro.x, tope, centro.z);
      this.grupoPines.add(grupo);
    }
    this._sucio = true;
  }

  // ---------- Cámara e imagen ----------

  restablecerVista() {
    this.controls.reset();
    this._sucio = true;
  }

  /** Devuelve la vista actual como data URL PNG. */
  capturaPNG() {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }
}

function texturaNumero(n) {
  const tam = 128;
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  const ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.arc(tam / 2, tam / 2, tam / 2 - 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb703';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#1f2937';
  ctx.stroke();
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 64px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), tam / 2, tam / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Genera miniaturas PNG de las piezas con un render aparte que luego se libera. */
export function generarMiniaturas(defs, color = '#4FA3E0', tam = 96) {
  const out = new Map();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    return out;
  }
  renderer.setPixelRatio(1);
  renderer.setSize(tam, tam, false);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 2.2));
  const luz = new THREE.DirectionalLight(0xffffff, 2);
  luz.position.set(5, 10, 7);
  scene.add(luz);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  for (const def of defs) {
    const grupo = crearMallaPieza(def, { id: -1, x: 0, y: 0, z: 0, rot: 0, color: def.color || color });
    grupo.position.set(0, 0, 0);
    scene.add(grupo);
    const caja = new THREE.Box3().setFromObject(grupo);
    const centro = caja.getCenter(new THREE.Vector3());
    const radio = caja.getSize(new THREE.Vector3()).length() / 2;
    const dist = radio / Math.sin(THREE.MathUtils.degToRad(15)) * 0.92;
    camera.position.copy(centro).add(new THREE.Vector3(1, 0.9, 1.25).normalize().multiplyScalar(dist));
    camera.lookAt(centro);
    renderer.render(scene, camera);
    out.set(def.id, renderer.domElement.toDataURL('image/png'));
    scene.remove(grupo);
  }
  renderer.dispose();
  renderer.forceContextLoss();
  return out;
}
