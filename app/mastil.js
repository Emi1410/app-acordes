"use strict";

/* ==================================================================
   Mástil virtual (vista Tabs): una Les Paul que toca sola

   Debajo de la tablatura (horizontal) o parado ocupando casi toda la
   pantalla (vertical), un mástil como el de una Les Paul (Eko LS-300):
   diapasón de palisandro con veta, incrustaciones trapezoidales color
   perla, filete crema en los bordes, trastes de níquel y, al final, una
   franja del cuerpo cherry sunburst flameado con un humbucker (donde se
   pulsa la cuerda).

   Cada cuerda tiene su color (configurable). Las notas son círculos del
   color de su cuerda con el número de traste (o el nombre de la nota)
   adentro. Como en Guitar Hero, las que vienen se ven tenues un instante
   antes y se encienden al sonar; la cuerda que suena se ilumina desde el
   dedo hasta el micrófono y vibra. Técnicas leídas nota por nota del .gp:
     - estirada (bend): la cuerda se curva hacia el costado según cuánto
       sube (½, full, 1½), con un arco y el valor; también la bajada
       (release) y las pre-estiradas, siguiendo los puntos del .gp;
     - vibrato: la cuerda ondula mientras dura la nota;
     - tapping: un golpe (un anillo que se abre) en el punto;
     - hammer-on y pull-off: un arco entre las dos notas;
     - slide: el punto se desliza hasta el traste de llegada, con estela;
     - nota muteada: una X; armónico: un rombo.
   La otra guitarra aparece más tenue (aunque en la tablatura se vea solo
   la 1), para ver los acordes mientras se sigue el punteo.

   Rendimiento: se dibuja en un <canvas>. Lo que no cambia (la madera, los
   trastes, el clavijero, el cuerpo) se dibuja una sola vez en imágenes
   aparte; en cada cuadro solo se copian y se dibujan las cuerdas y las
   notas. Con "efectos reducidos" no hay brillo, vibración ni estelas.

   Datos de alphaTab (ver tablaturas.js):
     - beat.absolutePlaybackStart / playbackDuration: cuándo suena (ticks);
     - note.string: 1 es la cuerda más grave; note.fret: 0 es al aire;
     - staff.tuning: alturas MIDI de las cuerdas, de la más aguda a la más grave;
     - note.bendPoints: [{ offset (0 a 60, a lo largo de la nota), value
       (en cuartos de tono: 4 = un tono, "full") }].
   ================================================================== */

const contenedorMastil = document.getElementById("mastil");
const botonOrientacionMastil = document.getElementById("orientacion-mastil");
const selectorEtiquetaMastil = document.getElementById("etiqueta-mastil");
const casillaOtraGuitarra = document.getElementById("mastil-otra-guitarra");
const casillaEfectosReducidos = document.getElementById("mastil-efectos-reducidos");
const entradasColorCuerda = [...document.querySelectorAll(".color-cuerda")];
const botonColoresOriginales = document.getElementById("colores-originales");

const TRASTES_TOTALES = 22;                          // una Les Paul tiene 22
const INCRUSTACIONES = [3, 5, 7, 9, 12, 15, 17, 19, 21];
// Colores de las cuerdas, de la 6ª (la más grave) a la 1ª
const COLORES_ORIGINALES = { 6: "#ef4444", 5: "#facc15", 4: "#3b82f6", 3: "#f97316", 2: "#22c55e", 1: "#a855f7" };
const ANTICIPO_MS = 650;          // cuánto antes de sonar aparece tenue una nota
const ESPERA_VENTANA_MS = 4000;   // para mover el mástil se miran también las notas de los próximos ~2 compases

/* ------------------------------------------------------------------
   Preferencias (en este dispositivo)
   ------------------------------------------------------------------ */

let orientacionMastil = "horizontal";   // "horizontal" | "vertical"
let etiquetaMastil = "traste";          // "traste" | "nota"
let mostrarOtraGuitarra = true;
let efectosReducidos = false;
let coloresCuerda = { ...COLORES_ORIGINALES };
try {
  if (localStorage.getItem("mastilOrientacion") === "vertical") orientacionMastil = "vertical";
  if (localStorage.getItem("mastilEtiqueta") === "nota") etiquetaMastil = "nota";
  if (localStorage.getItem("mastilOtraGuitarra") === "no") mostrarOtraGuitarra = false;
  if (localStorage.getItem("mastilEfectosReducidos") === "si") efectosReducidos = true;
  const guardados = JSON.parse(localStorage.getItem("mastilColores") || "null");
  if (guardados) for (const n of [1, 2, 3, 4, 5, 6]) if (/^#[0-9a-f]{6}$/i.test(guardados[n] || "")) coloresCuerda[n] = guardados[n];
} catch {
  // valores por defecto
}

function guardarPreferencia(clave, valor) {
  try { localStorage.setItem(clave, valor); } catch { /* queda para esta sesión */ }
}

/* ------------------------------------------------------------------
   Datos: las notas de cada guitarra, con sus técnicas
   ------------------------------------------------------------------ */

// [Guitarra principal, otra guitarra] = { nombre, afinacion, cuerdas, eventos: [{ inicio, fin (ms de la partitura), notas }] }
let guitarrasMastil = [null, null];
let mapaMastil = null;            // ms del mp3 -> ms de la partitura (con la sincronización)

/**
 * Prepara las notas al cargar la partitura (y al cambiar las pistas).
 * La principal es la Guitarra 1; la otra, la Guitarra 2 elegida o, si en
 * la tablatura se ve solo la 1, otra guitarra de la canción (la de
 * acompañamiento, si la hay).
 */
function prepararMastil(partitura) {
  const msDeTick = crearMapaDeTempo(partitura);
  const principal = partitura.tracks[pistasElegidas[0]] || null;
  let otra = pistasElegidas[1] >= 0 ? partitura.tracks[pistasElegidas[1]] : null;
  if (!otra) {
    const guitarras = partitura.tracks.filter((p) => esGuitarra(p) && p !== principal);
    let acompanamiento = null;
    try { acompanamiento = repartirPistas(partitura).acompanamiento.pista; } catch { /* sin notas */ }
    otra = guitarras.includes(acompanamiento) ? acompanamiento : guitarras[0] || null;
  }
  guitarrasMastil = [principal, otra].map((pista) => (pista ? notasDeGuitarra(pista, msDeTick) : null));
  prepararMapaMastil();
  dibujarMastil();
}

// Las notas de una pista de guitarra, con lo que hace falta para dibujarlas.
function notasDeGuitarra(pista, msDeTick) {
  const pentagrama = pista.staves[0];
  if (pentagrama.isPercussion || !pentagrama.tuning || !pentagrama.tuning.length) return null;
  const afinacion = pentagrama.tuning.slice();               // de la más aguda a la más grave
  const cuerdas = afinacion.length;
  const eventos = [];
  for (const compas of pentagrama.bars) {
    for (const voz of compas.voices) {
      for (const pulso of voz.beats) {
        if (pulso.isRest || pulso.notes.length === 0) continue;
        const inicio = msDeTick(pulso.absolutePlaybackStart);
        const fin = msDeTick(pulso.absolutePlaybackStart + pulso.playbackDuration);
        const notas = pulso.notes
          .filter((nota) => nota.string >= 1 && nota.string <= cuerdas)
          .map((nota) => ({
            fila: cuerdas - nota.string,                         // 0 = la cuerda de arriba (la más aguda)
            numero: cuerdas + 1 - nota.string,                   // 1ª ... 6ª, como dicen los guitarristas
            traste: nota.fret,
            altura: afinacion[cuerdas - nota.string] + nota.fret,
            continua: nota.isTieDestination,                     // ligadura: no se vuelve a pulsar
            muerta: nota.isDead,
            armonico: !!nota.harmonicType,
            vibrato: !!(nota.vibrato || pulso.vibrato),
            tapping: !!(pulso.tap || nota.isLeftHandTapped),
            estirada: nota.hasBend && nota.bendPoints.length
              ? nota.bendPoints.map((p) => ({ t: p.offset / 60, semitonos: p.value / 2 }))
              : null,
            slide: datosDeSlide(nota),
            ligadoA: nota.isHammerPullOrigin && nota.hammerPullDestination
              ? { traste: nota.hammerPullDestination.fret }
              : null,
          }));
        if (notas.length) eventos.push({ inicio, fin, notas });
      }
    }
  }
  eventos.sort((a, b) => a.inicio - b.inicio);
  return { nombre: pista.name, afinacion, cuerdas, eventos };
}

// Slide: a qué traste llega la nota (el de la nota siguiente, o 3 trastes
// para arriba o abajo si "sale" de la nota). null si no tiene.
function datosDeSlide(nota) {
  const tipo = nota.slideOutType;
  if (!tipo) return null;
  if ((tipo === 1 || tipo === 2) && nota.slideTarget) return { hasta: nota.slideTarget.fret };
  if (tipo === 3 || tipo === 6) return { hasta: nota.fret + 3 };
  if (tipo === 4 || tipo === 5) return { hasta: Math.max(0, nota.fret - 3) };
  return null;
}

// La sincronización cambió (o se cargó la partitura): ms del mp3 -> ms de la partitura.
function prepararMapaMastil() {
  mapaMastil = tiemposPartitura.length >= 2 ? crearMapaPartituraMp3(syncTabs, tiemposPartitura) : null;
  pedirCuadro();
}

// Lo que se escucha ahora, en ms de la partitura.
function msPartituraAhora() {
  return mapaMastil ? mapaMastil.aPartitura(msQueSuena()) : 0;
}

// Eventos que empiezan antes de "hasta" y terminan después de "desde"
// (búsqueda binaria, y unos anteriores por si hay notas largas).
function eventosEn(guitarra, desde, hasta = desde) {
  if (!guitarra) return [];
  const eventos = guitarra.eventos;
  let bajo = 0, alto = eventos.length - 1, k = -1;
  while (bajo <= alto) {
    const medio = (bajo + alto) >> 1;
    if (eventos[medio].inicio <= hasta) { k = medio; bajo = medio + 1; } else alto = medio - 1;
  }
  const resultado = [];
  for (let i = k; i >= 0 && i > k - 32; i--) if (eventos[i].fin > desde) resultado.push(eventos[i]);
  return resultado.reverse();
}

/* ------------------------------------------------------------------
   Medidas. Todo se piensa en "horizontal": a lo largo del mástil = x,
   a lo ancho = y. En vertical se gira el dibujo 90° (clavijero arriba).
   ------------------------------------------------------------------ */

let medidasMastil = null;
let lienzo = null, contexto2d = null;
let imagenDiapason = null;        // los 22 trastes de madera (se corre como una cinta)
let imagenMarco = null;           // clavijero, cejuela y cuerpo con el micrófono (fijos)
let primerTrasteVisible = 0;      // el que se pide (entero)
let desplazamientoActual = 0;     // el que se dibuja (se acerca de a poco: movimiento suave)
let ultimoCuadro = 0;
let cuadroPedido = false;

function calcularMedidas() {
  const vertical = orientacionMastil === "vertical";
  const anchoCss = contenedorMastil.clientWidth || 340;
  const altoCss = contenedorMastil.clientHeight || (vertical ? 500 : 128);
  const largo = vertical ? altoCss : anchoCss;       // a lo largo del mástil
  const ancho = vertical ? anchoCss : altoCss;       // a lo ancho
  const clavijero = Math.round(Math.min(34, Math.max(22, largo * 0.07)));
  const aire = 22;
  const cuerpo = Math.round(Math.min(84, Math.max(48, largo * 0.15)));
  const zona = Math.max(80, largo - clavijero - aire - cuerpo);
  const minimo = vertical ? 46 : 40;
  const trastesVisibles = Math.max(4, Math.min(TRASTES_TOTALES, Math.floor(zona / minimo)));
  const numeros = 16;                                // la fila de los números de traste
  const filete = 3;
  const arriba = 6, abajo = ancho - numeros;         // el diapasón, a lo ancho
  const cuerdas = (guitarrasMastil.find(Boolean) || { cuerdas: 6 }).cuerdas;
  const entreCuerdas = (abajo - arriba - 2 * filete) / cuerdas;
  return {
    vertical, anchoCss, altoCss, largo, ancho, clavijero, aire, cuerpo, zona, trastesVisibles,
    anchoTraste: zona / trastesVisibles, numeros, filete, arriba, abajo, cuerdas, entreCuerdas,
    xCejuela: clavijero + aire, xFinZona: clavijero + aire + zona, xMicrofono: largo - cuerpo * 0.45,
    radio: Math.max(6.5, Math.min(13, entreCuerdas * 0.46)),
    escala: window.devicePixelRatio || 1,
  };
}

const yDeCuerda = (m, fila) => m.arriba + m.filete + m.entreCuerdas * (fila + 0.5);
// Centro del traste n en la pantalla, según cuánto está corrido el mástil (traste 0 = al aire).
const xDeTraste = (m, traste) => (traste <= 0
  ? m.clavijero + m.aire / 2
  : m.xCejuela + (traste - 0.5 - desplazamientoActual) * m.anchoTraste);

/* ------------------------------------------------------------------
   Lo que no cambia: madera, trastes, incrustaciones, clavijero, cuerpo
   ------------------------------------------------------------------ */

// Números pseudoaleatorios repetibles (la veta sale igual cada vez).
function azarFijo(semilla) {
  let s = semilla;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function crearLienzo(ancho, alto, escala) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(ancho * escala);
  c.height = Math.ceil(alto * escala);
  const g = c.getContext("2d");
  g.scale(escala, escala);
  return [c, g];
}

// El diapasón entero (22 trastes): palisandro con veta, incrustaciones, trastes y filete.
function dibujarDiapason(m) {
  const largo = TRASTES_TOTALES * m.anchoTraste;
  const [c, g] = crearLienzo(largo, m.ancho, m.escala);
  const alto = m.abajo - m.arriba;
  // Palisandro: marrón oscuro, un poco más claro en el medio
  const madera = g.createLinearGradient(0, m.arriba, 0, m.abajo);
  madera.addColorStop(0, "#2a1810");
  madera.addColorStop(0.5, "#3d2417");
  madera.addColorStop(1, "#24140c");
  g.fillStyle = madera;
  g.fillRect(0, m.arriba, largo, alto);
  // Veta: líneas finas a lo largo, un poco onduladas
  const azar = azarFijo(7);
  for (let i = 0; i < 70; i++) {
    const y = m.arriba + azar() * alto;
    g.strokeStyle = azar() < 0.5 ? `rgba(20,10,5,${0.25 + azar() * 0.35})` : `rgba(120,70,40,${0.08 + azar() * 0.12})`;
    g.lineWidth = 0.4 + azar() * 1.2;
    g.beginPath();
    g.moveTo(0, y);
    const onda = 1 + azar() * 2.5, paso = 30 + azar() * 60, fase = azar() * 6;
    for (let x = 0; x <= largo; x += 12) g.lineTo(x, y + Math.sin(x / paso + fase) * onda);
    g.stroke();
  }
  // Incrustaciones trapezoidales color perla
  for (const traste of INCRUSTACIONES) {
    const centro = (traste - 0.5) * m.anchoTraste;
    const anchoArriba = m.anchoTraste * 0.42, anchoAbajo = m.anchoTraste * 0.3;
    const y0 = m.arriba + alto * 0.16, y1 = m.abajo - alto * 0.16;
    const perla = g.createLinearGradient(centro - anchoArriba, y0, centro + anchoArriba, y1);
    perla.addColorStop(0, "#f4efe3");
    perla.addColorStop(0.35, "#d9e2e4");
    perla.addColorStop(0.6, "#efe6d6");
    perla.addColorStop(1, "#c9d3d6");
    g.fillStyle = perla;
    g.beginPath();
    g.moveTo(centro - anchoArriba / 2, y0);
    g.lineTo(centro + anchoArriba / 2, y0);
    g.lineTo(centro + anchoAbajo / 2, y1);
    g.lineTo(centro - anchoAbajo / 2, y1);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(80,60,40,0.5)";
    g.lineWidth = 0.6;
    g.stroke();
  }
  // Trastes de níquel: una franja con brillo en el centro
  for (let traste = 1; traste <= TRASTES_TOTALES; traste++) {
    const x = traste * m.anchoTraste;
    const niquel = g.createLinearGradient(x - 1.6, 0, x + 1.6, 0);
    niquel.addColorStop(0, "#6f7377");
    niquel.addColorStop(0.5, "#eef1f2");
    niquel.addColorStop(1, "#7d8286");
    g.fillStyle = niquel;
    g.fillRect(x - 1.6, m.arriba, 3.2, alto);
  }
  // Filete crema en los dos bordes
  g.fillStyle = "#efe2c0";
  g.fillRect(0, m.arriba, largo, m.filete);
  g.fillRect(0, m.abajo - m.filete, largo, m.filete);
  return c;
}

// Lo fijo de los extremos: clavijero con sus clavijas, cejuela, y la franja
// del cuerpo cherry sunburst flameado con el humbucker.
function dibujarMarco(m) {
  const [c, g] = crearLienzo(m.largo, m.ancho, m.escala);
  // Clavijero negro
  const clavijero = g.createLinearGradient(0, 0, m.clavijero, 0);
  clavijero.addColorStop(0, "#050505");
  clavijero.addColorStop(1, "#1c1c1c");
  g.fillStyle = clavijero;
  redondeado(g, 0, m.arriba - 4, m.clavijero + 4, m.abajo - m.arriba + 8, 4);
  g.fill();
  // Columna de las cuerdas al aire, entre el clavijero y la cejuela (madera)
  g.fillStyle = "#2a1810";
  g.fillRect(m.clavijero, m.arriba, m.aire, m.abajo - m.arriba);
  // Cejuela (hueso, color crema)
  g.fillStyle = "#e9dfc6";
  g.fillRect(m.xCejuela - 4, m.arriba, 4, m.abajo - m.arriba);

  // Cuerpo: cherry sunburst (rojo oscuro en los bordes, ámbar en el centro) con flama
  const x0 = m.xFinZona;
  const medio = (m.arriba + m.abajo) / 2;
  const cuerpo = g.createRadialGradient(x0 + m.cuerpo * 0.55, medio, 4, x0 + m.cuerpo * 0.55, medio, Math.max(m.cuerpo, m.ancho));
  cuerpo.addColorStop(0, "#f2b13a");
  cuerpo.addColorStop(0.35, "#d8661b");
  cuerpo.addColorStop(0.7, "#8e1414");
  cuerpo.addColorStop(1, "#3a0505");
  g.fillStyle = cuerpo;
  g.fillRect(x0, 0, m.cuerpo, m.ancho);
  // Flama del arce: franjas onduladas claras y oscuras a lo ancho
  const azar = azarFijo(19);
  for (let i = 0; i < 26; i++) {
    const x = x0 + azar() * m.cuerpo;
    g.strokeStyle = azar() < 0.5 ? "rgba(255,220,150,0.16)" : "rgba(60,0,0,0.16)";
    g.lineWidth = 1 + azar() * 3;
    g.beginPath();
    g.moveTo(x, 0);
    for (let y = 0; y <= m.ancho; y += 8) g.lineTo(x + Math.sin(y / 9 + i) * 3, y);
    g.stroke();
  }
  // El final del diapasón (con su filete) sobre el cuerpo
  g.fillStyle = "#efe2c0";
  g.fillRect(x0, m.arriba, 2, m.abajo - m.arriba);

  // Humbucker: marco crema, dos bobinas negras con un tornillo por cuerda
  const largoMic = Math.min(m.cuerpo * 0.62, 46);
  const xm = m.xMicrofono - largoMic / 2;
  const ym = m.arriba + 1, altoMic = m.abajo - m.arriba - 2;
  g.fillStyle = "#e9dfc6";
  redondeado(g, xm - 3, ym - 3, largoMic + 6, altoMic + 6, 4);
  g.fill();
  for (let bobina = 0; bobina < 2; bobina++) {
    const xb = xm + bobina * largoMic / 2 + 1.5;
    g.fillStyle = "#121212";
    redondeado(g, xb, ym, largoMic / 2 - 3, altoMic, 3);
    g.fill();
    for (let fila = 0; fila < m.cuerdas; fila++) {
      g.fillStyle = bobina ? "#9aa0a6" : "#c8cdd2";
      g.beginPath();
      g.arc(xb + (largoMic / 2 - 3) / 2, yDeCuerda(m, fila), Math.min(2.6, m.entreCuerdas * 0.18), 0, Math.PI * 2);
      g.fill();
    }
  }
  // Clavijas: botones nacarados arriba y abajo del clavijero
  g.fillStyle = "#e8e2d2";
  for (let i = 0; i < 3; i++) {
    const x = 6 + i * (m.clavijero - 10) / 2;
    g.beginPath(); g.arc(x, m.arriba - 1, 2.6, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x, m.abajo + 1, 2.6, 0, Math.PI * 2); g.fill();
  }
  return c;
}

// Rectángulo con las puntas redondeadas.
function redondeado(g, x, y, ancho, alto, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + ancho, y, x + ancho, y + alto, r);
  g.arcTo(x + ancho, y + alto, x, y + alto, r);
  g.arcTo(x, y + alto, x, y, r);
  g.arcTo(x, y, x + ancho, y, r);
  g.closePath();
}

// Gira una imagen 90° (para el mástil parado: lo que era "a lo largo" queda hacia abajo).
function girarImagen(imagen, m) {
  const c = document.createElement("canvas");
  c.width = imagen.height;
  c.height = imagen.width;
  const g = c.getContext("2d");
  g.translate(c.width, 0);
  g.rotate(Math.PI / 2);
  g.drawImage(imagen, 0, 0);
  return c;
}

/* ------------------------------------------------------------------
   Armar el lienzo (al cargar, al cambiar de tamaño o de orientación)
   ------------------------------------------------------------------ */

function dibujarMastil() {
  const hay = guitarrasMastil.some(Boolean);
  contenedorMastil.hidden = !hay;
  vistaTabs.classList.toggle("mastil-vertical", hay && orientacionMastil === "vertical");
  if (!hay) return;
  if (!lienzo) {
    lienzo = document.createElement("canvas");
    lienzo.className = "lienzo-mastil";
    lienzo.setAttribute("aria-hidden", "true");
    contenedorMastil.replaceChildren(lienzo);
    contexto2d = lienzo.getContext("2d");
  }
  // El lienzo se achica primero para que el contenedor tome el tamaño que le da la página.
  lienzo.style.width = "0px";
  lienzo.style.height = "0px";
  const m = calcularMedidas();
  medidasMastil = m;
  lienzo.width = Math.round(m.anchoCss * m.escala);
  lienzo.height = Math.round(m.altoCss * m.escala);
  lienzo.style.width = m.anchoCss + "px";
  lienzo.style.height = m.altoCss + "px";
  // En vertical, las imágenes fijas se guardan ya giradas: copiarlas en cada
  // cuadro sin rotación es mucho más liviano (sobre todo sin aceleración gráfica).
  imagenDiapason = m.vertical ? girarImagen(dibujarDiapason(m), m) : dibujarDiapason(m);
  imagenMarco = m.vertical ? girarImagen(dibujarMarco(m), m) : dibujarMarco(m);
  primerTrasteVisible = Math.max(0, Math.min(primerTrasteVisible, TRASTES_TOTALES - m.trastesVisibles));
  desplazamientoActual = primerTrasteVisible;
  contenedorMastil.dataset.orientacion = orientacionMastil;
  contenedorMastil.dataset.trastesVisibles = m.trastesVisibles;
  pedirCuadro();
}

// Si cambia el tamaño (girar el celular, cambiar la orientación del mástil), se vuelve a armar.
new ResizeObserver(() => {
  if (!medidasMastil || !guitarrasMastil.some(Boolean) || contenedorMastil.hidden || vistaTabs.hidden) return;
  const ancho = contenedorMastil.clientWidth, alto = contenedorMastil.clientHeight;
  if (!ancho || !alto) return;   // la vista está oculta
  if (Math.abs(ancho - medidasMastil.anchoCss) > 1 || Math.abs(alto - medidasMastil.altoCss) > 1) dibujarMastil();
}).observe(contenedorMastil);

/* ------------------------------------------------------------------
   Cada cuadro
   ------------------------------------------------------------------ */

// Lo llama actualizarTabs (tablaturas.js) en cada cuadro mientras suena y al saltar.
function actualizarMastil() {
  pedirCuadro();
}

function pedirCuadro() {
  if (cuadroPedido || !medidasMastil || contenedorMastil.hidden || vistaTabs.hidden) return;
  cuadroPedido = true;
  requestAnimationFrame(dibujarCuadro);
}

// Dónde está el dedo (con slide) y cuánto está estirada la cuerda, en el momento t.
function estadoDeNota(nota, evento, t) {
  const duracion = Math.max(1, evento.fin - evento.inicio);
  const avance = Math.max(0, Math.min(1, (t - evento.inicio) / duracion));
  let traste = nota.traste;
  if (nota.slide) traste = nota.traste + (nota.slide.hasta - nota.traste) * Math.max(0, (avance - 0.25) / 0.75);
  let semitonos = 0;
  if (nota.estirada) {
    const puntos = nota.estirada;
    let k = 0;
    while (k + 1 < puntos.length && puntos[k + 1].t <= avance) k++;
    const a = puntos[k], b = puntos[Math.min(k + 1, puntos.length - 1)];
    semitonos = b.t === a.t ? a.semitonos : a.semitonos + (b.semitonos - a.semitonos) * (avance - a.t) / (b.t - a.t);
  }
  return { traste, semitonos, avance };
}

// Hacia dónde se empuja la cuerda al estirarla: las agudas hacia las graves y al revés.
const sentidoEstirada = (m, fila) => (fila < m.cuerdas / 2 ? 1 : -1);
const corrimientoEstirada = (m, fila, semitonos) => sentidoEstirada(m, fila) * Math.min(m.entreCuerdas * 1.15, semitonos * m.entreCuerdas * 0.38);

// "½", "full", "1½"... (de semitonos a como se escribe en las tablaturas)
function textoEstirada(semitonos) {
  const tonos = semitonos / 2;
  if (Math.abs(tonos - 1) < 0.01) return "full";
  const entero = Math.floor(tonos + 0.001), resto = tonos - entero;
  const fraccion = Math.abs(resto - 0.5) < 0.01 ? "½" : Math.abs(resto - 0.25) < 0.01 ? "¼" : Math.abs(resto - 0.75) < 0.01 ? "¾" : "";
  return ((entero ? String(entero) : "") + fraccion) || String(tonos);
}

function dibujarCuadro(marca) {
  cuadroPedido = false;
  const m = medidasMastil;
  if (!m || contenedorMastil.hidden || !contexto2d) return;
  const dt = ultimoCuadro ? Math.min(0.1, (marca - ultimoCuadro) / 1000) : 0;
  ultimoCuadro = marca;
  const t = msPartituraAhora();
  const g = contexto2d;
  const [principal, otra] = guitarrasMastil;
  const otraVisible = mostrarOtraGuitarra ? otra : null;

  // Qué suena ahora y qué viene
  const suenan = (guitarra) => eventosEn(guitarra, t).filter((e) => e.inicio <= t && e.fin > t);
  const ahoraPrincipal = suenan(principal), ahoraOtra = suenan(otraVisible);
  const proximasPrincipal = eventosEn(principal, t, t + ANTICIPO_MS).filter((e) => e.inicio > t);

  // Tramo visible (y su movimiento suave)
  moverVentana(m, ahoraPrincipal.length ? ahoraPrincipal : ahoraOtra, t);
  let animando = false;
  if (Math.abs(desplazamientoActual - primerTrasteVisible) > 0.01) {
    desplazamientoActual = efectosReducidos || !dt ? primerTrasteVisible
      : desplazamientoActual + (primerTrasteVisible - desplazamientoActual) * Math.min(1, dt * 9);
    animando = true;
  } else {
    desplazamientoActual = primerTrasteVisible;
  }

  // Madera (la cinta de 22 trastes, corrida) y el marco fijo: imágenes ya
  // armadas (y ya giradas si el mástil está parado), copiadas sin rotar.
  g.setTransform(m.escala, 0, 0, m.escala, 0, 0);
  g.clearRect(0, 0, m.anchoCss, m.altoCss);
  const corrida = m.xCejuela - desplazamientoActual * m.anchoTraste;
  g.save();
  g.beginPath();
  if (m.vertical) g.rect(0, m.xCejuela, m.anchoCss, m.zona); else g.rect(m.xCejuela, 0, m.zona, m.ancho);
  g.clip();
  if (m.vertical) g.drawImage(imagenDiapason, 0, corrida, imagenDiapason.width / m.escala, imagenDiapason.height / m.escala);
  else g.drawImage(imagenDiapason, corrida, 0, imagenDiapason.width / m.escala, imagenDiapason.height / m.escala);
  g.restore();
  g.drawImage(imagenMarco, 0, 0, m.anchoCss, m.altoCss);

  // El resto se dibuja en "horizontal"; en vertical se gira 90° (el clavijero queda arriba).
  if (m.vertical) { g.translate(m.anchoCss, 0); g.rotate(Math.PI / 2); }

  // Números de traste (derechos aunque el mástil esté parado) y nombres de las cuerdas
  g.font = "600 10px system-ui, sans-serif";
  g.fillStyle = "#9aa4ae";
  for (let traste = Math.max(1, Math.floor(desplazamientoActual)); traste <= Math.min(TRASTES_TOTALES, Math.ceil(desplazamientoActual) + m.trastesVisibles); traste++) {
    const x = xDeTraste(m, traste);
    if (x > m.xCejuela + 4 && x < m.xFinZona - 4) textoDerecho(g, m, String(traste), x, m.ancho - m.numeros / 2);
  }
  textoDerecho(g, m, "0", xDeTraste(m, 0), m.ancho - m.numeros / 2);
  const deReferencia = principal || otra;
  const nombres = nombresDeNotas(tonalidadOriginal);
  g.fillStyle = "#d8d2c4";
  for (let fila = 0; fila < m.cuerdas; fila++) {
    textoDerecho(g, m, nombres[deReferencia.afinacion[fila] % 12], m.clavijero / 2 + 1, yDeCuerda(m, fila));
  }

  // Cuerdas: quietas en metal; las que suenan, encendidas del dedo al micrófono y vibrando
  const activas = new Map();   // fila -> { nota, evento, tenue }
  for (const [eventos, tenue] of [[ahoraOtra, true], [ahoraPrincipal, false]]) {
    for (const evento of eventos) {
      for (const nota of evento.notas) {
        if (!nota.muerta && (!activas.has(nota.fila) || !tenue)) activas.set(nota.fila, { nota, evento, tenue });
      }
    }
  }
  for (let fila = 0; fila < m.cuerdas; fila++) {
    if (dibujarCuerda(g, m, fila, activas.get(fila), t)) animando = true;
  }

  // Notas: las de la otra guitarra (tenues), las que vienen y las de la principal
  for (const evento of ahoraOtra) for (const nota of evento.notas) dibujarNota(g, m, nota, evento, t, true, new Set());
  for (const evento of proximasPrincipal) for (const nota of evento.notas) if (!nota.continua) dibujarProxima(g, m, nota, evento, t);
  const tecnicas = new Set();
  for (const evento of ahoraPrincipal) {
    for (const nota of evento.notas) if (dibujarNota(g, m, nota, evento, t, false, tecnicas)) animando = true;
  }

  // Lo que se ve, para las pruebas
  const describir = (eventos) => eventos.flatMap((e) => e.notas.map((n) => `${n.numero}ª/${n.traste}`)).join(" ");
  contenedorMastil.dataset.sonando = describir(ahoraPrincipal);
  contenedorMastil.dataset.otra = describir(ahoraOtra);
  contenedorMastil.dataset.proximas = describir(proximasPrincipal);
  contenedorMastil.dataset.tecnicas = [...tecnicas].join(" ");
  contenedorMastil.dataset.tramo = `${primerTrasteVisible + 1}-${primerTrasteVisible + m.trastesVisibles}`;

  // Sigue mientras suena, o mientras queda algo moviéndose (vibración, el corrimiento del mástil)
  if (!audio.paused || (animando && !efectosReducidos)) pedirCuadro();
}

// Escribe un texto derecho: en vertical se contrarresta el giro del dibujo.
function textoDerecho(g, m, texto, x, y) {
  g.save();
  g.translate(x, y);
  if (m.vertical) g.rotate(-Math.PI / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(texto, 0, 0.5);
  g.restore();
}

// Mueve el tramo visible para que entren las notas que suenan (y, si se puede, las que vienen).
function moverVentana(m, ahora, t) {
  const pisados = ahora.flatMap((e) => e.notas.map((n) => Math.max(n.traste, n.slide ? n.slide.hasta : 0))).filter((x) => x > 0);
  const proximos = eventosEn(guitarrasMastil[0], t, t + ESPERA_VENTANA_MS).filter((e) => e.inicio > t)
    .flatMap((e) => e.notas.map((n) => n.traste)).filter((x) => x > 0);
  const base = pisados.length ? pisados : proximos;
  if (!base.length) return;
  const fuera = (lista) => lista.some((x) => x <= primerTrasteVisible || x > primerTrasteVisible + m.trastesVisibles);
  if (!fuera(base)) return;
  let minimo = Math.min(...base), maximo = Math.max(...base);
  const todos = [...base, ...proximos];
  if (Math.max(...todos) - Math.min(...todos) < m.trastesVisibles) {
    minimo = Math.min(...todos);
    maximo = Math.max(...todos);
  }
  let nuevo = Math.max(0, minimo - 2);
  if (maximo > nuevo + m.trastesVisibles) nuevo = maximo - m.trastesVisibles;
  primerTrasteVisible = Math.max(0, Math.min(TRASTES_TOTALES - m.trastesVisibles, nuevo));
}

/**
 * Una cuerda. Si suena, del dedo al micrófono va encendida con su color y
 * vibrando (más al pulsarla, y ondulando si tiene vibrato); si se estira,
 * se curva hacia el costado en el dedo. Devuelve true si se mueve.
 */
function dibujarCuerda(g, m, fila, activa, t) {
  const y = yDeCuerda(m, fila);
  const grosor = 0.8 + fila * 0.32;                         // las graves, más gruesas
  const entorchada = fila >= m.cuerdas / 2;                 // las graves son entorchadas (bronce)
  const quieta = entorchada ? "#a89270" : "#c3c7cb";
  const xInicio = m.clavijero, xFin = m.largo - 6;
  if (!activa) {
    g.strokeStyle = quieta;
    g.lineWidth = grosor;
    g.beginPath(); g.moveTo(xInicio, y); g.lineTo(xFin, y); g.stroke();
    return false;
  }
  const { nota, evento, tenue } = activa;
  const estado = estadoDeNota(nota, evento, t);
  const xNota = xDeTraste(m, estado.traste);
  const xDedo = estado.traste > 0 ? Math.max(m.xCejuela, Math.min(m.xFinZona, xNota + m.anchoTraste * 0.35)) : m.xCejuela;
  const yDedo = y + corrimientoEstirada(m, fila, estado.semitonos);
  const color = colorDeCuerda(nota.numero);
  // Del clavijero al dedo: metal (curvado si hay estirada)
  g.strokeStyle = quieta;
  g.lineWidth = grosor;
  g.beginPath(); g.moveTo(xInicio, y); g.lineTo(xDedo, yDedo); g.stroke();
  // Del dedo al micrófono: encendida y vibrando
  const desdeAtaque = nota.continua ? 1e9 : t - evento.inicio;
  const amplitud = efectosReducidos ? 0 : (tenue ? 1 : 2.4) * Math.exp(-Math.max(0, desdeAtaque) / 380);
  const vibrato = nota.vibrato && !efectosReducidos ? t : null;
  const fase = t / 1000 * 2 * Math.PI * 9;
  if (!efectosReducidos) {
    g.strokeStyle = color;
    g.globalAlpha = tenue ? 0.12 : 0.3;
    g.lineWidth = grosor + (tenue ? 3 : 6);
    trazoCuerda(g, xDedo, yDedo, xFin, y, amplitud, fase, vibrato);
  }
  g.globalAlpha = tenue ? 0.5 : 1;
  g.strokeStyle = color;
  g.lineWidth = grosor + (tenue ? 0.3 : 0.8);
  trazoCuerda(g, xDedo, yDedo, xFin, y, amplitud, fase, vibrato);
  g.globalAlpha = 1;
  return amplitud > 0.05 || vibrato !== null || !!nota.estirada || !!nota.slide;
}

// La parte que vibra: una onda estacionaria (y la ondulación del vibrato).
function trazoCuerda(g, x0, y0, x1, y1, amplitud, fase, tiempoVibrato) {
  g.beginPath();
  const pasos = amplitud > 0.05 || tiempoVibrato !== null ? 24 : 1;
  for (let i = 0; i <= pasos; i++) {
    const s = i / pasos;
    const x = x0 + (x1 - x0) * s;
    let y = y0 + (y1 - y0) * s + amplitud * Math.sin(Math.PI * s) * Math.sin(fase);
    if (tiempoVibrato !== null) y += 1.6 * Math.sin(Math.PI * s) * Math.sin(tiempoVibrato / 1000 * 2 * Math.PI * 5.5 + s * 9);
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
}

function colorDeCuerda(numero) {
  return coloresCuerda[numero] || COLORES_ORIGINALES[((numero - 1) % 6) + 1];
}

// ¿Texto oscuro o claro sobre este color? (para que el número se lea bien)
function textoSobre(color) {
  const r = parseInt(color.slice(1, 3), 16), v = parseInt(color.slice(3, 5), 16), a = parseInt(color.slice(5, 7), 16);
  return 0.299 * r + 0.587 * v + 0.114 * a > 150 ? "#0b0d10" : "#ffffff";
}

/**
 * Una nota que suena: el círculo del color de su cuerda con el número de
 * traste (o el nombre), una X (muteada) o un rombo (armónico), y sus
 * técnicas. "tenue" para la otra guitarra. Devuelve true si algo se anima.
 */
function dibujarNota(g, m, nota, evento, t, tenue, tecnicas) {
  const estado = estadoDeNota(nota, evento, t);
  const x = xDeTraste(m, estado.traste);
  if (estado.traste > 0 && (x < m.xCejuela - m.anchoTraste * 0.2 || x > m.xFinZona + m.anchoTraste * 0.2)) return false;
  const yCuerda = yDeCuerda(m, nota.fila);
  const y = yCuerda + corrimientoEstirada(m, nota.fila, estado.semitonos);
  const color = colorDeCuerda(nota.numero);
  const radio = tenue ? m.radio * 0.82 : m.radio;
  const opacidad = tenue ? 0.42 : 1;
  let animada = false;
  g.globalAlpha = opacidad;

  // Slide: la estela desde donde empezó
  if (nota.slide) {
    tecnicas.add("slide");
    if (!efectosReducidos) {
      const xDesde = xDeTraste(m, nota.traste);
      if (Math.abs(x - xDesde) > 1) {
        const estela = g.createLinearGradient(xDesde, y, x, y);
        estela.addColorStop(0, "rgba(255,255,255,0)");
        estela.addColorStop(1, color);
        g.strokeStyle = estela;
        g.lineWidth = radio * 1.2;
        g.lineCap = "round";
        g.beginPath(); g.moveTo(xDesde, y); g.lineTo(x, y); g.stroke();
        g.lineCap = "butt";
      }
      animada = true;
    }
  }

  // Hammer-on / pull-off: un arco hasta la nota siguiente
  if (nota.ligadoA) {
    const sube = nota.ligadoA.traste > nota.traste;
    tecnicas.add(sube ? "hammer" : "pull");
    const xDestino = xDeTraste(m, nota.ligadoA.traste);
    const alto = Math.min(18, m.entreCuerdas * 0.9);
    g.strokeStyle = color;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(x, yCuerda - radio);
    g.quadraticCurveTo((x + xDestino) / 2, yCuerda - radio - alto, xDestino, yCuerda - radio);
    g.stroke();
    g.font = "800 10px system-ui, sans-serif";
    g.fillStyle = color;
    textoDerecho(g, m, sube ? "h" : "p", (x + xDestino) / 2, yCuerda - radio - alto * 0.9);
  }

  // Tapping: un anillo que se abre al golpear
  if (nota.tapping) {
    tecnicas.add("tapping");
    const desde = t - evento.inicio;
    if (desde < 320 && !efectosReducidos) {
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.globalAlpha = opacidad * (1 - desde / 320);
      g.beginPath(); g.arc(x, y, radio + desde / 320 * radio * 1.6, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = opacidad;
      animada = true;
    }
  }

  // Brillo alrededor del punto al pulsar
  if (!tenue && !efectosReducidos && !nota.continua) {
    const desde = t - evento.inicio;
    if (desde < 450) {
      const brillo = g.createRadialGradient(x, y, radio * 0.6, x, y, radio * 2.2);
      brillo.addColorStop(0, color);
      brillo.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = 0.55 * (1 - desde / 450);
      g.fillStyle = brillo;
      g.beginPath(); g.arc(x, y, radio * 2.2, 0, Math.PI * 2); g.fill();
      g.globalAlpha = opacidad;
      animada = true;
    }
  }

  // El punto: X (muteada), rombo (armónico) o círculo, con el número o el nombre
  if (nota.muerta) {
    tecnicas.add("muteada");
    g.strokeStyle = color;
    g.lineWidth = 2.6;
    const r = radio * 0.75;
    g.beginPath();
    g.moveTo(x - r, y - r); g.lineTo(x + r, y + r);
    g.moveTo(x + r, y - r); g.lineTo(x - r, y + r);
    g.stroke();
  } else {
    g.fillStyle = color;
    g.strokeStyle = "#0b0d10";
    g.lineWidth = 1.4;
    g.beginPath();
    if (nota.armonico) {
      tecnicas.add("armonico");
      const r = radio * 1.2;
      g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y);
      g.closePath();
    } else {
      g.arc(x, y, radio, 0, Math.PI * 2);
    }
    g.fill();
    g.stroke();
    const texto = etiquetaMastil === "nota"
      ? nombresDeNotas(tonalidadOriginal)[(nota.altura + Math.round(estado.semitonos)) % 12]
      : String(Math.round(estado.traste));
    g.font = `800 ${Math.round(radio * (texto.length > 1 ? 1.05 : 1.25))}px system-ui, sans-serif`;
    g.fillStyle = textoSobre(color);
    textoDerecho(g, m, texto, x, y);
  }

  // Estirada: un arco desde la cuerda hasta donde llega, con el valor (½, full, 1½)
  if (nota.estirada) {
    const maximo = Math.max(...nota.estirada.map((p) => p.semitonos));
    tecnicas.add("estirada:" + textoEstirada(maximo));
    const sentido = sentidoEstirada(m, nota.fila);
    const yTope = yCuerda + corrimientoEstirada(m, nota.fila, maximo);
    const xa = x + radio + 4;
    g.strokeStyle = "#f2f4f6";
    g.lineWidth = 1.5;
    g.setLineDash([3, 2]);
    g.beginPath();
    g.moveTo(xa, yCuerda);
    g.quadraticCurveTo(xa + 9, yCuerda, xa + 6, yTope);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#f2f4f6";
    g.beginPath();
    g.moveTo(xa + 6, yTope);
    g.lineTo(xa + 3, yTope - sentido * 5);
    g.lineTo(xa + 9, yTope - sentido * 5);
    g.closePath();
    g.fill();
    g.font = "800 10px system-ui, sans-serif";
    textoDerecho(g, m, textoEstirada(maximo), xa + 18, yTope);
    animada = true;
  }
  if (nota.vibrato) { tecnicas.add("vibrato"); animada = true; }
  g.globalAlpha = 1;
  return animada;
}

// Una nota que viene (como en Guitar Hero): tenue, con un anillo que se cierra hasta que suena.
function dibujarProxima(g, m, nota, evento, t) {
  const cerca = 1 - (evento.inicio - t) / ANTICIPO_MS;    // 0 recién aparece, 1 a punto de sonar
  const x = xDeTraste(m, nota.traste);
  if (nota.traste > 0 && (x < m.xCejuela || x > m.xFinZona)) return;
  const y = yDeCuerda(m, nota.fila);
  const color = colorDeCuerda(nota.numero);
  g.globalAlpha = 0.12 + 0.33 * cerca;
  g.fillStyle = color;
  g.beginPath(); g.arc(x, y, m.radio * 0.85, 0, Math.PI * 2); g.fill();
  if (!efectosReducidos) {
    g.strokeStyle = color;
    g.lineWidth = 1.5;
    g.beginPath(); g.arc(x, y, m.radio * (1 + 1.2 * (1 - cerca)), 0, Math.PI * 2); g.stroke();
  }
  g.globalAlpha = 1;
}

/* ------------------------------------------------------------------
   Opciones: orientación (botón en la barra de Tabs) y "Pistas y sync"
   ------------------------------------------------------------------ */

function mostrarOpcionesMastil() {
  const vertical = orientacionMastil === "vertical";
  botonOrientacionMastil.setAttribute("aria-pressed", String(vertical));
  const texto = vertical ? "Mástil acostado (con la tablatura)" : "Mástil parado (para tocar)";
  botonOrientacionMastil.title = texto;
  botonOrientacionMastil.setAttribute("aria-label", texto);
  selectorEtiquetaMastil.value = etiquetaMastil;
  casillaOtraGuitarra.checked = mostrarOtraGuitarra;
  casillaEfectosReducidos.checked = efectosReducidos;
  for (const entrada of entradasColorCuerda) entrada.value = coloresCuerda[Number(entrada.dataset.cuerda)];
}

botonOrientacionMastil.addEventListener("click", () => {
  orientacionMastil = orientacionMastil === "vertical" ? "horizontal" : "vertical";
  guardarPreferencia("mastilOrientacion", orientacionMastil);
  mostrarOpcionesMastil();
  dibujarMastil();
  // La tablatura cambió de tamaño: alphaTab vuelve a armar los renglones.
  if (apiTabs && tabsListas) apiTabs.render();
});

selectorEtiquetaMastil.addEventListener("change", () => {
  etiquetaMastil = selectorEtiquetaMastil.value;
  guardarPreferencia("mastilEtiqueta", etiquetaMastil);
  pedirCuadro();
});

casillaOtraGuitarra.addEventListener("change", () => {
  mostrarOtraGuitarra = casillaOtraGuitarra.checked;
  guardarPreferencia("mastilOtraGuitarra", mostrarOtraGuitarra ? "si" : "no");
  pedirCuadro();
});

casillaEfectosReducidos.addEventListener("change", () => {
  efectosReducidos = casillaEfectosReducidos.checked;
  guardarPreferencia("mastilEfectosReducidos", efectosReducidos ? "si" : "no");
  pedirCuadro();
});

for (const entrada of entradasColorCuerda) {
  entrada.addEventListener("input", () => {
    coloresCuerda[Number(entrada.dataset.cuerda)] = entrada.value;
    guardarPreferencia("mastilColores", JSON.stringify(coloresCuerda));
    pedirCuadro();
  });
}

botonColoresOriginales.addEventListener("click", () => {
  coloresCuerda = { ...COLORES_ORIGINALES };
  guardarPreferencia("mastilColores", JSON.stringify(coloresCuerda));
  mostrarOpcionesMastil();
  pedirCuadro();
});

mostrarOpcionesMastil();
