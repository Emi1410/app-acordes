"use strict";

/* ==================================================================
   Mástil virtual (vista Tabs, etapa 2)

   Debajo de la tablatura se dibuja un diapasón, como el de Guitar Pro:
   6 cuerdas con la afinación de la pista, trastes con sus marcas y las
   notas que suenan en cada momento iluminadas (Guitarra 1 en amarillo,
   Guitarra 2 en celeste, como en la tablatura).

   En un celular vertical no entran los 24 trastes: se muestra el tramo que
   se está usando (mirando las notas de los próximos compases) y el mástil
   se corre suavemente cuando la música cambia de zona. Los números de los
   trastes visibles se ven siempre, debajo de las cuerdas.

   Datos de alphaTab (ver tablaturas.js):
     - beat.absolutePlaybackStart / playbackDuration: cuándo suena cada pulso (en ticks).
     - note.string: 1 es la cuerda más grave; note.fret: 0 es al aire.
     - staff.tuning: alturas MIDI de las cuerdas, de la más aguda a la más grave.
   ================================================================== */

const contenedorMastil = document.getElementById("mastil");
const selectorModoMastil = document.getElementById("modo-mastil");
const selectorEtiquetaMastil = document.getElementById("etiqueta-mastil");

const SVG_NS_MASTIL = "http://www.w3.org/2000/svg";
const TRASTES_TOTALES = 24;
const MARCAS_SIMPLES = [3, 5, 7, 9, 15, 17, 19, 21];
const MARCAS_DOBLES = [12, 24];

// Medidas del dibujo (en px de pantalla; el ancho se adapta al contenedor)
const MARGEN_IZQUIERDO = 26;   // nombres de las cuerdas
const COLUMNA_AIRE = 22;       // notas al aire (fija, a la izquierda de la cejuela)
const ENTRE_CUERDAS = 15;
const ARRIBA_MASTIL = 9;
const ALTO_NUMEROS = 15;

// Preferencias (en este dispositivo)
let modoMastil = "auto";        // "auto" | "1" | "2" | "ambas"
let etiquetaMastil = "nota";    // "nota" | "traste"
try {
  const modo = localStorage.getItem("mastilModo");
  if (["auto", "1", "2", "ambas"].includes(modo)) modoMastil = modo;
  const etiqueta = localStorage.getItem("mastilEtiqueta");
  if (["nota", "traste"].includes(etiqueta)) etiquetaMastil = etiqueta;
} catch {
  // valores por defecto
}
selectorModoMastil.value = modoMastil;
selectorEtiquetaMastil.value = etiquetaMastil;

// Para cada guitarra elegida: sus pulsos con notas, ordenados por inicio.
//   { pista, afinacion: [MIDI...], eventos: [{ inicio, fin, notas: [{ fila, traste, altura }] }] }
let guitarrasMastil = [];
let anchoTraste = 40;
let trastesVisibles = 7;
let primerTrasteVisible = 0;      // el tramo muestra los trastes primerTrasteVisible+1 ... +trastesVisibles
let claveDibujada = "";
let grupoMovil = null;            // la parte del mástil que se corre
let capaNotasMovil = null;
let capaNotasAire = null;

/* ------------------------------------------------------------------
   Preparar los datos al cargar la partitura
   ------------------------------------------------------------------ */

function prepararMastil(partitura) {
  guitarrasMastil = pistasElegidas.map((indice, n) => {
    const pista = indice >= 0 ? partitura.tracks[indice] : null;
    if (!pista) return null;
    const pentagrama = pista.staves[0];
    if (pentagrama.isPercussion || !pentagrama.tuning || !pentagrama.tuning.length) return null;
    const afinacion = pentagrama.tuning.slice();               // de la más aguda a la más grave
    const eventos = [];
    for (const compas of pentagrama.bars) {
      for (const voz of compas.voices) {
        for (const pulso of voz.beats) {
          if (pulso.isRest || pulso.notes.length === 0) continue;
          const notas = pulso.notes
            .filter((nota) => !nota.isDead && nota.string >= 1 && nota.string <= afinacion.length)
            .map((nota) => ({
              fila: afinacion.length - nota.string,              // 0 = cuerda de arriba (la más aguda)
              traste: nota.fret,
              altura: afinacion[afinacion.length - nota.string] + nota.fret,
            }));
          if (notas.length) {
            eventos.push({ inicio: pulso.absolutePlaybackStart, fin: pulso.absolutePlaybackStart + pulso.playbackDuration, notas });
          }
        }
      }
    }
    eventos.sort((a, b) => a.inicio - b.inicio);
    return { numero: n + 1, afinacion, eventos };
  });
  claveDibujada = "";
  dibujarMastil();
}

// Notas que suenan en el tick "t" en una guitarra.
function notasEn(guitarra, t) {
  if (!guitarra) return [];
  const eventos = guitarra.eventos;
  // Búsqueda binaria: el último pulso que empezó antes de t...
  let bajo = 0, alto = eventos.length - 1, k = -1;
  while (bajo <= alto) {
    const medio = (bajo + alto) >> 1;
    if (eventos[medio].inicio <= t) { k = medio; bajo = medio + 1; } else alto = medio - 1;
  }
  // ...y unos anteriores, por si hay varias voces que se superponen.
  const resultado = [];
  for (let i = k; i >= 0 && i > k - 8; i--) {
    if (eventos[i].fin > t) resultado.push(...eventos[i].notas);
  }
  return resultado;
}

// Trastes pisados (sin contar los al aire) entre t y t + "adelante" ticks.
function trastesProximos(guitarra, t, adelante) {
  if (!guitarra) return [];
  const trastes = [];
  for (const evento of guitarra.eventos) {
    if (evento.fin <= t) continue;
    if (evento.inicio > t + adelante) break;
    for (const nota of evento.notas) if (nota.traste > 0) trastes.push(nota.traste);
  }
  return trastes;
}

/* ------------------------------------------------------------------
   Dibujo del mástil (se arma una vez; después solo se mueven las notas)
   ------------------------------------------------------------------ */

function crearSvgMastil(tipo, atributos, padre) {
  const elemento = document.createElementNS(SVG_NS_MASTIL, tipo);
  for (const [nombre, valor] of Object.entries(atributos)) elemento.setAttribute(nombre, valor);
  if (padre) padre.appendChild(elemento);
  return elemento;
}

function dibujarMastil() {
  contenedorMastil.replaceChildren();
  const guitarra = guitarrasMastil.find(Boolean);
  if (!guitarra) {
    contenedorMastil.hidden = true;
    return;
  }
  contenedorMastil.hidden = false;
  const cuerdas = guitarra.afinacion.length;
  const ancho = Math.max(240, contenedorMastil.clientWidth || 340);
  const zonaTrastes = ancho - MARGEN_IZQUIERDO - COLUMNA_AIRE;
  // Cuántos trastes entran: cada uno de al menos ~40 px, entre 5 y 12.
  trastesVisibles = Math.max(5, Math.min(12, Math.floor(zonaTrastes / 40)));
  anchoTraste = zonaTrastes / trastesVisibles;
  const altoCuerdas = (cuerdas - 1) * ENTRE_CUERDAS;
  const alto = ARRIBA_MASTIL * 2 + altoCuerdas + ALTO_NUMEROS;
  const xCejuela = MARGEN_IZQUIERDO + COLUMNA_AIRE;
  const yCuerda = (fila) => ARRIBA_MASTIL + fila * ENTRE_CUERDAS;

  const svg = crearSvgMastil("svg", { viewBox: `0 0 ${ancho} ${alto}`, width: ancho, height: alto, class: "svg-mastil", "aria-hidden": "true" });

  // Nombres de las cuerdas (afinación de la pista)
  guitarra.afinacion.forEach((altura, fila) => {
    const texto = crearSvgMastil("text", { x: MARGEN_IZQUIERDO - 6, y: yCuerda(fila), class: "mastil-cuerda-nombre" }, svg);
    texto.textContent = nombresDeNotas(tonalidadOriginal)[altura % 12];
  });

  // Zona de trastes, recortada: adentro va el grupo que se corre.
  const recorte = crearSvgMastil("clipPath", { id: "recorte-mastil" }, crearSvgMastil("defs", {}, svg));
  crearSvgMastil("rect", { x: xCejuela, y: 0, width: zonaTrastes, height: alto }, recorte);
  const zona = crearSvgMastil("g", { "clip-path": "url(#recorte-mastil)" }, svg);
  grupoMovil = crearSvgMastil("g", { class: "mastil-movil" }, zona);
  grupoMovil.style.transform = `translateX(${xCejuela - primerTrasteVisible * anchoTraste}px)`;

  // Madera, marcas, trastes y números (para los 24 trastes; se ve solo un tramo)
  crearSvgMastil("rect", { x: 0, y: ARRIBA_MASTIL - 4, width: TRASTES_TOTALES * anchoTraste, height: altoCuerdas + 8, class: "mastil-madera" }, grupoMovil);
  const centro = (traste) => (traste - 0.5) * anchoTraste;
  for (const traste of MARCAS_SIMPLES) {
    crearSvgMastil("circle", { cx: centro(traste), cy: ARRIBA_MASTIL + altoCuerdas / 2, r: 3.5, class: "mastil-marca" }, grupoMovil);
  }
  for (const traste of MARCAS_DOBLES) {
    crearSvgMastil("circle", { cx: centro(traste), cy: ARRIBA_MASTIL + altoCuerdas * 0.25, r: 3.5, class: "mastil-marca" }, grupoMovil);
    crearSvgMastil("circle", { cx: centro(traste), cy: ARRIBA_MASTIL + altoCuerdas * 0.75, r: 3.5, class: "mastil-marca" }, grupoMovil);
  }
  for (let traste = 0; traste <= TRASTES_TOTALES; traste++) {
    crearSvgMastil("line", { x1: traste * anchoTraste, y1: ARRIBA_MASTIL - 4, x2: traste * anchoTraste, y2: ARRIBA_MASTIL + altoCuerdas + 4,
      class: traste === 0 ? "mastil-cejuela" : "mastil-traste" }, grupoMovil);
    if (traste >= 1) {
      const numero = crearSvgMastil("text", { x: centro(traste), y: alto - 4, class: "mastil-numero" }, grupoMovil);
      numero.textContent = String(traste);
    }
  }

  // Cuerdas (fijas, cruzan todo)
  for (let fila = 0; fila < cuerdas; fila++) {
    crearSvgMastil("line", { x1: MARGEN_IZQUIERDO, y1: yCuerda(fila), x2: ancho, y2: yCuerda(fila),
      class: "mastil-cuerda", "stroke-width": 0.8 + fila * 0.25 }, svg);
  }
  // Columna de las cuerdas al aire, con su número "0"
  const cero = crearSvgMastil("text", { x: MARGEN_IZQUIERDO + COLUMNA_AIRE / 2, y: alto - 4, class: "mastil-numero" }, svg);
  cero.textContent = "0";

  capaNotasMovil = crearSvgMastil("g", {}, grupoMovil);
  capaNotasAire = crearSvgMastil("g", {}, svg);
  contenedorMastil.appendChild(svg);
  moverTramo(Math.min(primerTrasteVisible, TRASTES_TOTALES - trastesVisibles));
  claveDibujada = "";
}

// Corre el mástil para mostrar los trastes nuevo+1 ... nuevo+trastesVisibles
// (con transición suave, ver .mastil-movil en style.css).
function moverTramo(nuevo) {
  primerTrasteVisible = nuevo;
  grupoMovil.style.transform = `translateX(${MARGEN_IZQUIERDO + COLUMNA_AIRE - primerTrasteVisible * anchoTraste}px)`;
  contenedorMastil.dataset.tramo = `${primerTrasteVisible + 1}-${primerTrasteVisible + trastesVisibles}`;
}

/* ------------------------------------------------------------------
   Actualizar en cada cuadro (lo llama actualizarTabs en tablaturas.js)
   ------------------------------------------------------------------ */

function actualizarMastil() {
  if (!grupoMovil || contenedorMastil.hidden) return;
  const t = apiTabs.tickPosition;
  const [g1, g2] = guitarrasMastil;
  const notas1 = notasEn(g1, t), notas2 = notasEn(g2, t);

  // Qué guitarra mostrar
  let mostrar;
  if (modoMastil === "1") mostrar = [[1, notas1]];
  else if (modoMastil === "2") mostrar = [[2, notas2]];
  else if (modoMastil === "ambas") mostrar = [[2, notas2], [1, notas1]];   // la 1 encima
  else mostrar = notas1.length || !g2 ? [[1, notas1]] : [[2, notas2]];   // automático

  // Tramo visible. Las notas que suenan AHORA tienen que verse siempre; las de
  // los próximos 2 compases (3840 ticks = 1 compás de 4/4) se suman si entran,
  // así el mástil se adelanta a un cambio de zona. Si no suena nada, se prepara
  // para lo que viene.
  const pisados = (notas) => notas.filter((n) => n.traste > 0).map((n) => n.traste);
  const actuales = mostrar.flatMap(([, notas]) => pisados(notas));
  const proximos = mostrar.flatMap(([n]) => trastesProximos(n === 1 ? g1 : g2, t, 2 * 3840));
  const fuera = (lista) => lista.some((x) => x <= primerTrasteVisible || x > primerTrasteVisible + trastesVisibles);
  const base = actuales.length ? actuales : proximos;
  if (base.length && fuera(base)) {
    let minimo = Math.min(...base), maximo = Math.max(...base);
    const todos = [...base, ...proximos];
    if (Math.max(...todos) - Math.min(...todos) < trastesVisibles) {
      minimo = Math.min(...todos);
      maximo = Math.max(...todos);
    }
    // Se corre lo justo: que entre desde el más bajo (con un traste de margen si se puede).
    let nuevo = Math.max(0, minimo - 2);
    if (maximo > nuevo + trastesVisibles) nuevo = maximo - trastesVisibles;
    nuevo = Math.max(0, Math.min(TRASTES_TOTALES - trastesVisibles, nuevo));
    moverTramo(nuevo);
  }

  // Redibujamos las notas solo si cambiaron.
  const clave = mostrar.map(([n, notas]) => n + ":" + notas.map((x) => x.fila + "." + x.traste).join(",")).join("|") + etiquetaMastil;
  if (clave === claveDibujada) return;
  claveDibujada = clave;
  capaNotasMovil.replaceChildren();
  capaNotasAire.replaceChildren();
  const nombres = nombresDeNotas(tonalidadOriginal);
  for (const [numero, notas] of mostrar) {
    for (const nota of notas) {
      const alAire = nota.traste === 0;
      const capa = alAire ? capaNotasAire : capaNotasMovil;
      const x = alAire ? MARGEN_IZQUIERDO + COLUMNA_AIRE / 2 : (nota.traste - 0.5) * anchoTraste;
      const y = ARRIBA_MASTIL + nota.fila * ENTRE_CUERDAS;
      crearSvgMastil("circle", { cx: x, cy: y, r: 7.2, class: `mastil-nota mastil-nota-${numero}` }, capa);
      const texto = crearSvgMastil("text", { x, y, class: "mastil-nota-texto" }, capa);
      texto.textContent = etiquetaMastil === "traste" ? String(nota.traste) : nombres[nota.altura % 12];
    }
  }
  contenedorMastil.dataset.mostrando = mostrar.map(([n]) => n).join(",");
}

/* ------------------------------------------------------------------
   Opciones (en "Pistas y sync")
   ------------------------------------------------------------------ */

selectorModoMastil.addEventListener("change", () => {
  modoMastil = selectorModoMastil.value;
  try { localStorage.setItem("mastilModo", modoMastil); } catch { /* queda para esta sesión */ }
  claveDibujada = "";
  actualizarMastil();
});

selectorEtiquetaMastil.addEventListener("change", () => {
  etiquetaMastil = selectorEtiquetaMastil.value;
  try { localStorage.setItem("mastilEtiqueta", etiquetaMastil); } catch { /* queda para esta sesión */ }
  claveDibujada = "";
  actualizarMastil();
});

// Si cambia el ancho de la pantalla (por ejemplo, al girar el celular), se vuelve a armar.
window.addEventListener("resize", () => {
  if (guitarrasMastil.some(Boolean)) dibujarMastil();
});
