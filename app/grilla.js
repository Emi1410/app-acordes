"use strict";

/* ==================================================================
   Grilla por vueltas (vista "Grilla")

   Como en un cancionero: cada casillero es un compás y cada renglón una
   vuelta (por ejemplo, 4 compases: A | E | G# | C#m), con las vueltas una
   debajo de la otra.
     - Los compases son los de la canción: los del .gp si se usan los
       acordes de la tablatura, o los del análisis (prepararPulsos en app.js
       marca en "esCompas" qué pulso empieza cada compás).
     - Si en un compás hay más de un acorde (acordes de paso), el casillero
       se divide en partes según los pulsos que dura cada uno.
     - El largo de la vuelta se detecta solo (cada cuántos compases se
       repite la secuencia de acordes) y se puede cambiar con − y +; la
       elección se guarda por canción.
     - Si la canción tiene partes (partes.js), cada parte empieza un renglón
       nuevo y lleva su título arriba, con su color.
     - El compás que suena se resalta y la grilla se desplaza sola.

   Usa de app.js: pulsos, esCompas, acordePorPulso, indicePulso, lista,
   nombreParaMostrar, ajuste, audio, actualizar, cancionActual, idActual.
   ================================================================== */

const barraGrilla = document.getElementById("barra-grilla");
const vueltaMenos = document.getElementById("vuelta-menos");
const vueltaMas = document.getElementById("vuelta-mas");
const valorVuelta = document.getElementById("valor-vuelta");
const vueltaAuto = document.getElementById("vuelta-auto");

const LARGOS_VUELTA = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16];
const LARGO_VUELTA_POR_DEFECTO = 4;

let compasesGrilla = [];      // [{ desde, hasta (pulsos), inicio (s), trozos: [{ acorde, desde, pulsos }], firma }]
let compasDePulso = [];       // para cada pulso, el índice de su compás en compasesGrilla
let largoVueltaDetectado = LARGO_VUELTA_POR_DEFECTO;
let compasResaltado = -1;
let trozoResaltado = null;

/* ------------------------------------------------------------------
   Compases de la canción, con sus acordes
   ------------------------------------------------------------------ */

/**
 * Arma los compases con los pulsos de la canción. Cada compás guarda sus
 * "trozos": los acordes que suenan en él, con cuántos pulsos dura cada uno.
 * Los pulsos antes del primer compás marcado forman un compás incompleto.
 */
function armarCompases() {
  const inicios = [];
  esCompas.forEach((empieza, i) => { if (empieza) inicios.push(i); });
  if (!inicios.length || !pulsos.length) return [];
  if (inicios[0] > 0) inicios.unshift(0);
  return inicios.map((desde, k) => {
    const hasta = k + 1 < inicios.length ? inicios[k + 1] : pulsos.length;
    const trozos = [];
    for (let i = desde; i < hasta; i++) {
      const acorde = acordePorPulso[i] || "N";
      const ultimo = trozos[trozos.length - 1];
      if (ultimo && ultimo.acorde === acorde) ultimo.pulsos++;
      else trozos.push({ acorde, desde: i, pulsos: 1 });
    }
    return {
      desde, hasta, inicio: pulsos[desde], trozos,
      firma: trozos.map((t) => `${t.acorde}:${t.pulsos}`).join(" "),
    };
  });
}

// ¿El compás tiene algún acorde? (los de "N" al principio y al final no se muestran)
const conAcordes = (compas) => compas.trozos.some((t) => t.acorde !== "N");

// Primer y último compás con acordes (para no mostrar la presentación y los aplausos).
function rangoConAcordes(compases) {
  let primero = compases.findIndex(conAcordes);
  if (primero < 0) return null;
  let ultimo = compases.length - 1;
  while (ultimo > primero && !conAcordes(compases[ultimo])) ultimo--;
  return { primero, ultimo };
}

/**
 * Cada cuántos compases se repite la secuencia de acordes. Para cada largo
 * posible L se cuenta qué parte de los compases es igual al que está L
 * compases después; gana el más corto que queda cerca del mejor (así, si la
 * vuelta es de 4, no gana 8, que también se repite). Un solo compás no
 * cuenta como vuelta (todos iguales): en ese caso se usan 4.
 */
function detectarLargoVuelta(compases) {
  const rango = rangoConAcordes(compases);
  if (!rango) return LARGO_VUELTA_POR_DEFECTO;
  const firmas = compases.slice(rango.primero, rango.ultimo + 1).map((c) => c.firma);
  const puntajes = [];
  for (const largo of LARGOS_VUELTA) {
    if (largo < 2 || firmas.length < 2 * largo + 1) continue;
    let iguales = 0;
    for (let i = 0; i + largo < firmas.length; i++) if (firmas[i] === firmas[i + largo]) iguales++;
    puntajes.push({ largo, puntaje: iguales / (firmas.length - largo) });
  }
  if (!puntajes.length) return LARGO_VUELTA_POR_DEFECTO;
  const mejor = Math.max(...puntajes.map((p) => p.puntaje));
  if (mejor <= 0) return LARGO_VUELTA_POR_DEFECTO;
  return puntajes.find((p) => p.puntaje >= mejor - 0.05).largo;
}

// Largo de vuelta que se usa: el elegido para la canción, o el detectado.
function largoVuelta() {
  const elegido = cancionActual && Number.isInteger(cancionActual.largoVuelta) ? cancionActual.largoVuelta : null;
  return elegido || largoVueltaDetectado;
}

/* ------------------------------------------------------------------
   Dibujo
   ------------------------------------------------------------------ */

/**
 * Renglones de la grilla: { titulo, tipo, vueltas: [[índices de compases]] }.
 * Las vueltas arrancan en el primer compás con acordes y en cada parte de
 * la canción (una parte que empieza a mitad de vuelta corta el renglón).
 */
function armarGruposDeVueltas(compases, largo) {
  const rango = rangoConAcordes(compases);
  if (!rango) return [];
  // Compás donde empieza cada parte (el más cercano a su inicio).
  const partes = typeof partesDeCancion === "function" ? partesDeCancion() : [];
  const inicioDeParte = new Map();
  for (const parte of partes) {
    let k = 0;
    while (k + 1 < compases.length && compases[k + 1].inicio <= parte.inicio + 0.05) k++;
    inicioDeParte.set(Math.max(k, rango.primero), parte);
  }
  const grupos = [];
  let grupo = null, vuelta = null;
  for (let k = rango.primero; k <= rango.ultimo; k++) {
    const parte = inicioDeParte.get(k);
    if (parte || !grupo) {
      grupo = { titulo: parte ? parte.nombre : "", tipo: parte ? parte.tipo : "", vueltas: [] };
      grupos.push(grupo);
      vuelta = null;
    }
    if (!vuelta || vuelta.length >= largo) {
      vuelta = [];
      grupo.vueltas.push(vuelta);
    }
    vuelta.push(k);
  }
  return grupos;
}

// Redibuja la grilla entera (al abrir la canción, al editar, al transportar
// o al cambiar el largo de la vuelta o las partes).
function dibujarGrillaVueltas() {
  compasesGrilla = armarCompases();
  compasDePulso = new Array(pulsos.length).fill(-1);
  compasesGrilla.forEach((c, k) => { for (let i = c.desde; i < c.hasta; i++) compasDePulso[i] = k; });
  largoVueltaDetectado = detectarLargoVuelta(compasesGrilla);
  const largo = largoVuelta();
  mostrarLargoVuelta();

  lista.replaceChildren();
  compasResaltado = -1;
  trozoResaltado = null;
  for (const grupo of armarGruposDeVueltas(compasesGrilla, largo)) {
    const seccion = document.createElement("section");
    seccion.className = "grupo-vueltas";
    if (grupo.tipo) seccion.style.setProperty("--color-parte", colorDeParte(grupo.tipo));
    if (grupo.titulo) {
      const titulo = document.createElement("h3");
      titulo.className = "titulo-grupo";
      titulo.textContent = grupo.titulo;
      seccion.appendChild(titulo);
    }
    for (const vuelta of grupo.vueltas) {
      const renglon = document.createElement("div");
      renglon.className = "vuelta";
      renglon.style.setProperty("--compases", largo);
      for (const k of vuelta) renglon.appendChild(dibujarCompas(k));
      seccion.appendChild(renglon);
    }
    lista.appendChild(seccion);
  }
}

// Un casillero: el compás con sus trozos (cada uno del ancho de los pulsos que dura).
function dibujarCompas(k) {
  const compas = compasesGrilla[k];
  const casillero = document.createElement("div");
  casillero.className = "compas-grilla";
  casillero.dataset.compas = k;
  compas.trozos.forEach((trozo, n) => {
    const parte = document.createElement("span");
    parte.className = "trozo";
    parte.dataset.pulso = trozo.desde;
    parte.style.flexGrow = trozo.pulsos;
    const nombre = document.createElement("b");
    nombre.textContent = trozo.acorde === "N" ? "–" : nombreParaMostrar(trozo.acorde);
    // Si sigue el acorde del compás anterior, se ve más apagado (como "%" en un cifrado).
    const anterior = n === 0 && k > 0 ? compasesGrilla[k - 1].trozos.at(-1) : null;
    if (anterior && anterior.acorde === trozo.acorde) parte.classList.add("sigue");
    parte.appendChild(nombre);
    casillero.appendChild(parte);
  });
  return casillero;
}

// Tocar un compás (o una de sus partes) salta a ese momento.
lista.addEventListener("click", (evento) => {
  const trozo = evento.target.closest(".trozo");
  if (!trozo || idActual === null) return;
  audio.currentTime = Math.max(0, pulsos[Number(trozo.dataset.pulso)] + ajuste);
  actualizar();
});

/* ------------------------------------------------------------------
   Seguir lo que suena (lo llama actualizar() en app.js)
   ------------------------------------------------------------------ */

function actualizarGrillaVueltas() {
  const k = indicePulso >= 0 ? compasDePulso[indicePulso] ?? -1 : -1;
  // La parte del compás que suena (si el compás tiene acordes de paso).
  let trozo = null;
  if (k >= 0) {
    const casillero = lista.querySelector(`.compas-grilla[data-compas="${k}"]`);
    if (casillero) {
      for (const parte of casillero.children) if (Number(parte.dataset.pulso) <= indicePulso) trozo = parte;
    }
  }
  if (trozo !== trozoResaltado) {
    if (trozoResaltado) trozoResaltado.classList.remove("sonando");
    if (trozo) trozo.classList.add("sonando");
    trozoResaltado = trozo;
  }
  if (k === compasResaltado) return;
  compasResaltado = k;
  for (const casillero of lista.querySelectorAll(".compas-grilla")) {
    const indice = Number(casillero.dataset.compas);
    casillero.classList.toggle("pasado", indice < k);
    casillero.classList.toggle("actual", indice === k);
  }
  // La vuelta que suena queda en el medio de la grilla.
  const actual = lista.querySelector(".compas-grilla.actual");
  if (actual && !lista.hidden) actual.parentElement.scrollIntoView({ block: "center", behavior: "smooth" });
}

/* ------------------------------------------------------------------
   Largo de la vuelta: − / + / Auto (se guarda por canción)
   ------------------------------------------------------------------ */

function mostrarLargoVuelta() {
  const largo = largoVuelta();
  const elegido = cancionActual && Number.isInteger(cancionActual.largoVuelta);
  valorVuelta.textContent = `${largo} ${largo === 1 ? "compás" : "compases"}`;
  vueltaMenos.disabled = largo <= LARGOS_VUELTA[0];
  vueltaMas.disabled = largo >= LARGOS_VUELTA[LARGOS_VUELTA.length - 1];
  vueltaAuto.setAttribute("aria-pressed", String(!elegido));
  vueltaAuto.title = `Detectado: ${largoVueltaDetectado} compases`;
}

async function elegirLargoVuelta(largo) {
  if (idActual === null) return;
  cancionActual = { ...cancionActual, largoVuelta: largo };
  try {
    await actualizarCancion(idActual, { largoVuelta: largo });
  } catch {
    // queda para esta sesión
  }
  dibujarGrillaVueltas();
  actualizar();
}

function pasoLargoVuelta(direccion) {
  const actual = largoVuelta();
  const i = LARGOS_VUELTA.findIndex((l) => l >= actual);
  const nuevo = LARGOS_VUELTA[Math.max(0, Math.min(LARGOS_VUELTA.length - 1, (i < 0 ? LARGOS_VUELTA.length - 1 : i) + direccion))];
  elegirLargoVuelta(nuevo);
}

vueltaMenos.addEventListener("click", () => pasoLargoVuelta(-1));
vueltaMas.addEventListener("click", () => pasoLargoVuelta(+1));
vueltaAuto.addEventListener("click", () => elegirLargoVuelta(null));
