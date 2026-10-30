"use strict";

/* ==================================================================
   Partes de la canción (Intro, Estrofa, Estribillo, Solo, Puente...)

   Se guardan por canción en "partes": [{ inicio (segundos), tipo, nombre }],
   ordenadas. Cada tipo tiene su color. Se arman de tres maneras:
     1. Detección automática (detectarPartes): se buscan los tramos que se
        repiten en la secuencia de acordes, compás por compás, usando las
        vueltas de la grilla (grilla.js). Si la canción tiene .gp, se usan
        sus secciones (si las trae) y se reconocen los solos (la guitarra
        líder toca mucho y la voz no canta).
     2. Desde un cifrado pegado, con las partes entre corchetes ([Intro],
        [Verse], [Chorus]...): sus acordes se alinean con los detectados para
        ubicar cada parte en la canción. Los nombres se traducen al español.
     3. A mano, en el editor: "Parte" marca dónde empieza una y permite
        elegir o escribir su nombre (o renombrar una que propuso la app).
   Se muestran en Pulsos (una leyenda con la parte que suena y una franja
   de color arriba de la tira) y en Grilla (un título arriba de cada grupo
   de vueltas). Van incluidas en "Exportar JSON".
   ================================================================== */

// Tipos de parte, con su nombre en español y su color.
const TIPOS_PARTE = {
  intro:         { nombre: "Intro",          color: "#94a3b8" },
  estrofa:       { nombre: "Estrofa",        color: "#38bdf8" },
  preestribillo: { nombre: "Pre-estribillo", color: "#a5b4fc" },
  estribillo:    { nombre: "Estribillo",     color: "#fb7185" },
  puente:        { nombre: "Puente",         color: "#c084fc" },
  solo:          { nombre: "Solo",           color: "#4ade80" },
  interludio:    { nombre: "Interludio",     color: "#2dd4bf" },
  final:         { nombre: "Final",          color: "#fb923c" },
  otra:          { nombre: "Parte",          color: "#d6d3d1" },
};

const ORDINALES_FEMENINO = ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Sexta", "Séptima", "Octava", "Novena", "Décima"];
const ORDINALES_MASCULINO = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"];

// Cómo se llaman las partes en los cifrados (en inglés o en español) -> tipo.
const NOMBRES_EN_CIFRADOS = [
  [/^(intro|introducci[oó]n|entrada)/i, "intro"],
  [/^(pre[\s-]?chorus|pre[\s-]?coro|pre[\s-]?estribillo|pre)\b/i, "preestribillo"],
  [/^(verse|verso|estrofa)/i, "estrofa"],
  [/^(chorus|coro|estribillo|refr[aá]n|hook|stribillo)/i, "estribillo"],
  [/^(bridge|puente|middle\s*8)/i, "puente"],
  [/^(solo|guitar\s*solo|solo\s+de)/i, "solo"],
  [/^(interlude|interludio|instrumental|break|riff)/i, "interludio"],
  [/^(outro|coda|final|ending|fin\b|cierre)/i, "final"],
];

/* ------------------------------------------------------------------
   Datos
   ------------------------------------------------------------------ */

function partesDeCancion() {
  return cancionActual && Array.isArray(cancionActual.partes) ? cancionActual.partes : [];
}

function colorDeParte(tipo) {
  return (TIPOS_PARTE[tipo] || TIPOS_PARTE.otra).color;
}

// La parte que suena en el segundo t (o null antes de la primera).
function parteEn(t) {
  let encontrada = null;
  for (const parte of partesDeCancion()) {
    if (parte.inicio <= t + 0.02) encontrada = parte; else break;
  }
  return encontrada;
}

/**
 * Nombres propuestos según el orden: "Primera estrofa", "Segunda estrofa",
 * "Estribillo", "Primer solo", "Segundo solo"... (se numeran las estrofas,
 * los solos y los puentes cuando hay más de uno).
 */
function nombrarPartes(partes) {
  const total = {};
  for (const p of partes) total[p.tipo] = (total[p.tipo] || 0) + 1;
  const vistas = {};
  return partes.map((p) => {
    vistas[p.tipo] = (vistas[p.tipo] || 0) + 1;
    return { ...p, nombre: nombreSugerido(p.tipo, vistas[p.tipo], total[p.tipo]) };
  });
}

function nombreSugerido(tipo, numero, total) {
  const base = (TIPOS_PARTE[tipo] || TIPOS_PARTE.otra).nombre;
  if (total <= 1 || !["estrofa", "solo", "puente"].includes(tipo)) return base;
  const ordinales = tipo === "estrofa" ? ORDINALES_FEMENINO : ORDINALES_MASCULINO;
  return `${ordinales[numero - 1] || numero + "°"} ${base.toLowerCase()}`;
}

// Guarda las partes de la canción abierta y redibuja todo lo que las muestra.
async function guardarPartes(partes) {
  if (idActual === null) return;
  const ordenadas = partes.slice().sort((a, b) => a.inicio - b.inicio)
    .map((p) => ({ inicio: Math.round(p.inicio * 1000) / 1000, tipo: TIPOS_PARTE[p.tipo] ? p.tipo : "otra", nombre: String(p.nombre || "").trim() || nombreSugerido(p.tipo, 1, 1) }));
  cancionActual = { ...cancionActual, partes: ordenadas };
  try {
    await actualizarCancion(idActual, { partes: ordenadas });
  } catch (error) {
    alert("No pude guardar las partes: " + error.message);
  }
  redibujarPartes();
}

function redibujarPartes() {
  dibujarGrillaVueltas();
  pintarPartesEnTira();
  parteMostrada = undefined;
  compasResaltado = -1;
  actualizar();
  if (dialogoPartes.open) dibujarListaPartes();
}

// Compás más cercano a un tiempo (las partes empiezan en un compás).
function alCompasMasCercano(t) {
  if (!compasesGrilla.length) return t;
  let mejor = compasesGrilla[0].inicio;
  for (const c of compasesGrilla) if (Math.abs(c.inicio - t) < Math.abs(mejor - t)) mejor = c.inicio;
  return mejor;
}

/* ------------------------------------------------------------------
   1. Detección automática
   ------------------------------------------------------------------ */

/**
 * Busca las partes con la secuencia de acordes:
 *   - Se arman renglones de una vuelta (los de la grilla). Cada compás se
 *     reduce a su acorde principal (el que más dura; raíz y mayor/menor),
 *     así un G#7 en vez de G# o un acorde de paso no separan dos vueltas.
 *   - Se juntan los renglones iguales seguidos ("A E G# C#m" tres veces).
 *   - Un renglón distinto justo después de un grupo de 2 o más es su cierre
 *     (en Cuchillos, la estrofa y el estribillo tienen la misma vuelta y
 *     solo cambia el final: "A E G# G#7" o "A E B B7"); salvo que ese
 *     renglón sea la vuelta de otra parte que se repite (entonces empieza
 *     una parte nueva, más corta).
 *   - Cada parte queda identificada por su vuelta y su cierre: las que
 *     coinciden son del mismo tipo. Un renglón suelto justo antes de una
 *     parte grande es su comienzo.
 *   - Lo que está antes de la primera parte grande que se repite es la
 *     Intro (también la primera parte si la voz no canta, según el .gp), y
 *     lo que está después de la última, el Final.
 *   - De las que se repiten, el Estribillo es la que más vueltas suma (si
 *     empatan, la que aparece después) y la otra, la Estrofa; más tipos
 *     repetidos son Puentes. Lo que no se repite, en el medio, es Puente,
 *     o Solo donde la tablatura dice que la voz no canta y la guitarra
 *     líder toca mucho.
 * Devuelve [{ inicio, tipo, nombre }].
 */
async function detectarPartes() {
  // Si el .gp trae secciones marcadas, son lo más confiable.
  const delGp = await seccionesDelGp();
  if (delGp.length) return nombrarPartes(delGp);

  const compases = compasesGrilla;
  const rango = rangoConAcordes(compases);
  if (!rango) return [];
  const largo = largoVuelta();
  // Acorde principal de cada compás: el que más pulsos dura (sin contar "N" si hay otro).
  const principal = (c) => {
    const conAcorde = c.trozos.filter((t) => t.acorde !== "N");
    if (!conAcorde.length) return "N";
    const mayor = conAcorde.reduce((a, b) => (b.pulsos > a.pulsos ? b : a));
    return familiaDeAcorde(mayor.acorde) || mayor.acorde;
  };
  const renglones = [];
  for (let k = rango.primero; k <= rango.ultimo; k += largo) {
    const hasta = Math.min(k + largo - 1, rango.ultimo);
    renglones.push({ desde: k, hasta, firma: compases.slice(k, hasta + 1).map(principal).join(" ") });
  }
  // Renglones iguales seguidos
  const grupos = [];
  for (const r of renglones) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.firma === r.firma) { ultimo.cantidad++; ultimo.hasta = r.hasta; }
    else grupos.push({ firma: r.firma, desde: r.desde, hasta: r.hasta, cantidad: 1 });
  }
  // Vueltas de las partes que se repiten (no pueden ser el cierre de otra).
  const vueltasGrandes = new Set(grupos.filter((g) => g.cantidad >= 2).map((g) => g.firma));
  // Partes: un grupo, más su cierre
  const secciones = [];
  for (const g of grupos) {
    const ultima = secciones[secciones.length - 1];
    if (ultima && g.cantidad === 1 && ultima.cantidad >= 2 && ultima.cierre === null && !vueltasGrandes.has(g.firma)) {
      ultima.cierre = g.firma;
      ultima.hasta = g.hasta;
    } else {
      secciones.push({ principal: g.firma, cantidad: g.cantidad, cierre: null, desde: g.desde, hasta: g.hasta });
    }
  }
  const claveDe = (s) => `${s.principal} || ${s.cierre || ""}`;
  const contar = () => {
    const veces = {};
    for (const s of secciones) veces[claveDe(s)] = (veces[claveDe(s)] || 0) + 1;
    return veces;
  };
  let veces = contar();
  const esGrande = (s) => s.cantidad >= 2 || s.cierre !== null;
  // Un renglón suelto que se parece a la vuelta de la parte grande que viene
  // después (3 de 4 compases iguales) es su comienzo.
  const parecidas = (a, b) => {
    const x = a.split(" "), y = b.split(" ");
    return x.filter((acorde, i) => acorde === y[i]).length >= 0.75 * Math.max(x.length, y.length);
  };
  for (let i = secciones.length - 2; i > 0; i--) {
    const s = secciones[i], siguiente = secciones[i + 1];
    if (!esGrande(s) && esGrande(siguiente) && veces[claveDe(siguiente)] >= 2 && parecidas(s.principal, siguiente.principal)) {
      siguiente.desde = s.desde;
      secciones.splice(i, 1);
    }
  }
  veces = contar();

  const fin = (s) => pulsos[compases[s.hasta].hasta] ?? pulsos[pulsos.length - 1];
  const inicio = (s) => compases[s.desde].inicio;
  const gp = await analisisDelGp();
  const repetida = (s) => veces[claveDe(s)] >= 2 && esGrande(s);
  let primera = secciones.findIndex(repetida);
  let ultima = -1;
  secciones.forEach((s, i) => { if (repetida(s)) ultima = i; });
  // Si la primera parte que se repite está al principio y la voz no canta, es la Intro.
  if (primera === 0 && gp && gp.sinVoz(inicio(secciones[0]), fin(secciones[0]))) primera = 1;

  // Estribillo: el tipo repetido que suma claramente más vueltas (un 25 %
  // más); si suman parecido, la Estrofa es la que aparece primero.
  const tipoDeClave = {};
  const repetidas = [];
  secciones.forEach((s, i) => {
    if (i < primera || i > ultima || !repetida(s)) return;
    const clave = claveDe(s);
    let r = repetidas.find((x) => x.clave === clave);
    if (!r) { r = { clave, vueltas: 0, aparicion: repetidas.length }; repetidas.push(r); }
    r.vueltas += s.hasta - s.desde + 1;   // compases
  });
  if (repetidas.length) {
    const [primero, segundo] = repetidas.slice().sort((a, b) => b.vueltas - a.vueltas || b.aparicion - a.aparicion);
    let estribillo = primero;
    if (segundo && primero.vueltas < 1.25 * segundo.vueltas) estribillo = primero.aparicion > segundo.aparicion ? primero : segundo;
    tipoDeClave[estribillo.clave] = "estribillo";
    const estrofa = repetidas.find((r) => r.clave !== estribillo.clave);
    if (estrofa) tipoDeClave[estrofa.clave] = "estrofa";
  }

  const partes = [];
  const agregar = (desde, tipo) => {
    const anterior = partes[partes.length - 1];
    // Las partes seguidas del mismo tipo que no se repiten se juntan en una.
    if (anterior && anterior.tipo === tipo && ["intro", "final", "puente", "solo"].includes(tipo)) return;
    partes.push({ inicio: desde, tipo });
  };
  secciones.forEach((s, i) => {
    if (primera >= 0 && i < primera) return agregar(inicio(s), "intro");
    if (ultima >= 0 && i > ultima) return agregar(inicio(s), "final");
    if (repetida(s)) return agregar(inicio(s), tipoDeClave[claveDe(s)] || "puente");
    // En el medio, sin repetirse: Solo o Puente, renglón por renglón.
    for (let k = s.desde; k <= s.hasta; k += largo) {
      const desde = compases[k].inicio;
      const hasta = pulsos[compases[Math.min(k + largo - 1, s.hasta)].hasta] ?? desde;
      agregar(desde, gp && gp.esSolo(desde, hasta) ? "solo" : "puente");
    }
  });
  return nombrarPartes(partes);
}

// Partitura de la canción abierta, si tiene .gp y está sincronizada (si no, null).
async function partituraSincronizada() {
  if (idActual === null || !cancionActual || !cancionActual.tabSync) return null;
  try {
    const partitura = await partituraDeCancion(idActual);
    if (!partitura) return null;
    const tiempos = calcularTiemposPartitura(partitura);
    const mapa = crearMapaPartituraMp3(cancionActual.tabSync, tiempos);
    const msDeTick = crearMapaDeTempo(partitura);
    return { partitura, segundos: (tick) => mapa.aMp3(msDeTick(tick)) / 1000 };
  } catch {
    return null;
  }
}

// Secciones marcadas en el .gp (Guitar Pro las guarda en los compases).
async function seccionesDelGp() {
  const gp = await partituraSincronizada();
  if (!gp) return [];
  const partes = [];
  for (const compas of gp.partitura.masterBars) {
    if (!compas.section) continue;
    const texto = (compas.section.text || compas.section.marker || "").trim();
    partes.push({ inicio: gp.segundos(compas.start), tipo: tipoDeNombre(texto) });
  }
  return partes;
}

/**
 * Lo que dice el .gp sobre un tramo de la canción (o null si no hay .gp
 * sincronizado):
 *   sinVoz(desde, hasta): la pista de la voz no canta;
 *   esSolo(desde, hasta): la voz no canta y una guitarra que no es la de
 *     acompañamiento toca al menos 3 notas por segundo.
 * Una pista es "la voz" si su nombre lo dice (Vocals, Voz...).
 */
async function analisisDelGp() {
  const gp = await partituraSincronizada();
  if (!gp) return null;
  const pistas = repartirPistas(gp.partitura, cancionActual.pistaAcompanamiento ?? null);
  const esVoz = (p) => /voc|voz|sing|canto|vox/i.test(p.name);
  const notasDe = (lista) => lista.flatMap((x) => x.eventos.map((e) => gp.segundos(e.inicio)));
  const hayVoz = pistas.otras.some((x) => esVoz(x.pista));
  const voces = notasDe(pistas.otras.filter((x) => esVoz(x.pista)));
  const lideres = notasDe(pistas.otras.filter((x) => !esVoz(x.pista) && !esPistaDeBajo(x.pista)));
  const enTramo = (lista, desde, hasta) => lista.filter((t) => t >= desde && t < hasta).length;
  // Sin contar el último segundo: la voz suele entrar un pulso antes de la parte siguiente.
  const sinVoz = (desde, hasta) => hayVoz && enTramo(voces, desde, Math.max(desde, hasta - 1)) === 0;
  return {
    sinVoz,
    esSolo: (desde, hasta) => sinVoz(desde, hasta) && enTramo(lideres, desde, hasta) / Math.max(1, hasta - desde) >= 3,
  };
}

/* ------------------------------------------------------------------
   2. Desde un cifrado pegado
   ------------------------------------------------------------------ */

// "Verse 2" -> "estrofa"; lo que no se reconoce es "otra".
function tipoDeNombre(texto) {
  const limpio = texto.replace(/[\[\]:]/g, "").trim();
  for (const [patron, tipo] of NOMBRES_EN_CIFRADOS) if (patron.test(limpio)) return tipo;
  return "otra";
}

/**
 * Lee un cifrado: encabezados de parte ([Intro], [Verse 1], "Estribillo:"...)
 * y renglones de acordes. Los renglones con letra se saltean (un renglón es
 * de acordes si casi todas sus palabras son acordes). "x2" o "(x3)" repiten
 * el renglón. Devuelve [{ tipo, etiqueta, acordes: [nombres] }].
 */
function leerCifrado(texto) {
  const secciones = [];
  let actual = null;
  const nueva = (etiqueta) => {
    actual = { tipo: tipoDeNombre(etiqueta), etiqueta: etiqueta.trim(), acordes: [] };
    secciones.push(actual);
  };
  for (const linea of texto.split(/\r?\n/)) {
    let resto = linea.trim();
    if (!resto) continue;
    // [Parte] al principio del renglón (puede seguir con acordes)
    const corchete = /^\[([^\]]+)\]\s*(.*)$/.exec(resto);
    if (corchete) {
      nueva(corchete[1]);
      resto = corchete[2];
    } else {
      // "Intro: Am C G" o "Estribillo final:"
      const dosPuntos = /^([A-Za-zÁÉÍÓÚáéíóúñÑ][A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s-]{1,30}):\s*(.*)$/.exec(resto);
      if (dosPuntos && tipoDeNombre(dosPuntos[1]) !== "otra") {
        nueva(dosPuntos[1]);
        resto = dosPuntos[2];
      }
    }
    if (!resto) continue;
    const palabras = resto.replace(/[|,]/g, " ").split(/\s+/).filter(Boolean);
    let repetir = 1;
    const sinRepeticion = palabras.filter((p) => {
      const r = /^\(?x(\d+)\)?$/i.exec(p) || /^\(?(\d+)x\)?$/i.exec(p);
      if (r) { repetir = Number(r[1]); return false; }
      return !/^[-%.]+$/.test(p);
    });
    const acordes = sinRepeticion.filter((p) => normalizarAcorde(p.replace(/[()]/g, "")));
    if (!acordes.length || acordes.length < 0.7 * sinRepeticion.length) continue;   // renglón de letra
    if (!actual) nueva("Intro");
    for (let i = 0; i < repetir; i++) actual.acordes.push(...acordes.map((a) => a.replace(/[()]/g, "")));
  }
  return secciones.filter((s) => s.acordes.length);
}

// Raíz y mayor/menor de un acorde ("C#m7" -> "1m", "Db" -> "1"), para comparar.
function familiaDeAcorde(nombre) {
  const a = normalizarAcorde(nombre);
  if (!a) return null;
  const menor = ["m", "m7", "m6", "m9", "m11", "madd9", "mmaj7", "m7b5", "dim", "dim7"].includes(a.tipo);
  return a.raiz + (menor ? "m" : "");
}

/**
 * Ubica las partes de un cifrado en la canción: se alinean los acordes del
 * cifrado con los detectados (la subsecuencia común más larga, con su
 * recorrido) y cada parte empieza donde cae su primer acorde alineado.
 * Si una parte no tiene ningún acorde alineado, se reparte el tiempo entre
 * sus vecinas. Devuelve { partes, alineados, total }.
 */
function ubicarCifrado(secciones) {
  // Detectados: los cambios de acorde (sin repetir y sin "N").
  const detectados = [];
  for (const tramo of acordes) {
    const familia = tramo.acorde === "N" ? null : familiaDeAcorde(tramo.acorde);
    if (!familia) continue;
    if (detectados.length && detectados[detectados.length - 1].familia === familia) continue;
    detectados.push({ familia, inicio: tramo.inicio });
  }
  // Cifrado: lo mismo, recordando de qué parte es cada acorde.
  const cifrado = [];
  secciones.forEach((s, n) => {
    for (const nombre of s.acordes) {
      const familia = familiaDeAcorde(nombre);
      if (!familia) continue;
      const ultimo = cifrado[cifrado.length - 1];
      if (ultimo && ultimo.familia === familia && ultimo.seccion === n) continue;
      cifrado.push({ familia, seccion: n });
    }
  });
  // Subsecuencia común más larga, con la tabla completa para recorrerla.
  const n = cifrado.length, m = detectados.length;
  const tabla = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      tabla[i][j] = cifrado[i].familia === detectados[j].familia
        ? tabla[i + 1][j + 1] + 1
        : Math.max(tabla[i + 1][j], tabla[i][j + 1]);
    }
  }
  const pareja = new Array(n).fill(-1);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (cifrado[i].familia === detectados[j].familia && tabla[i][j] === tabla[i + 1][j + 1] + 1) { pareja[i] = j; i++; j++; }
    else if (tabla[i + 1][j] >= tabla[i][j + 1]) i++;
    else j++;
  }
  // Inicio de cada parte: su primer acorde alineado.
  const inicios = secciones.map((_, s) => {
    const i = cifrado.findIndex((c, k) => c.seccion === s && pareja[k] >= 0);
    return i >= 0 ? detectados[pareja[i]].inicio : null;
  });
  // Las que quedaron sin ubicar: entre la anterior y la siguiente ubicadas.
  for (let s = 0; s < inicios.length; s++) {
    if (inicios[s] !== null) continue;
    let a = s - 1; while (a >= 0 && inicios[a] === null) a--;
    let b = s + 1; while (b < inicios.length && inicios[b] === null) b++;
    const desde = a >= 0 ? inicios[a] : 0;
    const hasta = b < inicios.length ? inicios[b] : (acordes.length ? acordes[acordes.length - 1].fin : desde);
    inicios[s] = desde + (hasta - desde) * (s - a) / (b - a);
  }
  // Nombres en español: las estrofas se numeran (si el cifrado trae el número, se respeta).
  const total = {};
  for (const s of secciones) total[s.tipo] = (total[s.tipo] || 0) + 1;
  const vistas = {};
  let partes = secciones.map((s, i) => {
    vistas[s.tipo] = (vistas[s.tipo] || 0) + 1;
    const numero = Number((/(\d+)/.exec(s.etiqueta) || [])[1]) || vistas[s.tipo];
    const nombre = s.tipo === "otra" ? s.etiqueta : nombreSugerido(s.tipo, numero, total[s.tipo]);
    return { inicio: alCompasMasCercano(inicios[i]), tipo: s.tipo, nombre };
  });
  // Dos partes en el mismo compás: queda la última.
  partes = partes.filter((p, i) => !(i + 1 < partes.length && Math.abs(partes[i + 1].inicio - p.inicio) < 0.05));
  return { partes, alineados: pareja.filter((j) => j >= 0).length, total: n };
}

/* ------------------------------------------------------------------
   Mostrar: leyenda en Pulsos y franja de color en la tira
   ------------------------------------------------------------------ */

const leyendaParte = document.getElementById("leyenda-parte");
let parteMostrada;    // la parte que dice la leyenda (undefined = redibujar)
let partesMostradas = null;

// Lo llama actualizar() en app.js con el tiempo que se escucha.
function actualizarLeyendaParte(t) {
  const partes = partesDeCancion();
  leyendaParte.hidden = !partes.length;
  if (!partes.length) return;
  const parte = parteEn(t);
  if (parte === parteMostrada && partes === partesMostradas) return;
  parteMostrada = parte;
  partesMostradas = partes;   // otra canción (u otras partes): se redibuja aunque "parte" sea igual
  const nombre = parte ? parte.nombre : partes[0].nombre;
  leyendaParte.textContent = parte ? nombre : `Antes de: ${nombre}`;
  leyendaParte.style.setProperty("--color-parte", colorDeParte(parte ? parte.tipo : partes[0].tipo));
  leyendaParte.classList.toggle("antes", !parte);
}

// Cada casillero de la tira lleva arriba el color de su parte; el primero
// de cada parte, además, una marca (lo llama dibujarTira en app.js).
function pintarPartesEnTira() {
  const partes = partesDeCancion();
  const celdas = tira.children;
  let k = -1;
  for (let i = 0; i < celdas.length; i++) {
    const t = pulsos[i] + 0.02;
    let nuevo = k;
    while (nuevo + 1 < partes.length && partes[nuevo + 1].inicio <= t) nuevo++;
    const empieza = nuevo !== k && nuevo >= 0;
    k = nuevo;
    const celda = celdas[i];
    if (k >= 0) celda.style.setProperty("--color-parte", colorDeParte(partes[k].tipo));
    else celda.style.removeProperty("--color-parte");
    celda.classList.toggle("con-parte", k >= 0);
    celda.classList.toggle("inicio-parte", empieza);
    if (empieza) celda.title = partes[k].nombre; else celda.removeAttribute("title");
  }
}

/* ------------------------------------------------------------------
   Ventana "Partes de la canción"
   ------------------------------------------------------------------ */

const dialogoPartes = document.getElementById("dialogo-partes");
const listaPartes = document.getElementById("lista-partes");
const sinPartes = document.getElementById("sin-partes");
const botonDetectarPartes = document.getElementById("detectar-partes");
const botonMostrarCifrado = document.getElementById("mostrar-cifrado");
const cajaCifrado = document.getElementById("caja-cifrado");
const textoCifrado = document.getElementById("texto-cifrado");
const botonUbicarCifrado = document.getElementById("ubicar-cifrado");
const resultadoCifrado = document.getElementById("resultado-cifrado");
const botonCerrarPartes = document.getElementById("cerrar-partes");

function opcionesDeTipo(elegido) {
  return Object.entries(TIPOS_PARTE).map(([tipo, { nombre }]) => {
    const opcion = new Option(nombre, tipo);
    opcion.selected = tipo === elegido;
    return opcion;
  });
}

// Una fila por parte: color, minuto (tocar salta ahí), tipo, nombre y borrar.
function dibujarListaPartes() {
  const partes = partesDeCancion();
  sinPartes.hidden = partes.length > 0;
  listaPartes.replaceChildren(...partes.map((parte, i) => {
    const fila = document.createElement("li");
    fila.style.setProperty("--color-parte", colorDeParte(parte.tipo));
    const minuto = document.createElement("button");
    minuto.type = "button";
    minuto.className = "minuto-parte";
    minuto.textContent = formatoTiempo(parte.inicio);
    minuto.addEventListener("click", () => { audio.currentTime = Math.max(0, parte.inicio + ajuste); actualizar(); });
    const tipo = document.createElement("select");
    tipo.setAttribute("aria-label", "Tipo de parte");
    tipo.append(...opcionesDeTipo(parte.tipo));
    tipo.addEventListener("change", () => {
      const copia = partes.slice();
      // Si el nombre era el sugerido, se cambia junto con el tipo.
      const eraSugerido = Object.values(TIPOS_PARTE).some((t) => parte.nombre.toLowerCase().includes(t.nombre.toLowerCase()));
      copia[i] = { ...parte, tipo: tipo.value, nombre: eraSugerido ? nombreSugerido(tipo.value, 1, 1) : parte.nombre };
      guardarPartes(copia);
    });
    const nombre = document.createElement("input");
    nombre.type = "text";
    nombre.maxLength = 40;
    nombre.value = parte.nombre;
    nombre.setAttribute("aria-label", "Nombre de la parte");
    nombre.addEventListener("change", () => {
      const copia = partes.slice();
      copia[i] = { ...parte, nombre: nombre.value };
      guardarPartes(copia);
    });
    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "borrar-parte";
    borrar.textContent = "×";
    borrar.setAttribute("aria-label", `Borrar ${parte.nombre}`);
    borrar.addEventListener("click", () => guardarPartes(partes.filter((_, k) => k !== i)));
    fila.append(minuto, tipo, nombre, borrar);
    return fila;
  }));
}

function abrirPartes() {
  if (idActual === null) return;
  cajaCifrado.hidden = true;
  resultadoCifrado.textContent = "";
  dibujarListaPartes();
  dialogoPartes.showModal();
}

botonDetectarPartes.addEventListener("click", async () => {
  if (partesDeCancion().length && !confirm("¿Reemplazar las partes por las que detecte la app?")) return;
  const partes = await detectarPartes();
  if (!partes.length) {
    alert("No encontré partes que se repitan en los acordes.");
    return;
  }
  await guardarPartes(partes);
  mostrarMensaje(`${partes.length} partes detectadas`);
});

botonMostrarCifrado.addEventListener("click", () => {
  cajaCifrado.hidden = !cajaCifrado.hidden;
  if (!cajaCifrado.hidden) textoCifrado.focus();
});

botonUbicarCifrado.addEventListener("click", async () => {
  const secciones = leerCifrado(textoCifrado.value);
  if (!secciones.length) {
    resultadoCifrado.textContent = "No encontré partes con acordes. Marcá cada parte entre corchetes, por ejemplo [Intro] o [Verse].";
    return;
  }
  if (partesDeCancion().length && !confirm("¿Reemplazar las partes por las del cifrado?")) return;
  const { partes, alineados, total } = ubicarCifrado(secciones);
  await guardarPartes(partes);
  resultadoCifrado.textContent = `${partes.length} partes ubicadas (coincidieron ${alineados} de ${total} acordes del cifrado).`;
});

botonCerrarPartes.addEventListener("click", () => dialogoPartes.close());
dialogoPartes.addEventListener("click", (evento) => { if (evento.target === dialogoPartes) dialogoPartes.close(); });
document.getElementById("boton-partes-grilla").addEventListener("click", abrirPartes);
document.getElementById("boton-partes").addEventListener("click", () => { panelOpciones.close(); abrirPartes(); });
leyendaParte.addEventListener("click", abrirPartes);

/* ------------------------------------------------------------------
   3. A mano, en el editor: "Parte" sobre el pulso elegido
   ------------------------------------------------------------------ */

const botonEditarParte = document.getElementById("editar-parte");
const dialogoParte = document.getElementById("dialogo-parte");
const tituloDialogoParte = document.getElementById("titulo-dialogo-parte");
const tipoParte = document.getElementById("tipo-parte");
const nombreParte = document.getElementById("nombre-parte");
const quitarParte = document.getElementById("quitar-parte");
let nombreParteEscrito = false;   // si se escribió un nombre, no se pisa al cambiar el tipo

botonEditarParte.addEventListener("click", () => {
  if (!seleccion) {
    mostrarMensaje("Tocá el pulso donde empieza la parte");
    return;
  }
  const inicio = pulsos[seleccion.desde];
  const partes = partesDeCancion();
  // ¿Ya empieza una parte en ese pulso? Entonces se renombra.
  const existente = partes.findIndex((p) => Math.abs(p.inicio - inicio) < 0.05);
  const parte = existente >= 0 ? partes[existente] : null;
  const tipo = parte ? parte.tipo : "estrofa";
  tituloDialogoParte.textContent = parte ? `Parte en ${formatoTiempo(inicio)}` : `Nueva parte en ${formatoTiempo(inicio)}`;
  tipoParte.replaceChildren(...opcionesDeTipo(tipo));
  nombreParte.value = parte ? parte.nombre : sugerenciaPara(tipo, inicio);
  nombreParteEscrito = !!parte;
  quitarParte.hidden = !parte;
  dialogoParte.returnValue = "";
  dialogoParte.showModal();
  dialogoParte.addEventListener("close", () => {
    const resultado = dialogoParte.returnValue;
    if (resultado === "guardar") {
      const nueva = { inicio, tipo: tipoParte.value, nombre: nombreParte.value };
      guardarPartes(existente >= 0 ? partes.map((p, i) => (i === existente ? nueva : p)) : [...partes, nueva]);
    } else if (resultado === "quitar" && existente >= 0) {
      guardarPartes(partes.filter((_, i) => i !== existente));
    }
  }, { once: true });
});

// Nombre sugerido para una parte nueva de ese tipo en ese momento ("Tercera estrofa").
function sugerenciaPara(tipo, inicio) {
  const antes = partesDeCancion().filter((p) => p.tipo === tipo && p.inicio < inicio).length;
  const despues = partesDeCancion().filter((p) => p.tipo === tipo && p.inicio > inicio).length;
  return nombreSugerido(tipo, antes + 1, antes + despues + 1);
}

tipoParte.addEventListener("change", () => {
  if (!nombreParteEscrito && seleccion) nombreParte.value = sugerenciaPara(tipoParte.value, pulsos[seleccion.desde]);
});
nombreParte.addEventListener("input", () => { nombreParteEscrito = true; });

/* ------------------------------------------------------------------
   Al importar un JSON: partes válidas o nada
   ------------------------------------------------------------------ */

function partesValidas(lista) {
  if (!Array.isArray(lista)) return undefined;
  const validas = lista.filter((p) => p && typeof p.inicio === "number" && p.inicio >= 0 && typeof p.nombre === "string")
    .map((p) => ({ inicio: p.inicio, nombre: p.nombre.slice(0, 40), tipo: TIPOS_PARTE[p.tipo] ? p.tipo : tipoDeNombre(p.nombre) }))
    .sort((a, b) => a.inicio - b.inicio);
  return validas.length ? validas : undefined;
}
