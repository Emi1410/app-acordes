"use strict";

/* ==================================================================
   Vista de tablaturas (etapa 1): archivos de Guitar Pro con alphaTab

   - El archivo .gp/.gp5/.gpx/.gp4 se guarda junto con la canción en
     IndexedDB (almacén "tablaturas", ver biblioteca.js).
   - alphaTab (app/lib/alphatab, licencia MPL-2.0) lee el archivo y dibuja
     la tablatura de dos pistas: Guitarra 1 arriba y Guitarra 2 debajo,
     cada una de un color.
   - El que manda es el mp3: alphaTab funciona en modo "audio externo"
     (PlayerMode.EnabledExternalMedia), sin sonido propio. En cada cuadro le
     contamos en qué parte del mp3 estamos y mueve el cursor.
   - Sincronización: alphaTab trae "puntos de sincronización" (sync points):
     para un compás dado, en qué milisegundo del audio empieza. Entre dos
     puntos interpola. Guardamos por canción:
       inicio: dónde empieza el compás 1 en el mp3 (en ms),
       puntos: [{ compas, ms }] marcados a mano en vivo.
   La librería se carga recién cuando se usa esta vista (pesa ~1 MB).

   Usa variables y funciones de app.js (audio, idActual, cancionActual,
   posicionQueSuena, reproducirCancion, actualizarCancion, mostrarMensaje).
   ================================================================== */

const VERSION_ALPHATAB = "1.8.4";
const COLOR_GUITARRA_1 = "#f5b83d";   // amarillo, como el resto de la app
const COLOR_GUITARRA_2 = "#5ec8f2";   // celeste

// (vistaTabs y botonVistaTabs están declarados en app.js)
const avisoTabs = document.getElementById("aviso-tabs");
const selectorPista1 = document.getElementById("pista-1");
const selectorPista2 = document.getElementById("pista-2");
const cajaTabs = document.getElementById("caja-tabs");
const contenedorTabs = document.getElementById("tabs");
const resumenSync = document.getElementById("resumen-sync");
const valorInicio = document.getElementById("valor-inicio");
const inicioMenos = document.getElementById("inicio-menos");
const inicioMas = document.getElementById("inicio-mas");
const inicioAhora = document.getElementById("inicio-ahora");
const marcarCompas = document.getElementById("marcar-compas");
const deshacerPunto = document.getElementById("deshacer-punto");
const borrarPuntos = document.getElementById("borrar-puntos");
const inputTablatura = document.getElementById("input-tablatura");
const textoTablatura = document.getElementById("texto-tablatura");

// Estado de la vista
let apiTabs = null;            // la instancia de alphaTab (se crea una sola vez)
let tabsDeCancion = null;      // id de la canción cuya tablatura está cargada
let pistasElegidas = [0, 1];   // índices de las pistas (Guitarra 1, Guitarra 2; -1 = ninguna)
let syncTabs = { inicio: 0, puntos: [] };
let tiemposPartitura = [];     // ms (sin sincronizar) en que empieza cada compás según la partitura
// alphaTab avisa una sola vez que su reproductor está listo, pero la partitura
// se vuelve a cargar al cambiar de canción o de pista: llevamos los dos estados.
let reproductorTabsListo = false;
let partituraLista = false;
let tabsListas = false;        // las dos cosas: ya se puede seguir al mp3

function revisarTabsListas() {
  tabsListas = reproductorTabsListo && partituraLista;
  if (!tabsListas) return;
  aplicarSyncTabs();
  if (!audio.paused) apiTabs.play();
  actualizarTabs();
}

/* ------------------------------------------------------------------
   Cargar la librería solo cuando hace falta
   ------------------------------------------------------------------ */

let promesaLibreria = null;
function cargarAlphaTab() {
  if (!promesaLibreria) {
    promesaLibreria = new Promise((resolver, rechazar) => {
      if (window.alphaTab) { resolver(); return; }
      const script = document.createElement("script");
      script.src = `lib/alphatab/alphaTab.min.js?v=${VERSION_ALPHATAB}`;
      script.onload = () => resolver();
      script.onerror = () => {
        promesaLibreria = null;
        rechazar(new Error("No pude cargar la librería de tablaturas."));
      };
      document.head.appendChild(script);
    });
  }
  return promesaLibreria;
}

/* ------------------------------------------------------------------
   Importar el archivo de Guitar Pro (botón en el panel "Más")
   ------------------------------------------------------------------ */

const EXTENSIONES_TABLATURA = /\.(gp|gp5|gpx|gp4)$/i;

inputTablatura.addEventListener("change", async () => {
  const archivo = inputTablatura.files[0];
  inputTablatura.value = "";
  if (!archivo || idActual === null) return;
  if (!EXTENSIONES_TABLATURA.test(archivo.name)) {
    alert(`"${archivo.name}" no es un archivo de Guitar Pro (.gp, .gp5, .gpx o .gp4).`);
    return;
  }
  try {
    await guardarTablatura(idActual, archivo, archivo.name);
    // Con un archivo nuevo, las pistas se vuelven a proponer (la sincronización se mantiene).
    await actualizarCancion(idActual, { tabPistas: null });
    cancionActual = { ...cancionActual, tabPistas: null };
  } catch (error) {
    alert("No pude guardar la tablatura: " + error.message);
    return;
  }
  panelOpciones.close();
  tabsDeCancion = null;                 // obliga a recargarla
  mostrarMensaje("Tablatura guardada");
  aplicarVista("tabs");
});

// Texto del botón del panel según si la canción ya tiene tablatura.
async function mostrarBotonTablatura() {
  const id = idActual;
  const tiene = id !== null && !!(await obtenerTablatura(id).catch(() => null));
  if (id === idActual) textoTablatura.textContent = tiene ? "Cambiar tablatura (.gp)" : "Agregar tablatura (.gp)";
}

/* ------------------------------------------------------------------
   Mostrar la vista: cargar la tablatura de la canción abierta
   ------------------------------------------------------------------ */

function mostrarAvisoTabs(texto) {
  avisoTabs.textContent = texto;
  avisoTabs.hidden = !texto;
}

// Se llama al elegir la vista "Tabs" y al abrir otra canción con la vista activa.
async function mostrarVistaTabs() {
  mostrarBotonTablatura();
  if (vistaTabs.hidden || idActual === null) return;
  if (tabsDeCancion === idActual && tabsListas) return;   // ya está cargada

  const id = idActual;
  partituraLista = false;
  tabsListas = false;
  let tablatura;
  try {
    tablatura = await obtenerTablatura(id);
  } catch {
    tablatura = null;
  }
  if (id !== idActual) return;
  if (!tablatura) {
    tabsDeCancion = id;
    contenedorTabs.replaceChildren();
    selectorPista1.replaceChildren();
    selectorPista2.replaceChildren();
    mostrarAvisoTabs("Esta canción no tiene tablatura. Agregala desde “Más” → “Agregar tablatura (.gp)”.");
    return;
  }

  mostrarAvisoTabs("Cargando la tablatura…");
  try {
    await cargarAlphaTab();
    crearApiTabs();
    // Sincronización y pistas guardadas para esta canción
    syncTabs = {
      inicio: cancionActual && cancionActual.tabSync ? cancionActual.tabSync.inicio || 0 : 0,
      puntos: cancionActual && cancionActual.tabSync && Array.isArray(cancionActual.tabSync.puntos)
        ? cancionActual.tabSync.puntos.slice() : [],
    };
    tabsDeCancion = id;
    apiTabs.load(new Uint8Array(await tablatura.archivo.arrayBuffer()));
  } catch (error) {
    mostrarAvisoTabs("No pude abrir la tablatura: " + error.message);
  }
}

/* ------------------------------------------------------------------
   alphaTab: configuración (tema oscuro, solo tablatura, audio externo)
   ------------------------------------------------------------------ */

function crearApiTabs() {
  if (apiTabs) return;
  apiTabs = new alphaTab.AlphaTabApi(contenedorTabs, {
    core: {
      fontDirectory: "lib/alphatab/font/",   // la fuente Bravura está dentro de la app (sin internet)
      useWorkers: false,                     // así funciona también abriendo la app desde un archivo
    },
    display: {
      staveProfile: alphaTab.StaveProfile.Tab,   // solo tablatura (sin pentagrama)
      layoutMode: alphaTab.LayoutMode.Page,
      scale: 0.85,
      resources: {
        mainGlyphColor: "#f2f4f6",
        secondaryGlyphColor: "rgba(242,244,246,0.45)",
        staffLineColor: "#4a525c",
        barSeparatorColor: "#6b747e",
        barNumberColor: "#9aa4ae",
        scoreInfoColor: "#f2f4f6",
      },
    },
    player: {
      playerMode: alphaTab.PlayerMode.EnabledExternalMedia,   // el audio es el mp3
      enableCursor: true,
      enableAnimatedBeatCursor: true,
      enableUserInteraction: true,                            // tocar una nota salta a ese lugar del mp3
      scrollMode: alphaTab.ScrollMode.Continuous,
      scrollElement: cajaTabs,
      scrollOffsetY: -40,
    },
  });

  apiTabs.scoreLoaded.on(alCargarPartitura);
  apiTabs.renderFinished.on(() => {
    if (tabsListas) mostrarAvisoTabs("");
  });
  apiTabs.playerReady.on(() => {
    // El "reproductor" de alphaTab le pide al mp3 que se mueva, suene o pare.
    apiTabs.player.output.handler = {
      get backingTrackDuration() { return isFinite(audio.duration) ? audio.duration * 1000 : 0; },
      get playbackRate() { return audio.playbackRate; },
      set playbackRate(valor) {},           // la velocidad la maneja la app
      get masterVolume() { return 1; },
      set masterVolume(valor) {},           // alphaTab no suena
      seekTo(ms) { audio.currentTime = Math.max(0, ms / 1000); },
      play() { if (audio.paused) reproducirCancion(); },
      pause() { if (!audio.paused) audio.pause(); },
    };
    reproductorTabsListo = true;
    revisarTabsListas();
  });
}

/* ------------------------------------------------------------------
   Pistas: Guitarra 1 y Guitarra 2
   ------------------------------------------------------------------ */

// ¿Es una pista de guitarra? (programa MIDI 24-31, o "guit" en el nombre, y no es percusión)
function esGuitarra(pista) {
  const programa = pista.playbackInfo ? pista.playbackInfo.program : -1;
  const percusion = pista.staves.some((s) => s.isPercussion);
  return !percusion && ((programa >= 24 && programa <= 31) || /guit/i.test(pista.name));
}

function alCargarPartitura(partitura) {
  const pistas = partitura.tracks;

  // Propuesta: las dos primeras guitarras. Si hay una elección guardada, se respeta.
  const guitarras = pistas.filter(esGuitarra).map((p) => p.index);
  const guardadas = cancionActual && Array.isArray(cancionActual.tabPistas) ? cancionActual.tabPistas : null;
  pistasElegidas = guardadas && guardadas.every((i) => i === -1 || (i >= 0 && i < pistas.length))
    ? guardadas.slice()
    : [guitarras[0] ?? 0, guitarras[1] ?? (pistas.length > 1 ? 1 : -1)];

  // Selectores con todas las pistas (las guitarras primero)
  const opciones = (conNinguna) => {
    const lista = pistas.map((p) => new Option(`${p.index + 1}. ${p.name}`, String(p.index)));
    if (conNinguna) lista.unshift(new Option("— ninguna —", "-1"));
    return lista;
  };
  selectorPista1.replaceChildren(...opciones(false));
  selectorPista2.replaceChildren(...opciones(true));
  selectorPista1.value = String(pistasElegidas[0]);
  selectorPista2.value = String(pistasElegidas[1]);

  tiemposPartitura = calcularTiemposPartitura(partitura);
  pintarPistas(partitura);
  dibujarPistas();
  mostrarSync();
  partituraLista = true;
  revisarTabsListas();
}

// Colorea los números de traste y las líneas de cada guitarra.
function pintarPistas(partitura) {
  const colores = [COLOR_GUITARRA_1, COLOR_GUITARRA_2];
  pistasElegidas.forEach((indice, n) => {
    const pista = partitura.tracks[indice];
    if (!pista) return;
    const color = alphaTab.model.Color.fromJson(colores[n]);
    const lineas = alphaTab.model.Color.fromJson(n === 0 ? "rgba(245,184,61,0.45)" : "rgba(94,200,242,0.45)");
    for (const pentagrama of pista.staves) {
      for (const compas of pentagrama.bars) {
        compas.style = new alphaTab.model.BarStyle();
        compas.style.colors.set(alphaTab.model.BarSubElement.GuitarTabsStaffLine, lineas);
        for (const voz of compas.voices) {
          for (const pulso of voz.beats) {
            for (const nota of pulso.notes) {
              nota.style = new alphaTab.model.NoteStyle();
              nota.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, color);
            }
          }
        }
      }
    }
  });
}

function dibujarPistas() {
  const partitura = apiTabs.score;
  const pistas = pistasElegidas.filter((i) => i >= 0).map((i) => partitura.tracks[i]);
  if (pistas.length) apiTabs.renderTracks(pistas);
}

// Cambiar una pista: se recuerda por canción y se vuelve a dibujar.
function cambiarPista(n, valor) {
  pistasElegidas[n] = Number(valor);
  if (idActual !== null) {
    actualizarCancion(idActual, { tabPistas: pistasElegidas.slice() }).catch(() => {});
    cancionActual = { ...cancionActual, tabPistas: pistasElegidas.slice() };
  }
  // Para que el color siga a la pista, se recarga el archivo (los estilos quedan en el modelo).
  tabsDeCancion = null;
  mostrarVistaTabs();
}
selectorPista1.addEventListener("change", () => cambiarPista(0, selectorPista1.value));
selectorPista2.addEventListener("change", () => cambiarPista(1, selectorPista2.value));

/* ------------------------------------------------------------------
   Sincronización con el mp3
   ------------------------------------------------------------------ */

const TICKS_POR_NEGRA = 960;   // así cuenta alphaTab los tiempos (como el MIDI)

/**
 * Cuándo empieza cada compás según la partitura sola (en ms, con sus
 * cambios de tempo), más el final. Sirve para el punto final automático y
 * para sugerir qué compás se está marcando.
 */
function calcularTiemposPartitura(partitura) {
  const tiempos = [];
  let bpm = partitura.tempo;
  let t = 0;
  for (const compas of partitura.masterBars) {
    tiempos.push(t);
    const duracion = compas.calculateDuration();
    let posicion = 0;
    const cambios = (compas.tempoAutomations || []).slice().sort((a, b) => a.ratioPosition - b.ratioPosition);
    for (const cambio of cambios) {
      const tick = cambio.ratioPosition * duracion;
      t += (tick - posicion) / TICKS_POR_NEGRA * 60000 / bpm;
      posicion = tick;
      bpm = cambio.value;
    }
    t += (duracion - posicion) / TICKS_POR_NEGRA * 60000 / bpm;
  }
  tiempos.push(t);
  return tiempos;
}

/**
 * Arma la lista de puntos para alphaTab:
 *   - el compás 1 en "inicio",
 *   - los puntos marcados (ordenados por compás),
 *   - un punto final automático. Sin él, alphaTab estiraría el último tramo
 *     hasta el final del mp3 (aplausos incluidos); con él, la partitura sigue
 *     al tempo del último tramo marcado (o al de la partitura si no hay).
 */
function puntosParaAlphaTab() {
  const marcados = [{ compas: 1, ms: syncTabs.inicio }, ...syncTabs.puntos.filter((p) => p.compas > 1)]
    .sort((a, b) => a.compas - b.compas);
  const lista = marcados.map((p) => ({ barIndex: p.compas - 1, barOccurence: 0, barPosition: 0, millisecondOffset: p.ms }));

  const ultimoCompas = tiemposPartitura.length - 2;          // índice del último compás
  const ultimo = marcados[marcados.length - 1];
  if (ultimo.compas - 1 < ultimoCompas) {
    let escala = 1;                                          // ms de audio por ms de partitura
    if (marcados.length >= 2) {
      const anterior = marcados[marcados.length - 2];
      const partitura = tiemposPartitura[ultimo.compas - 1] - tiemposPartitura[anterior.compas - 1];
      if (partitura > 0) escala = (ultimo.ms - anterior.ms) / partitura;
    }
    const resto = tiemposPartitura[tiemposPartitura.length - 1] - tiemposPartitura[ultimo.compas - 1];
    lista.push({ barIndex: ultimoCompas, barOccurence: 0, barPosition: 1, millisecondOffset: ultimo.ms + escala * resto });
  }
  return lista;
}

function aplicarSyncTabs() {
  if (!apiTabs || !apiTabs.score || !tiemposPartitura.length) return;
  apiTabs.score.applyFlatSyncPoints(puntosParaAlphaTab());
  apiTabs.updateSyncPoints();
  actualizarTabs();
}

function guardarSyncTabs() {
  if (idActual === null) return;
  const datos = { inicio: syncTabs.inicio, puntos: syncTabs.puntos.slice() };
  actualizarCancion(idActual, { tabSync: datos }).catch(() => {});
  cancionActual = { ...cancionActual, tabSync: datos };
  mostrarSync();
  aplicarSyncTabs();
}

function mostrarSync() {
  valorInicio.textContent = (syncTabs.inicio / 1000).toFixed(2).replace(".", ",") + " s";
  const n = syncTabs.puntos.length;
  resumenSync.textContent = `(compás 1 en ${(syncTabs.inicio / 1000).toFixed(1).replace(".", ",")} s · ${n === 1 ? "1 punto" : `${n} puntos`})`;
  deshacerPunto.disabled = n === 0;
  borrarPuntos.disabled = n === 0;
}

// Lo que se está ESCUCHANDO ahora, en ms del mp3 (descuenta la demora del audio).
const msQueSuena = () => Math.max(0, posicionQueSuena(true) * 1000);

inicioMenos.addEventListener("click", () => { syncTabs.inicio = Math.max(0, syncTabs.inicio - 50); guardarSyncTabs(); });
inicioMas.addEventListener("click", () => { syncTabs.inicio += 50; guardarSyncTabs(); });
inicioAhora.addEventListener("click", () => { syncTabs.inicio = Math.round(msQueSuena()); guardarSyncTabs(); });

/**
 * Compás que empieza más cerca del momento "ms" del audio, según la
 * sincronización actual (la misma interpolación que hace alphaTab).
 */
function compasSugerido(ms) {
  const puntos = puntosParaAlphaTab().map((p) => ({ t: tiemposPartitura[p.barIndex + p.barPosition], ms: p.millisecondOffset }));
  // Pasamos de ms del audio a ms de la partitura con el tramo que corresponde.
  let k = 0;
  while (k + 1 < puntos.length - 1 && puntos[k + 1].ms <= ms) k++;
  const a = puntos[k], b = puntos[Math.min(k + 1, puntos.length - 1)];
  const t = b.ms === a.ms ? a.t : a.t + (ms - a.ms) * (b.t - a.t) / (b.ms - a.ms);
  let mejor = 0;
  for (let i = 0; i < tiemposPartitura.length - 1; i++) {
    if (Math.abs(tiemposPartitura[i] - t) < Math.abs(tiemposPartitura[mejor] - t)) mejor = i;
  }
  return mejor + 1;
}

// "Marcar compás": se toma el momento al tocar, y después se elige qué compás es.
marcarCompas.addEventListener("click", () => {
  if (!tabsListas) return;
  const ms = Math.round(msQueSuena());
  const total = tiemposPartitura.length - 1;
  const respuesta = prompt(`¿Qué compás empieza en ${(ms / 1000).toFixed(2).replace(".", ",")} s? (1 a ${total})`, String(compasSugerido(ms)));
  if (respuesta === null) return;
  const compas = parseInt(respuesta, 10);
  if (!(compas >= 1 && compas <= total)) {
    alert(`El compás tiene que ser un número entre 1 y ${total}.`);
    return;
  }
  if (compas === 1) {
    syncTabs.inicio = ms;
  } else {
    // Un compás tiene un solo punto. Y los puntos tienen que ir en orden: si el
    // nuevo contradice a otro (un compás posterior marcado antes), se descarta el viejo.
    syncTabs.puntos = syncTabs.puntos.filter((p) => p.compas !== compas
      && (p.compas < compas ? p.ms < ms : p.ms > ms));
    syncTabs.puntos.push({ compas, ms });
    if (syncTabs.inicio >= ms) syncTabs.inicio = 0;
  }
  guardarSyncTabs();
  mostrarMensaje(`Compás ${compas} en ${(ms / 1000).toFixed(2).replace(".", ",")} s`);
});

// Deshacer el último punto agregado (el último de la lista).
deshacerPunto.addEventListener("click", () => {
  syncTabs.puntos.pop();
  guardarSyncTabs();
});

borrarPuntos.addEventListener("click", () => {
  if (!confirm("¿Borrar todos los puntos de sincronización? (El compás 1 se mantiene.)")) return;
  syncTabs.puntos = [];
  guardarSyncTabs();
});

/* ------------------------------------------------------------------
   Seguir al mp3 (se llama desde actualizar() en app.js)
   ------------------------------------------------------------------ */

function actualizarTabs() {
  if (!tabsListas || vistaTabs.hidden || tabsDeCancion !== idActual) return;
  apiTabs.player.output.updatePosition(msQueSuena());
}

// El cursor de alphaTab se anima solo mientras su reproductor está "sonando".
audio.addEventListener("play", () => { if (tabsListas) apiTabs.play(); });
audio.addEventListener("pause", () => { if (tabsListas) apiTabs.pause(); });
audio.addEventListener("seeked", actualizarTabs);
