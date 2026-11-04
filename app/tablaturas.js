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
const zoomMenos = document.getElementById("zoom-menos");
const zoomMas = document.getElementById("zoom-mas");
const valorZoom = document.getElementById("valor-zoom");
const botonPanelTabs = document.getElementById("boton-panel-tabs");
const panelTabs = document.getElementById("panel-tabs");
const cerrarPanelTabs = document.getElementById("cerrar-panel-tabs");

// Zoom de la tablatura (escala de alphaTab). Se recuerda en este dispositivo.
const ZOOMS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3];
let zoomTabs = 0.7;
try {
  const guardado = Number(localStorage.getItem("zoomTabs"));
  if (ZOOMS.includes(guardado)) zoomTabs = guardado;
} catch {
  // sin localStorage: 70 %
}

function mostrarZoom() {
  valorZoom.textContent = `${Math.round(zoomTabs * 100)} %`;
  zoomMenos.disabled = zoomTabs <= ZOOMS[0];
  zoomMas.disabled = zoomTabs >= ZOOMS[ZOOMS.length - 1];
}

// − y +: cambia el tamaño, vuelve a dibujar y lo recuerda.
function cambiarZoom(paso) {
  const i = ZOOMS.indexOf(zoomTabs);
  zoomTabs = ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i + paso))];
  try {
    localStorage.setItem("zoomTabs", String(zoomTabs));
  } catch {
    // queda para esta sesión
  }
  mostrarZoom();
  if (apiTabs) {
    apiTabs.settings.display.scale = zoomTabs;
    apiTabs.updateSettings();
    apiTabs.render();
  }
}
zoomMenos.addEventListener("click", () => cambiarZoom(-1));
zoomMas.addEventListener("click", () => cambiarZoom(+1));
mostrarZoom();

// Panel con las pistas y la sincronización (para que la tablatura ocupe casi toda la pantalla).
botonPanelTabs.addEventListener("click", () => panelTabs.showModal());
cerrarPanelTabs.addEventListener("click", () => panelTabs.close());
panelTabs.addEventListener("click", (evento) => {
  if (evento.target === panelTabs) panelTabs.close();   // tocar afuera también lo cierra
});

// Cuánto lugar se deja arriba del renglón que suena al desplazar la
// tablatura. En el celular acostado, poco: así entran dos sistemas enteros.
const enHorizontal = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
const margenCursor = () => (enHorizontal.matches ? -6 : -40);
enHorizontal.addEventListener("change", () => {
  if (!apiTabs) return;
  apiTabs.settings.player.scrollOffsetY = margenCursor();
  apiTabs.updateSettings();
  // Cambió el ancho disponible: alphaTab vuelve a armar los renglones.
  apiTabs.render();
});

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
  // Con el mástil parado la tablatura escrita no se ve (y alphaTab no la
  // termina de dibujar): el aviso "Cargando…" se saca acá.
  if (vistaTabs.classList.contains("mastil-parado")) mostrarAvisoTabs("");
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
  const id = idActual;
  panelOpciones.close();
  // Un .gp de Guitar Pro 7/8 puede traer su audio y sus puntos de
  // sincronización (guitar-pro.js): se ofrece usarlos. La tablatura se
  // guarda siempre sin el audio adentro.
  let info = null;
  try {
    capaProgreso.hidden = false;
    barraProgreso.value = 0.1;
    textoProgreso.textContent = "Leyendo el archivo de Guitar Pro…";
    info = await leerGuitarPro(archivo);
  } catch {
    info = null;                       // se guarda tal cual, como antes
  } finally {
    capaProgreso.hidden = true;
  }
  const usarSync = !!(info && info.sync) && confirm(`Este .gp trae ${info.sync.puntos.length + 1} puntos de sincronización`
    + (info.audio ? " y su propio audio" : "") + ".\n¿Usar sus puntos de sincronización?");
  const usarAudio = !!(info && info.audio) && confirm("¿Reemplazar también el audio de la canción por el que trae el archivo?"
    + (usarSync ? "" : "\n(Sus puntos de sincronización son de ese audio.)"));
  try {
    await guardarTablatura(id, info ? info.gp : archivo, archivo.name);
    // Con un archivo nuevo, las pistas se vuelven a proponer.
    const cambios = { tabPistas: null };
    if (usarAudio) await reemplazarAudio(id, info.audio);
    if (usarSync) {
      // Los puntos tal cual vienen, con el corrimiento fijo corregido (comprobado con los ataques del audio).
      const audio = usarAudio ? info.audio : await obtenerAudio(id);
      capaProgreso.hidden = false;
      const afinado = await afinarSincronizacion(info.partitura, info.sync, audio, (f, etapa) => {
        barraProgreso.value = f;
        textoProgreso.textContent = `Comprobando la sincronización con el audio… ${Math.round(f * 100)} %`;
      });
      capaProgreso.hidden = true;
      cambios.tabSync = afinado.sync;
    }
    await actualizarCancion(id, cambios);
    if (id === idActual) cancionActual = { ...cancionActual, ...cambios };
    // Si ya tenía acordes sacados de la tablatura, se corren con la sincronización nueva.
    if (cambios.tabSync) await reubicarAcordesTablatura(id, info.partitura, calcularTiemposPartitura(info.partitura), cambios.tabSync);
  } catch (error) {
    capaProgreso.hidden = true;
    alert("No pude guardar la tablatura: " + error.message);
    return;
  }
  tabsDeCancion = null;                 // obliga a recargarla
  // Con otro audio, se vuelve a cargar la canción entera.
  if (usarAudio && id === idActual) await cargarCancion(id);
  mostrarMensaje(usarAudio ? "Tablatura y audio del .gp guardados" : usarSync ? "Tablatura guardada con su sincronización" : "Tablatura guardada");
  aplicarVista("tabs");
});

// Texto del botón del panel según si la canción ya tiene tablatura.
async function mostrarBotonTablatura() {
  const id = idActual;
  const tiene = id !== null && !!(await obtenerTablatura(id).catch(() => null));
  if (id === idActual) textoTablatura.textContent = tiene ? "Cambiar tablatura (.gp)" : "Agregar tablatura (.gp)";
  mostrarFuenteAcordes();   // el botón "Acordes desde la tablatura" (acordes-tablatura.js)
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
    const guardada = cancionActual && cancionActual.tabSync ? cancionActual.tabSync : {};
    syncTabs = {
      inicio: guardada.inicio || 0,
      puntos: Array.isArray(guardada.puntos) ? guardada.puntos.slice() : [],
      confianzaInicio: guardada.confianzaInicio,   // solo si la puso la sincronización automática
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

// Cuándo se tocó la tablatura por última vez (sin deslizar): solo después
// de un toque se acepta que alphaTab mueva la canción.
let ultimoToqueTabs = -1e9;
let inicioToqueTabs = null;
// (en la fase de captura: antes de que alphaTab reciba el mismo toque)
cajaTabs.addEventListener("pointerdown", (evento) => { inicioToqueTabs = { x: evento.clientX, y: evento.clientY }; }, true);
cajaTabs.addEventListener("pointerup", (evento) => {
  if (inicioToqueTabs && Math.hypot(evento.clientX - inicioToqueTabs.x, evento.clientY - inicioToqueTabs.y) < 12) {
    ultimoToqueTabs = performance.now();
  }
  inicioToqueTabs = null;
}, true);
cajaTabs.addEventListener("pointercancel", () => { inicioToqueTabs = null; }, true);

function crearApiTabs() {
  if (apiTabs) return;
  apiTabs = new alphaTab.AlphaTabApi(contenedorTabs, {
    core: {
      fontDirectory: "lib/alphatab/font/",   // la fuente Bravura está dentro de la app (sin internet)
      useWorkers: false,                     // así funciona también abriendo la app desde un archivo
    },
    display: {
      staveProfile: alphaTab.StaveProfile.Tab,   // solo tablatura (sin pentagrama)
      // En el modo tocar, un solo renglón que corre de costado (practica.js)
      layoutMode: modoTocar ? alphaTab.LayoutMode.Horizontal : alphaTab.LayoutMode.Page,
      scale: zoomTabs,                           // más chica que antes; se cambia con − y +
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
      scrollMode: vistaSincronizada ? alphaTab.ScrollMode.Continuous : alphaTab.ScrollMode.Off,
      scrollElement: cajaTabs,
      scrollOffsetY: margenCursor(),
      scrollOffsetX: modoTocar ? DESPLAZAMIENTO_TOCAR : 0,
    },
  });
  conectarBucleConTabs();   // tocar dos compases arma el bucle A–B (practica.js)

  apiTabs.scoreLoaded.on(alCargarPartitura);
  apiTabs.renderFinished.on(() => {
    ubicarCapsula(pulsoDeLaCapsula);
    alRedibujarVista();      // los corchetes del bucle siguen a la tablatura (bucles.js)
    if (!tabsListas) return;
    mostrarAvisoTabs("");
    llevarVistaAlCursor();   // al terminar de dibujar (también después de un zoom), mostrar el cursor
  });
  apiTabs.playerReady.on(() => {
    // El "reproductor" de alphaTab le pide al mp3 que se mueva, suene o pare.
    apiTabs.player.output.handler = {
      get backingTrackDuration() { return isFinite(audio.duration) ? audio.duration * 1000 : 0; },
      get playbackRate() { return audio.playbackRate; },
      set playbackRate(valor) {},           // la velocidad la maneja la app
      get masterVolume() { return 1; },
      set masterVolume(valor) {},           // alphaTab no suena
      // Solo se mueve el mp3 si fue un toque en la tablatura (una nota o un
      // compás). alphaTab también "salta" solo al cargar la partitura o al
      // aplicar la sincronización (a 0:00, y pausando): eso se ignora, así la
      // canción sigue sonando al cambiar de vista.
      seekTo(ms) {
        if (performance.now() - ultimoToqueTabs > 1500) return;
        audio.currentTime = Math.max(0, ms / 1000);
        alTocarParaSaltar();   // la vista vuelve a seguir a la canción (seguir.js)
      },
      play() {},     // play y pausa los maneja la app (alphaTab solo los imita)
      pause() {},
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
  guardarTrastesOriginales(partitura);
  prepararPulsosCapsula(partitura);
  moverTrastes(partitura);     // transporte y afinación (ver "Transportar la tablatura")
  dibujarPistas();
  prepararMastil(partitura);   // el diapasón con las notas que suenan (mastil.js)
  mostrarSync();
  partituraLista = true;
  mostrarAvisoAfinacionTab();
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

// Las dos guitarras; en el modo tocar, solo la Guitarra 1 (un renglón).
function dibujarPistas() {
  const partitura = apiTabs.score;
  const elegidas = modoTocar ? pistasElegidas.slice(0, 1) : pistasElegidas;
  const pistas = elegidas.filter((i) => i >= 0).map((i) => partitura.tracks[i]).filter(Boolean);
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
  return puntosDeSincronizacion(syncTabs, tiemposPartitura);
}

// Lo mismo para cualquier sincronización y partitura (también la usan los
// acordes desde la tablatura, ver acordes-tablatura.js).
function puntosDeSincronizacion(sync, tiempos) {
  const marcados = [{ compas: 1, ms: sync.inicio || 0 }, ...(sync.puntos || []).filter((p) => p.compas > 1)]
    .sort((a, b) => a.compas - b.compas);
  const lista = marcados.map((p) => ({ barIndex: p.compas - 1, barOccurence: 0, barPosition: 0, millisecondOffset: p.ms }));

  const ultimoCompas = tiempos.length - 2;                   // índice del último compás
  const ultimo = marcados[marcados.length - 1];
  if (ultimo.compas - 1 < ultimoCompas) {
    let escala = 1;                                          // ms de audio por ms de partitura
    if (marcados.length >= 2) {
      const anterior = marcados[marcados.length - 2];
      const partitura = tiempos[ultimo.compas - 1] - tiempos[anterior.compas - 1];
      if (partitura > 0) escala = (ultimo.ms - anterior.ms) / partitura;
    }
    const resto = tiempos[tiempos.length - 1] - tiempos[ultimo.compas - 1];
    lista.push({ barIndex: ultimoCompas, barOccurence: 0, barPosition: 1, millisecondOffset: ultimo.ms + escala * resto });
  }
  return lista;
}

function aplicarSyncTabs() {
  if (!apiTabs || !apiTabs.score || !tiemposPartitura.length) return;
  apiTabs.score.applyFlatSyncPoints(puntosParaAlphaTab());
  apiTabs.updateSyncPoints();
  prepararMapaMastil();   // el mástil sigue la misma sincronización (mastil.js)
  actualizarTabs();
}

function guardarSyncTabs() {
  if (idActual === null) return;
  const datos = { inicio: syncTabs.inicio, puntos: syncTabs.puntos.slice(), confianzaInicio: syncTabs.confianzaInicio };
  const id = idActual, partitura = apiTabs && apiTabs.score, tiempos = tiemposPartitura;
  actualizarCancion(id, { tabSync: datos })
    // Si la canción tiene acordes sacados de la tablatura, se corren con la
    // sincronización nueva (acordes-tablatura.js).
    .then(() => reubicarAcordesTablatura(id, partitura, tiempos, datos))
    .catch(() => {});
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
  mostrarListaSync();   // los puntos con su confianza (sincronizar-solo.js)
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
   Cursor tipo cápsula

   En lugar de la línea de alphaTab (que queda invisible), un óvalo
   alargado que encierra la columna de notas que suena, con un puntito
   arriba. En cada cuadro se busca el pulso de la Guitarra 1 que suena
   (también en pausa, al saltar) y la cápsula se ubica sobre él, con sus
   medidas en el dibujo, dentro de la caja de la tablatura: así se
   desplaza junto con ella.
   ------------------------------------------------------------------ */

const capsula = document.createElement("div");
capsula.className = "capsula-cursor";
capsula.setAttribute("aria-hidden", "true");
let pulsoDeLaCapsula = null;
let pulsosDeLaGuitarra1 = [];   // [{ ms (de la partitura), pulso }], en orden

// Los pulsos de la Guitarra 1 con su momento (al cargar o cambiar de pista).
function prepararPulsosCapsula(partitura) {
  const msDeTick = crearMapaDeTempo(partitura);
  const pista = partitura.tracks[pistasElegidas[0]];
  pulsosDeLaGuitarra1 = [];
  if (!pista) return;
  for (const compas of pista.staves[0].bars) {
    for (const pulso of compas.voices[0].beats) pulsosDeLaGuitarra1.push({ ms: msDeTick(pulso.absolutePlaybackStart), pulso });
  }
  pulsosDeLaGuitarra1.sort((a, b) => a.ms - b.ms);
}

// El pulso que suena en "ms" de la partitura (el último que ya empezó).
function pulsoQueSuena(ms) {
  let bajo = 0, alto = pulsosDeLaGuitarra1.length - 1, k = -1;
  while (bajo <= alto) {
    const medio = (bajo + alto) >> 1;
    if (pulsosDeLaGuitarra1[medio].ms <= ms + 1) { k = medio; bajo = medio + 1; } else alto = medio - 1;
  }
  return k >= 0 ? pulsosDeLaGuitarra1[k].pulso : null;
}

function ubicarCapsula(pulso) {
  pulsoDeLaCapsula = pulso;
  const medidas = pulso && apiTabs && apiTabs.renderer.boundsLookup ? apiTabs.renderer.boundsLookup.findBeat(pulso) : null;
  const superficie = contenedorTabs.querySelector(".at-surface");
  if (!medidas || !superficie) {
    capsula.remove();
    return;
  }
  if (capsula.parentElement !== cajaTabs) cajaTabs.appendChild(capsula);
  const caja = cajaTabs.getBoundingClientRect(), dibujo = superficie.getBoundingClientRect();
  const origenX = dibujo.left - caja.left + cajaTabs.scrollLeft;
  const origenY = dibujo.top - caja.top + cajaTabs.scrollTop;
  const renglon = medidas.barBounds.realBounds;
  const x = medidas.onNotesX || medidas.visualBounds.x + medidas.visualBounds.w / 2;
  const ancho = Math.max(18, Math.min(24, medidas.visualBounds.w + 6));
  capsula.style.left = `${origenX + x - ancho / 2}px`;
  capsula.style.width = `${ancho}px`;
  capsula.style.top = `${origenY + renglon.y + 4}px`;
  capsula.style.height = `${Math.max(20, renglon.h - 8)}px`;
}

/* ------------------------------------------------------------------
   Transportar la tablatura (y el mástil)

   El transporte (Más → Transportar) corre también los números de traste:
   cada nota pasa a sonar "transporte" semitonos más arriba o abajo. Si
   una nota queda por debajo del traste 0, se busca dónde queda más
   cómoda: la misma nota en la cuerda vecina más grave, o una octava
   arriba en la misma cuerda (lo más cerca de las otras notas del pulso).

   Afinación: si la tablatura está en otra afinación que la guitarra
   (Más → Afinación), por ejemplo el .gp en Eb y la guitarra en estándar,
   se avisa y con "Ajustar" se pasa a la afinación de la guitarra: los
   trastes se corren para que suene igual (se recuerda por canción).

   Se cambia el modelo de alphaTab (note.fret, note.string y la afinación
   del pentagrama); lo original queda guardado en cada nota para volver.
   ------------------------------------------------------------------ */

const ESTANDAR = [64, 59, 55, 50, 45, 40];     // E B G D A E (de la 1ª a la 6ª)
const TRASTE_MAXIMO = 24;
const avisoAfinacionTab = document.getElementById("aviso-afinacion-tab");
const textoAfinacionTab = document.getElementById("texto-afinacion-tab");
const botonAjustarAfinacionTab = document.getElementById("ajustar-afinacion-tab");
const casillaAjusteAfinacionTab = document.getElementById("ajuste-afinacion-tab");
const filaAjusteAfinacionTab = document.getElementById("fila-ajuste-afinacion-tab");

// Guarda el traste, la cuerda y la afinación con que vino el archivo (una sola vez).
function guardarTrastesOriginales(partitura) {
  for (const pista of partitura.tracks) {
    for (const pentagrama of pista.staves) {
      if (!pentagrama.afinacionOriginal) pentagrama.afinacionOriginal = pentagrama.tuning.slice();
      for (const compas of pentagrama.bars) {
        for (const voz of compas.voices) {
          for (const pulso of voz.beats) {
            for (const nota of pulso.notes) {
              if (nota.trasteOriginal === undefined) { nota.trasteOriginal = nota.fret; nota.cuerdaOriginal = nota.string; }
            }
          }
        }
      }
    }
  }
}

// Cuántos semitonos está la afinación de un pentagrama respecto de la
// estándar, si todas las cuerdas están corridas igual (Eb = -1, D = -2);
// null si es otra (Drop D, 7 cuerdas...).
function corrimientoDeAfinacion(afinacionPentagrama) {
  if (!afinacionPentagrama || afinacionPentagrama.length !== 6) return null;
  const d = afinacionPentagrama[0] - ESTANDAR[0];
  return afinacionPentagrama.every((a, i) => a - ESTANDAR[i] === d) ? d : null;
}

const NOMBRE_CORRIMIENTO = {
  "-3": "C#, un tono y medio abajo", "-2": "D, un tono abajo", "-1": "Eb, medio tono abajo",
  0: "afinación estándar", 1: "F, medio tono arriba",
};

// La afinación de la Guitarra 1 tal como viene en el archivo.
function afinacionDeLaTab() {
  const pista = apiTabs && apiTabs.score ? apiTabs.score.tracks[pistasElegidas[0]] : null;
  const pentagrama = pista ? pista.staves[0] : null;
  return pentagrama && !pentagrama.isPercussion ? corrimientoDeAfinacion(pentagrama.afinacionOriginal || pentagrama.tuning) : null;
}

const tabAjustadaAAfinacion = () => !!(cancionActual && cancionActual.tabAjusteAfinacion);

// ¿El modelo está distinto del archivo? (entonces no sirve para calcular acordes)
function tablaturaMovida() {
  return transporte !== 0 || tabAjustadaAAfinacion();
}

// Mueve todas las notas según el transporte y (si se ajustó) la afinación de la guitarra.
function moverTrastes(partitura) {
  for (const pista of partitura.tracks) {
    for (const pentagrama of pista.staves) {
      if (pentagrama.isPercussion || !pentagrama.afinacionOriginal || !pentagrama.afinacionOriginal.length) continue;
      const original = pentagrama.afinacionOriginal;
      // La afinación en la que se lee: la del archivo o, ajustada, la elegida en "Afinación".
      const afinacionGuitarra = tabAjustadaAAfinacion() && corrimientoDeAfinacion(original) !== null
        ? ESTANDAR.map((a) => a + afinacion)
        : original;
      afinacionGuitarra.forEach((a, i) => { pentagrama.tuning[i] = a; });
      const cuerdas = original.length;
      for (const compas of pentagrama.bars) {
        for (const voz of compas.voices) {
          for (const pulso of voz.beats) moverPulso(pulso, original, afinacionGuitarra, cuerdas);
        }
      }
    }
  }
}

// Las notas de un pulso: cada una a la altura nueva, en la cuerda y traste más cómodos.
function moverPulso(pulso, original, guitarra, cuerdas) {
  if (!pulso.notes.length) return;
  const alturaDeCuerda = (afinacionCuerdas, cuerda) => afinacionCuerdas[cuerdas - cuerda];   // cuerda 1 = la más grave
  // Primero cada nota en su misma cuerda; las que quedan fuera del diapasón, después.
  const planes = pulso.notes.map((nota) => {
    if (nota.trasteOriginal === undefined || nota.cuerdaOriginal < 1 || nota.cuerdaOriginal > cuerdas) return null;
    const altura = alturaDeCuerda(original, nota.cuerdaOriginal) + nota.trasteOriginal + transporte;
    return { nota, altura, cuerda: nota.cuerdaOriginal, traste: altura - alturaDeCuerda(guitarra, nota.cuerdaOriginal) };
  });
  const entra = (plan) => plan.traste >= 0 && plan.traste <= TRASTE_MAXIMO;
  const validos = planes.filter((p) => p && entra(p));
  const usadas = new Set(validos.map((p) => p.cuerda));
  const referencia = validos.length ? validos.reduce((suma, p) => suma + p.traste, 0) / validos.length : null;
  for (const plan of planes) {
    if (!plan || entra(plan)) continue;
    const opciones = [];
    if (plan.traste < 0) {
      // La misma nota en la cuerda vecina más grave (o la siguiente), o una octava arriba en la misma cuerda.
      for (const cuerda of [plan.cuerda - 1, plan.cuerda - 2]) {
        if (cuerda < 1 || usadas.has(cuerda)) continue;
        const traste = plan.altura - alturaDeCuerda(guitarra, cuerda);
        if (traste >= 0 && traste <= TRASTE_MAXIMO) opciones.push({ cuerda, traste, extra: cuerda === plan.cuerda - 1 ? 0 : 3 });
      }
      opciones.push({ cuerda: plan.cuerda, traste: plan.traste + 12, extra: 1 });
    } else {
      opciones.push({ cuerda: plan.cuerda, traste: plan.traste - 12, extra: 0 });
    }
    // La más cómoda: la más cerca de las otras notas del pulso (o del traste que tenía).
    const cerca = referencia ?? plan.nota.trasteOriginal;
    const costo = (o) => Math.abs(o.traste - cerca) + o.extra;
    const elegida = opciones.filter((o) => o.traste >= 0).sort((a, b) => costo(a) - costo(b))[0];
    if (!elegida) continue;
    plan.cuerda = elegida.cuerda;
    plan.traste = elegida.traste;
    usadas.add(elegida.cuerda);
  }
  for (const plan of planes) {
    if (!plan) continue;
    plan.nota.string = plan.cuerda;
    plan.nota.fret = Math.max(0, plan.traste);
  }
  // alphaTab busca las notas de un pulso por cuerda y por altura: se rearman.
  pulso.noteStringLookup.clear();
  pulso.noteValueLookup.clear();
  for (const nota of pulso.notes) {
    if (nota.isStringed) pulso.noteStringLookup.set(nota.string, nota);
    pulso.noteValueLookup.set(nota.realValue, nota);
  }
}

// Se llama al cambiar el transporte o la afinación (app.js): se vuelve a dibujar todo.
function transportarTablatura() {
  mostrarAvisoAfinacionTab();
  if (!apiTabs || !apiTabs.score || !partituraLista) return;
  moverTrastes(apiTabs.score);
  dibujarPistas();
  prepararMastil(apiTabs.score);
}

// "La tablatura está en Eb, medio tono abajo": si no coincide con la guitarra.
function mostrarAvisoAfinacionTab() {
  const deLaTab = partituraLista ? afinacionDeLaTab() : null;
  const distinta = deLaTab !== null && deLaTab !== afinacion;
  filaAjusteAfinacionTab.hidden = !distinta;
  casillaAjusteAfinacionTab.checked = tabAjustadaAAfinacion();
  avisoAfinacionTab.hidden = !distinta || tabAjustadaAAfinacion();
  if (!distinta) return;
  const guitarra = NOMBRE_CORRIMIENTO[afinacion] || "otra afinación";
  textoAfinacionTab.textContent = `La tablatura está en ${NOMBRE_CORRIMIENTO[deLaTab] || "otra afinación"}; tu guitarra, en ${guitarra}.`;
}

function cambiarAjusteAfinacionTab(ajustar) {
  if (idActual === null) return;
  cancionActual = { ...cancionActual, tabAjusteAfinacion: ajustar };
  actualizarCancion(idActual, { tabAjusteAfinacion: ajustar }).catch(() => {});
  transportarTablatura();
  if (ajustar) mostrarMensaje("Tablatura pasada a la afinación de tu guitarra");
}
botonAjustarAfinacionTab.addEventListener("click", () => cambiarAjusteAfinacionTab(true));
casillaAjusteAfinacionTab.addEventListener("change", () => cambiarAjusteAfinacionTab(casillaAjusteAfinacionTab.checked));

/* ------------------------------------------------------------------
   Seguir al mp3 (se llama desde actualizar() en app.js)
   ------------------------------------------------------------------ */

function actualizarTabs() {
  if (!tabsListas || vistaTabs.hidden || tabsDeCancion !== idActual) return;
  apiTabs.player.output.updatePosition(msQueSuena());
  const pulso = pulsoQueSuena(msPartituraAhora());
  if (pulso !== pulsoDeLaCapsula) ubicarCapsula(pulso);
  actualizarMastil();   // ilumina en el mástil las notas que suenan (mastil.js)
}

// El cursor de alphaTab se anima solo mientras su reproductor está "sonando".
audio.addEventListener("play", () => { if (tabsListas) apiTabs.play(); });
audio.addEventListener("pause", () => { if (tabsListas) apiTabs.pause(); });
// Al saltar a otro lugar con la canción en pausa, alphaTab mueve el cursor pero
// no desplaza la vista: se lo pedimos, para que se vea dónde quedó.
function llevarVistaAlCursor() {
  actualizarTabs();
  if (tabsListas && !vistaTabs.hidden && audio.paused && vistaSincronizada) setTimeout(() => apiTabs.scrollToCursor(), 60);
}
audio.addEventListener("seeked", llevarVistaAlCursor);
