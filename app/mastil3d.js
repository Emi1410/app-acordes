"use strict";

/* ==================================================================
   Mástil en 3D (experimental): una Les Paul con three.js

   Es una opción ("Estilo del mástil" en "Pistas y sync"); el mástil
   clásico (mastil.js) queda intacto y se puede volver a él en cualquier
   momento. three.js está dentro de la app (lib/three/, sin internet) y
   se carga recién la primera vez que se elige el 3D.

   La guitarra se arma toda por código, sin imágenes (inspirada en una
   Eko LS-300, tipo Les Paul): diapasón de palisandro con trapecios
   nacarados chicos y filete crema, trastes de níquel con la separación
   real, cejuela de hueso, clavijero negro con sus clavijas, y el cuerpo
   con tapa cherry sunburst flameada, dos humbuckers con marco crema, el
   puente y el cordal. La madera y la tapa se pintan en un <canvas>.

   Medidas en centímetros. En la guitarra (el grupo "guitarra"):
     x: a lo largo de las cuerdas; la cejuela en x = 0, el clavijero
        hacia +x y el cuerpo hacia −x (el puente en x = −ESCALA);
     y: a lo ancho; la 1ª cuerda (la más aguda) arriba (+y);
     z: hacia afuera del diapasón (hacia la cámara); el diapasón en z = 0.
   El grupo se inclina para que el clavijero quede arriba a la derecha y
   el cuerpo abajo a la izquierda, y la cámara lo mira en perspectiva,
   como filmado de costado.

   Lo que se ve sale de lo mismo que el clásico (mastil.js): queMostrar
   (manda la Guitarra 1; si no toca, los acordes de la 2, normales o
   tenues), estadoDeNota (slide y estiradas), los colores de las cuerdas,
   "En cada nota" (traste o nombre) y el transporte (ya aplicado en las
   notas). Igual que en el clásico: las cuerdas que suenan se encienden
   como un láser y vibran en los punteos; en los acordes, solo los puntos.

   La cámara sigue la zona que se toca: se acerca en los punteos y se
   aleja un poco con acordes para que entren todas las notas, siempre
   con movimientos suaves.

   Rendimiento: se dibuja solo mientras suena o mientras algo se mueve.
   Con "Efectos reducidos": resolución 1×, sin sombras ni brillos.
   Si el celular no tiene WebGL, vuelve solo al clásico con un aviso.
   ================================================================== */

const VERSION_THREE = "0.158.0";
const ESCALA = 62.8;                     // largo de la cuerda (Les Paul: 24,75")
const ANCHO_CEJUELA = 4.3, ANCHO_TRASTE_22 = 5.7;
const SEPARACION_CEJUELA = 3.55, SEPARACION_PUENTE = 5.2;   // de la 6ª a la 1ª
const ALTURA_CUERDA_CEJUELA = 0.24, ALTURA_CUERDA_PUENTE = 0.5;
const Z_TAPA = -1.7;                     // la tapa del cuerpo, debajo del diapasón
const X_MICROFONO_MANGO = -48.2, X_MICROFONO_PUENTE = -58.4;
const X_CORDAL = -ESCALA - 5.8;
const SEGMENTOS_CUERDA = 40;
const DIAMETRO_NOTA = 1.45;                 // a 20 cm de la cámara; se agranda al alejarse (ver tamanoNota)

let promesaThree = null;
let escena3D = null;          // todo lo de three.js (se arma una sola vez)
let cuadro3DPedido = false;

// La librería, la primera vez que hace falta (como alphaTab).
function cargarThree() {
  if (!promesaThree) {
    promesaThree = new Promise((resolver, rechazar) => {
      if (window.THREE) { resolver(); return; }
      const script = document.createElement("script");
      script.src = `lib/three/three.min.js?v=${VERSION_THREE}`;
      script.onload = () => resolver();
      script.onerror = () => {
        promesaThree = null;
        rechazar(new Error("No pude cargar la librería 3D."));
      };
      document.head.appendChild(script);
    });
  }
  return promesaThree;
}

function hayWebGL() {
  try {
    const prueba = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (prueba.getContext("webgl2") || prueba.getContext("webgl")));
  } catch {
    return false;
  }
}

// Si no se puede (sin WebGL, sin la librería, se perdió el contexto): al clásico, con un aviso.
function volverAlClasico(motivo) {
  mostrarMensaje(motivo + " Vuelvo al mástil clásico.");
  if (escena3D) escena3D.renderer.domElement.remove();
  cambiarEstiloMastil("clasico");
}

// Lo llama dibujarMastil (mastil.js) con el estilo 3D elegido.
async function armarMastil3D() {
  if (!escena3D) {
    try {
      await cargarThree();
    } catch (error) {
      if (usar3D()) volverAlClasico(error.message);
      return;
    }
    if (!usar3D() || escena3D) return armarMastil3D();
    if (!hayWebGL()) {
      volverAlClasico("Este celular no puede mostrar el mástil en 3D (no tiene WebGL).");
      return;
    }
    try {
      escena3D = crearEscena3D();
    } catch (error) {
      escena3D = null;
      volverAlClasico("No pude armar el mástil en 3D.");
      return;
    }
  }
  if (escena3D.renderer.domElement.parentElement !== contenedorMastil) contenedorMastil.replaceChildren(escena3D.renderer.domElement);
  contenedorMastil.dataset.dibujo = "3d";
  redimensionar3D();
  escena3D.saltar = true;       // la cámara va directo a la zona que suena
  pedirCuadro3D();
}

function pedirCuadro3D() {
  if (cuadro3DPedido || !escena3D || !usar3D() || contenedorMastil.hidden || vistaTabs.hidden) return;
  cuadro3DPedido = true;
  requestAnimationFrame(cuadro3D);
}

function redimensionar3D() {
  if (!escena3D) return;
  const ancho = contenedorMastil.clientWidth, alto = contenedorMastil.clientHeight;
  if (!ancho || !alto) return;
  const { renderer, camara } = escena3D;
  aplicarCalidad3D(true);
  renderer.setSize(ancho, alto);
  camara.aspect = ancho / alto;
  camara.updateProjectionMatrix();
  // Con el celular parado el mástil va más empinado, para aprovechar el alto.
  escena3D.guitarra.rotation.z = camara.aspect < 1 ? 0.95 : 0.36;
  escena3D.guitarra.updateMatrixWorld(true);
  pedirCuadro3D();
}

new ResizeObserver(() => { if (usar3D() && escena3D) redimensionar3D(); }).observe(contenedorMastil);

/* ------------------------------------------------------------------
   Medidas de la guitarra
   ------------------------------------------------------------------ */

const xDeTrasteN = (n) => -ESCALA * distanciaReal(n);
const X_FIN_DIAPASON = xDeTrasteN(TRASTES_TOTALES) - 0.9;
// Dónde va el dedo en el traste n (cerca del alambre); al aire, del otro lado de la cejuela.
const xDedo3D = (traste) => (traste <= 0 ? 1.0 : xDeTrasteN(traste - 0.45));
const anchoMastil3D = (x) => ANCHO_CEJUELA + (ANCHO_TRASTE_22 - ANCHO_CEJUELA) * Math.min(1.05, Math.max(0, -x / -X_FIN_DIAPASON));
const avanceCuerda = (x) => Math.min(1, Math.max(0, -x / ESCALA));
const separacion3D = (x) => SEPARACION_CEJUELA + (SEPARACION_PUENTE - SEPARACION_CEJUELA) * avanceCuerda(x);
const zCuerda3D = (x) => (x > 0 ? ALTURA_CUERDA_CEJUELA - x * 0.06 : ALTURA_CUERDA_CEJUELA + (ALTURA_CUERDA_PUENTE - ALTURA_CUERDA_CEJUELA) * avanceCuerda(x));
function yCuerda3D(fila, x, cuerdas) {
  const n = Math.max(1, cuerdas - 1);
  return separacion3D(x) * (0.5 - fila / n);
}
// Cuánto se corre la cuerda al estirarla (como en el clásico: las agudas hacia las graves y al revés).
function corrimiento3D(fila, cuerdas, x, semitonos) {
  const entre = separacion3D(x) / Math.max(1, cuerdas - 1);
  const sentido = fila < cuerdas / 2 ? -1 : 1;
  return sentido * Math.min(entre * 1.15, semitonos * entre * 0.38);
}

/* ------------------------------------------------------------------
   Texturas pintadas en un <canvas> (sin imágenes)
   ------------------------------------------------------------------ */

function texturaDeLienzo(lienzo) {
  const textura = new THREE.CanvasTexture(lienzo);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  return textura;
}

// Palisandro: veta a lo largo, poros, y el filete crema en los dos bordes.
function texturaPalisandro() {
  const lienzo = document.createElement("canvas");
  lienzo.width = 1024; lienzo.height = 128;
  const g = lienzo.getContext("2d");
  const base = g.createLinearGradient(0, 0, 0, 128);
  base.addColorStop(0, "#2b170e"); base.addColorStop(0.5, "#3c2216"); base.addColorStop(1, "#28150c");
  g.fillStyle = base; g.fillRect(0, 0, 1024, 128);
  const azar = azarFijo(31);
  for (let i = 0; i < 140; i++) {
    const y = azar() * 128;
    g.strokeStyle = azar() < 0.55 ? `rgba(15,7,3,${0.25 + azar() * 0.4})` : `rgba(120,68,38,${0.08 + azar() * 0.14})`;
    g.lineWidth = 0.4 + azar() * 1.6;
    g.beginPath();
    const onda = 0.5 + azar() * 2.5, paso = 40 + azar() * 90, fase = azar() * 6;
    for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + Math.sin(x / paso + fase) * onda);
    g.stroke();
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = "rgba(10,5,2,0.5)";
    g.fillRect(azar() * 1024, azar() * 128, 1 + azar() * 3, 0.8);
  }
  // Filete crema (la tablatura del dibujo va de 0 a 1 a lo ancho del diapasón)
  g.fillStyle = "#efe2c0";
  g.fillRect(0, 0, 1024, 4);
  g.fillRect(0, 124, 1024, 4);
  return texturaDeLienzo(lienzo);
}

// Tapa cherry sunburst flameada, con el filete crema siguiendo el contorno.
function texturaTapa(contorno, caja) {
  const lienzo = document.createElement("canvas");
  const escalaPx = 18;   // px por cm
  lienzo.width = Math.ceil(caja.ancho * escalaPx);
  lienzo.height = Math.ceil(caja.alto * escalaPx);
  const g = lienzo.getContext("2d");
  const aPx = (p) => [(p.x - caja.x) * escalaPx, (caja.y + caja.alto - p.y) * escalaPx];
  // Sunburst: ámbar en el centro del bajo, rojo cereza y casi negro en el borde
  const [cx, cy] = aPx({ x: -64, y: 0 });
  const sol = g.createRadialGradient(cx, cy, 10, cx, cy, lienzo.width * 0.62);
  sol.addColorStop(0, "#f6b442"); sol.addColorStop(0.32, "#e07a22"); sol.addColorStop(0.58, "#b32014");
  sol.addColorStop(0.82, "#5e0a08"); sol.addColorStop(1, "#250303");
  g.fillStyle = sol; g.fillRect(0, 0, lienzo.width, lienzo.height);
  // Flama: franjas onduladas a lo ancho, claras y oscuras
  const azar = azarFijo(53);
  for (let i = 0; i < 90; i++) {
    const x0 = azar() * lienzo.width;
    g.strokeStyle = azar() < 0.5 ? `rgba(255,214,150,${0.05 + azar() * 0.09})` : `rgba(70,0,0,${0.06 + azar() * 0.1})`;
    g.lineWidth = 2 + azar() * 9;
    g.beginPath();
    const fase = azar() * 6, amplitud = 6 + azar() * 16;
    for (let y = 0; y <= lienzo.height; y += 10) g.lineTo(x0 + Math.sin(y / 38 + fase) * amplitud + y * 0.12, y);
    g.stroke();
  }
  // Brillo del barniz
  const brillo = g.createLinearGradient(0, 0, lienzo.width, lienzo.height);
  brillo.addColorStop(0, "rgba(255,255,255,0.08)"); brillo.addColorStop(0.5, "rgba(255,255,255,0)");
  g.fillStyle = brillo; g.fillRect(0, 0, lienzo.width, lienzo.height);
  // Filete crema en el borde
  g.strokeStyle = "#efe4c6";
  g.lineWidth = 0.45 * escalaPx;
  g.beginPath();
  contorno.forEach((p, i) => { const [x, y] = aPx(p); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  g.closePath();
  g.stroke();
  return texturaDeLienzo(lienzo);
}

// La nota: círculo del color de la cuerda con borde blanco y sombra, y el número
// (o un rombo para los armónicos, o una X para las muteadas).
function texturaNota(color, texto, forma) {
  const clave = `${color}|${texto}|${forma}`;
  const guardadas = escena3D.texturas;
  if (guardadas.has(clave)) return guardadas.get(clave);
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 128;
  const g = lienzo.getContext("2d");
  g.shadowColor = "rgba(0,0,0,0.7)";
  g.shadowBlur = 10;
  g.shadowOffsetY = 3;
  if (forma === "x") {
    g.lineCap = "round";
    g.strokeStyle = "#ffffff"; g.lineWidth = 26;
    g.beginPath(); g.moveTo(34, 34); g.lineTo(94, 94); g.moveTo(94, 34); g.lineTo(34, 94); g.stroke();
    g.shadowColor = "transparent";
    g.strokeStyle = color; g.lineWidth = 16;
    g.beginPath(); g.moveTo(34, 34); g.lineTo(94, 94); g.moveTo(94, 34); g.lineTo(34, 94); g.stroke();
  } else {
    g.beginPath();
    if (forma === "rombo") { g.moveTo(64, 6); g.lineTo(122, 64); g.lineTo(64, 122); g.lineTo(6, 64); g.closePath(); }
    else g.arc(64, 64, 54, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = textoSobre(color);
    g.font = `800 ${texto.length > 1 ? 62 : 76}px system-ui, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, 64, 69);
  }
  const textura = texturaDeLienzo(lienzo);
  guardadas.set(clave, textura);
  return textura;
}

// Un texto suelto (½, full, h, p), blanco con borde oscuro.
function texturaTexto(texto) {
  const clave = `texto|${texto}`;
  const guardadas = escena3D.texturas;
  if (guardadas.has(clave)) return guardadas.get(clave);
  const lienzo = document.createElement("canvas");
  lienzo.width = 128; lienzo.height = 64;
  const g = lienzo.getContext("2d");
  g.font = "800 44px system-ui, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 8; g.strokeStyle = "#0b0d10"; g.strokeText(texto, 64, 34);
  g.fillStyle = "#f2f4f6"; g.fillText(texto, 64, 34);
  const textura = texturaDeLienzo(lienzo);
  guardadas.set(clave, textura);
  return textura;
}

// Brillo redondo (se tiñe con el color del material) y anillo.
function texturaRedonda(anillo) {
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = 128;
  const g = lienzo.getContext("2d");
  if (anillo) {
    g.strokeStyle = "#ffffff"; g.lineWidth = 9;
    g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.stroke();
  } else {
    const r = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,0.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  }
  return texturaDeLienzo(lienzo);
}

/* ------------------------------------------------------------------
   Armar la escena
   ------------------------------------------------------------------ */

function crearEscena3D() {
  const reducidos = efectosReducidos;
  const renderer = new THREE.WebGLRenderer({ antialias: !reducidos, powerPreference: "high-performance" });
  renderer.domElement.className = "lienzo-mastil lienzo-mastil-3d";
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.addEventListener("webglcontextlost", (evento) => {
    evento.preventDefault();
    const perdida = escena3D;
    escena3D = null;
    if (perdida) perdida.renderer.domElement.remove();
    if (usar3D()) volverAlClasico("Se perdió el dibujo en 3D.");
  });

  const escena = new THREE.Scene();
  escena.background = new THREE.Color("#0b0d10");
  const camara = new THREE.PerspectiveCamera(36, 2, 1, 400);

  // Luz: cielo y suelo suaves, una principal (con sombra) y una de contra.
  escena.add(new THREE.HemisphereLight("#fff6ea", "#1a1410", 1.25));
  const luz = new THREE.DirectionalLight("#ffffff", 2.4);
  luz.shadow.mapSize.set(1024, 1024);
  luz.shadow.camera.left = -16; luz.shadow.camera.right = 16;
  luz.shadow.camera.top = 16; luz.shadow.camera.bottom = -16;
  luz.shadow.camera.near = 1; luz.shadow.camera.far = 90;
  luz.shadow.bias = -0.0008;
  escena.add(luz, luz.target);
  const contra = new THREE.DirectionalLight("#9fc4ff", 0.7);
  contra.position.set(40, -30, 20);
  escena.add(contra);

  // Reflejos para el níquel y el barniz: un "cuarto" simple con dos ventanas de luz.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const cuarto = new THREE.Scene();
  const fondoCuarto = new THREE.Mesh(new THREE.SphereGeometry(50, 16, 8), new THREE.MeshBasicMaterial({ color: "#2a2724", side: THREE.BackSide }));
  const ventana1 = new THREE.Mesh(new THREE.PlaneGeometry(40, 18), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  ventana1.position.set(-10, 30, 25); ventana1.lookAt(0, 0, 0);
  const ventana2 = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: "#8a8a8a" }));
  ventana2.position.set(30, -10, 30); ventana2.lookAt(0, 0, 0);
  cuarto.add(fondoCuarto, ventana1, ventana2);
  escena.environment = pmrem.fromScene(cuarto, 0.04).texture;
  pmrem.dispose();

  const guitarra = new THREE.Group();
  escena.add(guitarra);

  const datos = {
    renderer, escena, camara, luz, guitarra, texturas: new Map(),
    centro: -12, distancia: 26, saltar: true, ultimoCuadro: 0, calidad: null,
    sombras: [], brillos: [],
  };
  escena3D = datos;   // (texturaNota la usa mientras se arma)

  armarDiapason(datos);
  armarClavijero(datos);
  armarCuerpo(datos);
  armarCuerdas(datos);
  armarNotas(datos);
  return datos;
}

// Diapasón, mango, trastes, incrustaciones y cejuela.
function armarDiapason(d) {
  const { guitarra } = d;
  const xFin = X_FIN_DIAPASON, w0 = ANCHO_CEJUELA, w1 = anchoMastil3D(xFin);
  // La cara de arriba, con la textura de palisandro (u a lo largo, v a lo ancho)
  const cara = new THREE.BufferGeometry();
  cara.setAttribute("position", new THREE.Float32BufferAttribute([0, -w0 / 2, 0, 0, w0 / 2, 0, xFin, -w1 / 2, 0, xFin, w1 / 2, 0], 3));
  cara.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 0, 1, 1], 2));
  cara.setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  cara.setIndex([0, 2, 1, 1, 2, 3]);
  const palisandro = new THREE.MeshStandardMaterial({ map: texturaPalisandro(), roughness: 0.62, metalness: 0 });
  const tapaDiapason = new THREE.Mesh(cara, palisandro);
  tapaDiapason.receiveShadow = true;
  guitarra.add(tapaDiapason);
  // Los costados (filete crema) y el mango de caoba por debajo
  const forma = new THREE.Shape([new THREE.Vector2(0, -w0 / 2), new THREE.Vector2(xFin, -w1 / 2), new THREE.Vector2(xFin, w1 / 2), new THREE.Vector2(0, w0 / 2)]);
  const costados = new THREE.Mesh(
    new THREE.ExtrudeGeometry(forma, { depth: 0.55, bevelEnabled: false }),
    [new THREE.MeshStandardMaterial({ color: "#24130b", roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: "#efe2c0", roughness: 0.45 })],
  );
  costados.position.z = -0.56;
  guitarra.add(costados);
  const mango = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 1.8, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: "#5a2a14", roughness: 0.4 }));
  mango.position.z = -2.4;
  guitarra.add(mango);

  // Trastes de níquel: un alambre redondo en cada traste (todos de una vez)
  const niquel = new THREE.MeshStandardMaterial({ color: "#d4d8dc", metalness: 0.95, roughness: 0.26 });
  d.niquel = niquel;
  const trastes = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.065, 0.065, 1, 10), niquel, TRASTES_TOTALES);
  const matriz = new THREE.Matrix4();
  for (let n = 1; n <= TRASTES_TOTALES; n++) {
    const x = xDeTrasteN(n);
    matriz.compose(new THREE.Vector3(x, 0, 0.03), new THREE.Quaternion(), new THREE.Vector3(1, anchoMastil3D(x) - 0.04, 1));
    trastes.setMatrixAt(n - 1, matriz);
  }
  trastes.castShadow = true;
  guitarra.add(trastes);

  // Incrustaciones: trapecios chicos, nacarados (cada vértice con un tono distinto)
  const posiciones = [], colores = [];
  const tonos = [[0.72, 0.7, 0.65], [0.6, 0.68, 0.7], [0.72, 0.64, 0.68], [0.64, 0.71, 0.64]];
  for (const n of INCRUSTACIONES) {
    const x0 = xDeTrasteN(n - 1), x1 = xDeTrasteN(n);
    const cx = (x0 + x1) / 2, largo = (x0 - x1) * 0.42, ancho = anchoMastil3D(cx) * 0.3;
    const a = [cx + largo / 2, -ancho / 2], b = [cx + largo / 2, ancho / 2];
    const c = [cx - largo / 2 * 0.78, ancho / 2], e = [cx - largo / 2 * 0.78, -ancho / 2];
    for (const [p, k] of [[a, 0], [b, 1], [c, 2], [a, 0], [c, 2], [e, 3]]) {
      posiciones.push(p[0], p[1], 0.004);
      colores.push(...tonos[(k + n) % 4]);
    }
  }
  const nacar = new THREE.BufferGeometry();
  nacar.setAttribute("position", new THREE.Float32BufferAttribute(posiciones, 3));
  nacar.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
  nacar.computeVertexNormals();
  const incrustaciones = new THREE.Mesh(nacar, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.2, side: THREE.DoubleSide }));
  incrustaciones.receiveShadow = true;
  guitarra.add(incrustaciones);

  // Cejuela de hueso
  const cejuela = new THREE.Mesh(new THREE.BoxGeometry(0.5, w0 + 0.08, 0.78), new THREE.MeshStandardMaterial({ color: "#efe6cf", roughness: 0.35 }));
  cejuela.position.set(0.25, 0, -0.14);
  cejuela.castShadow = true;
  guitarra.add(cejuela);
}

// Clavijero negro "libro abierto" con tres clavijas por lado (botones crema).
function armarClavijero(d) {
  const { guitarra } = d;
  const contorno = [[0.5, -2.2], [2.6, -3.9], [16.5, -4.9], [18.6, -3.6], [19.3, -1.2], [18.5, 0], [19.3, 1.2], [18.6, 3.6], [16.5, 4.9], [2.6, 3.9], [0.5, 2.2]];
  const forma = new THREE.Shape(contorno.map(([x, y]) => new THREE.Vector2(x, y)));
  const negro = new THREE.MeshStandardMaterial({ color: "#070707", roughness: 0.18, metalness: 0.1 });
  const clavijero = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 2 }), negro);
  clavijero.position.z = -2.0;
  clavijero.receiveShadow = true;
  guitarra.add(clavijero);
  const crema = new THREE.MeshStandardMaterial({ color: "#e9dfc8", roughness: 0.3 });
  d.postes = [];
  for (let i = 0; i < 3; i++) {
    for (const lado of [-1, 1]) {
      const x = 6.2 + i * 4.3, y = lado * 3.3;
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.0, 12), d.niquel);
      poste.rotation.x = Math.PI / 2;
      poste.position.set(x, y, -0.2);
      guitarra.add(poste);
      const eje = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 8), d.niquel);
      eje.position.set(x, lado * 5.2, -1.2);
      guitarra.add(eje);
      const boton = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.45), crema);
      boton.position.set(x, lado * 6.6, -1.2);
      guitarra.add(boton);
      d.postes.push({ x, y, lado, i });
    }
  }
}

// El cuerpo: contorno de una sola cortadura, tapa flameada, micrófonos, puente, cordal y perillas.
function armarCuerpo(d) {
  const { guitarra } = d;
  // Contorno (x a lo largo, y a lo ancho; la cortadura del lado de las agudas, +y)
  const forma = new THREE.Shape();
  forma.moveTo(-36.5, -4.8);
  forma.bezierCurveTo(-39, -12.5, -46, -14.2, -52, -12.6);   // hombro de las graves
  forma.bezierCurveTo(-56, -11.6, -58, -11.4, -61, -13.6);   // cintura
  forma.bezierCurveTo(-66, -17.8, -77, -17.6, -80.5, -9.5);  // lóbulo grande
  forma.bezierCurveTo(-82.2, -4, -82.2, 4, -80.5, 9.5);      // la cola
  forma.bezierCurveTo(-77, 17.6, -66, 17.8, -61, 13.6);
  forma.bezierCurveTo(-58, 11.4, -55, 11.8, -51, 13.2);      // cintura de las agudas
  forma.bezierCurveTo(-45, 15, -37.2, 13.4, -36.4, 9.4);     // el cuerno
  forma.bezierCurveTo(-36, 7.2, -39.5, 6.2, -41.5, 5.6);     // la cortadura
  forma.bezierCurveTo(-40, 4.2, -37.5, 3.6, -36.5, 3.4);
  forma.closePath();
  const reducidos = efectosReducidos;
  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: 4.4, bevelEnabled: true, bevelThickness: 0.7, bevelSize: 0.6,
    bevelSegments: reducidos ? 1 : 3, curveSegments: reducidos ? 10 : 22,
  });
  geometria.computeBoundingBox();
  const caja = geometria.boundingBox;
  const contorno = forma.getPoints(24);
  const marco = { x: caja.min.x, y: caja.min.y, ancho: caja.max.x - caja.min.x, alto: caja.max.y - caja.min.y };
  const tapa = texturaTapa(contorno, marco);
  tapa.repeat.set(1 / marco.ancho, 1 / marco.alto);
  tapa.offset.set(-marco.x / marco.ancho, -marco.y / marco.alto);
  const cuerpo = new THREE.Mesh(geometria, [
    new THREE.MeshPhysicalMaterial({ map: tapa, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 }),
    new THREE.MeshStandardMaterial({ color: "#3d0d08", roughness: 0.3 }),
  ]);
  cuerpo.position.z = Z_TAPA - 4.4 - 0.7;
  cuerpo.receiveShadow = true;
  guitarra.add(cuerpo);

  const crema = new THREE.MeshStandardMaterial({ color: "#efe4c8", roughness: 0.35 });
  const negro = new THREE.MeshStandardMaterial({ color: "#0c0c0c", roughness: 0.4 });
  // Dos humbuckers: marco crema, dos bobinas negras; en una, un tornillo por cuerda
  for (const xm of [X_MICROFONO_MANGO, X_MICROFONO_PUENTE]) {
    const anillo = new THREE.Mesh(new THREE.BoxGeometry(4.7, 9.0, 0.45), crema);
    anillo.position.set(xm, 0, Z_TAPA + 0.22);
    anillo.castShadow = anillo.receiveShadow = true;
    guitarra.add(anillo);
    for (const lado of [-1, 1]) {
      const bobina = new THREE.Mesh(new THREE.BoxGeometry(1.75, 7.0, 0.6), negro);
      bobina.position.set(xm + lado * 0.95, 0, Z_TAPA + 0.55);
      bobina.receiveShadow = true;
      guitarra.add(bobina);
      for (let fila = 0; fila < 6; fila++) {
        const tornillo = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 10), lado < 0 ? d.niquel : negro);
        tornillo.rotation.x = Math.PI / 2;
        tornillo.position.set(xm + lado * 0.95, yCuerda3D(fila, xm, 6), Z_TAPA + 0.88);
        guitarra.add(tornillo);
      }
    }
  }
  // Puente tune-o-matic: barra, seis selletas y dos postes
  const xp = -ESCALA, zSilla = zCuerda3D(xp);
  const barra = new THREE.Mesh(new THREE.BoxGeometry(1.0, 8.2, 0.5), d.niquel);
  barra.position.set(xp - 0.2, 0, zSilla - 0.42);
  barra.castShadow = true;
  guitarra.add(barra);
  for (let fila = 0; fila < 6; fila++) {
    const silla = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.3), d.niquel);
    silla.position.set(xp, yCuerda3D(fila, xp, 6), zSilla - 0.15);
    guitarra.add(silla);
  }
  for (const lado of [-1, 1]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, zSilla - Z_TAPA - 0.4, 14), d.niquel);
    poste.rotation.x = Math.PI / 2;
    poste.position.set(xp - 0.2, lado * 4.5, (zSilla - 0.4 + Z_TAPA) / 2);
    guitarra.add(poste);
  }
  // Cordal (stopbar)
  const cordal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 8.6, 16), d.niquel);
  cordal.position.set(X_CORDAL, 0, Z_TAPA + 0.75);
  cordal.castShadow = true;
  guitarra.add(cordal);
  // Cuatro perillas doradas y la llave selectora
  const dorado = new THREE.MeshStandardMaterial({ color: "#c79a3c", metalness: 0.8, roughness: 0.3 });
  for (const [x, y] of [[-66.5, 8.8], [-72, 8.4], [-68, 12.6], [-73.6, 12.2]]) {
    const perilla = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.3, reducidos ? 10 : 20), dorado);
    perilla.rotation.x = Math.PI / 2;
    perilla.position.set(x, y, Z_TAPA + 0.65);
    perilla.castShadow = true;
    guitarra.add(perilla);
  }
  const llave = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), d.niquel);
  llave.rotation.x = Math.PI / 2;
  llave.position.set(-41.5, -9.5, Z_TAPA + 1.1);
  const punta = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), crema);
  punta.position.set(-41.5, -9.5, Z_TAPA + 2.2);
  guitarra.add(llave, punta);
}

// Una cinta (tira de triángulos) que sigue una lista de puntos; el ancho va en "y".
function crearCinta(segmentos, material) {
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(new Float32Array((segmentos + 1) * 2 * 3), 3));
  // Todas miran hacia afuera del diapasón (+z): así las ilumina la luz.
  const normales = new Float32Array((segmentos + 1) * 2 * 3);
  for (let i = 2; i < normales.length; i += 3) normales[i] = 1;
  geometria.setAttribute("normal", new THREE.BufferAttribute(normales, 3));
  const indices = [];
  for (let i = 0; i < segmentos; i++) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  geometria.setIndex(indices);
  const malla = new THREE.Mesh(geometria, material);
  malla.frustumCulled = false;
  malla.userData.segmentos = segmentos;
  return malla;
}

// puntoEn(s) da { x, y, z } para s de 0 a 1.
function moverCinta(cinta, puntoEn, ancho) {
  const posiciones = cinta.geometry.attributes.position.array;
  const n = cinta.userData.segmentos;
  for (let i = 0; i <= n; i++) {
    const p = puntoEn(i / n);
    posiciones.set([p.x, p.y + ancho / 2, p.z, p.x, p.y - ancho / 2, p.z], i * 6);
  }
  cinta.geometry.attributes.position.needsUpdate = true;
}

// Seis cuerdas: la gris (de la cejuela al puente), la encendida y su brillo; más
// los tramos quietos hasta las clavijas y hasta el cordal.
function armarCuerdas(d) {
  d.cuerdas = [];
  const quietas = [];
  for (let fila = 0; fila < 6; fila++) {
    // Gris claro con algo de brillo metálico (muy metálica se ve negra)
    const gris = new THREE.MeshStandardMaterial({ color: "#b4bac1", metalness: 0.55, roughness: 0.35, side: THREE.DoubleSide });
    const base = crearCinta(SEGMENTOS_CUERDA, gris);
    base.castShadow = true;
    base.renderOrder = 1;
    const encendida = crearCinta(SEGMENTOS_CUERDA, new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, transparent: true }));
    encendida.renderOrder = 3;
    const brillo = crearCinta(SEGMENTOS_CUERDA, new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    brillo.renderOrder = 2;
    d.guitarra.add(base, encendida, brillo);
    d.cuerdas.push({ base, encendida, brillo, grosor: 0.045 + fila / 5 * 0.075 });
    // Hasta la clavija (del lado que le toca: la 1ª y la 6ª a las más cercanas a la
    // cejuela, como en una Les Paul, así no se cruzan) y del puente al cordal
    const poste = d.postes.find((p) => p.lado === (fila < 3 ? 1 : -1) && p.i === (fila < 3 ? fila : 5 - fila));
    quietas.push(0.5, yCuerda3D(fila, 0, 6), ALTURA_CUERDA_CEJUELA, poste.x, poste.y, 0.3);
    quietas.push(-ESCALA, yCuerda3D(fila, -ESCALA, 6), zCuerda3D(-ESCALA), X_CORDAL + 0.3, yCuerda3D(fila, -ESCALA, 6) * 0.95, Z_TAPA + 1.2);
  }
  const lineas = new THREE.BufferGeometry();
  lineas.setAttribute("position", new THREE.Float32BufferAttribute(quietas, 3));
  d.guitarra.add(new THREE.LineSegments(lineas, new THREE.LineBasicMaterial({ color: "#8d949b" })));
}

// Los objetos de las notas se reusan cuadro a cuadro (no se crean de nuevo).
function armarNotas(d) {
  const nuevoSprite = (orden) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false }));
    s.renderOrder = orden;
    s.visible = false;
    d.guitarra.add(s);
    return s;
  };
  const halo = texturaRedonda(false), anillo = texturaRedonda(true);
  d.notas = Array.from({ length: 24 }, () => nuevoSprite(10));
  d.halos = Array.from({ length: 12 }, () => { const s = nuevoSprite(6); s.material.map = halo; s.material.blending = THREE.AdditiveBlending; return s; });
  d.proximas = Array.from({ length: 24 }, () => nuevoSprite(8));
  d.anillos = Array.from({ length: 24 }, () => { const s = nuevoSprite(7); s.material.map = anillo; return s; });
  d.textos = Array.from({ length: 12 }, () => nuevoSprite(11));
  d.arcos = Array.from({ length: 8 }, () => {
    const c = crearCinta(16, new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, transparent: true, depthTest: false }));
    c.renderOrder = 9; c.visible = false; d.guitarra.add(c); return c;
  });
  d.estelas = Array.from({ length: 6 }, () => {
    const c = crearCinta(8, new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthTest: false }));
    c.renderOrder = 5; c.visible = false; d.guitarra.add(c); return c;
  });
}

/* ------------------------------------------------------------------
   Calidad (normal o "efectos reducidos")
   ------------------------------------------------------------------ */

function aplicarCalidad3D(forzar) {
  const d = escena3D;
  const calidad = efectosReducidos ? "baja" : "alta";
  if (!forzar && d.calidad === calidad) return;
  const cambioSombras = d.calidad !== calidad;
  d.calidad = calidad;
  d.renderer.setPixelRatio(efectosReducidos ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  d.renderer.shadowMap.enabled = !efectosReducidos;
  d.luz.castShadow = !efectosReducidos;
  if (cambioSombras) d.escena.traverse((o) => { if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true; });
  const ancho = contenedorMastil.clientWidth, alto = contenedorMastil.clientHeight;
  if (ancho && alto) d.renderer.setSize(ancho, alto);
}

/* ------------------------------------------------------------------
   Cada cuadro
   ------------------------------------------------------------------ */

function cuadro3D(marca) {
  cuadro3DPedido = false;
  const d = escena3D;
  if (!d || !usar3D() || contenedorMastil.hidden || vistaTabs.hidden) return;
  const dt = d.ultimoCuadro ? Math.min(0.1, (marca - d.ultimoCuadro) / 1000) : 0;
  d.ultimoCuadro = marca;
  aplicarCalidad3D(false);
  const t = msPartituraAhora();
  const visto = queMostrar(t);
  const guitarraDatos = guitarrasMastil[visto.guitarra - 1] || guitarrasMastil.find(Boolean);
  const cuerdas = guitarraDatos ? guitarraDatos.cuerdas : 6;
  let animando = moverCamara3D(d, visto, t, dt);

  // Cuerdas: grises; las que suenan, encendidas como un láser y vibrando (solo en los punteos)
  const activas = new Map();
  for (const evento of visto.eventos) for (const nota of evento.notas) if (!nota.muerta) activas.set(nota.fila, { nota, evento });
  const esAcorde = activas.size >= 2;
  contenedorMastil.dataset.lineas = esAcorde ? "no" : "si";
  for (let fila = 0; fila < d.cuerdas.length; fila++) {
    const visible = fila < cuerdas;
    const cuerda = d.cuerdas[fila];
    cuerda.base.visible = visible;
    if (!visible) { cuerda.encendida.visible = cuerda.brillo.visible = false; continue; }
    if (moverCuerda3D(cuerda, fila, cuerdas, activas.get(fila), esAcorde, t, visto.opacidad)) animando = true;
  }

  // Notas: las que vienen (tenues), las que suenan y sus técnicas
  const usados = { notas: 0, halos: 0, proximas: 0, anillos: 0, textos: 0, arcos: 0, estelas: 0 };
  for (const evento of visto.proximas) {
    for (const nota of evento.notas) if (!nota.continua && nota.fila < cuerdas) dibujarProxima3D(d, usados, nota, evento, t, cuerdas);
  }
  const tecnicas = new Set();
  for (const evento of visto.eventos) {
    for (const nota of evento.notas) {
      if (nota.fila < cuerdas && dibujarNota3D(d, usados, nota, evento, t, visto.opacidad, cuerdas, tecnicas)) animando = true;
    }
  }
  for (const [lista, n] of Object.entries(usados)) for (let i = n; i < d[lista].length; i++) d[lista][i].visible = false;

  d.renderer.render(d.escena, d.camara);

  // Lo que se ve, para las pruebas (igual que el clásico)
  const describir = (eventos) => eventos.flatMap((e) => e.notas.map((n) => `${n.numero}ª/${n.traste}`)).join(" ");
  contenedorMastil.dataset.guitarra = visto.eventos.length ? String(visto.guitarra) : "";
  contenedorMastil.dataset.sonando = describir(visto.eventos);
  contenedorMastil.dataset.proximas = describir(visto.proximas);
  contenedorMastil.dataset.opacidad = String(visto.opacidad);
  contenedorMastil.dataset.tecnicas = [...tecnicas].join(" ");
  contenedorMastil.dataset.enfoque = d.centro.toFixed(1);
  contenedorMastil.dataset.distancia = d.distancia.toFixed(1);

  if (!audio.paused || animando) pedirCuadro3D();
}

/**
 * La cámara sigue la zona que se toca: el centro de las notas que suenan y
 * de las que vienen en los próximos ~2 s; se aleja con acordes (para que
 * entren todas) y se acerca en los punteos. Siempre suave (se acerca al
 * objetivo de a poco). Devuelve true si todavía se está moviendo.
 */
function moverCamara3D(d, visto, t, dt) {
  const guitarra = guitarrasMastil[visto.guitarra - 1];
  const ahora = visto.eventos.flatMap((e) => e.notas.filter((n) => !n.muerta).map((n) => Math.max(n.traste, n.slide ? n.slide.hasta : 0)));
  const despues = eventosEn(guitarra, t, t + 2200).filter((e) => e.inicio > t).flatMap((e) => e.notas.map((n) => n.traste));
  const trastes = [...ahora, ...despues];
  if (trastes.length) {
    const xs = trastes.map((tr) => xDedo3D(tr));
    const minimo = Math.min(...xs), maximo = Math.max(...xs);
    const notasJuntas = Math.max(0, ...visto.eventos.map((e) => e.notas.length));
    d.objetivoCentro = (minimo + maximo) / 2;
    d.objetivoDistancia = Math.min(50, Math.max(15, 15 + (maximo - minimo) * 0.75 + (notasJuntas >= 2 ? 7 : 0)));
  } else if (d.objetivoCentro === undefined) {
    d.objetivoCentro = -12;
    d.objetivoDistancia = 26;
  }
  const parado = d.camara.aspect < 1;
  // Con el celular parado la imagen es angosta: la cámara va más lejos para que entre el mástil.
  const objetivoDistancia = d.objetivoDistancia * (parado ? 2.0 : 1);
  if (d.saltar || !dt) {
    d.centro = d.objetivoCentro;
    d.distancia = objetivoDistancia;
    d.saltar = false;
  } else {
    const k = 1 - Math.exp(-dt * 1.8);
    d.centro += (d.objetivoCentro - d.centro) * k;
    d.distancia += (objetivoDistancia - d.distancia) * k * 0.8;
  }
  // La cámara, en perspectiva "de costado": desde abajo (las graves) y hacia el cuerpo.
  const objetivo = new THREE.Vector3(d.centro, 0, 0).applyMatrix4(d.guitarra.matrixWorld);
  const direccion = new THREE.Vector3(-0.32, -0.62, 1).normalize().applyQuaternion(d.guitarra.quaternion);
  d.camara.position.copy(objetivo).addScaledVector(direccion, d.distancia);
  d.camara.up.set(0, 1, 0);
  d.camara.lookAt(objetivo);
  // La luz principal acompaña a la zona que se mira (así la sombra queda nítida ahí).
  d.luz.position.copy(objetivo).add(new THREE.Vector3(-14, 22, 34));
  d.luz.target.position.copy(objetivo);
  return Math.abs(d.objetivoCentro - d.centro) > 0.02 || Math.abs(objetivoDistancia - d.distancia) > 0.02;
}

// Una cuerda en el momento t. Devuelve true si se mueve.
function moverCuerda3D(cuerda, fila, cuerdas, activa, esAcorde, t, opacidad) {
  const yLinea = (x) => yCuerda3D(fila, x, cuerdas);
  const recta = (s) => { const x = -ESCALA * s; return { x, y: yLinea(x), z: zCuerda3D(x) }; };
  if (!activa) {
    moverCinta(cuerda.base, recta, cuerda.grosor);
    cuerda.encendida.visible = cuerda.brillo.visible = false;
    return false;
  }
  const { nota, evento } = activa;
  const estado = estadoDeNota(nota, evento, t);
  const xD = estado.traste > 0 ? Math.max(X_FIN_DIAPASON, xDeTrasteN(estado.traste) + 0.15) : 0;
  const corrimiento = corrimiento3D(fila, cuerdas, xD, estado.semitonos);
  // La gris: de la cejuela al dedo (corrida si se estira) y del dedo al puente
  const quebrada = (s) => {
    const x = -ESCALA * s;
    const k = x >= xD ? (xD < 0 ? x / xD : 0) : (x + ESCALA) / (xD + ESCALA);
    return { x, y: yLinea(x) + corrimiento * Math.max(0, Math.min(1, k)), z: zCuerda3D(x) };
  };
  moverCinta(cuerda.base, quebrada, cuerda.grosor);
  if (esAcorde) {
    cuerda.encendida.visible = cuerda.brillo.visible = false;
    return !!nota.estirada || !!nota.slide;
  }
  // La encendida: del dedo al puente, vibrando (más al pulsarla) y ondulando con vibrato
  const desdeAtaque = nota.continua ? 1e9 : t - evento.inicio;
  const amplitud = efectosReducidos ? 0 : 0.11 * Math.exp(-Math.max(0, desdeAtaque) / 380);
  const vibrato = nota.vibrato && !efectosReducidos;
  const fase = t / 1000 * 2 * Math.PI * 9;
  const largo = xD + ESCALA;
  const vibrando = (s) => {
    const x = xD - largo * s;
    const p = quebrada(-x / ESCALA);
    let y = p.y + amplitud * Math.sin(Math.PI * s) * Math.sin(fase);
    if (vibrato) y += 0.07 * Math.sin(Math.PI * s) * Math.sin(t / 1000 * 2 * Math.PI * 5.5 + s * 9);
    return { x, y, z: p.z + 0.01 };
  };
  const color = colorDeCuerda(nota.numero);
  cuerda.encendida.visible = true;
  cuerda.encendida.material.color.set(color);
  cuerda.encendida.material.opacity = opacidad;
  moverCinta(cuerda.encendida, vibrando, cuerda.grosor + 0.05);
  cuerda.brillo.visible = !efectosReducidos;
  if (cuerda.brillo.visible) {
    cuerda.brillo.material.color.set(color);
    cuerda.brillo.material.opacity = 0.4 * opacidad;
    moverCinta(cuerda.brillo, vibrando, cuerda.grosor + 0.38);
  }
  return amplitud > 0.002 || vibrato || !!nota.estirada || !!nota.slide;
}

// Las notas mantienen su tamaño en la pantalla aunque la cámara se aleje (con acordes).
const tamanoNota = (d) => DIAMETRO_NOTA * Math.max(1, d.distancia / 20);

function tomar(d, usados, lista) {
  const objeto = d[lista][usados[lista]];
  if (!objeto) return null;
  usados[lista]++;
  objeto.visible = true;
  return objeto;
}

// Una nota que viene: tenue, con un anillo que se cierra (como en Guitar Hero).
function dibujarProxima3D(d, usados, nota, evento, t, cuerdas) {
  const diametro = tamanoNota(d);
  const cerca = Math.max(0, Math.min(1, 1 - (evento.inicio - t) / ANTICIPO_MS));
  const x = xDedo3D(nota.traste);
  if (x < X_FIN_DIAPASON - 1) return;
  const y = yCuerda3D(nota.fila, x, cuerdas), z = zCuerda3D(x) + 0.3;
  const color = colorDeCuerda(nota.numero);
  const punto = tomar(d, usados, "proximas");
  if (!punto) return;
  punto.material.map = texturaNota(color, "", "circulo");
  punto.material.opacity = 0.12 + 0.33 * cerca;
  punto.position.set(x, y, z);
  punto.scale.setScalar(diametro * 0.85);
  if (efectosReducidos) return;
  const anillo = tomar(d, usados, "anillos");
  if (!anillo) return;
  anillo.material.color.set(color);
  anillo.material.opacity = 0.12 + 0.33 * cerca;
  anillo.position.set(x, y, z);
  anillo.scale.setScalar(diametro * (1 + 1.2 * (1 - cerca)));
}

// Una nota que suena: el punto con el número (o rombo o X) y sus técnicas. Devuelve true si se anima.
function dibujarNota3D(d, usados, nota, evento, t, opacidad, cuerdas, tecnicas) {
  const diametro = tamanoNota(d);
  const estado = estadoDeNota(nota, evento, t);
  const x = xDedo3D(estado.traste);
  if (x < X_FIN_DIAPASON - 1) return false;
  const yCuerda = yCuerda3D(nota.fila, x, cuerdas);
  const y = yCuerda + corrimiento3D(nota.fila, cuerdas, x, estado.semitonos);
  const z = zCuerda3D(x) + 0.35;
  const color = colorDeCuerda(nota.numero);
  let animada = false;

  // Slide: la estela desde donde empezó
  if (nota.slide) {
    tecnicas.add("slide");
    const xDesde = xDedo3D(nota.traste);
    const estela = !efectosReducidos && Math.abs(x - xDesde) > 0.05 ? tomar(d, usados, "estelas") : null;
    if (estela) {
      estela.material.color.set(color);
      moverCinta(estela, (s) => ({ x: xDesde + (x - xDesde) * s, y, z: z - 0.05 }), diametro * 0.45);
    }
    animada = true;
  }
  // Hammer-on / pull-off: un arco hasta la nota de llegada, con "h" o "p"
  if (nota.ligadoA) {
    const sube = nota.ligadoA.traste > nota.traste;
    tecnicas.add(sube ? "hammer" : "pull");
    const xDestino = xDedo3D(nota.ligadoA.traste);
    const arco = tomar(d, usados, "arcos");
    const alto = 0.7;
    if (arco) {
      arco.material.color.set(color);
      moverCinta(arco, (s) => ({ x: x + (xDestino - x) * s, y: yCuerda + diametro * 0.5 + Math.sin(Math.PI * s) * alto, z: z + 0.1 }), 0.09);
    }
    const letra = tomar(d, usados, "textos");
    if (letra) {
      letra.material.map = texturaTexto(sube ? "h" : "p");
      letra.material.opacity = opacidad;
      letra.position.set((x + xDestino) / 2, yCuerda + diametro * 0.5 + alto + 0.35, z + 0.1);
      letra.scale.set(1.2, 0.6, 1);
    }
  }
  // Tapping: un anillo que se abre al golpear
  if (nota.tapping) {
    tecnicas.add("tapping");
    const desde = t - evento.inicio;
    if (desde < 320 && !efectosReducidos) {
      const anillo = tomar(d, usados, "anillos");
      if (anillo) {
        anillo.material.color.set(color);
        anillo.material.opacity = opacidad * (1 - desde / 320);
        anillo.position.set(x, y, z);
        anillo.scale.setScalar(diametro * (1 + desde / 320 * 1.6));
      }
      animada = true;
    }
  }
  // Brillo alrededor del punto al pulsar
  if (!efectosReducidos && !nota.continua) {
    const desde = t - evento.inicio;
    if (desde < 450) {
      const halo = tomar(d, usados, "halos");
      if (halo) {
        halo.material.color.set(color);
        halo.material.opacity = 0.8 * opacidad * (1 - desde / 450);
        halo.position.set(x, y, z - 0.02);
        halo.scale.setScalar(diametro * 2.3);
      }
      animada = true;
    }
  }
  // El punto
  const punto = tomar(d, usados, "notas");
  if (punto) {
    let forma = "circulo", texto = "";
    if (nota.muerta) { forma = "x"; tecnicas.add("muteada"); }
    else {
      if (nota.armonico) { forma = "rombo"; tecnicas.add("armonico"); }
      texto = etiquetaMastil === "nota"
        ? nombresDeNotas(tonalidadOriginal)[(nota.altura + Math.round(estado.semitonos)) % 12]
        : String(Math.round(estado.traste));
    }
    punto.material.map = texturaNota(color, texto, forma);
    punto.material.opacity = opacidad;
    punto.position.set(x, y, z);
    punto.scale.setScalar(diametro * (forma === "rombo" ? 1.2 : 1));
  }
  // Estirada: el valor (½, full, 1½) al lado
  if (nota.estirada) {
    const maximo = Math.max(...nota.estirada.map((p) => p.semitonos));
    const texto = textoEstirada(maximo);
    tecnicas.add("estirada:" + texto);
    const etiqueta = tomar(d, usados, "textos");
    if (etiqueta) {
      etiqueta.material.map = texturaTexto(texto);
      etiqueta.material.opacity = opacidad;
      etiqueta.position.set(x - diametro * 1.1, y + (y - yCuerda > 0 ? 0.6 : -0.6), z);
      etiqueta.scale.set(1.3, 0.65, 1);
    }
    animada = true;
  }
  if (nota.vibrato) tecnicas.add("vibrato");
  return animada;
}
