"use strict";

/* ==================================================================
   Mástil virtual (vista Tabs): una Les Paul que toca sola

   Un mástil como el de una Les Paul (Eko LS-300): diapasón de palisandro
   con veta, trastes de níquel con la separación real (cada vez más juntos
   hacia el cuerpo), incrustaciones trapezoidales nacaradas, filete crema,
   cejuela de hueso y, al pie, un poco del cuerpo cherry sunburst con un
   humbucker chico (donde se pulsa la cuerda).

   Dos modos (botón en la barra de Tabs, se recuerda):
     - acostado: debajo de la tablatura, para leerla;
     - parado (pantalla completa): sin la tablatura, el mástil ocupa toda
       la vista para tocar siguiendo las notas. Con el celular vertical se
       dibuja parado (clavijero arriba); acostado, a lo largo de la pantalla.
   Si entra completo (en la compu) se ve entero; si no, el tramo visible
   sigue a las notas, suave y anticipándose a las que vienen.

   Qué guitarra se ve (se combinan las dos en una):
     - si la Guitarra 1 toca (punteo o acordes), solo la Guitarra 1;
     - si la Guitarra 1 no toca, los acordes de la Guitarra 2 (normales o
       tenues, según la opción).

   Las cuerdas que no suenan, grises; las que suenan se encienden con su
   color (configurable) desde el dedo hasta el micrófono y vibran. Cada nota
   es un círculo del color de su cuerda con el número de traste (o el nombre
   de la nota). Como en Guitar Hero, las que vienen se ven tenues un instante
   antes. Técnicas leídas nota por nota del .gp:
     - estirada (bend): la cuerda se curva hacia el costado según cuánto
       sube (½, full, 1½), con un arco y el valor; también la bajada
       (release) y las pre-estiradas, siguiendo los puntos del .gp;
     - vibrato: la cuerda ondula; tapping: un anillo que se abre;
     - hammer-on y pull-off: un arco entre las dos notas;
     - slide: el punto se desliza hasta el traste de llegada, con estela;
     - nota muteada: una X; armónico: un rombo.

   Rendimiento: se dibuja en un <canvas>. La madera y los extremos se
   dibujan una sola vez en imágenes aparte (ya giradas si el mástil está
   parado); en cada cuadro solo se copian y se dibujan los trastes, las
   incrustaciones, las cuerdas y las notas. Con "efectos reducidos" no hay
   brillo, vibración ni estelas.

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
const selectorAcordesOtra = document.getElementById("mastil-acordes-otra");
const casillaEfectosReducidos = document.getElementById("mastil-efectos-reducidos");
const entradasColorCuerda = [...document.querySelectorAll(".color-cuerda")];
const botonColoresOriginales = document.getElementById("colores-originales");

const TRASTES_TOTALES = 22;                          // una Les Paul tiene 22
const INCRUSTACIONES = [3, 5, 7, 9, 12, 15, 17, 19, 21];
// Colores de las cuerdas, de la 6ª (la más grave) a la 1ª
const COLORES_ORIGINALES = { 6: "#ef4444", 5: "#facc15", 4: "#3b82f6", 3: "#f97316", 2: "#22c55e", 1: "#a855f7" };
const CUERDA_APAGADA = "#5c6268";                    // las que no suenan, en gris
const ANTICIPO_MS = 650;          // cuánto antes de sonar aparece tenue una nota
const ESPERA_VENTANA_MS = 4000;   // para mover el mástil se miran también las notas de los próximos ~2 compases
const OPACIDAD_TENUE = 0.45;

/* ------------------------------------------------------------------
   Preferencias (en este dispositivo)
   ------------------------------------------------------------------ */

let orientacionMastil = "horizontal";   // "horizontal" (acostado, con la tablatura) | "vertical" (parado, pantalla completa)
let etiquetaMastil = "traste";          // "traste" | "nota"
let acordesOtra = "normal";             // "normal" | "tenue": cómo se ven los acordes de la Guitarra 2
let efectosReducidos = false;
let coloresCuerda = { ...COLORES_ORIGINALES };
try {
  if (localStorage.getItem("mastilOrientacion") === "vertical") orientacionMastil = "vertical";
  if (localStorage.getItem("mastilEtiqueta") === "nota") etiquetaMastil = "nota";
  if (localStorage.getItem("mastilAcordesOtra") === "tenue") acordesOtra = "tenue";
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

// [Guitarra 1, Guitarra 2] = { nombre, afinacion, cuerdas, eventos: [{ inicio, fin (ms de la partitura), notas }] }
let guitarrasMastil = [null, null];
let mapaMastil = null;            // ms del mp3 -> ms de la partitura (con la sincronización)

/**
 * Prepara las notas al cargar la partitura (y al cambiar las pistas).
 * La Guitarra 2 es la elegida en "Pistas y sync" o, si ahí se dejó solo la
 * 1, otra guitarra de la canción (la de acompañamiento, si la hay).
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

/**
 * Qué se ve en el momento t: { eventos, proximas, opacidad, guitarra }.
 * Manda la Guitarra 1: si toca (o tocó hace un instante, o va a tocar en
 * un instante: los silencios cortos de un punteo no cuentan), se ve solo
 * ella. Si no toca, se ven los acordes de la Guitarra 2.
 */
function queMostrar(t) {
  const [g1, g2] = guitarrasMastil;
  const suenan = (g) => eventosEn(g, t).filter((e) => e.inicio <= t && e.fin > t);
  const vienen = (g) => eventosEn(g, t, t + ANTICIPO_MS).filter((e) => e.inicio > t);
  const activa1 = eventosEn(g1, t - 400, t + 250).length > 0;
  if (activa1 || !g2) return { eventos: suenan(g1), proximas: vienen(g1), opacidad: 1, guitarra: 1 };
  return { eventos: suenan(g2), proximas: vienen(g2), opacidad: acordesOtra === "tenue" ? OPACIDAD_TENUE : 1, guitarra: 2 };
}

/* ------------------------------------------------------------------
   Medidas. Todo se piensa en "horizontal": a lo largo del mástil = x,
   a lo ancho = y. Si el mástil se dibuja parado, se gira 90°.
   ------------------------------------------------------------------ */

let medidasMastil = null;
let lienzo = null, contexto2d = null;
let imagenMadera = null;          // el palisandro con su veta y el filete (fijo)
let imagenMarco = null;           // clavijero, cejuela y cuerpo con el micrófono (fijos)
let primerTrasteVisible = 0;      // el que se pide (entero)
let desplazamientoActual = 0;     // el que se dibuja (se acerca de a poco: movimiento suave)
let ultimoCuadro = 0;
let cuadroPedido = false;

// Distancia real de la cejuela al traste n, como fracción del largo de la
// cuerda (cada traste achica la cuerda un 5,6 %: los trastes se juntan).
const distanciaReal = (n) => 1 - Math.pow(2, -n / 12);

/**
 * Cuántos trastes entran a la vista: los más posibles con el traste más
 * angosto (el último del tramo, con la separación real) de al menos
 * "minimo" px. Si entran los 22, se ve el mástil entero y no se corre.
 */
function trastesQueEntran(zona, minimo) {
  for (let k = TRASTES_TOTALES; k >= 4; k--) {
    const angosto = (distanciaReal(k) - distanciaReal(k - 1)) / distanciaReal(k) * zona;
    if (angosto >= minimo) return k;
  }
  return 4;
}

function calcularMedidas() {
  const anchoCss = contenedorMastil.clientWidth || 340;
  const altoCss = contenedorMastil.clientHeight || 150;
  // Parado se dibuja a lo largo del lado más largo de la pantalla.
  const vertical = orientacionMastil === "vertical" && altoCss > anchoCss;
  const largo = vertical ? altoCss : anchoCss;       // a lo largo del mástil
  const ancho = vertical ? anchoCss : altoCss;       // a lo ancho
  const clavijero = 28;
  const aire = 24;
  const cuerpo = orientacionMastil === "vertical" ? 30 : Math.round(Math.min(52, Math.max(34, largo * 0.07)));
  const zona = Math.max(80, largo - clavijero - aire - cuerpo);
  // Parado entran al menos 12 en un celular (los trastes son anchos a lo ancho del mástil).
  const trastesVisibles = trastesQueEntran(zona, vertical ? 25 : 26);
  const numeros = 17;                                // la fila de los números de traste
  const filete = 3;
  const arriba = 8, abajo = ancho - numeros;         // el diapasón, a lo ancho
  const cuerdas = (guitarrasMastil.find(Boolean) || { cuerdas: 6 }).cuerdas;
  const entreCuerdas = (abajo - arriba - 2 * filete) / cuerdas;
  return {
    vertical, anchoCss, altoCss, largo, ancho, clavijero, aire, cuerpo, zona, trastesVisibles,
    numeros, filete, arriba, abajo, cuerdas, entreCuerdas,
    xCejuela: clavijero + aire, xFinZona: clavijero + aire + zona, xMicrofono: largo - cuerpo / 2,
    // Parado, el círculo no puede pasar del ancho del traste más angosto.
    radio: Math.max(8, Math.min(vertical ? 13 : 15, entreCuerdas * 0.5)),
    escala: window.devicePixelRatio || 1,
  };
}

const yDeCuerda = (m, fila) => m.arriba + m.filete + m.entreCuerdas * (fila + 0.5);

// Dónde está el alambre del traste n (puede ser fraccionario) con el tramo
// visible que empieza en "desplazamientoActual": el tramo ocupa toda la zona.
function xDeLinea(m, n) {
  const a = distanciaReal(desplazamientoActual), b = distanciaReal(desplazamientoActual + m.trastesVisibles);
  return m.xCejuela + (distanciaReal(n) - a) / (b - a) * m.zona;
}

// Dónde va el dedo en el traste n (un poco más cerca del alambre que del anterior); 0 = al aire.
const xDeTraste = (m, traste) => (traste <= 0 ? m.clavijero + m.aire / 2 : xDeLinea(m, traste - 0.45));

/* ------------------------------------------------------------------
   Lo que no cambia: la madera, el clavijero, la cejuela, el cuerpo
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

// El palisandro (con veta) y el filete crema, del tamaño de la zona de trastes.
function dibujarMadera(m) {
  const [c, g] = crearLienzo(m.zona, m.ancho, m.escala);
  const alto = m.abajo - m.arriba;
  const madera = g.createLinearGradient(0, m.arriba, 0, m.abajo);
  madera.addColorStop(0, "#2a1810");
  madera.addColorStop(0.5, "#3d2417");
  madera.addColorStop(1, "#24140c");
  g.fillStyle = madera;
  g.fillRect(0, m.arriba, m.zona, alto);
  // Veta: líneas finas a lo largo, un poco onduladas
  const azar = azarFijo(7);
  for (let i = 0; i < 80; i++) {
    const y = m.arriba + azar() * alto;
    g.strokeStyle = azar() < 0.5 ? `rgba(20,10,5,${0.25 + azar() * 0.35})` : `rgba(120,70,40,${0.08 + azar() * 0.12})`;
    g.lineWidth = 0.4 + azar() * 1.2;
    g.beginPath();
    g.moveTo(0, y);
    const onda = 1 + azar() * 2.5, paso = 30 + azar() * 60, fase = azar() * 6;
    for (let x = 0; x <= m.zona; x += 12) g.lineTo(x, y + Math.sin(x / paso + fase) * onda);
    g.stroke();
  }
  // Filete crema en los dos bordes
  g.fillStyle = "#efe2c0";
  g.fillRect(0, m.arriba, m.zona, m.filete);
  g.fillRect(0, m.abajo - m.filete, m.zona, m.filete);
  return c;
}

// Los extremos: clavijero con sus clavijas, la columna de las cuerdas al
// aire, la cejuela de hueso, y al pie un poco del cuerpo cherry sunburst
// flameado con un humbucker chico.
function dibujarMarco(m) {
  const [c, g] = crearLienzo(m.largo, m.ancho, m.escala);
  // Clavijero negro
  const clavijero = g.createLinearGradient(0, 0, m.clavijero, 0);
  clavijero.addColorStop(0, "#050505");
  clavijero.addColorStop(1, "#1c1c1c");
  g.fillStyle = clavijero;
  redondeado(g, 0, m.arriba - 5, m.clavijero + 4, m.abajo - m.arriba + 10, 5);
  g.fill();
  // Columna de las cuerdas al aire (madera)
  g.fillStyle = "#2a1810";
  g.fillRect(m.clavijero, m.arriba, m.aire, m.abajo - m.arriba);
  // Cejuela de hueso: marfil con un poco de brillo
  const hueso = g.createLinearGradient(m.xCejuela - 5, 0, m.xCejuela, 0);
  hueso.addColorStop(0, "#d9cba5");
  hueso.addColorStop(0.5, "#f6eedb");
  hueso.addColorStop(1, "#cbbd96");
  g.fillStyle = hueso;
  g.fillRect(m.xCejuela - 5, m.arriba - 1, 5, m.abajo - m.arriba + 2);
  // Clavijas: botones nacarados arriba y abajo del clavijero
  g.fillStyle = "#e8e2d2";
  for (let i = 0; i < 3; i++) {
    const x = 6 + i * (m.clavijero - 10) / 2;
    g.beginPath(); g.arc(x, m.arriba - 2, 2.6, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x, m.abajo + 2, 2.6, 0, Math.PI * 2); g.fill();
  }

  // Cuerpo: cherry sunburst con flama (solo una franja, como referencia)
  const x0 = m.xFinZona;
  const medio = (m.arriba + m.abajo) / 2;
  const cuerpo = g.createRadialGradient(x0 + m.cuerpo * 0.6, medio, 2, x0 + m.cuerpo * 0.6, medio, Math.max(m.cuerpo * 1.5, m.ancho * 0.8));
  cuerpo.addColorStop(0, "#f2b13a");
  cuerpo.addColorStop(0.35, "#d8661b");
  cuerpo.addColorStop(0.7, "#8e1414");
  cuerpo.addColorStop(1, "#3a0505");
  g.fillStyle = cuerpo;
  g.fillRect(x0, 0, m.cuerpo, m.ancho);
  const azar = azarFijo(19);
  for (let i = 0; i < 14; i++) {
    const x = x0 + azar() * m.cuerpo;
    g.strokeStyle = azar() < 0.5 ? "rgba(255,220,150,0.16)" : "rgba(60,0,0,0.16)";
    g.lineWidth = 1 + azar() * 2.5;
    g.beginPath();
    g.moveTo(x, 0);
    for (let y = 0; y <= m.ancho; y += 8) g.lineTo(x + Math.sin(y / 9 + i) * 2.5, y);
    g.stroke();
  }
  // Humbucker chico: marco crema y dos bobinas negras con un tornillo por cuerda
  const largoMic = Math.min(m.cuerpo * 0.7, 24);
  const xm = m.xMicrofono - largoMic / 2;
  const ym = m.arriba + 2, altoMic = m.abajo - m.arriba - 4;
  g.fillStyle = "#e9dfc6";
  redondeado(g, xm - 2, ym - 2, largoMic + 4, altoMic + 4, 3);
  g.fill();
  for (let bobina = 0; bobina < 2; bobina++) {
    const xb = xm + bobina * largoMic / 2 + 1;
    g.fillStyle = "#121212";
    redondeado(g, xb, ym, largoMic / 2 - 2, altoMic, 2);
    g.fill();
    for (let fila = 0; fila < m.cuerdas; fila++) {
      g.fillStyle = bobina ? "#9aa0a6" : "#c8cdd2";
      g.beginPath();
      g.arc(xb + (largoMic / 2 - 2) / 2, yDeCuerda(m, fila), Math.min(2, m.entreCuerdas * 0.14), 0, Math.PI * 2);
      g.fill();
    }
  }
  return c;
}

// Gira una imagen 90° (para el mástil parado: lo que era "a lo largo" queda hacia abajo).
function girarImagen(imagen) {
  const c = document.createElement("canvas");
  c.width = imagen.height;
  c.height = imagen.width;
  const g = c.getContext("2d");
  g.translate(c.width, 0);
  g.rotate(Math.PI / 2);
  g.drawImage(imagen, 0, 0);
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

/* ------------------------------------------------------------------
   Armar el lienzo (al cargar, al cambiar de tamaño o de modo)
   ------------------------------------------------------------------ */

function dibujarMastil() {
  const hay = guitarrasMastil.some(Boolean);
  contenedorMastil.hidden = !hay;
  vistaTabs.classList.toggle("mastil-parado", hay && orientacionMastil === "vertical");
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
  // Parado, las imágenes fijas se guardan ya giradas: copiarlas en cada
  // cuadro sin rotación es mucho más liviano (sobre todo sin aceleración gráfica).
  imagenMadera = m.vertical ? girarImagen(dibujarMadera(m)) : dibujarMadera(m);
  imagenMarco = m.vertical ? girarImagen(dibujarMarco(m)) : dibujarMarco(m);
  primerTrasteVisible = Math.max(0, Math.min(primerTrasteVisible, TRASTES_TOTALES - m.trastesVisibles));
  desplazamientoActual = primerTrasteVisible;
  contenedorMastil.dataset.dibujo = m.vertical ? "parado" : "acostado";
  contenedorMastil.dataset.trastesVisibles = m.trastesVisibles;
  pedirCuadro();
}

// Si cambia el tamaño (girar el celular, cambiar de modo), se vuelve a armar.
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
  const visto = queMostrar(t);

  // Tramo visible (y su movimiento suave)
  moverVentana(m, visto, t);
  let animando = false;
  if (Math.abs(desplazamientoActual - primerTrasteVisible) > 0.01) {
    desplazamientoActual = efectosReducidos || !dt ? primerTrasteVisible
      : desplazamientoActual + (primerTrasteVisible - desplazamientoActual) * Math.min(1, dt * 7);
    animando = true;
  } else {
    desplazamientoActual = primerTrasteVisible;
  }

  // Madera y extremos: imágenes ya armadas (y ya giradas si está parado), sin rotar.
  g.setTransform(m.escala, 0, 0, m.escala, 0, 0);
  g.clearRect(0, 0, m.anchoCss, m.altoCss);
  if (m.vertical) g.drawImage(imagenMadera, 0, m.xCejuela, m.anchoCss, m.zona);
  else g.drawImage(imagenMadera, m.xCejuela, 0, m.zona, m.ancho);
  g.drawImage(imagenMarco, 0, 0, m.anchoCss, m.altoCss);

  // El resto se dibuja en "horizontal"; parado se gira 90° (el clavijero queda arriba).
  if (m.vertical) { g.translate(m.anchoCss, 0); g.rotate(Math.PI / 2); }
  dibujarTrastes(g, m);

  // Números de traste (derechos aunque el mástil esté parado) y nombres de las cuerdas
  g.font = "700 11px system-ui, sans-serif";
  g.fillStyle = "#9aa4ae";
  for (let traste = Math.max(1, Math.floor(desplazamientoActual) + 1); traste <= Math.min(TRASTES_TOTALES, Math.ceil(desplazamientoActual) + m.trastesVisibles); traste++) {
    const x = (xDeLinea(m, traste - 1) + xDeLinea(m, traste)) / 2;
    if (x > m.xCejuela + 4 && x < m.xFinZona - 4) textoDerecho(g, m, String(traste), x, m.ancho - m.numeros / 2);
  }
  textoDerecho(g, m, "0", xDeTraste(m, 0), m.ancho - m.numeros / 2);
  const deReferencia = guitarrasMastil.find(Boolean);
  const nombres = nombresDeNotas(tonalidadOriginal);
  g.fillStyle = "#d8d2c4";
  for (let fila = 0; fila < m.cuerdas; fila++) {
    textoDerecho(g, m, nombres[deReferencia.afinacion[fila] % 12], m.clavijero / 2 + 1, yDeCuerda(m, fila));
  }

  // Cuerdas: grises las que no suenan; las que suenan, encendidas del dedo al micrófono y vibrando
  const activas = new Map();   // fila -> { nota, evento }
  for (const evento of visto.eventos) for (const nota of evento.notas) if (!nota.muerta) activas.set(nota.fila, { nota, evento });
  for (let fila = 0; fila < m.cuerdas; fila++) {
    if (dibujarCuerda(g, m, fila, activas.get(fila), t, visto.opacidad)) animando = true;
  }

  // Notas: las que vienen (tenues) y las que suenan
  for (const evento of visto.proximas) for (const nota of evento.notas) if (!nota.continua) dibujarProxima(g, m, nota, evento, t);
  const tecnicas = new Set();
  for (const evento of visto.eventos) {
    for (const nota of evento.notas) if (dibujarNota(g, m, nota, evento, t, visto.opacidad, tecnicas)) animando = true;
  }

  // Lo que se ve, para las pruebas
  const describir = (eventos) => eventos.flatMap((e) => e.notas.map((n) => `${n.numero}ª/${n.traste}`)).join(" ");
  contenedorMastil.dataset.guitarra = visto.eventos.length ? String(visto.guitarra) : "";
  contenedorMastil.dataset.sonando = describir(visto.eventos);
  contenedorMastil.dataset.proximas = describir(visto.proximas);
  contenedorMastil.dataset.opacidad = String(visto.opacidad);
  contenedorMastil.dataset.tecnicas = [...tecnicas].join(" ");
  contenedorMastil.dataset.tramo = `${primerTrasteVisible + 1}-${primerTrasteVisible + m.trastesVisibles}`;

  // Sigue mientras suena, o mientras queda algo moviéndose (vibración, el corrimiento del mástil)
  if (!audio.paused || (animando && !efectosReducidos)) pedirCuadro();
}

// Los trastes de níquel (con la separación real) y las incrustaciones nacaradas del tramo visible.
function dibujarTrastes(g, m) {
  const desde = Math.floor(desplazamientoActual), hasta = Math.min(TRASTES_TOTALES, Math.ceil(desplazamientoActual + m.trastesVisibles));
  const alto = m.abajo - m.arriba - 2 * m.filete;
  const y0 = m.arriba + m.filete;
  g.save();
  g.beginPath();
  g.rect(m.xCejuela, 0, m.zona, m.ancho);
  g.clip();
  // Incrustaciones: trapecios chicos, proporcionados al ancho del diapasón, con brillo nacarado
  for (const traste of INCRUSTACIONES) {
    if (traste <= desde || traste > hasta) continue;
    const x0 = xDeLinea(m, traste - 1), x1 = xDeLinea(m, traste);
    const centro = (x0 + x1) / 2, ancho = x1 - x0;
    const largoMayor = Math.min(alto * 0.5, ancho * 0.36), largoMenor = largoMayor * 0.72;
    const yA = y0 + alto * 0.22, yB = y0 + alto * 0.78;
    const nacar = g.createLinearGradient(centro - largoMayor, yA, centro + largoMayor, yB);
    nacar.addColorStop(0, "#efe9dc");
    nacar.addColorStop(0.3, "#d6e5e8");
    nacar.addColorStop(0.5, "#f3e4ec");
    nacar.addColorStop(0.7, "#dfeee0");
    nacar.addColorStop(1, "#e9e2d4");
    g.globalAlpha = 0.88;
    g.fillStyle = nacar;
    g.beginPath();
    g.moveTo(centro - largoMayor / 2, yA);
    g.lineTo(centro + largoMayor / 2, yA);
    g.lineTo(centro + largoMenor / 2, yB);
    g.lineTo(centro - largoMenor / 2, yB);
    g.closePath();
    g.fill();
    // un reflejo fino
    g.globalAlpha = 0.5;
    g.strokeStyle = "#ffffff";
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(centro - largoMayor * 0.3, yA + 2);
    g.lineTo(centro - largoMenor * 0.2, yB - 2);
    g.stroke();
    g.globalAlpha = 1;
  }
  // Trastes: una franja oscura con el brillo del níquel en el medio
  for (let traste = Math.max(1, desde); traste <= hasta; traste++) {
    const x = xDeLinea(m, traste);
    g.fillStyle = "#6c7176";
    g.fillRect(x - 1.6, y0 - m.filete, 3.2, alto + 2 * m.filete);
    g.fillStyle = "#e9edef";
    g.fillRect(x - 0.6, y0 - m.filete, 1.2, alto + 2 * m.filete);
  }
  g.restore();
}

// Escribe un texto derecho: parado se contrarresta el giro del dibujo.
function textoDerecho(g, m, texto, x, y) {
  g.save();
  g.translate(x, y);
  if (m.vertical) g.rotate(-Math.PI / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(texto, 0, 0.5);
  g.restore();
}

/**
 * Mueve el tramo visible para que entren las notas que suenan y, si se
 * puede, las de los próximos segundos (así se adelanta a un cambio de
 * zona). Si entra el mástil entero, no se mueve.
 */
function moverVentana(m, visto, t) {
  if (m.trastesVisibles >= TRASTES_TOTALES) { primerTrasteVisible = 0; return; }
  const guitarra = guitarrasMastil[visto.guitarra - 1];
  const pisados = visto.eventos.flatMap((e) => e.notas.map((n) => Math.max(n.traste, n.slide ? n.slide.hasta : 0))).filter((x) => x > 0);
  const proximos = eventosEn(guitarra, t, t + ESPERA_VENTANA_MS).filter((e) => e.inicio > t)
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

// Grosor de cada cuerda: las graves bastante más gruesas que las agudas.
const grosorCuerda = (m, fila) => 0.7 + (fila / Math.max(1, m.cuerdas - 1)) * 1.9;

/**
 * Una cuerda. Si no suena, gris (apagada). Si suena, del dedo al micrófono
 * va encendida con su color y vibrando (más al pulsarla, y ondulando si
 * tiene vibrato); si se estira, se curva hacia el costado en el dedo.
 * Devuelve true si se mueve.
 */
function dibujarCuerda(g, m, fila, activa, t, opacidad) {
  const y = yDeCuerda(m, fila);
  const grosor = grosorCuerda(m, fila);
  const xInicio = m.clavijero - 2, xFin = m.largo - 4;
  if (!activa) {
    g.strokeStyle = CUERDA_APAGADA;
    g.lineWidth = grosor;
    g.beginPath(); g.moveTo(xInicio, y); g.lineTo(xFin, y); g.stroke();
    return false;
  }
  const { nota, evento } = activa;
  const estado = estadoDeNota(nota, evento, t);
  const xDedo = estado.traste > 0 ? Math.max(m.xCejuela, Math.min(m.xFinZona, xDeLinea(m, estado.traste) - 2)) : m.xCejuela;
  const yDedo = y + corrimientoEstirada(m, fila, estado.semitonos);
  const color = colorDeCuerda(nota.numero);
  // Del clavijero al dedo: gris (curvado si hay estirada)
  g.strokeStyle = CUERDA_APAGADA;
  g.lineWidth = grosor;
  g.beginPath(); g.moveTo(xInicio, y); g.lineTo(xDedo, yDedo); g.stroke();
  // Del dedo al micrófono: encendida y vibrando
  const desdeAtaque = nota.continua ? 1e9 : t - evento.inicio;
  const amplitud = efectosReducidos ? 0 : 2.6 * Math.exp(-Math.max(0, desdeAtaque) / 380);
  const vibrato = nota.vibrato && !efectosReducidos ? t : null;
  const fase = t / 1000 * 2 * Math.PI * 9;
  if (!efectosReducidos) {
    g.strokeStyle = color;
    g.globalAlpha = 0.3 * opacidad;
    g.lineWidth = grosor + 6;
    trazoCuerda(g, xDedo, yDedo, xFin, y, amplitud, fase, vibrato);
  }
  g.globalAlpha = opacidad;
  g.strokeStyle = color;
  g.lineWidth = grosor + 0.8;
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
 * técnicas. Devuelve true si algo se anima.
 */
function dibujarNota(g, m, nota, evento, t, opacidad, tecnicas) {
  const estado = estadoDeNota(nota, evento, t);
  const x = xDeTraste(m, estado.traste);
  if (estado.traste > 0 && (x < m.xCejuela - 10 || x > m.xFinZona + 10)) return false;
  const yCuerda = yDeCuerda(m, nota.fila);
  const y = yCuerda + corrimientoEstirada(m, nota.fila, estado.semitonos);
  const color = colorDeCuerda(nota.numero);
  const radio = m.radio;
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
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, yCuerda - radio);
    g.quadraticCurveTo((x + xDestino) / 2, yCuerda - radio - alto, xDestino, yCuerda - radio);
    g.stroke();
    g.font = "800 11px system-ui, sans-serif";
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
  if (!efectosReducidos && !nota.continua) {
    const desde = t - evento.inicio;
    if (desde < 450) {
      const brillo = g.createRadialGradient(x, y, radio * 0.6, x, y, radio * 2.2);
      brillo.addColorStop(0, color);
      brillo.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = 0.55 * opacidad * (1 - desde / 450);
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
    g.lineWidth = 2.8;
    const r = radio * 0.75;
    g.beginPath();
    g.moveTo(x - r, y - r); g.lineTo(x + r, y + r);
    g.moveTo(x + r, y - r); g.lineTo(x - r, y + r);
    g.stroke();
  } else {
    g.fillStyle = color;
    g.strokeStyle = "#0b0d10";
    g.lineWidth = 1.5;
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
    // Números grandes: casi todo el círculo (un poco menos si son dos cifras)
    g.font = `800 ${Math.round(radio * (texto.length > 1 ? 1.2 : 1.45))}px system-ui, sans-serif`;
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
    g.lineWidth = 1.6;
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
    g.font = "800 11px system-ui, sans-serif";
    textoDerecho(g, m, textoEstirada(maximo), xa + 19, yTope);
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
   Opciones: modo (botón en la barra de Tabs) y "Pistas y sync"
   ------------------------------------------------------------------ */

function mostrarOpcionesMastil() {
  const parado = orientacionMastil === "vertical";
  botonOrientacionMastil.setAttribute("aria-pressed", String(parado));
  const texto = parado ? "Mástil acostado (con la tablatura)" : "Mástil parado a pantalla completa (para tocar)";
  botonOrientacionMastil.title = texto;
  botonOrientacionMastil.setAttribute("aria-label", texto);
  selectorEtiquetaMastil.value = etiquetaMastil;
  selectorAcordesOtra.value = acordesOtra;
  casillaEfectosReducidos.checked = efectosReducidos;
  for (const entrada of entradasColorCuerda) entrada.value = coloresCuerda[Number(entrada.dataset.cuerda)];
}

botonOrientacionMastil.addEventListener("click", () => {
  orientacionMastil = orientacionMastil === "vertical" ? "horizontal" : "vertical";
  guardarPreferencia("mastilOrientacion", orientacionMastil);
  mostrarOpcionesMastil();
  dibujarMastil();
  // La tablatura vuelve a verse (o se oculta): alphaTab vuelve a armar los renglones.
  if (apiTabs && tabsListas && orientacionMastil === "horizontal") apiTabs.render();
  if (tabsListas && orientacionMastil === "vertical") mostrarAvisoTabs("");
});

selectorEtiquetaMastil.addEventListener("change", () => {
  etiquetaMastil = selectorEtiquetaMastil.value;
  guardarPreferencia("mastilEtiqueta", etiquetaMastil);
  pedirCuadro();
});

selectorAcordesOtra.addEventListener("change", () => {
  acordesOtra = selectorAcordesOtra.value;
  guardarPreferencia("mastilAcordesOtra", acordesOtra);
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
