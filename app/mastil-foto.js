"use strict";

/* ==================================================================
   Mástil "Foto": las fotos de tu guitarra (Eko LS-300)

   Un estilo del mástil ("Estilo del mástil" en "Pistas y sync"), como
   el clásico (mastil.js) y el 3D (mastil3d.js), que quedan como están.

   Las fotos (app/fotos-mastil/, preparadas con
   herramientas/preparar_fotos_mastil.py) ya tienen el fondo de estudio.
   Cada una está calibrada (fotos-mastil/calibracion.js, hecha con
   calibrar-fotos.html): con la perspectiva y la separación real de los
   trastes (foto-geometria.js) se sabe dónde cae cada traste y cada
   cuerda en la foto.

   Qué foto: con el celular acostado y en el modo tocar, la diagonal (el
   clavijero arriba a la derecha); con el celular parado, la de
   perspectiva o la de frente (opción). Primero se muestra la versión
   chica; la grande (toda la resolución de la foto) se pide recién cuando
   la pantalla la necesita, al acercarse.

   La cámara nunca muestra nada fuera de la foto: no se aleja más de lo
   que cubre la pantalla y no sale de la "zona útil" de cada foto (sin la
   parte de la guitarra que quedó cortada en el borde de la foto original;
   fotos-mastil/fotos.js, que genera el mismo programa que las prepara).

   Cámara: la foto se agranda y se corre suavemente hacia la zona que se
   toca (las notas que suenan y las de los próximos ~1,5 s): más cerca en
   los punteos, más lejos con acordes. Nunca más cerca de lo que permite
   la foto: un píxel de la foto no ocupa más de un píxel de la pantalla,
   así se ve siempre nítida.

   Encima, con la misma lógica del clásico (queMostrar, estadoDeNota,
   colores, transporte, la otra guitarra), pero más sutil, como en el
   video de referencia:
     - la nota que suena: un anillo chico, del tamaño de la nota real
       sobre la cuerda, con un brillo suave (el número de traste, solo si
       se elige en "Pistas y sync");
     - las que vienen: el mismo anillo, tenue;
     - la cuerda que suena: un hilo de luz fino, de un color apagado (se
       siguen distinguiendo), del dedo hacia el puente, vibrando en los
       punteos (en los acordes, solo los anillos);
     - las técnicas del .gp.
   Las cuerdas de la foto quedan como están cuando no suenan.

   En un costado, una miniatura de la guitarra entera con la zona que se
   toca resaltada (se puede ocultar).
   ================================================================== */

const selectorFotoParado = document.getElementById("foto-parado");
const casillaFotoMiniatura = document.getElementById("foto-miniatura");
const casillaFotoNumeros = document.getElementById("foto-numeros");

const CARPETA_FOTOS = "fotos-mastil/";
const VERSION_FOTOS = "3";
const NITIDEZ_MAXIMA = 1;          // un píxel de la foto grande ocupa como mucho un píxel de la pantalla
const ANTICIPO_CAMARA_MS = 1500;   // la cámara también encuadra las notas que vienen en este tiempo

let fotoParado = "perspectiva";
let miniaturaVisible = true;
let numerosEnFoto = false;          // el número de traste en cada nota (apagado: solo el anillo)
try {
  if (localStorage.getItem("mastilFotoParado") === "frente") fotoParado = "frente";
  if (localStorage.getItem("mastilFotoMiniatura") === "no") miniaturaVisible = false;
  if (localStorage.getItem("mastilFotoNumeros") === "si") numerosEnFoto = true;
} catch { /* valores por defecto */ }
selectorFotoParado.value = fotoParado;
casillaFotoMiniatura.checked = miniaturaVisible;
casillaFotoNumeros.checked = numerosEnFoto;

let promesaCalibracion = null;
const imagenesFoto = {};           // nombre -> { chica, grande } (objetos Image, cuando cargan)
let escenaFoto = null;             // { lienzo, g, miniatura, ... } (se arma una sola vez)
let cuadroFotoPedido = false;

// La calibración y los datos de las fotos (tamaño y zona útil) son scripts: así
// anda también abriendo la app desde un archivo.
function cargarScriptFotos(archivo) {
  return new Promise((resolver, rechazar) => {
    const script = document.createElement("script");
    script.src = `${CARPETA_FOTOS}${archivo}?v=${VERSION_FOTOS}`;
    script.onload = () => resolver();
    script.onerror = () => rechazar(new Error("No pude cargar los datos de las fotos."));
    document.head.appendChild(script);
  });
}

function cargarCalibracionFotos() {
  if (!promesaCalibracion) {
    promesaCalibracion = Promise.all([
      window.CALIBRACION_FOTOS ? null : cargarScriptFotos("calibracion.js"),
      window.FOTOS_MASTIL ? null : cargarScriptFotos("fotos.js"),
    ]).catch((error) => { promesaCalibracion = null; throw error; });
  }
  return promesaCalibracion;
}

// Una foto: primero la chica (decodificada, para que no trabe el dibujo); la
// grande, recién cuando la pide pedirFotoGrande.
function cargarFoto(nombre) {
  if (imagenesFoto[nombre]) return imagenesFoto[nombre];
  const datos = { chica: null, grande: null, pidiendoGrande: false };
  imagenesFoto[nombre] = datos;
  cargarVersion(nombre, "chica");
  return datos;
}

function cargarVersion(nombre, tamano) {
  const imagen = new Image();
  imagen.src = `${CARPETA_FOTOS}${nombre}-${tamano}.webp?v=${VERSION_FOTOS}`;
  imagen.decode().then(() => {
    imagenesFoto[nombre][tamano] = imagen;
    pedirCuadroFoto();
  }).catch(() => { /* sin esa versión: queda la otra */ });
}

// La grande, si con la chica no alcanza para la pantalla (al acercarse).
function pedirFotoGrande(nombre) {
  const datos = imagenesFoto[nombre];
  if (!datos || datos.grande || datos.pidiendoGrande) return;
  datos.pidiendoGrande = true;
  cargarVersion(nombre, "grande");
}

// Qué foto corresponde ahora: la diagonal acostado (y en el modo tocar), y la elegida parado.
function fotoQueCorresponde() {
  const ancho = contenedorMastil.clientWidth, alto = contenedorMastil.clientHeight;
  return modoTocar || ancho >= alto ? "diagonal" : fotoParado;
}

// Lo llama dibujarMastil (mastil.js) con el estilo Foto elegido.
async function armarMastilFoto() {
  try {
    await cargarCalibracionFotos();
  } catch (error) {
    mostrarMensaje(error.message + " Vuelvo al mástil clásico.");
    cambiarEstiloMastil("clasico");
    return;
  }
  if (!usarFoto()) return;
  if (!escenaFoto) escenaFoto = crearEscenaFoto();
  if (escenaFoto.lienzo.parentElement !== contenedorMastil) contenedorMastil.replaceChildren(escenaFoto.lienzo, escenaFoto.miniatura, escenaFoto.botonMiniatura);
  contenedorMastil.dataset.dibujo = "foto";
  cargarFoto("entera");
  redimensionarFoto();
  escenaFoto.saltar = true;
  pedirCuadroFoto();
}

function crearEscenaFoto() {
  const lienzo = document.createElement("canvas");
  lienzo.className = "lienzo-mastil lienzo-mastil-foto";
  lienzo.setAttribute("aria-hidden", "true");
  const miniatura = document.createElement("canvas");
  miniatura.className = "miniatura-guitarra";
  miniatura.setAttribute("aria-hidden", "true");
  const botonMiniatura = document.createElement("button");
  botonMiniatura.type = "button";
  botonMiniatura.className = "boton-miniatura";
  botonMiniatura.addEventListener("click", () => cambiarMiniatura(!miniaturaVisible));
  return {
    lienzo, g: lienzo.getContext("2d"), miniatura, gMini: miniatura.getContext("2d"), botonMiniatura,
    foto: null, geometria: null, ancho: 0, alto: 0, escala: 1,
    camara: { x: 0, y: 0, zoom: 1 }, objetivo: null, saltar: true, ultimoCuadro: 0,
  };
}

// Resolución del dibujo: la de la pantalla (hasta 2,5×); con "efectos reducidos", hasta 1,5×.
const escalaFoto = () => Math.min(window.devicePixelRatio || 1, efectosReducidos ? 1.5 : 2.5);

function redimensionarFoto() {
  const e = escenaFoto;
  if (!e) return;
  const ancho = contenedorMastil.clientWidth, alto = contenedorMastil.clientHeight;
  if (!ancho || !alto) return;
  e.ancho = ancho; e.alto = alto;
  e.escala = escalaFoto();
  e.lienzo.width = Math.round(ancho * e.escala);
  e.lienzo.height = Math.round(alto * e.escala);
  e.lienzo.style.width = ancho + "px";
  e.lienzo.style.height = alto + "px";
  elegirFoto();
  mostrarMiniatura();
  pedirCuadroFoto();
}

new ResizeObserver(() => { if (usarFoto() && escenaFoto) redimensionarFoto(); }).observe(contenedorMastil);

// Cambia de foto si hace falta (al girar el celular, al entrar al modo tocar, al cambiar la opción).
function elegirFoto() {
  const e = escenaFoto;
  const nombre = fotoQueCorresponde();
  if (e.foto === nombre && e.geometria) return;
  const calibracion = window.CALIBRACION_FOTOS[nombre];
  e.foto = nombre;
  e.calibracion = calibracion;
  e.geometria = geometriaDeFoto(calibracion);
  // La zona útil, en píxeles de la foto grande (sin datos, la foto entera)
  const zona = (window.FOTOS_MASTIL && window.FOTOS_MASTIL[nombre] && window.FOTOS_MASTIL[nombre].zona) || { x0: 0, y0: 0, x1: 1, y1: 1 };
  e.zona = { x0: zona.x0 * calibracion.ancho, y0: zona.y0 * calibracion.alto, x1: zona.x1 * calibracion.ancho, y1: zona.y1 * calibracion.alto };
  cargarFoto(nombre);
  e.saltar = true;
  contenedorMastil.dataset.foto = nombre;
}

function pedirCuadroFoto() {
  if (cuadroFotoPedido || !escenaFoto || !usarFoto() || contenedorMastil.hidden || vistaTabs.hidden) return;
  cuadroFotoPedido = true;
  requestAnimationFrame(cuadroFoto);
}

/* ------------------------------------------------------------------
   De la guitarra a la pantalla
   ------------------------------------------------------------------ */

// Un punto del plano de las cuerdas (mm) en la foto grande (px) y en la pantalla (px).
function enFoto(e, X, fila, cuerdas, corrimientoMm = 0) {
  const p = e.geometria.punto(X, fila, cuerdas, corrimientoMm);
  return { x: p.x * e.calibracion.ancho, y: p.y * e.calibracion.alto };
}
function enPantalla(e, p) {
  return { x: e.ancho / 2 + (p.x - e.camara.x) * e.camara.zoom, y: e.alto / 2 + (p.y - e.camara.y) * e.camara.zoom };
}
const punto = (e, X, fila, cuerdas, corrimientoMm = 0) => enPantalla(e, enFoto(e, X, fila, cuerdas, corrimientoMm));

// Lo que mide en la pantalla el traste donde está X (para el tamaño de los círculos).
function anchoDeTrastePx(e, traste, fila, cuerdas) {
  const n = Math.max(1, Math.min(22, Math.round(traste) || 1));
  const a = punto(e, xDeTrasteMm(n - 1), fila, cuerdas), b = punto(e, xDeTrasteMm(n), fila, cuerdas);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Cuánto se corre la cuerda al estirarla (mm, a lo ancho), como en el clásico.
function corrimientoEstiradaMm(fila, cuerdas, X, semitonos) {
  const entre = separacionMm(X) / Math.max(1, cuerdas - 1);
  const sentido = fila < cuerdas / 2 ? -1 : 1;   // las agudas hacia las graves y al revés
  return sentido * Math.min(entre * 1.15, semitonos * entre * 0.38);
}

/* ------------------------------------------------------------------
   Cámara
   ------------------------------------------------------------------ */

/**
 * La zona que se toca (las notas que suenan y las que vienen) en la foto
 * grande, y el acercamiento para que entre: más cerca en los punteos, más
 * lejos con acordes. Se mueve de a poco hacia ahí (exponencial, sin saltos).
 * Devuelve true mientras se sigue moviendo.
 */
function moverCamaraFoto(e, visto, t, dt, cuerdas) {
  const guitarra = guitarrasMastil[visto.guitarra - 1];
  const notas = visto.eventos.flatMap((ev) => ev.notas.filter((n) => !n.muerta));
  const despues = eventosEn(guitarra, t, t + ANTICIPO_CAMARA_MS).filter((ev) => ev.inicio > t).flatMap((ev) => ev.notas);
  const todas = [...notas, ...despues];
  const zona = e.zona;
  // El acercamiento más chico: el que cubre toda la pantalla con la zona útil (más lejos
  // se vería fondo fuera de la foto); el más grande: un píxel de la foto grande por
  // píxel de la pantalla (los reales del celular, aunque se dibuje a menos).
  const zoomMinimo = Math.max(e.ancho / (zona.x1 - zona.x0), e.alto / (zona.y1 - zona.y0));
  const zoomMaximo = Math.max(zoomMinimo, NITIDEZ_MAXIMA / Math.max(e.escala, window.devicePixelRatio || 1));
  if (todas.length) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const nota of todas) {
      for (const traste of [nota.traste, nota.slide ? nota.slide.hasta : nota.traste]) {
        // El traste entero (de un alambre al otro), de borde a borde del diapasón
        for (const X of [xDeTrasteMm(Math.max(0, traste - 1.3)), xDeTrasteMm(Math.min(24, traste + 0.6))]) {
          for (const fila of [0, cuerdas - 1]) {
            const p = enFoto(e, X, fila, cuerdas, (fila ? -1 : 1) * 5);
            x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
          }
        }
      }
    }
    const juntas = Math.max(0, ...visto.eventos.map((ev) => ev.notas.length));
    const margen = juntas >= 2 ? 1.8 : 1.15;   // con acordes, más lejos
    const zoom = Math.min(e.ancho / ((x1 - x0) * margen), e.alto / ((y1 - y0) * margen));
    // Con acordes, aunque entren de cerca, siempre un poco más lejos que en los punteos
    const tope = juntas >= 2 ? Math.max(zoomMinimo, zoomMaximo * 0.72) : zoomMaximo;
    e.objetivo = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, zoom: Math.max(zoomMinimo, Math.min(tope, zoom)), tope };
  } else if (!e.objetivo) {
    // Al empezar: los primeros trastes
    const a = enFoto(e, xDeTrasteMm(0), 3, 6), b = enFoto(e, xDeTrasteMm(7), 3, 6);
    const zoom = Math.min(e.ancho / (Math.abs(b.x - a.x) * 1.6 + 1), e.alto / (Math.abs(b.y - a.y) * 1.6 + 1));
    e.objetivo = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, zoom: Math.max(zoomMinimo, Math.min(zoomMaximo, zoom)) };
  }
  const objetivo = e.objetivo;
  objetivo.zoom = Math.max(zoomMinimo, Math.min(objetivo.tope || zoomMaximo, zoomMaximo, objetivo.zoom));
  const c = e.camara;
  if (e.saltar || !dt) {
    Object.assign(c, objetivo);
    e.saltar = false;
  } else {
    const k = 1 - Math.exp(-dt * 1.8);
    c.x += (objetivo.x - c.x) * k;
    c.y += (objetivo.y - c.y) * k;
    c.zoom = Math.exp(Math.log(c.zoom) + (Math.log(objetivo.zoom) - Math.log(c.zoom)) * k * 0.8);
  }
  // Siempre dentro de la zona útil: el borde de la pantalla no pasa nunca el de la zona
  c.zoom = Math.max(c.zoom, zoomMinimo);
  const mitadX = e.ancho / 2 / c.zoom, mitadY = e.alto / 2 / c.zoom;
  c.x = Math.min(zona.x1 - mitadX, Math.max(zona.x0 + mitadX, c.x));
  c.y = Math.min(zona.y1 - mitadY, Math.max(zona.y0 + mitadY, c.y));
  return Math.abs(objetivo.x - c.x) * c.zoom > 0.5 || Math.abs(objetivo.y - c.y) * c.zoom > 0.5 || Math.abs(Math.log(objetivo.zoom / c.zoom)) > 0.003;
}

/* ------------------------------------------------------------------
   Cada cuadro
   ------------------------------------------------------------------ */

function cuadroFoto(marca) {
  cuadroFotoPedido = false;
  const e = escenaFoto;
  if (!e || !usarFoto() || contenedorMastil.hidden || vistaTabs.hidden || !e.geometria) return;
  const inicio = performance.now();
  const dt = e.ultimoCuadro ? Math.min(0.1, (marca - e.ultimoCuadro) / 1000) : 0;
  e.ultimoCuadro = marca;
  if (e.escala !== escalaFoto()) redimensionarFoto();   // cambió "efectos reducidos"
  elegirFoto();
  const t = msPartituraAhora();
  const visto = queMostrar(t);
  const datosGuitarra = guitarrasMastil[visto.guitarra - 1] || guitarrasMastil.find(Boolean);
  const cuerdas = datosGuitarra ? datosGuitarra.cuerdas : 6;
  let animando = moverCamaraFoto(e, visto, t, dt, cuerdas);

  // La foto (la grande si ya llegó)
  const g = e.g;
  g.setTransform(e.escala, 0, 0, e.escala, 0, 0);
  g.fillStyle = "#0a0b0d";
  g.fillRect(0, 0, e.ancho, e.alto);
  const foto = imagenesFoto[e.foto];
  // Con la chica alcanza mientras cada píxel suyo no ocupe más de uno de la pantalla; si no, la grande.
  if (foto && foto.chica && !foto.grande && e.camara.zoom * e.escala * e.calibracion.ancho > foto.chica.naturalWidth * 1.02) pedirFotoGrande(e.foto);
  const imagen = (foto && (foto.grande || foto.chica)) || null;
  if (imagen) {
    const c = e.camara;
    g.imageSmoothingQuality = efectosReducidos ? "low" : "high";
    g.drawImage(imagen, e.ancho / 2 - c.x * c.zoom, e.alto / 2 - c.y * c.zoom, e.calibracion.ancho * c.zoom, e.calibracion.alto * c.zoom);
  } else {
    animando = true;   // todavía cargando
  }

  // Cuerdas que suenan: encendidas como un láser (solo en los punteos)
  const activas = new Map();
  for (const evento of visto.eventos) for (const nota of evento.notas) if (!nota.muerta) activas.set(nota.fila, { nota, evento });
  const esAcorde = activas.size >= 2;
  contenedorMastil.dataset.lineas = esAcorde ? "no" : "si";
  if (!esAcorde) {
    for (const [fila, activa] of activas) if (dibujarLaserFoto(e, fila, cuerdas, activa, t, visto.opacidad)) animando = true;
  }
  // Notas: las que vienen (tenues), las que suenan y sus técnicas
  for (const evento of visto.proximas) for (const nota of evento.notas) if (!nota.continua && nota.fila < cuerdas) dibujarProximaFoto(e, nota, evento, t, cuerdas);
  const tecnicas = new Set();
  for (const evento of visto.eventos) {
    for (const nota of evento.notas) if (nota.fila < cuerdas && dibujarNotaFoto(e, nota, evento, t, visto.opacidad, cuerdas, tecnicas)) animando = true;
  }
  if (miniaturaVisible) dibujarMiniatura(e, visto, t);

  // Lo que se ve, para las pruebas (igual que el clásico)
  const describir = (eventos) => eventos.flatMap((ev) => ev.notas.map((n) => `${n.numero}ª/${n.traste}`)).join(" ");
  contenedorMastil.dataset.guitarra = visto.eventos.length ? String(visto.guitarra) : "";
  contenedorMastil.dataset.sonando = describir(visto.eventos);
  contenedorMastil.dataset.proximas = describir(visto.proximas);
  contenedorMastil.dataset.opacidad = String(visto.opacidad);
  contenedorMastil.dataset.tecnicas = [...tecnicas].join(" ");
  contenedorMastil.dataset.zoom = e.camara.zoom.toFixed(3);
  contenedorMastil.dataset.centro = `${Math.round(e.camara.x)},${Math.round(e.camara.y)}`;
  contenedorMastil.dataset.calidad = imagen === (foto && foto.grande) ? "grande" : "chica";
  e.ultimoTiempoDibujo = performance.now() - inicio;

  if (!audio.paused || animando) pedirCuadroFoto();
}

// Un color de cuerda más apagado y menos saturado (los colores se siguen distinguiendo).
const coloresApagados = new Map();
function colorApagado(hex) {
  if (coloresApagados.has(hex)) return coloresApagados.get(hex);
  const r = parseInt(hex.slice(1, 3), 16) / 255, v = parseInt(hex.slice(3, 5), 16) / 255, a = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, v, a), min = Math.min(r, v, a), l = (max + min) / 2, d = max - min;
  let h = 0;
  if (d) h = max === r ? ((v - a) / d) % 6 : max === v ? (a - r) / d + 2 : (r - v) / d + 4;
  const saturacion = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  const color = `hsl(${Math.round(h * 60 + 360) % 360}, ${Math.round(saturacion * 52)}%, ${Math.round(58 + (l - 0.5) * 20)}%)`;
  coloresApagados.set(hex, color);
  return color;
}

// La cuerda que suena, del dedo al puente: un hilo de luz fino de su color
// (apagado), con un brillo suave; vibra en los punteos (y ondula con vibrato).
function dibujarLaserFoto(e, fila, cuerdas, activa, t, opacidad) {
  const { nota, evento } = activa;
  const estado = estadoDeNota(nota, evento, t);
  const xDedo = estado.traste > 0 ? xDeTrasteMm(estado.traste) - 1.5 : 0;
  const corrimiento = corrimientoEstiradaMm(fila, cuerdas, xDedo, estado.semitonos);
  const desdeAtaque = nota.continua ? 1e9 : t - evento.inicio;
  const amplitud = efectosReducidos ? 0 : 0.9 * Math.exp(-Math.max(0, desdeAtaque) / 380);   // mm
  const vibrato = nota.vibrato && !efectosReducidos;
  const fase = t / 1000 * 2 * Math.PI * 9;
  const pasos = amplitud > 0.02 || vibrato || corrimiento ? 28 : 1;
  const camino = [];
  for (let i = 0; i <= pasos; i++) {
    const s = i / pasos;
    const X = xDedo + (ESCALA_MM - xDedo) * s;
    let mm = corrimiento * (1 - s) + amplitud * Math.sin(Math.PI * s) * Math.sin(fase);
    if (vibrato) mm += 0.6 * Math.sin(Math.PI * s) * Math.sin(t / 1000 * 2 * Math.PI * 5.5 + s * 9);
    camino.push(punto(e, X, fila, cuerdas, mm));
  }
  const color = colorApagado(colorDeCuerda(nota.numero));
  // Fino: del grosor de una cuerda real en esa parte de la foto (como mucho 2,5 px)
  const hilo = Math.max(1, Math.min(2.5, anchoDeTrastePx(e, estado.traste || 1, fila, cuerdas) * 0.03));
  const g = e.g;
  const trazar = () => { g.beginPath(); camino.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke(); };
  g.lineCap = "round";
  g.strokeStyle = color;
  if (!efectosReducidos) {
    // El brillo suave alrededor
    g.globalAlpha = 0.16 * opacidad;
    g.lineWidth = hilo * 6;
    trazar();
    g.globalAlpha = 0.3 * opacidad;
    g.lineWidth = hilo * 2.6;
    trazar();
  }
  g.globalAlpha = 0.95 * opacidad;
  g.lineWidth = hilo;
  trazar();
  g.globalAlpha = 1;
  g.lineCap = "butt";
  return amplitud > 0.02 || vibrato || !!nota.estirada || !!nota.slide;
}

// Radio del anillo de una nota: el de la nota real sobre la cuerda (chico, según el
// ancho del traste en esa parte de la foto). Con el número de traste, un círculo
// un poco más grande, para que entre.
function radioNotaFoto(e, traste, fila, cuerdas) {
  const trastePx = anchoDeTrastePx(e, traste || 1, fila, cuerdas);
  return numerosEnFoto ? Math.max(9, Math.min(24, trastePx * 0.3)) : Math.max(4, Math.min(11, trastePx * 0.14));
}

// Un brillo redondo y suave alrededor de un punto.
function brilloSuave(g, p, radio, color, intensidad) {
  const brillo = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, radio);
  brillo.addColorStop(0, color);
  brillo.addColorStop(1, "rgba(0,0,0,0)");
  const antes = g.globalAlpha;
  g.globalAlpha = antes * intensidad;
  g.fillStyle = brillo;
  g.beginPath(); g.arc(p.x, p.y, radio, 0, Math.PI * 2); g.fill();
  g.globalAlpha = antes;
}

// Una nota que viene: el mismo anillo chico que la que suena, tenue (más visible cuanto más cerca).
function dibujarProximaFoto(e, nota, evento, t, cuerdas) {
  const cerca = Math.max(0, Math.min(1, 1 - (evento.inicio - t) / ANTICIPO_MS));
  const p = punto(e, xDedoFotoMm(nota.traste), nota.fila, cuerdas);
  const radio = radioNotaFoto(e, nota.traste, nota.fila, cuerdas);
  const g = e.g;
  g.globalAlpha = 0.15 + 0.3 * cerca;
  g.strokeStyle = colorApagado(colorDeCuerda(nota.numero));
  g.lineWidth = Math.max(1.2, radio * 0.25);
  g.beginPath(); g.arc(p.x, p.y, radio, 0, Math.PI * 2); g.stroke();
  g.globalAlpha = 1;
}

// Dónde va el dedo (mm): cerca del alambre; al aire, del otro lado de la cejuela.
const xDedoFotoMm = (traste) => (traste <= 0 ? -7 : xDeTrasteMm(traste - 0.45));

// Una nota que suena: el punto con el número (o rombo, o X) y sus técnicas. Devuelve true si se anima.
function dibujarNotaFoto(e, nota, evento, t, opacidad, cuerdas, tecnicas) {
  const g = e.g;
  const estado = estadoDeNota(nota, evento, t);
  const X = xDedoFotoMm(estado.traste);
  const corrimiento = corrimientoEstiradaMm(nota.fila, cuerdas, X, estado.semitonos);
  const p = punto(e, X, nota.fila, cuerdas, corrimiento);
  const enCuerda = punto(e, X, nota.fila, cuerdas);
  const radio = radioNotaFoto(e, estado.traste, nota.fila, cuerdas);
  const colorVivo = colorDeCuerda(nota.numero);
  const color = colorApagado(colorVivo);
  // "Hacia arriba" de la cuerda en la pantalla (hacia la 1ª), para los arcos y textos
  const arriba = (() => {
    const q = punto(e, X, nota.fila, cuerdas, 4);
    const largo = Math.hypot(q.x - enCuerda.x, q.y - enCuerda.y) || 1;
    return { x: (q.x - enCuerda.x) / largo, y: (q.y - enCuerda.y) / largo };
  })();
  let animada = false;
  g.globalAlpha = opacidad;

  // Slide: la estela desde donde empezó
  if (nota.slide) {
    tecnicas.add("slide");
    if (!efectosReducidos) {
      const desde = punto(e, xDedoFotoMm(nota.traste), nota.fila, cuerdas);
      if (Math.hypot(p.x - desde.x, p.y - desde.y) > 1) {
        const estela = g.createLinearGradient(desde.x, desde.y, p.x, p.y);
        estela.addColorStop(0, "rgba(255,255,255,0)");
        estela.addColorStop(1, color);
        g.strokeStyle = estela;
        g.lineWidth = Math.max(2, radio * 0.8);
        g.lineCap = "round";
        g.beginPath(); g.moveTo(desde.x, desde.y); g.lineTo(p.x, p.y); g.stroke();
        g.lineCap = "butt";
      }
      animada = true;
    }
  }
  // Hammer-on / pull-off: un arco hasta la nota de llegada, con "h" o "p"
  if (nota.ligadoA) {
    const sube = nota.ligadoA.traste > nota.traste;
    tecnicas.add(sube ? "hammer" : "pull");
    const destino = punto(e, xDedoFotoMm(nota.ligadoA.traste), nota.fila, cuerdas);
    const alto = Math.max(10, radio * 2.6);
    const medio = { x: (enCuerda.x + destino.x) / 2 + arriba.x * alto, y: (enCuerda.y + destino.y) / 2 + arriba.y * alto };
    g.strokeStyle = color;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(enCuerda.x + arriba.x * radio, enCuerda.y + arriba.y * radio);
    g.quadraticCurveTo(medio.x, medio.y, destino.x + arriba.x * radio, destino.y + arriba.y * radio);
    g.stroke();
    textoConBorde(g, sube ? "h" : "p", medio.x + arriba.x * 8, medio.y + arriba.y * 8, 12);
  }
  // Tapping: un anillo que se abre al golpear
  if (nota.tapping) {
    tecnicas.add("tapping");
    const desde = t - evento.inicio;
    if (desde < 320 && !efectosReducidos) {
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.globalAlpha = opacidad * (1 - desde / 320);
      g.beginPath(); g.arc(p.x, p.y, radio + desde / 320 * radio * 2.5, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = opacidad;
      animada = true;
    }
  }
  // Brillo suave alrededor (más fuerte al pulsar)
  if (!efectosReducidos) {
    const desde = nota.continua ? 1e9 : t - evento.inicio;
    const pulso = desde < 450 ? 1 - desde / 450 : 0;
    brilloSuave(g, p, radio * (2.4 + 1.2 * pulso), color, 0.45 + 0.45 * pulso);
    if (pulso) animada = true;
  }
  // El punto: X (muteada), rombo (armónico) o anillo; con la opción, círculo con el número
  if (nota.muerta) {
    tecnicas.add("muteada");
    const r = Math.max(4, radio * 1.1);
    g.lineCap = "round";
    for (const [trazo, ancho] of [["rgba(11,13,16,0.8)", 4], [color, 2]]) {
      g.strokeStyle = trazo;
      g.lineWidth = ancho;
      g.beginPath();
      g.moveTo(p.x - r, p.y - r); g.lineTo(p.x + r, p.y + r);
      g.moveTo(p.x + r, p.y - r); g.lineTo(p.x - r, p.y + r);
      g.stroke();
    }
    g.lineCap = "butt";
  } else if (numerosEnFoto) {
    g.fillStyle = colorVivo;
    g.beginPath();
    if (nota.armonico) {
      tecnicas.add("armonico");
      const r = radio * 1.2;
      g.moveTo(p.x, p.y - r); g.lineTo(p.x + r, p.y); g.lineTo(p.x, p.y + r); g.lineTo(p.x - r, p.y);
      g.closePath();
    } else {
      g.arc(p.x, p.y, radio, 0, Math.PI * 2);
    }
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = Math.max(1.2, radio * 0.1);
    g.stroke();
    const texto = etiquetaMastil === "nota"
      ? nombresDeNotas(tonalidadOriginal)[(nota.altura + Math.round(estado.semitonos)) % 12]
      : String(Math.round(estado.traste));
    g.font = `800 ${Math.round(radio * (texto.length > 1 ? 1.15 : 1.4))}px system-ui, sans-serif`;
    g.fillStyle = textoSobre(colorVivo);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, p.x, p.y + radio * 0.06);
  } else {
    // El anillo (rombo si es armónico), con un borde oscuro finito para que se vea sobre la madera clara
    g.beginPath();
    if (nota.armonico) {
      tecnicas.add("armonico");
      const r = radio * 1.3;
      g.moveTo(p.x, p.y - r); g.lineTo(p.x + r, p.y); g.lineTo(p.x, p.y + r); g.lineTo(p.x - r, p.y);
      g.closePath();
    } else {
      g.arc(p.x, p.y, radio, 0, Math.PI * 2);
    }
    const grosor = Math.max(1.6, radio * 0.3);
    g.strokeStyle = "rgba(11,13,16,0.55)";
    g.lineWidth = grosor + 1.6;
    g.stroke();
    g.strokeStyle = color;
    g.lineWidth = grosor;
    g.stroke();
  }
  // Estirada: el valor (½, full, 1½) al lado, hacia donde se corre la cuerda
  if (nota.estirada) {
    const maximo = Math.max(...nota.estirada.map((q) => q.semitonos));
    const texto = textoEstirada(maximo);
    tecnicas.add("estirada:" + texto);
    const lado = corrimiento > 0 ? 1 : -1;
    textoConBorde(g, texto, p.x + arriba.x * lado * Math.max(14, radio * 2.4), p.y + arriba.y * lado * Math.max(14, radio * 2.4), 12);
    animada = true;
  }
  if (nota.vibrato) tecnicas.add("vibrato");
  g.globalAlpha = 1;
  return animada;
}

function textoConBorde(g, texto, x, y, tamano) {
  g.font = `800 ${tamano}px system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 4;
  g.strokeStyle = "#0b0d10";
  g.strokeText(texto, x, y);
  g.fillStyle = "#f2f4f6";
  g.fillText(texto, x, y);
}

/* ------------------------------------------------------------------
   Miniatura: la guitarra entera con la zona que se toca resaltada
   ------------------------------------------------------------------ */

function mostrarMiniatura() {
  const e = escenaFoto;
  e.miniatura.hidden = !miniaturaVisible;
  e.botonMiniatura.textContent = miniaturaVisible ? "×" : "◫";
  e.botonMiniatura.title = miniaturaVisible ? "Ocultar la miniatura" : "Mostrar la miniatura de la guitarra";
  e.botonMiniatura.setAttribute("aria-label", e.botonMiniatura.title);
  // Alto: un tercio de la vista (entre 90 y 170 px), con la proporción de la foto entera
  const calibracion = window.CALIBRACION_FOTOS.entera;
  const alto = Math.round(Math.max(90, Math.min(170, e.alto * 0.36)));
  const ancho = Math.round(alto * calibracion.ancho / calibracion.alto);
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  e.miniatura.width = ancho * escala;
  e.miniatura.height = alto * escala;
  e.miniatura.style.width = ancho + "px";
  e.miniatura.style.height = alto + "px";
  e.miniatura.dataset.escala = String(escala);
  // El botón, en la esquina de arriba a la izquierda de la miniatura (así no le tapa el clavijero)
  e.botonMiniatura.style.right = miniaturaVisible ? `${6 + ancho - 13}px` : "6px";
}

function dibujarMiniatura(e, visto, t) {
  const fotos = imagenesFoto.entera;
  const imagen = fotos && (fotos.grande || fotos.chica);
  if (!imagen) return;
  const g = e.gMini;
  const escala = Number(e.miniatura.dataset.escala) || 1;
  const ancho = e.miniatura.width / escala, alto = e.miniatura.height / escala;
  g.setTransform(escala, 0, 0, escala, 0, 0);
  g.drawImage(imagen, 0, 0, ancho, alto);
  // La zona: de un traste antes del más bajo a uno después del más alto que suenan (o vienen)
  const guitarra = guitarrasMastil[visto.guitarra - 1];
  const notas = [...visto.eventos, ...eventosEn(guitarra, t, t + ANTICIPO_CAMARA_MS).filter((ev) => ev.inicio > t)]
    .flatMap((ev) => ev.notas.map((n) => n.traste));
  if (!notas.length) return;
  const desde = Math.max(0, Math.min(...notas) - 1), hasta = Math.min(22, Math.max(...notas) + 0.4);
  const geometria = e.geometriaEntera || (e.geometriaEntera = geometriaDeFoto(window.CALIBRACION_FOTOS.entera));
  const esquina = (n, lado) => {
    const X = xDeTrasteMm(n);
    const q = aFoto(geometria.H, X, lado * (anchoDiapasonMm(X) / 2 + 1.5));
    return [q.x * ancho, q.y * alto];
  };
  g.beginPath();
  g.moveTo(...esquina(desde, -1)); g.lineTo(...esquina(desde, 1)); g.lineTo(...esquina(hasta, 1)); g.lineTo(...esquina(hasta, -1));
  g.closePath();
  g.fillStyle = "rgba(245,184,61,0.35)";
  g.fill();
  g.strokeStyle = "#f5b83d";
  g.lineWidth = 1.5;
  g.stroke();
}

function cambiarMiniatura(visible) {
  miniaturaVisible = visible;
  casillaFotoMiniatura.checked = visible;
  guardarPreferencia("mastilFotoMiniatura", visible ? "si" : "no");
  if (escenaFoto) mostrarMiniatura();
  pedirCuadroFoto();
}

/* ------------------------------------------------------------------
   Opciones
   ------------------------------------------------------------------ */

selectorFotoParado.addEventListener("change", () => {
  fotoParado = selectorFotoParado.value === "frente" ? "frente" : "perspectiva";
  guardarPreferencia("mastilFotoParado", fotoParado);
  if (escenaFoto) { elegirFoto(); pedirCuadroFoto(); }
});
casillaFotoMiniatura.addEventListener("change", () => cambiarMiniatura(casillaFotoMiniatura.checked));
// El número de traste en cada nota (solo en este estilo; el clásico y el 3D no cambian)
casillaFotoNumeros.addEventListener("change", () => {
  numerosEnFoto = casillaFotoNumeros.checked;
  guardarPreferencia("mastilFotoNumeros", numerosEnFoto ? "si" : "no");
  pedirCuadroFoto();
});
