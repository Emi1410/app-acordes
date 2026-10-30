"use strict";

/* ==================================================================
   Sincronización automática de la tablatura con el mp3 (vista Tabs)

   Idea: comparar CUÁNDO hay ataques (golpes, notas que empiezan) en la
   partitura y en la grabación.
     1. Ataques de la partitura: el inicio de cada pulso con notas, en todas
        las pistas (la batería y el bajo pesan más, porque marcan el tiempo),
        ubicados en el tiempo con el tempo y los cambios de tempo del .gp.
     2. Ataques del mp3: la misma "envolvente de ataques" que usa el
        analizador para buscar los pulsos (analizador.js, modo soloAtaques).
     3. Búsqueda global: el corrimiento (dónde empieza el compás 1) y la
        escala de tempo (la banda en vivo puede tocar algo más rápido o lento)
        que mejor hacen coincidir los dos.
     4. Seguimiento de aceleraciones y frenadas con los PULSOS que el
        analizador ya detectó en el mp3: cada comienzo de compás se acerca al
        pulso más cercano y ese corrimiento se suaviza entre compases vecinos.
        (Se probó también un alineamiento elástico (DTW) sobre las curvas de
        ataques, pero con la canción de prueba empeoraba el resultado: seguía
        diferencias chicas entre las curvas y no cambios de tempo reales.)
     5. De ahí sale en qué segundo del mp3 empieza cada compás. Se simplifica
        a pocos puntos (donde el tempo cambia de verdad) y a cada uno se le
        calcula una confianza: qué parte de los compases vecinos tienen un
        pulso detectado justo donde quedó la sincronización.
   Lo anterior se guarda para poder deshacer todo con un toque.

   Usa variables y funciones de tablaturas.js (apiTabs, syncTabs,
   tiemposPartitura, guardarSyncTabs, mostrarSync...) y de app.js.
   ================================================================== */

const botonSincronizarSolo = document.getElementById("sincronizar-solo");
const botonDeshacerAutomatica = document.getElementById("deshacer-automatica");
const listaSync = document.getElementById("lista-sync");

// Sincronización que había antes de la automática (para deshacer), por canción.
let syncAntesDeAutomatica = null;
let cancionDeSyncAntes = null;

/* ------------------------------------------------------------------
   Tiempos de la partitura
   ------------------------------------------------------------------ */

const TICKS_NEGRA = 960;

// Devuelve una función tick -> ms de la partitura, con sus cambios de tempo.
function crearMapaDeTempo(partitura) {
  const cambios = [];
  for (const compas of partitura.masterBars) {
    const duracion = compas.calculateDuration();
    for (const cambio of compas.tempoAutomations || []) {
      cambios.push({ tick: compas.start + cambio.ratioPosition * duracion, bpm: cambio.value });
    }
  }
  cambios.sort((a, b) => a.tick - b.tick);
  const tramos = [{ tick: 0, ms: 0, bpm: partitura.tempo }];
  for (const cambio of cambios) {
    const anterior = tramos[tramos.length - 1];
    const ms = anterior.ms + (cambio.tick - anterior.tick) / TICKS_NEGRA * 60000 / anterior.bpm;
    tramos.push({ tick: cambio.tick, ms, bpm: cambio.bpm });
  }
  return (tick) => {
    let k = tramos.length - 1;
    while (k > 0 && tramos[k].tick > tick) k--;
    return tramos[k].ms + (tick - tramos[k].tick) / TICKS_NEGRA * 60000 / tramos[k].bpm;
  };
}

// Ataques de la partitura: [{ ms, peso }], uno por pulso con notas (sin las ligaduras).
function ataquesDePartitura(partitura) {
  const msDeTick = crearMapaDeTempo(partitura);
  const ataques = [];
  for (const pista of partitura.tracks) {
    const pentagrama = pista.staves[0];
    const programa = pista.playbackInfo ? pista.playbackInfo.program : 0;
    const peso = pentagrama.isPercussion ? 1 : (programa >= 32 && programa <= 39 ? 0.8 : 0.5);
    for (const compas of pentagrama.bars) {
      for (const voz of compas.voices) {
        for (const pulso of voz.beats) {
          if (pulso.isRest || !pulso.notes.some((n) => !n.isTieDestination)) continue;
          ataques.push({ ms: msDeTick(pulso.absolutePlaybackStart), peso });
        }
      }
    }
  }
  return ataques;
}

/* ------------------------------------------------------------------
   Curvas de ataques (las dos con los mismos "cuadros" por segundo)
   ------------------------------------------------------------------ */

// Suaviza con una campanita y normaliza (media 0, desvío 1).
function suavizarYNormalizar(curva) {
  const nucleo = [0.05, 0.25, 0.4, 0.25, 0.05];
  const suave = new Float32Array(curva.length);
  for (let i = 0; i < curva.length; i++) {
    let s = 0;
    for (let k = -2; k <= 2; k++) {
      const j = i + k;
      if (j >= 0 && j < curva.length) s += curva[j] * nucleo[k + 2];
    }
    suave[i] = s;
  }
  let media = 0;
  for (const v of suave) media += v;
  media /= suave.length;
  let varianza = 0;
  for (const v of suave) varianza += (v - media) ** 2;
  const desvio = Math.sqrt(varianza / suave.length) || 1;
  for (let i = 0; i < suave.length; i++) suave[i] = (suave[i] - media) / desvio;
  return suave;
}

// Curva de la partitura: los pesos de los ataques en cada cuadro.
function curvaDePartitura(ataques, fps, largo) {
  const curva = new Float32Array(largo);
  for (const { ms, peso } of ataques) {
    const k = Math.round(ms / 1000 * fps);
    if (k >= 0 && k < largo) curva[k] += peso;
  }
  return curva;
}

/* ------------------------------------------------------------------
   Paso 3: búsqueda global (corrimiento y escala de tempo)
   ------------------------------------------------------------------ */

// Qué tan bien caen los ataques de la partitura sobre la curva del mp3
// si el audio = corrimiento + escala × partitura (en cuadros).
function puntajeGlobal(curvaAudio, ataquesCuadros, corrimiento, escala) {
  let suma = 0;
  for (const { cuadro, peso } of ataquesCuadros) {
    const i = Math.round(corrimiento + escala * cuadro);
    if (i >= 0 && i < curvaAudio.length) suma += peso * curvaAudio[i];
  }
  return suma;
}

function busquedaGlobal(curvaAudio, ataquesCuadros, fps) {
  // Gruesa: solo la batería y el bajo (los que más marcan), escala de a 1 %, corrimiento de a 2 cuadros.
  const fuertes = ataquesCuadros.filter((a) => a.peso >= 0.8);
  const muestra = fuertes.length >= 200 ? fuertes : ataquesCuadros;
  let mejor = { puntaje: -Infinity, corrimiento: 0, escala: 1 };
  for (let escala = 0.9; escala <= 1.1001; escala += 0.01) {
    for (let corrimiento = Math.round(-10 * fps); corrimiento <= Math.round(60 * fps); corrimiento += 2) {
      const p = puntajeGlobal(curvaAudio, muestra, corrimiento, escala);
      if (p > mejor.puntaje) mejor = { puntaje: p, corrimiento, escala };
    }
  }
  // Fina: con todos los ataques, alrededor de lo encontrado.
  const gruesa = mejor;
  mejor = { puntaje: -Infinity, corrimiento: gruesa.corrimiento, escala: gruesa.escala };
  for (let escala = gruesa.escala - 0.01; escala <= gruesa.escala + 0.01001; escala += 0.001) {
    for (let corrimiento = gruesa.corrimiento - 4; corrimiento <= gruesa.corrimiento + 4; corrimiento++) {
      const p = puntajeGlobal(curvaAudio, ataquesCuadros, corrimiento, escala);
      if (p > mejor.puntaje) mejor = { puntaje: p, corrimiento, escala };
    }
  }
  return mejor;
}

/* ------------------------------------------------------------------
   Pasos 4 y 5: seguir el tempo con los pulsos, puntos y confianza
   ------------------------------------------------------------------ */

// Douglas-Peucker: se queda con los puntos necesarios para que la línea
// quebrada no se aparte más de "tolerancia" (ms) de los tiempos de cada compás.
function simplificar(puntos, tolerancia) {
  const quedan = new Array(puntos.length).fill(false);
  quedan[0] = quedan[puntos.length - 1] = true;
  const pila = [[0, puntos.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    let peor = -1, distancia = tolerancia;
    for (let i = a + 1; i < b; i++) {
      const t = (puntos[i].t - puntos[a].t) / (puntos[b].t - puntos[a].t);
      const esperado = puntos[a].ms + t * (puntos[b].ms - puntos[a].ms);
      const d = Math.abs(puntos[i].ms - esperado);
      if (d > distancia) { distancia = d; peor = i; }
    }
    if (peor >= 0) {
      quedan[peor] = true;
      pila.push([a, peor], [peor, b]);
    }
  }
  return puntos.filter((_, i) => quedan[i]);
}

// Correlación entre la curva del mp3 y la de la partitura (ya ubicada en el
// mp3) en una ventana de cuadros de la partitura.
function correlacionLocal(audio, partitura, audioDeCuadro, desde, hasta) {
  const xs = [], ys = [];
  for (let j = Math.max(0, desde); j < Math.min(partitura.length, hasta); j++) {
    const i = Math.round(audioDeCuadro[j]);
    if (i >= 0 && i < audio.length) { xs.push(audio[i]); ys.push(partitura[j]); }
  }
  if (xs.length < 10) return 0;
  const mx = xs.reduce((s, v) => s + v, 0) / xs.length, my = ys.reduce((s, v) => s + v, 0) / ys.length;
  let c = 0, vx = 0, vy = 0;
  for (let i = 0; i < xs.length; i++) {
    c += (xs[i] - mx) * (ys[i] - my);
    vx += (xs[i] - mx) ** 2;
    vy += (ys[i] - my) ** 2;
  }
  return c / Math.sqrt(vx * vy || 1);
}

/**
 * Método con los PULSOS que el analizador ya encontró en el mp3 (cancion.pulsos).
 * Partiendo de la recta global, cada comienzo de compás se acerca al pulso
 * detectado más cercano (si hay uno a menos de 150 ms). El corrimiento de
 * cada compás se suaviza con la mediana de los 9 compases de alrededor, así
 * un pulso mal detectado no tuerce nada; solo queda una curva suave que sigue
 * las aceleraciones y frenadas reales.
 * La confianza de cada compás: qué parte de los compases vecinos tienen un
 * pulso detectado a menos de 60 ms de donde quedó la curva.
 * Devuelve [{ compas, t, ms, confianza }] para cada compás.
 */
function compasesConPulsos(recta, tiemposCompas, pulsosMp3) {
  const pulsos = pulsosMp3.map((p) => p * 1000);
  const masCercano = (ms) => {
    let bajo = 0, alto = pulsos.length - 1;
    while (bajo < alto) {
      const medio = (bajo + alto) >> 1;
      if (pulsos[medio] < ms) bajo = medio + 1; else alto = medio;
    }
    const a = pulsos[Math.max(0, bajo - 1)], b = pulsos[bajo];
    return Math.abs(a - ms) <= Math.abs(b - ms) ? a : b;
  };
  // Corrimiento de cada compás respecto de la recta (o null si no hay pulso cerca)
  const crudos = tiemposCompas.map((t) => {
    const previsto = recta(t);
    const pulso = masCercano(previsto);
    return Math.abs(pulso - previsto) < 150 ? pulso - previsto : null;
  });
  const suaves = crudos.map((_, b) => {
    const vecinos = crudos.slice(Math.max(0, b - 4), b + 5).filter((x) => x !== null).sort((x, y) => x - y);
    return vecinos.length ? vecinos[vecinos.length >> 1] : null;
  });
  // Donde no hubo ningún pulso cerca, se repite el último corrimiento conocido.
  let ultimo = suaves.find((x) => x !== null) ?? 0;
  for (let b = 0; b < suaves.length; b++) {
    if (suaves[b] === null) suaves[b] = ultimo; else ultimo = suaves[b];
  }
  return tiemposCompas.map((t, b) => {
    const ms = recta(t) + suaves[b];
    const ventana = crudos.slice(Math.max(0, b - 4), b + 5);
    const bien = ventana.filter((x) => x !== null && Math.abs(recta(t) + x - ms) < 60).length;
    return { compas: b + 1, t, ms, confianza: Math.round(100 * bien / ventana.length) };
  });
}

/**
 * Todo el proceso. Devuelve { inicio (ms), puntos: [{ compas, ms, confianza }],
 * escala, confianzaInicio } o tira un error si no se pudo.
 */
async function calcularSincronizacionAutomatica(alProgreso, partitura = apiTabs.score, tiempos = tiemposPartitura) {
  const mp3 = await obtenerAudio(idActual);
  alProgreso(0.02, "Escuchando los ataques del mp3");
  const { envolvente, fps } = await analizarMp3(mp3, "", (f) => alProgreso(0.02 + 0.6 * f, "Escuchando los ataques del mp3"), null, { soloAtaques: true });

  alProgreso(0.65, "Comparando con la tablatura");
  await new Promise((r) => setTimeout(r, 0));   // deja dibujar la barra
  const audio = suavizarYNormalizar(envolvente);
  const ataques = ataquesDePartitura(partitura);
  if (ataques.length < 50) throw new Error("La tablatura tiene muy pocas notas para sincronizar.");
  const duracionPartitura = tiempos[tiempos.length - 1];
  const largoPartitura = Math.ceil(duracionPartitura / 1000 * fps) + 1;
  const curvaPartitura = suavizarYNormalizar(curvaDePartitura(ataques, fps, largoPartitura));
  const ataquesCuadros = ataques.map(({ ms, peso }) => ({ cuadro: ms / 1000 * fps, peso }));

  const global = busquedaGlobal(audio, ataquesCuadros, fps);
  alProgreso(0.85, "Siguiendo los cambios de tempo");
  const recta = (t) => (global.corrimiento + global.escala * t / 1000 * fps) / fps * 1000;
  const tiemposCompas = tiempos.slice(0, -1);

  // En qué ms del mp3 empieza cada compás, con su confianza. Se usan los
  // pulsos que detectó el análisis del audio (aunque la canción esté usando
  // los acordes de la tablatura, que traen los pulsos de la partitura).
  let compases;
  const delAudio = juegoDe(cancionActual, "analisis");
  const pulsos = delAudio && Array.isArray(delAudio.pulsos) ? delAudio.pulsos : [];
  if (pulsos.length >= 50) {
    compases = compasesConPulsos(recta, tiemposCompas, pulsos);
  } else {
    // Sin pulsos detectados (canción vieja): la recta global, y la confianza según
    // qué tan bien coinciden los ataques alrededor de cada compás.
    const audioDeCuadro = new Float32Array(curvaPartitura.length).map((_, j) => global.corrimiento + global.escala * j);
    const cuadrosPorCompas = (tiempos[1] - tiempos[0]) / 1000 * fps;
    compases = tiemposCompas.map((t, b) => {
      const j = t / 1000 * fps;
      const r = correlacionLocal(audio, curvaPartitura, audioDeCuadro, Math.round(j - 2 * cuadrosPorCompas), Math.round(j + 2 * cuadrosPorCompas));
      return { compas: b + 1, t, ms: recta(t), confianza: Math.round(100 * Math.max(0, Math.min(1, r / 0.5))) };
    });
  }

  // Pocos puntos: donde de verdad cambia el tempo (tolerancia 30 ms).
  const conConfianza = simplificar(compases, 30)
    .map((p) => ({ compas: p.compas, ms: Math.round(p.ms), confianza: p.confianza }));
  alProgreso(1, "Listo");
  return {
    inicio: Math.max(0, conConfianza[0].ms),
    confianzaInicio: conConfianza[0].confianza,
    puntos: conConfianza.slice(1),
    escala: global.escala,
  };
}

/* ------------------------------------------------------------------
   Botones de "Pistas y sync"
   ------------------------------------------------------------------ */

botonSincronizarSolo.addEventListener("click", async () => {
  if (!tabsListas || idActual === null) return;
  const anterior = { inicio: syncTabs.inicio, puntos: syncTabs.puntos.slice(), confianzaInicio: syncTabs.confianzaInicio };
  panelTabs.close();
  audio.pause();
  capaProgreso.hidden = false;
  let resultado;
  try {
    resultado = await calcularSincronizacionAutomatica((fraccion, etapa) => {
      barraProgreso.value = fraccion;
      textoProgreso.textContent = `${etapa}… ${Math.round(fraccion * 100)} %`;
    });
  } catch (error) {
    capaProgreso.hidden = true;
    alert("No pude sincronizar solo: " + error.message);
    return;
  }
  capaProgreso.hidden = true;
  syncAntesDeAutomatica = anterior;
  cancionDeSyncAntes = idActual;
  syncTabs = { inicio: resultado.inicio, puntos: resultado.puntos, confianzaInicio: resultado.confianzaInicio, automatica: true };
  guardarSyncTabs();
  mostrarListaSync();
  const tempo = Math.round(resultado.escala * 1000) / 10;
  mostrarMensaje(`Compás 1 en ${(resultado.inicio / 1000).toFixed(2).replace(".", ",")} s · ${resultado.puntos.length} puntos · tempo ${tempo} %`);
});

botonDeshacerAutomatica.addEventListener("click", () => {
  if (!syncAntesDeAutomatica || cancionDeSyncAntes !== idActual) return;
  syncTabs = syncAntesDeAutomatica;
  syncAntesDeAutomatica = null;
  guardarSyncTabs();
  mostrarListaSync();
  mostrarMensaje("Sincronización automática deshecha");
});

// Lista de puntos con su confianza (los marcados a mano no tienen).
function mostrarListaSync() {
  botonDeshacerAutomatica.disabled = !(syncAntesDeAutomatica && cancionDeSyncAntes === idActual);
  const confianza = (c) => (typeof c === "number" ? ` (${c} %)` : "");
  const items = [`Compás 1: ${(syncTabs.inicio / 1000).toFixed(2).replace(".", ",")} s${confianza(syncTabs.confianzaInicio)}`,
    ...syncTabs.puntos.slice().sort((a, b) => a.compas - b.compas)
      .map((p) => `Compás ${p.compas}: ${(p.ms / 1000).toFixed(2).replace(".", ",")} s${confianza(p.confianza)}`)];
  listaSync.replaceChildren(...items.map((texto) => {
    const li = document.createElement("li");
    li.textContent = texto;
    return li;
  }));
}
