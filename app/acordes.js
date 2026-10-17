"use strict";

/* ==================================================================
   Biblioteca de posiciones de acordes para guitarra (afinación estándar)

   Cómo se describe una posición:
     trastes: un número por cuerda, de la 6ª (Mi grave) a la 1ª (Mi agudo).
              -1 = la cuerda no se toca (X), 0 = al aire (O), 1 o más = traste.
     dedos:   un número por cuerda: 1 índice, 2 mayor, 3 anular, 4 meñique,
              0 = ningún dedo (cuerda al aire o que no se toca).
     cejilla: (opcional) { traste, desde, hasta }: el índice apoyado sobre
              varias cuerdas en ese traste. "desde" y "hasta" son posiciones
              en los arrays de arriba (0 = 6ª cuerda ... 5 = 1ª cuerda).

   Las posiciones abiertas están escritas a mano. Las de cejilla se generan
   a partir de cuatro "formas" móviles (las de E, Em, E7 y Em7 con raíz en la
   6ª cuerda, y las de A, Am, A7 y Am7 con raíz en la 5ª), corriéndolas
   traste por traste. Así las 48 se arman con la misma forma probada y no
   hay que escribir (ni revisar) cada una por separado.
   ================================================================== */

const NOTAS_ACORDE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Semitono de cada letra (C = 0). Se usa para traducir bemoles a sostenidos.
const SEMITONO_LETRA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Formas de escribir el tipo de acorde que aceptamos, y a qué tipo equivalen.
// Los cuatro primeros tienen posiciones propias (abajo); el resto sale de
// chords-db (app/acordes-extra.js).
const TIPOS_EQUIVALENTES = {
  "": "", "M": "", "maj": "",
  "m": "m", "min": "m", "-": "m",
  "7": "7", "dom7": "7",
  "m7": "m7", "min7": "m7", "-7": "m7",
  "5": "5",
  "dim": "dim", "°": "dim", "o": "dim",
  "dim7": "dim7", "°7": "dim7", "o7": "dim7",
  "aug": "aug", "+": "aug",
  "sus2": "sus2", "sus4": "sus4", "sus": "sus4", "7sus4": "7sus4", "7sus": "7sus4",
  "6": "6", "m6": "m6", "69": "69", "6add9": "69",
  "9": "9", "m9": "m9",
  "maj7": "maj7", "M7": "maj7", "Δ7": "maj7", "7M": "maj7",
  "maj9": "maj9", "add9": "add9", "madd9": "madd9", "add11": "add11",
  "m7b5": "m7b5", "ø": "m7b5", "ø7": "m7b5",
  "mmaj7": "mmaj7", "mM7": "mmaj7", "m(maj7)": "mmaj7",
  "7b5": "7b5", "aug7": "aug7", "7#5": "aug7", "+7": "aug7",
  "7b9": "7b9", "7#9": "7#9", "11": "11", "m11": "m11", "13": "13",
};

// Tipos que se ofrecen en el editor de acordes, con su descripción.
const TIPOS_DE_ACORDE = [
  { tipo: "", nombre: "Mayor" }, { tipo: "m", nombre: "Menor" },
  { tipo: "7", nombre: "7" }, { tipo: "m7", nombre: "m7" },
  { tipo: "maj7", nombre: "maj7" }, { tipo: "5", nombre: "5 (power)" },
  { tipo: "sus2", nombre: "sus2" }, { tipo: "sus4", nombre: "sus4" },
  { tipo: "7sus4", nombre: "7sus4" }, { tipo: "add9", nombre: "add9" },
  { tipo: "madd9", nombre: "madd9" }, { tipo: "6", nombre: "6" },
  { tipo: "m6", nombre: "m6" }, { tipo: "9", nombre: "9" },
  { tipo: "m9", nombre: "m9" }, { tipo: "dim", nombre: "dim" },
  { tipo: "dim7", nombre: "dim7" }, { tipo: "m7b5", nombre: "m7b5" },
  { tipo: "aug", nombre: "aug" }, { tipo: "mmaj7", nombre: "mmaj7" },
  { tipo: "69", nombre: "69" }, { tipo: "maj9", nombre: "maj9" },
  { tipo: "add11", nombre: "add11" }, { tipo: "11", nombre: "11" },
  { tipo: "m11", nombre: "m11" }, { tipo: "13", nombre: "13" },
  { tipo: "7b5", nombre: "7b5" }, { tipo: "aug7", nombre: "aug7" },
  { tipo: "7b9", nombre: "7b9" }, { tipo: "7#9", nombre: "7#9" },
];

// Posiciones abiertas (con cuerdas al aire), solo para los acordes que las tienen.
const ACORDES_ABIERTOS = {
  "C":   [{ trastes: [-1, 3, 2, 0, 1, 0], dedos: [0, 3, 2, 0, 1, 0] }],
  "C7":  [{ trastes: [-1, 3, 2, 3, 1, 0], dedos: [0, 3, 2, 4, 1, 0] }],
  "D":   [{ trastes: [-1, -1, 0, 2, 3, 2], dedos: [0, 0, 0, 1, 3, 2] }],
  "Dm":  [{ trastes: [-1, -1, 0, 2, 3, 1], dedos: [0, 0, 0, 2, 3, 1] }],
  "D7":  [{ trastes: [-1, -1, 0, 2, 1, 2], dedos: [0, 0, 0, 2, 1, 3] }],
  "Dm7": [{ trastes: [-1, -1, 0, 2, 1, 1], dedos: [0, 0, 0, 2, 1, 1],
            cejilla: { traste: 1, desde: 4, hasta: 5 } }],
  "E":   [{ trastes: [0, 2, 2, 1, 0, 0], dedos: [0, 2, 3, 1, 0, 0] }],
  "Em":  [{ trastes: [0, 2, 2, 0, 0, 0], dedos: [0, 2, 3, 0, 0, 0] }],
  "E7":  [{ trastes: [0, 2, 0, 1, 0, 0], dedos: [0, 2, 0, 1, 0, 0] }],
  "Em7": [{ trastes: [0, 2, 0, 0, 0, 0], dedos: [0, 2, 0, 0, 0, 0] }],
  // F "chico", sin la cejilla completa: más fácil para empezar.
  "F":   [{ trastes: [-1, -1, 3, 2, 1, 1], dedos: [0, 0, 3, 2, 1, 1],
            cejilla: { traste: 1, desde: 4, hasta: 5 } }],
  "G":   [{ trastes: [3, 2, 0, 0, 0, 3], dedos: [2, 1, 0, 0, 0, 3] }],
  "G7":  [{ trastes: [3, 2, 0, 0, 0, 1], dedos: [3, 2, 0, 0, 0, 1] }],
  "A":   [{ trastes: [-1, 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] }],
  "Am":  [{ trastes: [-1, 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] }],
  "A7":  [{ trastes: [-1, 0, 2, 0, 2, 0], dedos: [0, 0, 2, 0, 3, 0] }],
  "Am7": [{ trastes: [-1, 0, 2, 0, 1, 0], dedos: [0, 0, 2, 0, 1, 0] }],
  "B7":  [{ trastes: [-1, 2, 1, 2, 0, 2], dedos: [0, 2, 1, 3, 0, 4] }],
};

// Formas móviles de cejilla. "trastes" está escrito relativo a la cejilla:
// 0 = el traste de la cejilla, 2 = dos trastes más arriba, -1 = no se toca.
// "notaAlAire" es la nota de la cuerda donde está la raíz (E = 4, A = 9),
// que sirve para calcular en qué traste va la cejilla para cada acorde.
const FORMAS_CEJILLA = {
  "": [
    { notaAlAire: 4, trastes: [0, 2, 2, 1, 0, 0], dedos: [1, 3, 4, 2, 1, 1], desde: 0 },
    { notaAlAire: 9, trastes: [-1, 0, 2, 2, 2, 0], dedos: [0, 1, 3, 3, 3, 1], desde: 1 },
  ],
  "m": [
    { notaAlAire: 4, trastes: [0, 2, 2, 0, 0, 0], dedos: [1, 3, 4, 1, 1, 1], desde: 0 },
    { notaAlAire: 9, trastes: [-1, 0, 2, 2, 1, 0], dedos: [0, 1, 3, 4, 2, 1], desde: 1 },
  ],
  "7": [
    { notaAlAire: 4, trastes: [0, 2, 0, 1, 0, 0], dedos: [1, 3, 1, 2, 1, 1], desde: 0 },
    { notaAlAire: 9, trastes: [-1, 0, 2, 0, 2, 0], dedos: [0, 1, 3, 1, 4, 1], desde: 1 },
  ],
  "m7": [
    { notaAlAire: 4, trastes: [0, 2, 0, 0, 0, 0], dedos: [1, 3, 1, 1, 1, 1], desde: 0 },
    { notaAlAire: 9, trastes: [-1, 0, 2, 0, 1, 0], dedos: [0, 1, 3, 1, 2, 1], desde: 1 },
  ],
};

// Semitono de una nota escrita como letra + alteración ("Bb" -> 10, "C#" -> 1).
// El "+ 12" evita números negativos (por ejemplo Cb = -1 -> 11 = B).
function semitonoDeNota(letra, alteracion) {
  let semitono = SEMITONO_LETRA[letra];
  if (alteracion === "#") semitono += 1;
  if (alteracion === "b") semitono -= 1;
  return (semitono + 12) % 12;
}

/**
 * Lee un nombre de acorde y lo separa en raíz, tipo y bajo (si tiene).
 *   "Ab"     -> { raiz: 8, tipo: "",     bajo: null }
 *   "Bbmin7" -> { raiz: 10, tipo: "m7",  bajo: null }
 *   "D/F#"   -> { raiz: 2, tipo: "",     bajo: 6 }
 * Devuelve null si no es un acorde que la biblioteca conozca.
 */
function normalizarAcorde(nombre) {
  const partes = /^([A-G])(#|b)?(.*?)(?:\/([A-G])(#|b)?)?$/.exec(String(nombre).trim());
  if (!partes) return null;
  const [, letra, alteracion, tipoEscrito, letraBajo, alteracionBajo] = partes;
  if (!(tipoEscrito in TIPOS_EQUIVALENTES)) return null;
  return {
    raiz: semitonoDeNota(letra, alteracion),
    tipo: TIPOS_EQUIVALENTES[tipoEscrito],
    bajo: letraBajo ? semitonoDeNota(letraBajo, alteracionBajo) : null,
  };
}

/* ==================================================================
   Transportar y escribir con sostenidos o bemoles
   ================================================================== */

// Tres formas de escribir las 12 notas.
const NOMBRES_SOSTENIDOS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOMBRES_BEMOLES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
// Para C mayor / A menor (sin alteraciones) usamos los nombres más comunes.
const NOMBRES_NEUTROS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// Según la armadura de cada tonalidad MAYOR (por su tónica, 0 = C):
// "b" = se escribe con bemoles (F, Bb, Eb, Ab, Db), "#" = con sostenidos
// (G, D, A, E, B, F#), "" = sin alteraciones (C). Las enarmónicas se
// escriben con la versión de menos alteraciones (Db y no C#, Ab y no G#).
const ARMADURA_MAYOR = ["", "b", "#", "b", "#", "b", "#", "#", "b", "#", "b", "#"];

/**
 * Los nombres de las notas que corresponden a una tonalidad.
 * Una tonalidad menor usa la armadura de su relativa mayor (3 semitonos
 * arriba): Dm usa la de F (bemoles), C#m la de E (sostenidos).
 * Si no se conoce la tonalidad, se usan los nombres neutros.
 */
function nombresDeNotas(tonalidad) {
  if (!tonalidad) return NOMBRES_NEUTROS;
  const relativaMayor = tonalidad.modo === "m" ? (tonalidad.tonica + 3) % 12 : tonalidad.tonica;
  const armadura = ARMADURA_MAYOR[relativaMayor];
  if (armadura === "b") return NOMBRES_BEMOLES;
  if (armadura === "#") return NOMBRES_SOSTENIDOS;
  return NOMBRES_NEUTROS;
}

/** "C#m" -> { tonica: 1, modo: "m" }. null si no se reconoce. */
function leerTonalidad(nombre) {
  const acorde = nombre ? normalizarAcorde(nombre) : null;
  if (!acorde || (acorde.tipo !== "" && acorde.tipo !== "m")) return null;
  return { tonica: acorde.raiz, modo: acorde.tipo };
}

/** Sube o baja una tonalidad: ({ tonica: 1, modo: "m" }, 2) -> { tonica: 3, modo: "m" }. */
function moverTonalidad(tonalidad, semitonos) {
  if (!tonalidad) return null;
  return { tonica: (((tonalidad.tonica + semitonos) % 12) + 12) % 12, modo: tonalidad.modo };
}

/** Nombre de una tonalidad escrito según su propia armadura: Eb, no D#; Bbm, no A#m. */
function nombreDeTonalidad(tonalidad) {
  if (!tonalidad) return "";
  return nombresDeNotas(tonalidad)[tonalidad.tonica] + tonalidad.modo;
}

/**
 * Transporta un acorde y lo escribe con los nombres de "tonalidad".
 *   transportarAcorde("C#m7", 2, { tonica: 3, modo: "m" }) -> "Ebm7"
 * "N" (sin acorde) y los nombres desconocidos quedan igual.
 */
function transportarAcorde(nombre, semitonos, tonalidad) {
  if (nombre === "N") return "N";
  const acorde = normalizarAcorde(nombre);
  if (!acorde) return nombre;
  const nombres = nombresDeNotas(tonalidad);
  const mover = (nota) => (((nota + semitonos) % 12) + 12) % 12;
  // En los acordes con bajo (D/F#) también se mueve el bajo.
  const bajo = acorde.bajo === null ? "" : "/" + nombres[mover(acorde.bajo)];
  return nombres[mover(acorde.raiz)] + acorde.tipo + bajo;
}

/** Nombre normalizado como texto (con sostenidos): "Ab" -> "G#", "D/Gb" -> "D/F#". */
function nombreNormalizado(nombre) {
  const acorde = normalizarAcorde(nombre);
  if (!acorde) return null;
  const bajo = acorde.bajo === null ? "" : "/" + NOTAS_ACORDE[acorde.bajo];
  return NOTAS_ACORDE[acorde.raiz] + acorde.tipo + bajo;
}

/**
 * Corre una forma de cejilla hasta el traste que corresponde a la raíz.
 * Si el traste da 0 (por ejemplo la forma de E para el acorde E), no es una
 * cejilla sino la posición abierta, que ya está en ACORDES_ABIERTOS.
 */
function moverForma(forma, raiz) {
  const traste = (raiz - forma.notaAlAire + 12) % 12;
  if (traste === 0) return null;
  return {
    trastes: forma.trastes.map((t) => (t < 0 ? -1 : t + traste)),
    dedos: forma.dedos.slice(),
    cejilla: { traste, desde: forma.desde, hasta: 5 },
  };
}

// Guardamos las posiciones ya calculadas para no recalcularlas cada vez.
const cachePosiciones = {};

/**
 * Devuelve todas las posiciones de un acorde: primero la abierta (si existe)
 * y después las de cejilla, de la más cercana a la cejuela a la más alta.
 * Acepta nombres equivalentes ("Ab", "G#"). Devuelve [] si no lo conoce.
 */
function posicionesDeAcorde(nombre) {
  const clave = nombreNormalizado(nombre);
  if (!clave) return [];
  if (cachePosiciones[clave]) return cachePosiciones[clave];

  const { raiz, tipo, bajo } = normalizarAcorde(nombre);

  // Los demás tipos (sus4, maj7, D/F#...) salen de chords-db (acordes-extra.js),
  // que ya viene ordenado con las posiciones abiertas primero.
  if (bajo !== null || !FORMAS_CEJILLA[tipo]) {
    const extra = typeof POSICIONES_EXTRA !== "undefined" ? POSICIONES_EXTRA[clave] : null;
    cachePosiciones[clave] = extra || [];
    return cachePosiciones[clave];
  }

  const abiertas = ACORDES_ABIERTOS[clave] || [];
  const cejillas = FORMAS_CEJILLA[tipo]
    .map((forma) => moverForma(forma, raiz))
    .filter(Boolean)
    .sort((a, b) => a.cejilla.traste - b.cejilla.traste);

  cachePosiciones[clave] = abiertas.concat(cejillas);
  return cachePosiciones[clave];
}
