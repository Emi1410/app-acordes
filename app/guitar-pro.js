"use strict";

/* ==================================================================
   Canciones desde archivos de Guitar Pro que traen el audio adentro

   Los .gp de Guitar Pro 7 y 8 son un zip: adentro está la partitura
   (Content/score.gpif) y, si el archivo se sincronizó con un audio, ese
   audio (Content/Assets/...) y los "puntos de sincronización" que unen
   cada compás con su momento en el audio. alphaTab 1.8 lee todo eso:
     - partitura.backingTrack.rawAudioFile: los bytes del audio;
     - partitura.exportFlatSyncPoints(): [{ barIndex, millisecondOffset }]
       (Guitar Pro los guarda en muestras a 44.100 Hz, "FrameOffset", y
       alphaTab los pasa a ms; se comprobó con los ataques del audio que
       esa es la unidad, aunque el mp3 sea de 48.000 Hz).
   Con eso la canción se arma sola: el audio del archivo, la tablatura
   (guardada SIN el audio adentro, para no guardarlo dos veces), los puntos
   de sincronización, los acordes calculados desde la tablatura con los
   compases y pulsos del .gp, la tonalidad, el nombre (título y artista) y
   la portada, si el audio trae una.

   Al importar se comprueba con los ataques del audio que la tablatura
   quede justa: en el archivo de prueba los puntos venían ~70 ms tarde,
   parejo en toda la canción. Ese corrimiento fijo se mide y se corrige
   (todos los puntos juntos), solo si es claro y parejo.
   ================================================================== */

const EXTENSIONES_GUITAR_PRO = /\.(gp|gp5|gpx|gp4)$/i;

/**
 * Lee un archivo de Guitar Pro. Devuelve {
 *   partitura, nombre (propuesto), audio (File o null), sync ({ inicio,
 *   puntos } o null), portada (Blob o null), gp (el archivo para guardar
 *   como tablatura, sin el audio adentro)
 * }.
 */
async function leerGuitarPro(archivo) {
  await cargarAlphaTab();
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  let partitura;
  try {
    partitura = alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes, new alphaTab.Settings());
  } catch (error) {
    throw new Error(`"${archivo.name}" no es un archivo de Guitar Pro que se pueda leer.`);
  }
  const crudo = partitura.backingTrack && partitura.backingTrack.rawAudioFile;
  const audio = crudo && crudo.length > 1000 ? archivoDeAudio(crudo, archivo.name) : null;
  const sinAudio = audio ? quitarAudioDelZip(bytes) : null;
  return {
    partitura,
    nombre: nombreDeGuitarPro(partitura, archivo.name),
    audio,
    sync: syncDelGuitarPro(partitura),
    portada: audio ? portadaDelAudio(crudo) : null,
    gp: sinAudio ? new File([sinAudio], archivo.name, { type: "application/octet-stream" }) : archivo,
  };
}

// "Título" del archivo, con el artista adelante si el título no lo trae.
function nombreDeGuitarPro(partitura, nombreArchivo) {
  const titulo = (partitura.title || "").trim(), artista = (partitura.artist || "").trim();
  if (!titulo) return nombreArchivo.replace(/\.[^.]+$/, "").replace(/_synced$/i, "");
  if (!artista || titulo.toLowerCase().includes(artista.toLowerCase())) return titulo;
  return `${artista} - ${titulo}`;
}

// El audio de adentro como archivo, con el tipo según sus primeros bytes.
function archivoDeAudio(bytes, nombreArchivo) {
  const empieza = (texto, desde = 0) => [...texto].every((c, i) => bytes[desde + i] === c.charCodeAt(0));
  let tipo = "audio/mpeg", extension = "mp3";
  if (empieza("OggS")) { tipo = "audio/ogg"; extension = "ogg"; }
  else if (empieza("RIFF")) { tipo = "audio/wav"; extension = "wav"; }
  else if (empieza("fLaC")) { tipo = "audio/flac"; extension = "flac"; }
  else if (empieza("ftyp", 4)) { tipo = "audio/mp4"; extension = "m4a"; }
  const base = nombreArchivo.replace(/\.[^.]+$/, "");
  return new File([bytes], `${base}.${extension}`, { type: tipo });
}

/**
 * Los puntos de sincronización del archivo, en el formato de la vista Tabs
 * ({ inicio: ms del compás 1, puntos: [{ compas, ms }] }), o null si no
 * trae. Se usan los que caen al principio de un compás (los de Guitar Pro
 * siempre son así) y la primera vez que suena (sin repeticiones).
 */
function syncDelGuitarPro(partitura) {
  if (!partitura.exportFlatSyncPoints) return null;
  const planos = partitura.exportFlatSyncPoints()
    .filter((p) => p.barOccurence === 0 && p.barPosition === 0)
    .sort((a, b) => a.barIndex - b.barIndex);
  if (planos.length < 2) return null;
  let inicio = planos[0].barIndex === 0 ? planos[0].millisecondOffset : null;
  if (inicio === null) {
    // Sin punto en el compás 1: se estira la recta de los dos primeros.
    const tiempos = calcularTiemposPartitura(partitura);
    const [a, b] = planos;
    const escala = (b.millisecondOffset - a.millisecondOffset) / (tiempos[b.barIndex] - tiempos[a.barIndex]);
    inicio = Math.max(0, a.millisecondOffset - escala * tiempos[a.barIndex]);
  }
  return {
    inicio: Math.round(inicio),
    puntos: planos.filter((p) => p.barIndex > 0).map((p) => ({ compas: p.barIndex + 1, ms: Math.round(p.millisecondOffset) })),
    deGuitarPro: true,
  };
}

/* ------------------------------------------------------------------
   Guardar la tablatura sin el audio: se rearma el zip sin Content/Assets
   ------------------------------------------------------------------ */

/**
 * Devuelve los bytes del mismo .gp sin los archivos de Content/Assets (el
 * audio), o null si no es un zip o no tiene nada ahí. Las demás entradas se
 * copian tal cual (comprimidas como estaban): solo se rearma el índice del
 * final del zip (el "directorio central") con las posiciones nuevas.
 */
function quitarAudioDelZip(bytes) {
  const datos = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (datos.getUint32(0, true) !== 0x04034b50) return null;              // "PK\3\4": no es un zip
  // Fin del directorio central: está al final (puede tener un comentario).
  let fin = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (datos.getUint32(i, true) === 0x06054b50) { fin = i; break; }
  }
  if (fin < 0) return null;
  const cantidad = datos.getUint16(fin + 10, true);
  const inicioDirectorio = datos.getUint32(fin + 16, true);
  const decodificador = new TextDecoder();
  const entradas = [];
  for (let i = 0, p = inicioDirectorio; i < cantidad; i++) {
    const largoNombre = datos.getUint16(p + 28, true), largoExtra = datos.getUint16(p + 30, true), largoComentario = datos.getUint16(p + 32, true);
    const largo = 46 + largoNombre + largoExtra + largoComentario;
    entradas.push({
      nombre: decodificador.decode(bytes.subarray(p + 46, p + 46 + largoNombre)),
      central: bytes.subarray(p, p + largo),
      local: datos.getUint32(p + 42, true),
    });
    p += largo;
  }
  const quedan = entradas.filter((e) => !(e.nombre.startsWith("Content/Assets/") && !e.nombre.endsWith("/")));
  if (quedan.length === entradas.length) return null;
  // Cada entrada local va desde su encabezado hasta el de la siguiente (incluye
  // los datos comprimidos y el descriptor, si lo tiene).
  const porPosicion = entradas.slice().sort((a, b) => a.local - b.local);
  porPosicion.forEach((e, k) => { e.finLocal = k + 1 < porPosicion.length ? porPosicion[k + 1].local : inicioDirectorio; });
  const partes = [], centrales = [];
  let posicion = 0;
  for (const e of quedan) {
    const local = bytes.subarray(e.local, e.finLocal);
    const central = new Uint8Array(e.central);                       // copia, para cambiarle la posición
    new DataView(central.buffer).setUint32(42, posicion, true);
    partes.push(local);
    centrales.push(central);
    posicion += local.length;
  }
  const largoCentral = centrales.reduce((s, c) => s + c.length, 0);
  const cierre = new Uint8Array(bytes.subarray(fin, fin + 22));
  const vista = new DataView(cierre.buffer);
  vista.setUint16(8, quedan.length, true);
  vista.setUint16(10, quedan.length, true);
  vista.setUint32(12, largoCentral, true);
  vista.setUint32(16, posicion, true);
  vista.setUint16(20, 0, true);                                      // sin comentario
  const resultado = new Uint8Array(posicion + largoCentral + 22);
  let k = 0;
  for (const parte of [...partes, ...centrales, cierre]) { resultado.set(parte, k); k += parte.length; }
  return resultado;
}

/* ------------------------------------------------------------------
   Portada: la imagen que traen las etiquetas ID3 del mp3 (si tiene)
   ------------------------------------------------------------------ */

function portadaDelAudio(bytes) {
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;     // "ID3"
  const version = bytes[3];
  const sincro = (i) => ((bytes[i] & 0x7f) << 21) | ((bytes[i + 1] & 0x7f) << 14) | ((bytes[i + 2] & 0x7f) << 7) | (bytes[i + 3] & 0x7f);
  const largoTotal = 10 + sincro(6);
  let p = 10;
  while (p + 10 < largoTotal) {
    const id = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
    const largo = version >= 4 ? sincro(p + 4) : ((bytes[p + 4] << 24) | (bytes[p + 5] << 16) | (bytes[p + 6] << 8) | bytes[p + 7]);
    if (!/^[A-Z0-9]{4}$/.test(id) || largo <= 0) break;
    if (id === "APIC") {
      const cuadro = bytes.subarray(p + 10, p + 10 + largo);
      // codificación (1) + tipo MIME (hasta un 0) + tipo de imagen (1) + descripción (hasta 0 o 00) + imagen
      let i = 1;
      let mime = "";
      while (i < cuadro.length && cuadro[i] !== 0) mime += String.fromCharCode(cuadro[i++]);
      i += 2;
      const doble = cuadro[0] === 1 || cuadro[0] === 2;
      while (i < cuadro.length && (doble ? (cuadro[i] !== 0 || cuadro[i + 1] !== 0) : cuadro[i] !== 0)) i += doble ? 2 : 1;
      i += doble ? 2 : 1;
      return new Blob([cuadro.subarray(i)], { type: mime.includes("/") ? mime : "image/jpeg" });
    }
    p += 10 + largo;
  }
  return null;
}

/* ------------------------------------------------------------------
   ¿La tablatura queda justa? Ataques de la partitura contra los del audio
   ------------------------------------------------------------------ */

/**
 * Compara los golpes de batería y bajo de la partitura (ubicados con la
 * sincronización) con la envolvente de ataques del audio, para corrimientos
 * de -300 a +300 ms. Si el mejor corrimiento es claro y parejo en los tres
 * tercios de la canción, devuelve la sincronización con todos los puntos
 * corridos esa cantidad; si no, la deja como está.
 * Devuelve { sync, corrimiento (ms, ya corregido el retraso propio de la
 * envolvente), aplicado, tercios: [ms, ms, ms] }.
 */
async function afinarSincronizacion(partitura, sync, audio, alProgreso = () => {}) {
  const { envolvente, fps } = await analizarMp3(audio, "", alProgreso, null, { soloAtaques: true });
  const curva = suavizarYNormalizar(envolvente);
  const tiempos = calcularTiemposPartitura(partitura);
  const mapa = crearMapaPartituraMp3(sync, tiempos);
  const golpes = ataquesDePartitura(partitura).filter((a) => a.peso >= 0.8).map((a) => mapa.aMp3(a.ms));
  const mejorEn = (lista) => {
    let mejor = { c: 0, p: -Infinity };
    for (let c = -300; c <= 300; c += 5) {
      let suma = 0, n = 0;
      for (const ms of lista) {
        const i = Math.round((ms + c) / 1000 * fps);
        if (i >= 0 && i < curva.length) { suma += curva[i]; n++; }
      }
      if (n && suma / n > mejor.p) mejor = { c, p: suma / n };
    }
    return mejor;
  };
  const tercio = Math.floor(golpes.length / 3);
  const global = mejorEn(golpes);
  const tercios = [golpes.slice(0, tercio), golpes.slice(tercio, 2 * tercio), golpes.slice(2 * tercio)].map((l) => mejorEn(l).c);
  // La envolvente marca los ataques un poco tarde (SESGO_ENVOLVENTE_MS): se descuenta.
  const corrimiento = global.c - SESGO_ENVOLVENTE_MS;
  const parejo = tercios.every((c) => Math.abs(c - global.c) <= 30);
  const aplicado = parejo && global.p > 0.5 && Math.abs(corrimiento) >= 15;
  const corrido = aplicado
    ? { ...sync, inicio: Math.max(0, Math.round(sync.inicio + corrimiento)), puntos: sync.puntos.map((p) => ({ ...p, ms: Math.round(p.ms + corrimiento) })), corrimientoAudio: corrimiento }
    : sync;
  return { sync: corrido, corrimiento, aplicado, tercios: tercios.map((c) => c - SESGO_ENVOLVENTE_MS), puntaje: global.p };
}

// Duración de un audio en segundos (lee solo el encabezado, sin decodificarlo entero).
function duracionDeAudio(archivo) {
  return new Promise((resolver) => {
    const elemento = new Audio();
    const url = URL.createObjectURL(archivo);
    const terminar = (valor) => { URL.revokeObjectURL(url); resolver(valor); };
    elemento.preload = "metadata";
    elemento.addEventListener("loadedmetadata", () => terminar(isFinite(elemento.duration) ? elemento.duration : 0), { once: true });
    elemento.addEventListener("error", () => terminar(0), { once: true });
    elemento.src = url;
  });
}

/* ------------------------------------------------------------------
   Armar y guardar la canción
   ------------------------------------------------------------------ */

/**
 * Guarda una canción a partir de un .gp con audio (lo que devuelve
 * leerGuitarPro). Devuelve { id, afinado (o null) }.
 *   nombre, nombreLista: lo que eligió la usuaria;
 *   alProgreso(fraccion, etapa).
 */
async function guardarCancionDesdeGuitarPro(info, nombre, nombreLista, alProgreso = () => {}) {
  const { partitura } = info;
  const duracion = await duracionDeAudio(info.audio);
  let sync = info.sync, afinado = null;
  if (sync) {
    afinado = await afinarSincronizacion(partitura, sync, info.audio, (f) => alProgreso(0.05 + 0.75 * f, "Comprobando la sincronización con el audio"));
    sync = afinado.sync;
  }
  alProgreso(0.85, "Armando los acordes desde la tablatura");
  await new Promise((r) => setTimeout(r, 0));
  const datos = {
    nombre,
    tamanoMp3: info.audio.size,
    agregada: Date.now(),
    portada: info.portada || undefined,
    origen: "guitarPro",
  };
  if (sync) {
    // Acordes, compases y pulsos de la tablatura, en tiempos del audio.
    const tiempos = calcularTiemposPartitura(partitura);
    const resultado = acordesDePartitura(partitura);
    const juego = armarJuegoTablatura(resultado, partitura, tiempos, sync, {}, duracion);
    Object.assign(datos, juego, {
      fuenteAcordes: "tablatura",
      tabSync: sync,
      tonalidad: NOTAS_ACORDE[resultado.tonalidad.tonica] + resultado.tonalidad.modo,
      tempo: tempoDeSincronizacion(partitura, tiempos, sync),
    });
  } else {
    // Trae audio pero no puntos de sincronización: se analiza al abrirla, como un mp3.
    Object.assign(datos, { tonalidad: "", tempo: 0, acordes: [], pendiente: true, ajuste: 0 });
  }
  const id = await guardarCancion(datos, info.audio, nombreLista);
  await guardarTablatura(id, info.gp, info.gp.name);
  alProgreso(1, "Listo");
  return { id, afinado };
}

// Tempo real de la grabación: pulsos de la partitura entre el primer y el último punto, sobre el tiempo del audio.
function tempoDeSincronizacion(partitura, tiempos, sync) {
  const ultimo = sync.puntos[sync.puntos.length - 1];
  if (!ultimo) return partitura.tempo;
  let pulsos = 0;
  for (let b = 0; b < ultimo.compas - 1; b++) {
    const compas = partitura.masterBars[b];
    pulsos += compas.timeSignatureNumerator * 4 / compas.timeSignatureDenominator;
  }
  const minutos = (ultimo.ms - sync.inicio) / 60000;
  return minutos > 0 ? Math.round(pulsos / minutos * 10) / 10 : partitura.tempo;
}

// Para emparejar un .gp sin audio con su mp3: el nombre sin extensión ni "_synced".
const claveDeArchivo = (nombre) => nombre.replace(/\.[^.]+$/, "").replace(/_synced$/i, "").toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, " ").trim();
