"use strict";

/* ==================================================================
   Para practicar: modo tocar, bucle A–B y cuenta "3, 2, 1"

   Modo tocar (el botón del encabezado):
     - pantalla completa y, si el celular lo deja, la pantalla fija
       acostada (Screen Orientation API); si no lo deja, un aviso pide
       girarlo;
     - en la vista Tabs (si la canción tiene tablatura): el mástil grande
       acostado y arriba un solo renglón de tablatura que corre de costado
       (solo la Guitarra 1);
     - los controles se esconden solos a los 3 s sin tocar la pantalla
       (mientras suena); un toque los vuelve a mostrar (ese primer toque
       no hace nada más);
     - "Salir" (o el gesto de atrás) devuelve todo como estaba.

   Bucle A–B (botón "A–B" del transporte):
     - primer toque: el inicio es el compás que suena; segundo toque: el
       final es el fin del compás que suena; tercero: se saca el bucle;
     - o con los dedos: mantener apretado un compás de la tira de Pulsos
       o de la tablatura marca el inicio, y tocar otro marca el final;
     - se revisa en cada cuadro con la posición que se escucha, así que
       anda igual a cualquier velocidad.

   Cuenta "3, 2, 1" (opción del panel "Más"): al dar play, un compás de
   clics del metrónomo (con el tempo de ese lugar y la velocidad elegida)
   y un número grande; recién después arranca. También en cada vuelta
   del bucle. Tocar play durante la cuenta la cancela.
   ================================================================== */

const botonBucle = document.getElementById("boton-bucle");
const casillaCuentaPrevia = document.getElementById("cuenta-previa");
const capaCuenta = document.getElementById("cuenta-entrada");
const avisoGirar = document.getElementById("aviso-girar");
const botonSeguirSinGirar = document.getElementById("seguir-sin-girar");
const botonSalirModoTocar = document.getElementById("salir-modo-tocar");
const textoVersion = document.getElementById("version-app");
const botonActualizar = document.getElementById("boton-actualizar");

const ESPERA_OCULTAR_MS = 3000;     // controles: se esconden a los 3 s sin tocar
const PRESION_LARGA_MS = 500;       // mantener apretado un compás: inicio del bucle
const DESPLAZAMIENTO_TOCAR = -40;   // renglón único: cuánto se ve antes del compás que suena (px)

/* ------------------------------------------------------------------
   Versión de la app (panel "Más") y aviso de versión nueva
   ------------------------------------------------------------------ */

// La versión es la de los enlaces de index.html (?v=...), la misma en todos.
const VERSION_APP = (() => {
  const script = document.querySelector('script[src*="app.js?v="]');
  const encontrada = script && script.getAttribute("src").match(/\?v=([\w.]+)/);
  return encontrada ? encontrada[1] : "?";
})();
textoVersion.textContent = `Versión ${VERSION_APP}`;

// Si el celular abrió una copia vieja (guardada en caché), se pide index.html
// sin caché: si trae otra versión, se recarga una sola vez con la nueva.
async function revisarVersionNueva() {
  if (location.protocol === "file:") return;
  let nueva;
  try {
    const respuesta = await fetch(new URL("index.html", location.href), { cache: "no-store" });
    if (!respuesta.ok) return;
    const encontrada = (await respuesta.text()).match(/app\.js\?v=([\w.]+)/);
    nueva = encontrada && encontrada[1];
  } catch {
    return;   // sin conexión: sigue con la que hay
  }
  if (!nueva || nueva === VERSION_APP) {
    textoVersion.textContent = `Versión ${VERSION_APP} (la última)`;
    return;
  }
  let yaRecargada = null;
  try { yaRecargada = sessionStorage.getItem("recargadaPara"); } catch { /* sin sessionStorage */ }
  if (yaRecargada !== nueva && audio.paused) {
    try { sessionStorage.setItem("recargadaPara", nueva); } catch { /* recarga igual */ }
    recargarSinCache();
    return;
  }
  // Ya se intentó (o está sonando): queda el botón para hacerlo a mano.
  textoVersion.textContent = `Versión ${VERSION_APP} · hay una nueva (${nueva})`;
  botonActualizar.hidden = false;
}

// Una dirección distinta obliga al navegador a pedir index.html de nuevo.
function recargarSinCache() {
  const direccion = new URL(location.href);
  direccion.searchParams.set("actualizar", Date.now());
  location.replace(direccion.href);
}
botonActualizar.addEventListener("click", recargarSinCache);
document.addEventListener("DOMContentLoaded", revisarVersionNueva);

/* ------------------------------------------------------------------
   Modo tocar
   ------------------------------------------------------------------ */

let modoTocar = false;
let vistaAntesDeTocar = null;       // para volver a la vista que había
let conPantallaCompleta = false;    // si entró a pantalla completa (para salir con "atrás")
let orientacionFija = false;        // si el celular dejó fijar la pantalla acostada
let sinGirar = false;               // tocó "Seguir así" en el aviso de girar
let temporizadorControles = null;
let tragarClic = false;             // el toque que solo muestra los controles no hace nada más
const enVertical = window.matchMedia("(orientation: portrait)");

function alternarModoTocar() {
  if (modoTocar) salirModoTocar();
  else entrarModoTocar();
}

async function entrarModoTocar() {
  modoTocar = true;
  sinGirar = false;
  document.body.classList.add("modo-tocar");
  botonSalirModoTocar.hidden = false;
  botonPantallaCompleta.setAttribute("aria-pressed", "true");
  // Pantalla completa primero (la orientación solo se puede fijar así).
  conPantallaCompleta = false;
  if (hayPantallaCompleta && !elementoEnPantallaCompleta()) {
    try {
      await pedirPantallaCompleta();
      conPantallaCompleta = true;
    } catch {
      // sigue sin pantalla completa
    }
  }
  orientacionFija = false;
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
      orientacionFija = true;
    }
  } catch {
    // la compu, iPhone o un navegador que no deja: se pide girarlo si hace falta
  }
  if (!modoTocar) return;   // salió mientras se esperaba
  revisarGiro();
  // Con tablatura: a la vista Tabs (mástil grande y un renglón).
  vistaAntesDeTocar = vista;
  const tablatura = idActual !== null ? await obtenerTablatura(idActual).catch(() => null) : null;
  if (!modoTocar) return;
  if (tablatura && vista !== "tabs") aplicarVista("tabs");
  ajustarTabsAlModo();
  dibujarMastil();
  mostrarControles();
}

async function salirModoTocar() {
  if (!modoTocar) return;
  modoTocar = false;
  document.body.classList.remove("modo-tocar", "controles-ocultos");
  botonSalirModoTocar.hidden = true;
  botonPantallaCompleta.setAttribute("aria-pressed", "false");
  clearTimeout(temporizadorControles);
  avisoGirar.hidden = true;
  try {
    if (orientacionFija && screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
  } catch {
    // ya estaba libre
  }
  orientacionFija = false;
  if (conPantallaCompleta) {
    conPantallaCompleta = false;
    try { await dejarPantallaCompleta(); } catch { /* ya había salido */ }
  }
  if (vistaAntesDeTocar && vistaAntesDeTocar !== vista) aplicarVista(vistaAntesDeTocar);
  vistaAntesDeTocar = null;
  ajustarTabsAlModo();
  dibujarMastil();
}

botonSalirModoTocar.addEventListener("click", salirModoTocar);

// Salir de pantalla completa con "atrás" también sale del modo tocar.
function alCambiarPantallaCompleta() {
  if (modoTocar && conPantallaCompleta && !elementoEnPantallaCompleta()) {
    conPantallaCompleta = false;
    salirModoTocar();
  }
}
document.addEventListener("fullscreenchange", alCambiarPantallaCompleta);
document.addEventListener("webkitfullscreenchange", alCambiarPantallaCompleta);

// El aviso de girar: solo si no se pudo fijar la orientación y el celular está parado.
function revisarGiro() {
  avisoGirar.hidden = !(modoTocar && !orientacionFija && !sinGirar && enVertical.matches);
}
enVertical.addEventListener("change", revisarGiro);
botonSeguirSinGirar.addEventListener("click", () => {
  sinGirar = true;
  revisarGiro();
});

// alphaTab: un renglón que corre de costado (solo la Guitarra 1) o las páginas de siempre.
function ajustarTabsAlModo() {
  if (!apiTabs) return;
  const modo = modoTocar ? alphaTab.LayoutMode.Horizontal : alphaTab.LayoutMode.Page;
  if (apiTabs.settings.display.layoutMode === modo) return;
  apiTabs.settings.display.layoutMode = modo;
  apiTabs.settings.player.scrollOffsetX = modoTocar ? DESPLAZAMIENTO_TOCAR : 0;
  apiTabs.updateSettings();
  cajaTabs.scrollLeft = 0;
  if (apiTabs.score) dibujarPistas();
  else apiTabs.render();
}

// Controles: se muestran y, si está sonando, se esconden a los 3 s.
function mostrarControles() {
  document.body.classList.remove("controles-ocultos");
  programarOcultarControles();
}

function programarOcultarControles() {
  clearTimeout(temporizadorControles);
  if (!modoTocar) return;
  temporizadorControles = setTimeout(() => {
    if (modoTocar && quiereSonar()) document.body.classList.add("controles-ocultos");
  }, ESPERA_OCULTAR_MS);
}

// Cualquier toque reinicia la espera. Si los controles estaban escondidos,
// el toque solo los muestra (no pausa, no salta, no toca la tablatura).
document.addEventListener("pointerdown", (evento) => {
  if (!modoTocar) return;
  if (document.body.classList.contains("controles-ocultos")) {
    evento.preventDefault();
    evento.stopPropagation();
    tragarClic = true;
    setTimeout(() => { tragarClic = false; }, 700);
    mostrarControles();
    return;
  }
  programarOcultarControles();
}, true);
document.addEventListener("click", (evento) => {
  if (!tragarClic) return;
  tragarClic = false;
  evento.preventDefault();
  evento.stopPropagation();
}, true);

audio.addEventListener("play", programarOcultarControles);
audio.addEventListener("pause", () => {
  // La pausa de un instante para contar antes de la vuelta del bucle: el botón sigue en "pausa".
  if (cuentaEntrada) {
    botonPlay.textContent = "❚❚";
    botonPlay.setAttribute("aria-label", "Cancelar la cuenta");
    return;
  }
  if (modoTocar) mostrarControles();
});

/* ------------------------------------------------------------------
   Cuenta "3, 2, 1" antes de tocar
   ------------------------------------------------------------------ */

let cuentaPrevia = false;
try { cuentaPrevia = localStorage.getItem("cuentaPrevia") === "si"; } catch { /* apagada */ }
casillaCuentaPrevia.checked = cuentaPrevia;
casillaCuentaPrevia.addEventListener("change", () => {
  cuentaPrevia = casillaCuentaPrevia.checked;
  try { localStorage.setItem("cuentaPrevia", cuentaPrevia ? "si" : "no"); } catch { /* queda para esta sesión */ }
});

// La cuenta en curso: { temporizadores, osciladores } (null si no hay).
let cuentaEntrada = null;

// El botón de play: cancela la cuenta, cuenta y toca, o pausa.
function alternarReproduccion() {
  if (cuentaEntrada) cancelarCuenta();
  else if (audio.paused) tocarConCuenta();
  else audio.pause();
}

function tocarConCuenta() {
  if (cuentaPrevia) contarYTocar();
  else reproducirCancion();
}

// Segundos de un pulso en el lugar de la canción "segundos" (del análisis o del tempo).
function periodoDePulso(segundos) {
  if (pulsos.length >= 2) {
    const i = Math.max(0, Math.min(pulsos.length - 2, masCercano(pulsos, segundos - ajuste)));
    const periodo = pulsos[i + 1] - pulsos[i];
    if (periodo > 0.2 && periodo < 2) return periodo;
  }
  if (cancionActual && cancionActual.tempo > 0) return 60 / cancionActual.tempo;
  return 0.5;
}

// Un clic de la cuenta (aparte del metrónomo: a este no lo cancelan los saltos).
function clicDeCuenta(cuando, fuerte) {
  const oscilador = contextoAudio.createOscillator();
  const envolvente = contextoAudio.createGain();
  oscilador.frequency.value = fuerte ? 1760 : 1100;
  envolvente.gain.setValueAtTime(0, cuando);
  envolvente.gain.linearRampToValueAtTime(fuerte ? 1 : 0.6, cuando + 0.002);
  envolvente.gain.exponentialRampToValueAtTime(0.001, cuando + 0.06);
  oscilador.connect(envolvente).connect(gananciaMetronomo);
  oscilador.start(cuando);
  oscilador.stop(cuando + 0.07);
  oscilador.onended = () => envolvente.disconnect();
  return oscilador;
}

// Un compás de clics con el número grande (4, 3, 2, 1 en 4/4) y después play.
function contarYTocar() {
  cancelarCuenta();
  const contexto = asegurarAudio();
  if (!contexto) {
    reproducirCancion();
    return;
  }
  if (audio.ended || (isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05)) audio.currentTime = 0;
  const periodo = periodoDePulso(audio.currentTime) / audio.playbackRate;
  const tiempos = PULSOS_POR_COMPAS;
  const inicio = contexto.currentTime + 0.1;
  const cuenta = { temporizadores: [], osciladores: [] };
  cuentaEntrada = cuenta;
  for (let k = 0; k < tiempos; k++) {
    cuenta.osciladores.push(clicDeCuenta(inicio + k * periodo, k === 0));
    cuenta.temporizadores.push(setTimeout(() => {
      capaCuenta.textContent = String(tiempos - k);
      capaCuenta.hidden = false;
      // reinicia la animación del número
      capaCuenta.classList.remove("latido");
      void capaCuenta.offsetWidth;
      capaCuenta.classList.add("latido");
    }, 100 + k * periodo * 1000));
  }
  cuenta.temporizadores.push(setTimeout(() => {
    if (cuentaEntrada !== cuenta) return;
    cuentaEntrada = null;
    capaCuenta.hidden = true;
    reproducirCancion();
  }, 100 + tiempos * periodo * 1000));
  botonPlay.textContent = "❚❚";
  botonPlay.setAttribute("aria-label", "Cancelar la cuenta");
  pedirPantallaEncendida();
}

function cancelarCuenta() {
  const cuenta = cuentaEntrada;
  if (!cuenta) return;
  cuentaEntrada = null;
  for (const temporizador of cuenta.temporizadores) clearTimeout(temporizador);
  for (const oscilador of cuenta.osciladores) {
    try { oscilador.stop(); } catch { /* ya sonó */ }
  }
  capaCuenta.hidden = true;
  if (audio.paused) {
    botonPlay.textContent = "▶";
    botonPlay.setAttribute("aria-label", "Reproducir");
    soltarPantalla();
  }
}

// Otra canción: sin cuenta pendiente ni bucle.
audio.addEventListener("loadstart", () => {
  cancelarCuenta();
  sacarBucle();
});

/* ------------------------------------------------------------------
   Bucle A–B
   ------------------------------------------------------------------ */

// estado: "apagado" | "esperandoB" (ya está el inicio) | "activo".
// a, b: segundos del mp3 (b es el fin del último compás). finA: fin del compás A.
const bucleAB = { estado: "apagado", a: 0, b: 0, finA: 0 };

// Los compases de la tira (en segundos del mp3, con el ajuste): [inicio, fin] del que contiene "segundos".
function compasDeTira(segundos) {
  let inicio = null, fin = null;
  for (let i = 0; i < pulsos.length; i++) {
    if (!esCompas[i]) continue;
    const t = pulsos[i] + ajuste;
    if (t <= segundos + 0.03) inicio = t;
    else { fin = t; break; }
  }
  const duracion = isFinite(audio.duration) ? audio.duration : segundos + 4;
  if (inicio === null) inicio = 0;
  if (fin === null) fin = duracion;
  return [Math.max(0, inicio), fin];
}

// El compás (en segundos del mp3) de un pulso de la tablatura, con la sincronización.
function compasDeTab(pulso) {
  if (!mapaMastil || !pulso || !pulso.voice) return null;
  const indice = pulso.voice.bar.index;
  if (indice + 1 >= tiemposPartitura.length) return null;
  return [mapaMastil.aMp3(tiemposPartitura[indice]) / 1000, mapaMastil.aMp3(tiemposPartitura[indice + 1]) / 1000];
}

function marcarInicio([inicio, fin]) {
  bucleAB.estado = "esperandoB";
  bucleAB.a = inicio;
  bucleAB.finA = fin;
  mostrarBucle();
  mostrarMensaje("Inicio del bucle marcado: tocá el compás final (o A–B)");
}

function marcarFinal([inicio, fin], saltar) {
  // Si el compás final es anterior al inicio, se dan vuelta.
  const a = Math.min(bucleAB.a, inicio);
  const b = Math.max(bucleAB.finA, fin);
  bucleAB.estado = "activo";
  bucleAB.a = a;
  bucleAB.b = b;
  mostrarBucle();
  const compases = pulsos.filter((p, i) => esCompas[i] && p + ajuste >= a - 0.03 && p + ajuste < b - 0.03).length;
  mostrarMensaje(compases > 0
    ? `Bucle de ${compases === 1 ? "1 compás" : `${compases} compases`} · A–B lo saca`
    : "Bucle armado · A–B lo saca");
  // Tocando un compás en la tira o la tablatura, la canción se va a él: se vuelve al inicio.
  if (saltar) setTimeout(() => { audio.currentTime = bucleAB.a; actualizar(); }, 80);
}

function sacarBucle() {
  if (bucleAB.estado === "apagado") return;
  bucleAB.estado = "apagado";
  mostrarBucle();
}

// El botón: inicio en el compás que suena → final en el compás que suena → sin bucle.
botonBucle.addEventListener("click", () => {
  const ahora = posicionQueSuena(true);
  if (bucleAB.estado === "apagado") marcarInicio(compasDeTira(ahora));
  else if (bucleAB.estado === "esperandoB") marcarFinal(compasDeTira(ahora), false);
  else {
    sacarBucle();
    mostrarMensaje("Sin bucle");
  }
});

function mostrarBucle() {
  const { estado } = bucleAB;
  botonBucle.setAttribute("aria-pressed", String(estado === "activo"));
  botonBucle.classList.toggle("esperando", estado === "esperandoB");
  botonBucle.textContent = estado === "esperandoB" ? "A…" : "A–B";
  const texto = estado === "apagado" ? "Bucle A–B: marcar el inicio"
    : estado === "esperandoB" ? "Bucle A–B: marcar el final" : "Sacar el bucle A–B";
  botonBucle.setAttribute("aria-label", texto);
  botonBucle.title = texto;
  pintarBucleEnTira();
}

// En la tira de Pulsos, los compases del bucle (o el del inicio, mientras se espera el final).
function pintarBucleEnTira() {
  const { estado } = bucleAB;
  const desde = bucleAB.a;
  const hasta = estado === "activo" ? bucleAB.b : bucleAB.finA;
  const celdas = tira.children;
  for (let i = 0; i < celdas.length; i++) {
    const t = pulsos[i] + ajuste;
    const dentro = estado !== "apagado" && t >= desde - 0.03 && t < hasta - 0.03;
    celdas[i].classList.toggle("en-bucle", dentro);
  }
}

// Se llama en cada cuadro (actualizar, en app.js): al pasar el fin de B, vuelve a A.
function revisarBucleAB() {
  if (bucleAB.estado !== "activo" || audio.paused || audio.seeking || cuentaEntrada) return;
  const t = posicionQueSuena(true);
  // Solo si recién lo pasó: si se saltó a mano más allá del bucle, se respeta.
  if (t < bucleAB.b || t > bucleAB.b + 1.5) return;
  if (cuentaPrevia) {
    audio.pause();
    audio.currentTime = bucleAB.a;
    contarYTocar();
  } else {
    audio.currentTime = bucleAB.a;
  }
}

// Mantener apretado un compás (en la tira o en la tablatura) marca el inicio;
// con el inicio marcado, tocar otro compás marca el final.
let temporizadorPresion = null;
let presionLarga = false;      // la presión larga ya marcó: el clic que sigue no salta
let puntoPresion = null;

function empezarPresion(evento, alCumplirse) {
  cancelarPresion();
  presionLarga = false;
  puntoPresion = { x: evento.clientX, y: evento.clientY };
  temporizadorPresion = setTimeout(() => {
    temporizadorPresion = null;
    presionLarga = true;
    if (navigator.vibrate) navigator.vibrate(30);
    alCumplirse();
  }, PRESION_LARGA_MS);
}

function cancelarPresion() {
  clearTimeout(temporizadorPresion);
  temporizadorPresion = null;
}

// Tira de Pulsos
tira.addEventListener("pointerdown", (evento) => {
  const celda = evento.target.closest(".pulso");
  if (!celda || editando || idActual === null) return;
  const indice = Number(celda.dataset.indice);
  empezarPresion(evento, () => marcarInicio(compasDeTira(pulsos[indice] + ajuste)));
});
tira.addEventListener("pointermove", (evento) => {
  if (puntoPresion && Math.hypot(evento.clientX - puntoPresion.x, evento.clientY - puntoPresion.y) > 10) cancelarPresion();
});
for (const tipo of ["pointerup", "pointercancel", "pointerleave"]) tira.addEventListener(tipo, cancelarPresion);
tira.addEventListener("contextmenu", (evento) => evento.preventDefault());

// En la fase de captura: antes que el clic que salta a ese pulso (app.js).
tira.addEventListener("click", (evento) => {
  const celda = evento.target.closest(".pulso");
  if (!celda || editando) return;
  if (presionLarga) {
    presionLarga = false;
    evento.stopPropagation();
    return;
  }
  if (bucleAB.estado === "esperandoB") {
    evento.stopPropagation();
    marcarFinal(compasDeTira(pulsos[Number(celda.dataset.indice)] + ajuste), true);
  }
}, true);

// Tablatura: alphaTab avisa qué pulso se apretó y cuándo se soltó.
function conectarBucleConTabs() {
  apiTabs.beatMouseDown.on((pulso) => {
    if (editando) return;
    const compas = compasDeTab(pulso);
    if (!compas) return;
    if (bucleAB.estado === "esperandoB") {
      cancelarPresion();
      marcarFinal(compas, true);
      return;
    }
    presionLarga = false;
    clearTimeout(temporizadorPresion);
    temporizadorPresion = setTimeout(() => {
      temporizadorPresion = null;
      if (navigator.vibrate) navigator.vibrate(30);
      marcarInicio(compas);
    }, PRESION_LARGA_MS);
  });
  apiTabs.beatMouseUp.on(cancelarPresion);
}
cajaTabs.addEventListener("scroll", cancelarPresion, { passive: true });
cajaTabs.addEventListener("pointercancel", cancelarPresion);
cajaTabs.addEventListener("contextmenu", (evento) => evento.preventDefault());

mostrarBucle();
