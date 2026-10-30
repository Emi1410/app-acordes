"use strict";

/* ==================================================================
   Acordes desde la tablatura (.gp)

   En vez de "escuchar" el mp3, se leen las notas escritas en el archivo
   de Guitar Pro y se arma el acorde de cada pulso:
     1. Pistas: la guitarra de acompañamiento (la que más toca notas juntas,
        o la que se llama "Rhythm"), el bajo y las demás (guitarra líder,
        voz, teclados...), que solo ayudan.
     2. Para cada pulso del compás se suma cuánto suena cada una de las 12
        notas. Las notas que se tocan juntas (un acorde rasgueado) pesan más
        que las sueltas de un riff o una melodía.
     3. Se prueban las 12 raíces con todos los tipos de la biblioteca (7,
        maj7, sus, add9, dim...). Un tipo vale solo si sus notas esenciales
        suenan; entre los que valen gana el que más explica lo que suena,
        con preferencia por los más simples y por la raíz que toca el bajo.
     4. Se unen los pulsos seguidos con el mismo acorde. Un acorde de un solo
        pulso queda (acorde de paso) si es claro; si no, se une al anterior.
     5. Por tramo:
          - power chords (raíz y quinta, sin tercera): mayor o menor según la
            tercera que toquen el bajo o las otras pistas en ese tramo, y si
            nadie la toca, según la tonalidad de la canción;
          - acorde con bajo (A/C#): si el bajo toca casi todo el tramo una
            nota que no es la raíz, y la biblioteca tiene ese acorde.
   Los tiempos salen en ms de la partitura; después se pasan al mp3 con la
   sincronización de la tablatura (ver más abajo).

   Usa crearMapaDeTempo (sincronizar-solo.js) y posicionesDeAcorde y
   NOTAS_ACORDE (acordes.js).
   ================================================================== */

/* ------------------------------------------------------------------
   Tipos de acorde: notas (en semitonos desde la raíz)
   ------------------------------------------------------------------ */

// Para cada tipo de la biblioteca (TIPOS_DE_ACORDE en acordes.js):
//   notas:      todas las notas del acorde;
//   esenciales: las que tienen que sonar sí o sí para elegirlo (la quinta
//               justa casi nunca es esencial: muchas veces no se toca);
//   costo:      cuánto se castiga por ser más "raro" que una tríada.
const FORMULAS_ACORDE = {
  "":      { notas: [0, 4, 7], esenciales: [0, 4], costo: 0 },
  "m":     { notas: [0, 3, 7], esenciales: [0, 3], costo: 0 },
  "5":     { notas: [0, 7], esenciales: [0, 7], costo: 0.01 },
  "7":     { notas: [0, 4, 7, 10], esenciales: [0, 4, 10], costo: 0.06 },
  "m7":    { notas: [0, 3, 7, 10], esenciales: [0, 3, 10], costo: 0.06 },
  "maj7":  { notas: [0, 4, 7, 11], esenciales: [0, 4, 11], costo: 0.08 },
  "sus2":  { notas: [0, 2, 7], esenciales: [0, 2, 7], costo: 0.08 },
  "sus4":  { notas: [0, 5, 7], esenciales: [0, 5, 7], costo: 0.08 },
  "7sus4": { notas: [0, 5, 7, 10], esenciales: [0, 5, 10], costo: 0.1 },
  "add9":  { notas: [0, 2, 4, 7], esenciales: [0, 2, 4], costo: 0.1 },
  "madd9": { notas: [0, 2, 3, 7], esenciales: [0, 2, 3], costo: 0.1 },
  "6":     { notas: [0, 4, 7, 9], esenciales: [0, 4, 9], costo: 0.1 },
  "m6":    { notas: [0, 3, 7, 9], esenciales: [0, 3, 9], costo: 0.1 },
  "dim":   { notas: [0, 3, 6], esenciales: [0, 3, 6], costo: 0.08 },
  "dim7":  { notas: [0, 3, 6, 9], esenciales: [0, 3, 6, 9], costo: 0.12 },
  "m7b5":  { notas: [0, 3, 6, 10], esenciales: [0, 3, 6, 10], costo: 0.1 },
  "aug":   { notas: [0, 4, 8], esenciales: [0, 4, 8], costo: 0.1 },
  "9":     { notas: [0, 2, 4, 7, 10], esenciales: [0, 2, 4, 10], costo: 0.12 },
  "m9":    { notas: [0, 2, 3, 7, 10], esenciales: [0, 2, 3, 10], costo: 0.12 },
  "maj9":  { notas: [0, 2, 4, 7, 11], esenciales: [0, 2, 4, 11], costo: 0.13 },
  "mmaj7": { notas: [0, 3, 7, 11], esenciales: [0, 3, 11], costo: 0.12 },
  "69":    { notas: [0, 2, 4, 7, 9], esenciales: [0, 2, 4, 9], costo: 0.13 },
  "add11": { notas: [0, 4, 5, 7], esenciales: [0, 4, 5], costo: 0.12 },
  "11":    { notas: [0, 2, 5, 7, 10], esenciales: [0, 5, 10, 2], costo: 0.13 },
  "m11":   { notas: [0, 2, 3, 5, 7, 10], esenciales: [0, 3, 5, 10], costo: 0.13 },
  "13":    { notas: [0, 4, 7, 9, 10], esenciales: [0, 4, 9, 10], costo: 0.13 },
  "7b5":   { notas: [0, 4, 6, 10], esenciales: [0, 4, 6, 10], costo: 0.12 },
  "aug7":  { notas: [0, 4, 8, 10], esenciales: [0, 4, 8, 10], costo: 0.12 },
  "7b9":   { notas: [0, 1, 4, 7, 10], esenciales: [0, 1, 4, 10], costo: 0.13 },
  "7#9":   { notas: [0, 3, 4, 7, 10], esenciales: [0, 3, 4, 10], costo: 0.13 },
};

// Una nota "suena" en el pulso si tiene al menos esta parte del total.
const UMBRAL_NOTA_ESENCIAL = 0.07;
// Las notas que agregan color (séptima, novena, sexta...) tienen que sonar más:
// si no, cualquier nota de paso de un riff convertiría el acorde en otro tipo.
const UMBRAL_NOTA_EXTRA = 0.14;
// Premio a la raíz que toca el bajo.
const PREMIO_BAJO = 0.2;
// Peso de cada tipo de pista en el perfil del pulso.
const PESO_ACOMPANAMIENTO = 1;
const PESO_BAJO = 0.6;
const PESO_OTRAS = 0.25;
// Lo que suena en la segunda mitad de cada pulso cuenta menos (ver parteDelTramo).
const PESO_SEGUNDA_MITAD = 0.35;
// Las notas sueltas (riff, melodía) pesan menos que las que se tocan juntas.
const PESO_NOTA_SUELTA = 0.45;
// Para cambiar de acorde, el nuevo tiene que explicar el pulso al menos esto mejor que el anterior.
const MARGEN_CAMBIO = 0.15;
// Un acorde de paso de un solo pulso tiene que ganarle por esto al acorde del medio compás.
const MARGEN_ACORDE_DE_PASO = 0.25;
// Un acorde de paso de un solo pulso tiene que explicar al menos esta parte de lo que suena.
const CLARIDAD_ACORDE_DE_PASO = 0.8;
// Power chord: la tercera que tocan el bajo o las otras pistas tiene que ser al menos esta parte de lo que tocan.
const EVIDENCIA_TERCERA = 0.1;
// Acorde con bajo: el bajo toca esa nota al menos esta parte del tramo.
const DOMINIO_BAJO = 0.6;

// Perfiles de tonalidad de Krumhansl-Kessler (los mismos que el analizador).
const PERFIL_TONALIDAD_MAYOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const PERFIL_TONALIDAD_MENOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/* ------------------------------------------------------------------
   1. Pistas
   ------------------------------------------------------------------ */

function esPistaDeBajo(pista) {
  const programa = pista.playbackInfo ? pista.playbackInfo.program : -1;
  return (programa >= 32 && programa <= 39) || /bass|bajo/i.test(pista.name);
}

// Notas de una pista como eventos { inicio, fin (ticks), alturas: [MIDI], juntas: bool }.
function eventosDePista(pista) {
  const eventos = [];
  for (const compas of pista.staves[0].bars) {
    for (const voz of compas.voices) {
      for (const pulso of voz.beats) {
        if (pulso.isRest) continue;
        const alturas = pulso.notes.filter((n) => !n.isDead).map((n) => n.realValue);
        if (!alturas.length) continue;
        eventos.push({
          inicio: pulso.absolutePlaybackStart,
          fin: pulso.absolutePlaybackStart + pulso.playbackDuration,
          alturas,
          juntas: new Set(alturas.map((a) => a % 12)).size >= 2,
        });
      }
    }
  }
  return eventos.sort((a, b) => a.inicio - b.inicio);
}

/**
 * Reparte las pistas: { acompanamiento, bajo, otras } (con sus eventos).
 * Acompañamiento: entre las que no son batería ni bajo, la que más pulsos
 * tiene con varias notas juntas. El nombre ayuda: "Rhythm"/"Ritmo" suma,
 * "Lead"/"Solo"/"Vocals" resta.
 */
function repartirPistas(partitura) {
  const conNotas = partitura.tracks
    .filter((p) => !p.staves[0].isPercussion)
    .map((p) => ({ pista: p, eventos: eventosDePista(p) }))
    .filter((x) => x.eventos.length);
  const bajos = conNotas.filter((x) => esPistaDeBajo(x.pista)).sort((a, b) => b.eventos.length - a.eventos.length);
  const bajo = bajos[0] || null;
  const resto = conNotas.filter((x) => x !== bajo);
  const puntaje = (x) => {
    let p = x.eventos.filter((e) => e.juntas).length + 0.1 * x.eventos.length;
    if (/rhythm|ritm|acomp/i.test(x.pista.name)) p *= 2;
    if (/lead|solo|voc|voz|sax|melod/i.test(x.pista.name)) p *= 0.5;
    return p;
  };
  resto.sort((a, b) => puntaje(b) - puntaje(a));
  return { acompanamiento: resto[0] || bajo, bajo, otras: resto.slice(1) };
}

/* ------------------------------------------------------------------
   2. Perfil de notas de cada pulso
   ------------------------------------------------------------------ */

// Pulsos de la partitura (inicio y fin en ticks), y en qué pulso empieza cada compás.
function pulsosDePartitura(partitura) {
  const pulsos = [], primeros = [];
  for (const compas of partitura.masterBars) {
    const largo = TICKS_NEGRA * 4 / compas.timeSignatureDenominator;
    primeros.push(pulsos.length);
    for (let i = 0; i < compas.timeSignatureNumerator; i++) {
      pulsos.push({ inicio: compas.start + i * largo, fin: compas.start + (i + 1) * largo });
    }
  }
  return { pulsos, primeros };
}

// Qué parte de [desde, hasta) ocupa un evento, contando más la primera mitad
// de cada pulso: lo que se toca en el "y" del último tiempo suele ser el
// acorde siguiente que se adelanta, no un acorde nuevo. (Solo para los golpes
// de varias notas y para el bajo; en un arpegio o una melodía de notas
// sueltas, todas cuentan igual.)
// (pesoSegunda = 1 mide las dos mitades por igual.)
function parteDelTramo(e, desde, hasta, largoPulso, pesoSegunda = PESO_SEGUNDA_MITAD) {
  let suma = 0;
  for (let t = desde; t < hasta; t += largoPulso) {
    const mitad = t + largoPulso / 2, fin = Math.min(t + largoPulso, hasta);
    suma += Math.max(0, Math.min(e.fin, mitad) - Math.max(e.inicio, t));
    suma += pesoSegunda * Math.max(0, Math.min(e.fin, fin) - Math.max(e.inicio, mitad));
  }
  return suma / (hasta - desde);
}

// Suma al perfil (12 notas) lo que suena de "eventos" entre desde y hasta, con un peso.
// Si se pasa "graves", suma ahí la nota más grave de cada evento (para el bajo).
function sumarEventos(eventos, desde, hasta, largoPulso, peso, perfil, graves, pesoSegunda) {
  // Los eventos están ordenados por inicio; los que empiezan después de "hasta" no cuentan.
  for (const e of eventos) {
    if (e.inicio >= hasta) break;
    if (e.fin <= desde) continue;
    const parte = parteDelTramo(e, desde, hasta, largoPulso, e.juntas || graves ? pesoSegunda : 1);
    if (parte <= 0) continue;
    const p = peso * parte * (e.juntas ? 1 : PESO_NOTA_SUELTA);
    if (perfil) for (const clase of new Set(e.alturas.map((a) => a % 12))) perfil[clase] += p;
    if (graves) graves[Math.min(...e.alturas) % 12] += parte;
  }
}

// Busca desde qué evento mirar (para no recorrer la canción entera en cada pulso).
function indiceDesde(eventos, tick) {
  let bajo = 0, alto = eventos.length;
  while (bajo < alto) {
    const medio = (bajo + alto) >> 1;
    if (eventos[medio].inicio < tick - 4 * TICKS_NEGRA * 4) bajo = medio + 1; else alto = medio;
  }
  return bajo;
}

/**
 * Para un tramo de ticks: { guitarra, graves, otras }
 *   guitarra: lo que toca el acompañamiento (con eso se elige el tipo de acorde),
 *   juntas:   qué notas se tocan juntas en la guitarra (ver notasJuntas),
 *   graves:   cuánto toca el bajo cada nota (o la guitarra, si no hay bajo):
 *             de ahí sale la raíz,
 *   otras:    las demás pistas y todas las notas del bajo (solo ayudan a
 *             decidir la tercera de un power chord).
 */
function perfilEntre(pistas, desde, hasta, largoPulso, pesoSegunda = PESO_SEGUNDA_MITAD) {
  const guitarra = new Array(12).fill(0), otras = new Array(12).fill(0), graves = new Array(12).fill(0);
  const tramo = (eventos) => eventos.slice(indiceDesde(eventos, desde));
  const hayBajo = pistas.bajo && pistas.bajo !== pistas.acompanamiento;
  const acompanamiento = tramo(pistas.acompanamiento.eventos);
  sumarEventos(acompanamiento, desde, hasta, largoPulso, PESO_ACOMPANAMIENTO, guitarra, hayBajo ? null : graves, pesoSegunda);
  const juntas = notasJuntas(acompanamiento, desde, hasta, largoPulso, pesoSegunda);
  if (hayBajo) sumarEventos(tramo(pistas.bajo.eventos), desde, hasta, largoPulso, PESO_BAJO, otras, graves, pesoSegunda);
  for (const otra of pistas.otras) sumarEventos(tramo(otra.eventos), desde, hasta, largoPulso, PESO_OTRAS, otras, null, pesoSegunda);
  return { guitarra, juntas, graves, otras };
}

/**
 * Qué notas se tocan juntas (en el mismo golpe) en la guitarra:
 * { total, pares } donde pares[a * 12 + b] es cuánto suenan a y b a la vez.
 * Sirve para las notas de color: la séptima de un G#7 se toca junto con el
 * G# o su tercera; si solo aparece en otro power chord (C#5 y B5 alternados),
 * no es la séptima de nada.
 */
function notasJuntas(eventos, desde, hasta, largoPulso, pesoSegunda) {
  const pares = new Array(144).fill(0);
  let total = 0;
  for (const e of eventos) {
    if (e.inicio >= hasta) break;
    if (e.fin <= desde || !e.juntas) continue;
    const parte = parteDelTramo(e, desde, hasta, largoPulso, pesoSegunda);
    if (parte <= 0) continue;
    total += parte;
    const clases = [...new Set(e.alturas.map((a) => a % 12))];
    for (const a of clases) for (const b of clases) if (a !== b) pares[a * 12 + b] += parte;
  }
  return { total, pares };
}

// La nota que más toca el bajo en el tramo (o -1 si no toca o no domina).
function notaDelBajo(graves, dominio = 0.4) {
  const total = graves.reduce((s, v) => s + v, 0);
  if (total <= 0) return -1;
  const nota = graves.indexOf(Math.max(...graves));
  return graves[nota] / total >= dominio ? nota : -1;
}

/* ------------------------------------------------------------------
   3. Elegir el acorde de un perfil
   ------------------------------------------------------------------ */

/**
 * Puntaje de un acorde (raiz, tipo) para lo que suena, o null si no vale.
 *   parte:    lo que toca la guitarra (proporciones de las 12 notas),
 *   juntas:   qué notas se tocan en el mismo golpe (ver notasJuntas),
 *   notaBajo: la nota que toca el bajo (-1 si no hay).
 * Las notas esenciales tienen que sonar en la guitarra (la raíz puede estar
 * solo en el bajo). Las "de color" (séptima, novena, sexta...) además tienen
 * que tocarse en el mismo golpe que la raíz: una nota suelta de un riff no
 * convierte un Am en Fmaj7, ni dos power chords alternados (C#5 y B5) son
 * un C#7sus4.
 */
function puntuarAcorde(parte, juntas, notaBajo, raiz, tipo) {
  const formula = FORMULAS_ACORDE[tipo];
  const nota = (intervalo) => parte[(raiz + intervalo) % 12];
  // Cuánto se toca la nota "x" en el mismo golpe que la raíz.
  const raizEnGuitarra = nota(0) >= UMBRAL_NOTA_ESENCIAL;
  const conLaRaiz = (x) => (juntas.total > 0 ? juntas.pares[x * 12 + raiz] / juntas.total : 0);
  const valido = formula.esenciales.every((i) => {
    if (i === 0 && raiz === notaBajo) return true;
    if ([0, 3, 4, 7].includes(i)) return nota(i) >= UMBRAL_NOTA_ESENCIAL;
    // Nota de color: la guitarra tiene que tocar también la raíz (si la raíz
    // está solo en el bajo, es un bajo que camina debajo de otro acorde).
    return raizEnGuitarra && nota(i) >= UMBRAL_NOTA_EXTRA && conLaRaiz((raiz + i) % 12) >= UMBRAL_NOTA_EXTRA;
  });
  if (!valido) return null;
  // Un power chord solo si la guitarra no toca ninguna tercera.
  if (tipo === "5" && (nota(3) >= UMBRAL_NOTA_ESENCIAL || nota(4) >= UMBRAL_NOTA_ESENCIAL)) return null;
  const explica = formula.notas.reduce((s, i) => s + nota(i), 0);
  let puntaje = explica - formula.costo;
  if (raiz === notaBajo) puntaje += PREMIO_BAJO;
  else if (notaBajo >= 0 && !formula.notas.includes((notaBajo - raiz + 12) % 12)) puntaje -= PREMIO_BAJO / 2;
  return { raiz, tipo, explica, puntaje };
}

// Proporciones de un perfil (que sumen 1); todo 0 si está vacío.
function proporciones(perfil) {
  const total = perfil.reduce((s, v) => s + v, 0);
  return perfil.map((v) => (total > 0 ? v / total : 0));
}

/**
 * El mejor acorde para lo que toca la guitarra de acompañamiento, con la
 * nota del bajo como ayuda para la raíz. Devuelve { raiz, tipo, explica,
 * puntaje } o null si no alcanza para decir nada (una sola nota suelta).
 *   soloRaiz: si se indica, solo se prueban acordes con esa raíz.
 */
function elegirAcordeDeNotas(perfil, soloRaiz = null) {
  const parte = proporciones(perfil.guitarra);
  if (parte.every((v) => v === 0)) return null;
  const juntas = perfil.juntas;
  const notaBajo = notaDelBajo(perfil.graves);
  const suenan = new Set(parte.map((v, i) => (v >= UMBRAL_NOTA_ESENCIAL ? i : -1)).filter((i) => i >= 0));
  if (notaBajo >= 0) suenan.add(notaBajo);
  if (suenan.size < 2) return null;

  let mejor = null;
  for (let raiz = 0; raiz < 12; raiz++) {
    if (soloRaiz !== null && raiz !== soloRaiz) continue;
    for (const tipo of Object.keys(FORMULAS_ACORDE)) {
      const r = puntuarAcorde(parte, juntas, notaBajo, raiz, tipo);
      if (r && (!mejor || r.puntaje > mejor.puntaje)) mejor = r;
    }
  }
  return mejor;
}

// Puntaje que tendría en este pulso el acorde que venía sonando (sin exigir
// sus notas esenciales: alcanza con que siga explicando lo que suena).
function puntajeDeSeguir(perfil, anterior) {
  const parte = proporciones(perfil.guitarra);
  const formula = FORMULAS_ACORDE[anterior.tipo];
  const notaBajo = notaDelBajo(perfil.graves);
  let puntaje = formula.notas.reduce((s, i) => s + parte[(anterior.raiz + i) % 12], 0) - formula.costo;
  if (anterior.raiz === notaBajo) puntaje += PREMIO_BAJO;
  else if (notaBajo >= 0 && !formula.notas.includes((notaBajo - anterior.raiz + 12) % 12)) puntaje -= PREMIO_BAJO / 2;
  return puntaje;
}

/* ------------------------------------------------------------------
   4. Tonalidad (para los power chords que nadie aclara)
   ------------------------------------------------------------------ */

function estimarTonalidadDePerfil(perfil) {
  const correlacion = (a, b) => {
    const ma = a.reduce((s, v) => s + v, 0) / 12, mb = b.reduce((s, v) => s + v, 0) / 12;
    let c = 0, va = 0, vb = 0;
    for (let i = 0; i < 12; i++) { c += (a[i] - ma) * (b[i] - mb); va += (a[i] - ma) ** 2; vb += (b[i] - mb) ** 2; }
    return c / Math.sqrt(va * vb || 1);
  };
  let mejor = null;
  for (let tonica = 0; tonica < 12; tonica++) {
    for (const [modo, base] of [["", PERFIL_TONALIDAD_MAYOR], ["m", PERFIL_TONALIDAD_MENOR]]) {
      const girado = base.map((_, i) => base[(i - tonica + 12) % 12]);
      const r = correlacion(perfil, girado);
      if (!mejor || r > mejor.r) mejor = { tonica, modo, r };
    }
  }
  return { tonica: mejor.tonica, modo: mejor.modo };
}

// ¿La tercera mayor (4) o la menor (3) de "raiz" está en la escala de la tonalidad?
// En menor se usa la escala menor natural, salvo el V, que casi siempre es
// mayor (E en Am, G# en C#m).
function terceraSegunTonalidad(raiz, tonalidad) {
  if (tonalidad.modo === "m" && (raiz - tonalidad.tonica + 12) % 12 === 7) return "";
  const escala = tonalidad.modo === "m" ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const enEscala = (nota) => escala.includes((nota - tonalidad.tonica + 12) % 12);
  const mayor = enEscala(raiz + 4), menor = enEscala(raiz + 3);
  if (mayor && !menor) return "";
  if (menor && !mayor) return "m";
  return null;
}

/* ------------------------------------------------------------------
   5. Todo junto: acordes de la partitura (en pulsos)
   ------------------------------------------------------------------ */

/**
 * Calcula los acordes de una partitura de alphaTab.
 * Devuelve {
 *   tramos:   [{ desde, hasta (índices de pulso, hasta excluido), acorde }],
 *   pulsos:   [{ inicio, fin }] en ticks,
 *   primeros: índice del primer pulso de cada compás,
 *   tonalidad: { tonica, modo },
 *   pistas:   nombres de las pistas usadas,
 * }
 */
function acordesDePartitura(partitura) {
  const pistas = repartirPistas(partitura);
  if (!pistas.acompanamiento) throw new Error("La tablatura no tiene pistas con notas.");
  const { pulsos, primeros } = pulsosDePartitura(partitura);

  // Tonalidad: con todas las notas de la canción.
  const final = pulsos.length ? pulsos[pulsos.length - 1].fin : 0;
  const todo = perfilEntre(pistas, 0, final, TICKS_NEGRA);
  const tonalidad = estimarTonalidadDePerfil(todo.guitarra.map((v, i) => v + todo.otras[i]));

  // Paso 3: un acorde por pulso (null = no alcanza para decidir).
  // La base es el medio compás (2 pulsos): así un riff de notas sueltas se
  // mira junto y no aparece un acorde nuevo en cada nota.
  const perfiles = pulsos.map((p) => perfilEntre(pistas, p.inicio, p.fin, p.fin - p.inicio));
  const grupos = [];
  primeros.forEach((desde, b) => {
    const hasta = b + 1 < primeros.length ? primeros[b + 1] : pulsos.length;
    for (let i = desde; i < hasta; i += 2) grupos.push({ desde: i, hasta: Math.min(i + 2, hasta) });
  });
  const porPulso = new Array(pulsos.length).fill(null);
  let anterior = null;
  for (const g of grupos) {
    const largoPulso = pulsos[g.desde].fin - pulsos[g.desde].inicio;
    const perfil = perfilEntre(pistas, pulsos[g.desde].inicio, pulsos[g.hasta - 1].fin, largoPulso);
    let acorde = elegirAcordeDeNotas(perfil);
    // Un riff de notas sueltas no alcanza para cambiar de acorde, salvo que
    // el bajo se vaya a la raíz del acorde nuevo.
    if (acorde && anterior && perfil.juntas.total === 0 && acorde.raiz !== notaDelBajo(perfil.graves)) acorde = anterior;
    // Si el acorde que venía sigue explicando casi igual de bien lo que
    // suena, no se cambia (una nota de color del riff no es un acorde nuevo).
    if (acorde && anterior && !(acorde.raiz === anterior.raiz && acorde.tipo === anterior.tipo)
        && acorde.puntaje - puntajeDeSeguir(perfil, anterior) < MARGEN_CAMBIO) {
      acorde = anterior;
    }
    if (acorde) anterior = acorde;
    for (let i = g.desde; i < g.hasta; i++) {
      porPulso[i] = acorde;
      // Acorde de paso de un solo pulso: solo si en ese pulso la guitarra toca
      // notas juntas (un rasgueo) que forman claramente otro acorde durante
      // TODO el pulso (las dos mitades pesan igual: medio pulso de otro power
      // chord dentro de un riff no es un acorde de paso).
      if (!acorde || perfiles[i].juntas.total === 0) continue;
      const entero = perfilEntre(pistas, pulsos[i].inicio, pulsos[i].fin, pulsos[i].fin - pulsos[i].inicio, 1);
      const propio = elegirAcordeDeNotas(entero);
      // Además, su raíz la tiene que tocar la guitarra: si no, es el bajo que
      // camina debajo del mismo acorde.
      const raizEnGuitarra = propio && proporciones(entero.guitarra)[propio.raiz] >= UMBRAL_NOTA_ESENCIAL;
      if (propio && raizEnGuitarra && !(propio.raiz === acorde.raiz && propio.tipo === acorde.tipo)
          && propio.explica >= CLARIDAD_ACORDE_DE_PASO
          && propio.puntaje - puntajeDeSeguir(entero, acorde) >= MARGEN_ACORDE_DE_PASO) {
        porPulso[i] = propio;
      }
    }
  }

  // Paso 4: unir pulsos. Sin información, sigue el acorde anterior (si no
  // suena nada en ninguna pista, "N").
  const vacio = (v) => v.every((x) => x === 0);
  const silencio = perfiles.map((p) => vacio(p.guitarra) && vacio(p.otras) && vacio(p.graves));
  const clave = (a) => (a ? a.raiz + ":" + a.tipo : null);
  let etiquetas = porPulso.map((a, i) => (silencio[i] ? "N" : clave(a)));
  for (let i = 0; i < etiquetas.length; i++) {
    if (etiquetas[i] === null) etiquetas[i] = i > 0 ? etiquetas[i - 1] : null;
  }
  // Los primeros pulsos sin información toman el primer acorde que aparezca.
  const primero = etiquetas.find((e) => e !== null && e !== "N") || "N";
  etiquetas = etiquetas.map((e) => (e === null ? primero : e));
  const raizDe = (e) => (e && e !== "N" ? Number(e.split(":")[0]) : null);
  const tipoDe = (e) => e.split(":")[1];
  // Anticipación: un acorde de un solo pulso con la misma raíz que el que
  // viene después es ese acorde que la banda adelanta medio tiempo (el golpe
  // en el "y" del 4). El cambio se deja en el compás, donde lo escribe un cifrado.
  for (let i = 1; i + 1 < etiquetas.length; i++) {
    const solo = etiquetas[i] !== etiquetas[i - 1] && etiquetas[i] !== etiquetas[i + 1];
    if (solo && etiquetas[i] !== "N" && raizDe(etiquetas[i]) === raizDe(etiquetas[i + 1])) etiquetas[i] = etiquetas[i - 1];
  }
  // El "5" y un acorde con tercera (mayor, menor, 7...) de la misma raíz son
  // el mismo acorde a esta altura: a uno le falta la tercera que el otro tiene.
  const conTercera = (e) => {
    const notas = FORMULAS_ACORDE[tipoDe(e)].notas;
    return notas.includes(3) || notas.includes(4);
  };
  const tramos = [];
  for (let i = 0; i < etiquetas.length; i++) {
    const ultimo = tramos[tramos.length - 1];
    const misma = ultimo && (ultimo.etiqueta === etiquetas[i]
      || (ultimo.etiqueta !== "N" && etiquetas[i] !== "N" && raizDe(ultimo.etiqueta) === raizDe(etiquetas[i])
          && [ultimo.etiqueta, etiquetas[i]].some((e) => e.endsWith(":5"))
          && [ultimo.etiqueta, etiquetas[i]].every((e) => e.endsWith(":5") || conTercera(e))));
    if (misma) {
      ultimo.hasta = i + 1;
      ultimo.tipos.push(tipoDe(etiquetas[i]));
    } else {
      tramos.push({ desde: i, hasta: i + 1, etiqueta: etiquetas[i], tipos: etiquetas[i] === "N" ? [] : [tipoDe(etiquetas[i])] });
    }
  }

  // Paso 5: el tipo de cada tramo es el que más se eligió en sus pulsos
  // (sin contar el "5", que se resuelve abajo). De paso se anota, para cada
  // raíz, cuántos pulsos suena en la canción como mayor y como menor.
  const segunCancion = Array.from({ length: 12 }, () => ({ mayor: 0, menor: 0 }));
  const TIPOS_MENORES = ["m", "m7", "m6", "m9", "m11", "madd9", "mmaj7"];
  for (const tramo of tramos) {
    if (tramo.etiqueta === "N") continue;
    tramo.raiz = raizDe(tramo.etiqueta);
    tramo.perfil = perfilEntre(pistas, pulsos[tramo.desde].inicio, pulsos[tramo.hasta - 1].fin, pulsos[tramo.desde].fin - pulsos[tramo.desde].inicio);
    const cuenta = {};
    for (const t of tramo.tipos) if (t !== "5") cuenta[t] = (cuenta[t] || 0) + 1;
    const masElegido = Object.keys(cuenta).sort((a, b) => cuenta[b] - cuenta[a])[0];
    tramo.tipo = masElegido ?? "5";
    if (tramo.tipo === "5") continue;
    const largo = tramo.hasta - tramo.desde;
    if (TIPOS_MENORES.includes(tramo.tipo)) segunCancion[tramo.raiz].menor += largo;
    else if (FORMULAS_ACORDE[tramo.tipo].notas.includes(4)) segunCancion[tramo.raiz].mayor += largo;
  }

  const nombres = NOTAS_ACORDE;
  for (const tramo of tramos) {
    if (tramo.etiqueta === "N") { tramo.acorde = "N"; continue; }
    const { raiz, perfil: p } = tramo;
    let tipo = tramo.tipo;
    // Power chord: ¿mayor o menor? En este orden:
    //   1. cómo toca la guitarra ese mismo acorde en el resto de la canción
    //      (si en otro lado toca G# con su tercera, este G#5 también es G#),
    //      cuando una de las dos formas domina claramente (el doble, y por
    //      lo menos un compás);
    //   2. la tercera que tocan el bajo o las otras pistas en el tramo;
    //   3. la tonalidad.
    // La guitarra va primero porque el bajo muchas veces pasa por la otra
    // tercera como nota de paso (G#, B, D# en un compás de G#).
    if (tipo === "5") {
      const enCancion = segunCancion[raiz];
      const total = p.otras.reduce((s, v) => s + v, 0);
      const mayor = total ? p.otras[(raiz + 4) % 12] / total : 0;
      const menor = total ? p.otras[(raiz + 3) % 12] / total : 0;
      const domina = Math.max(enCancion.mayor, enCancion.menor);
      if (domina >= 4 && domina >= 2 * Math.min(enCancion.mayor, enCancion.menor)) {
        tipo = enCancion.mayor > enCancion.menor ? "" : "m";
      } else if (Math.max(mayor, menor) >= EVIDENCIA_TERCERA && Math.abs(mayor - menor) >= 0.5 * Math.max(mayor, menor)) {
        tipo = mayor > menor ? "" : "m";
      } else {
        const segunTono = terceraSegunTonalidad(raiz, tonalidad);
        if (segunTono !== null) tipo = segunTono;
      }
    }
    // Acorde con bajo: el bajo se queda casi todo el tramo (de 2 pulsos o
    // más; en uno solo suele ser una nota de paso) en otra nota.
    let bajo = "";
    const notaBajo = notaDelBajo(p.graves, DOMINIO_BAJO);
    if (notaBajo >= 0 && notaBajo !== raiz && tramo.hasta - tramo.desde >= 2) {
      const conBajo = nombres[raiz] + tipo + "/" + nombres[notaBajo];
      if (posicionesDeAcorde(conBajo).length) bajo = "/" + nombres[notaBajo];
    }
    tramo.acorde = nombres[raiz] + tipo + bajo;
  }
  // Tramos vecinos que quedaron con el mismo nombre se unen.
  const unidos = [];
  for (const t of tramos) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && ultimo.acorde === t.acorde) ultimo.hasta = t.hasta;
    else unidos.push({ desde: t.desde, hasta: t.hasta, acorde: t.acorde });
  }

  return {
    tramos: unidos,
    etiquetas,          // lo elegido en cada pulso antes de unir (para las pruebas)
    pulsos,
    primeros,
    tonalidad,
    pistas: {
      acompanamiento: pistas.acompanamiento.pista.name,
      bajo: pistas.bajo ? pistas.bajo.pista.name : null,
      otras: pistas.otras.map((o) => o.pista.name),
    },
  };
}

/* ==================================================================
   De la partitura al mp3
   ================================================================== */

/**
 * Mapa entre los ms de la partitura y los ms del mp3, con los mismos puntos
 * de sincronización que usa la vista Tabs (puntosDeSincronizacion, en
 * tablaturas.js). Entre dos puntos interpola en línea recta; antes del
 * primero y después del último sigue la recta del tramo vecino.
 * Devuelve { aMp3(msPartitura), aPartitura(msMp3) }.
 */
function crearMapaPartituraMp3(sync, tiempos) {
  const puntos = puntosDeSincronizacion(sync, tiempos)
    .map((p) => ({ t: tiempos[p.barIndex + p.barPosition], ms: p.millisecondOffset }));
  if (puntos.length === 1) puntos.push({ t: puntos[0].t + 1000, ms: puntos[0].ms + 1000 });   // tempo de la partitura
  const interpolar = (x, desde, hacia) => {
    let k = 0;
    while (k + 2 < puntos.length && puntos[k + 1][desde] <= x) k++;
    const a = puntos[k], b = puntos[k + 1];
    if (b[desde] === a[desde]) return a[hacia];
    return a[hacia] + (x - a[desde]) * (b[hacia] - a[hacia]) / (b[desde] - a[desde]);
  };
  return { aMp3: (t) => interpolar(t, "t", "ms"), aPartitura: (ms) => interpolar(ms, "ms", "t") };
}

const redondear3 = (x) => Math.round(x * 1000) / 1000;

/**
 * Junta los pulsos y compases de la tablatura (en segundos del mp3) con los
 * que detectó el análisis del audio ANTES y DESPUÉS de la partitura (la
 * presentación, los aplausos), para que la tira cubra toda la canción.
 */
function combinarConAudio(pulsosTab, compasesTab, finTab, delAudio) {
  const periodo = pulsosTab.length > 1 ? (finTab - pulsosTab[0]) / pulsosTab.length : 0.5;
  const afuera = (lista) => {
    const tiempos = Array.isArray(lista) ? lista : [];
    return {
      antes: tiempos.filter((t) => t < pulsosTab[0] - periodo / 2),
      despues: tiempos.filter((t) => t >= finTab - periodo / 2),
    };
  };
  const p = afuera(delAudio.pulsos), c = afuera(delAudio.compases);
  return {
    pulsos: [...p.antes, ...pulsosTab, ...p.despues].map(redondear3),
    compases: [...c.antes, ...compasesTab, ...c.despues].map(redondear3),
  };
}

/**
 * Arma el juego de acordes de la tablatura (mismo formato que el del
 * análisis) a partir del resultado de acordesDePartitura.
 *   sync:     la sincronización de la tablatura con el mp3,
 *   delAudio: el juego del análisis (de ahí salen los pulsos de afuera),
 *   duracion: duración del mp3 en segundos.
 */
function armarJuegoTablatura(resultado, partitura, tiempos, sync, delAudio, duracion) {
  const msDeTick = crearMapaDeTempo(partitura);
  const mapa = crearMapaPartituraMp3(sync, tiempos);
  const segundos = (tick) => mapa.aMp3(msDeTick(tick)) / 1000;
  const { pulsos, primeros, tramos } = resultado;

  const pulsosTab = pulsos.map((p) => segundos(p.inicio));
  const finTab = segundos(pulsos[pulsos.length - 1].fin);
  const combinados = combinarConAudio(pulsosTab, primeros.map((i) => pulsosTab[i]), finTab, delAudio);

  // Acordes: los de la partitura, con "N" (sin acorde) antes y después.
  const acordesTab = tramos.map((t) => ({
    inicio: redondear3(segundos(pulsos[t.desde].inicio)),
    fin: redondear3(segundos(pulsos[t.hasta - 1].fin)),
    acorde: t.acorde,
  }));
  const lista = [];
  if (acordesTab[0].inicio > 0.01) lista.push({ inicio: 0, fin: acordesTab[0].inicio, acorde: "N" });
  else acordesTab[0].inicio = 0;
  lista.push(...acordesTab);
  const ultimo = lista[lista.length - 1];
  if (duracion > ultimo.fin + 0.01) lista.push({ inicio: ultimo.fin, fin: redondear3(duracion), acorde: "N" });

  return {
    acordes: lista,
    pulsos: combinados.pulsos,
    compases: combinados.compases,
    acordesOriginales: null,
    editada: false,
    ajuste: 0,             // la sincronización ya la da la tablatura
    infoJuego: {
      pistas: resultado.pistas,
      sync: copiarSync(sync),
      creado: Date.now(),
    },
  };
}

// Copia de una sincronización (solo lo que hace falta para el mapa).
function copiarSync(sync) {
  return { inicio: sync.inicio || 0, puntos: (sync.puntos || []).map((p) => ({ compas: p.compas, ms: p.ms })) };
}

/**
 * Corre un tiempo del mp3 (en ms) de una sincronización a otra: se pasa a
 * la partitura con la vieja y se vuelve al mp3 con la nueva. Antes del
 * compás 1 y después del final, el tramo se estira o se encoge entero
 * (así 0:00 y el final de la canción no se mueven).
 */
function reubicarTiempo(ms, viejo, nuevo, finPartitura, duracionMs) {
  const a0 = viejo.aMp3(0), a1 = viejo.aMp3(finPartitura);
  const b0 = nuevo.aMp3(0), b1 = nuevo.aMp3(finPartitura);
  if (ms <= a0) return a0 > 0 ? ms * Math.max(0, b0) / a0 : ms;
  if (ms >= a1) return duracionMs > a1 ? b1 + (ms - a1) * (duracionMs - b1) / (duracionMs - a1) : ms - a1 + b1;
  return nuevo.aMp3(viejo.aPartitura(ms));
}

/**
 * Cuando cambia la sincronización de la tablatura (vista Tabs), los acordes
 * que salieron de ella se corren con la sincronización nueva. Se corren los
 * tramos tal como están, así no se pierden las correcciones a mano.
 */
async function reubicarAcordesTablatura(id, partitura, tiempos, syncNuevo) {
  if (!partitura || !tiempos || tiempos.length < 2) return;
  const cancion = await obtenerCancion(id);
  const juego = juegoDe(cancion, "tablatura");
  if (!juego || !juego.infoJuego || !juego.infoJuego.sync || !Array.isArray(juego.acordes)) return;
  const viejo = crearMapaPartituraMp3(juego.infoJuego.sync, tiempos);
  const nuevo = crearMapaPartituraMp3(syncNuevo, tiempos);
  const fin = tiempos[tiempos.length - 1];
  const duracionMs = juego.acordes[juego.acordes.length - 1].fin * 1000;
  const mover = (s) => redondear3(reubicarTiempo(s * 1000, viejo, nuevo, fin, duracionMs) / 1000);
  const moverTramos = (tramos) => (Array.isArray(tramos)
    ? tramos.map((t) => ({ ...t, inicio: mover(t.inicio), fin: mover(t.fin) }))
    : tramos);

  // Pulsos y compases: los de la partitura se corren; los de afuera se
  // vuelven a tomar del análisis del audio.
  const a0 = viejo.aMp3(0) / 1000, a1 = viejo.aMp3(fin) / 1000;
  const deLaPartitura = (lista) => (lista || []).filter((t) => t >= a0 - 0.002 && t < a1 - 0.002)
    .map((t) => nuevo.aMp3(viejo.aPartitura(t * 1000)) / 1000);
  const pulsosTab = deLaPartitura(juego.pulsos);
  if (!pulsosTab.length) return;
  const combinados = combinarConAudio(pulsosTab, deLaPartitura(juego.compases), nuevo.aMp3(fin) / 1000, juegoDe(cancion, "analisis") || {});

  const actualizado = {
    ...juego,
    acordes: moverTramos(juego.acordes),
    acordesOriginales: moverTramos(juego.acordesOriginales),
    pulsos: combinados.pulsos,
    compases: combinados.compases,
    infoJuego: { ...juego.infoJuego, sync: copiarSync(syncNuevo) },
  };
  const guardada = await guardarJuegoAcordes(id, "tablatura", actualizado);
  if (guardada && id === idActual && fuenteDe(guardada) === "tablatura") aplicarJuegoActivo(guardada);
}

/* ==================================================================
   En la app: botón "Acordes desde la tablatura" y elección del juego
   ================================================================== */

const botonAcordesTab = document.getElementById("boton-acordes-tab");
const selectorFuente = document.getElementById("selector-fuente");

// La partitura de una canción: la de la vista Tabs si ya está cargada, o se
// lee el archivo (sin dibujarlo).
async function partituraDeCancion(id) {
  if (apiTabs && apiTabs.score && tabsDeCancion === id && tabsListas) return apiTabs.score;
  const tablatura = await obtenerTablatura(id);
  if (!tablatura) return null;
  await cargarAlphaTab();
  const bytes = new Uint8Array(await tablatura.archivo.arrayBuffer());
  return alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes, new alphaTab.Settings());
}

// Muestra el botón (si hay tablatura) y el selector (si hay los dos juegos).
async function mostrarFuenteAcordes() {
  const id = idActual;
  const tieneTab = id !== null && !!(await obtenerTablatura(id).catch(() => null));
  if (id !== idActual) return;
  botonAcordesTab.hidden = !tieneTab;
  const tiene = (fuente) => {
    const juego = juegoDe(cancionActual, fuente);
    return !!(juego && Array.isArray(juego.acordes) && juego.acordes.length);
  };
  selectorFuente.hidden = !(tiene("analisis") && tiene("tablatura"));
  selectorFuente.value = fuenteDe(cancionActual);
}

botonAcordesTab.addEventListener("click", async () => {
  if (idActual === null) return;
  const id = idActual;
  panelOpciones.close();
  terminarEdicion();
  let cancion;
  try {
    cancion = await obtenerCancion(id);
  } catch (error) {
    alert("No pude leer la canción: " + error.message);
    return;
  }
  const anterior = juegoDe(cancion, "tablatura");
  if (anterior && anterior.editada && !confirm("Los acordes de la tablatura tienen correcciones a mano.\n"
      + "Si los volvés a calcular, se pierden esas correcciones (el análisis del audio no cambia). ¿Seguir?")) return;

  const progreso = (fraccion, etapa) => {
    barraProgreso.value = fraccion;
    textoProgreso.textContent = `${etapa}… ${Math.round(fraccion * 100)} %`;
  };
  capaProgreso.hidden = false;
  progreso(0, "Leyendo la tablatura");
  try {
    const partitura = await partituraDeCancion(id);
    if (!partitura) throw new Error("La canción no tiene tablatura.");
    const tiempos = calcularTiemposPartitura(partitura);

    // Sin sincronización guardada no se sabe en qué segundo del mp3 cae cada
    // compás: se ofrece sincronizar sola (lo mismo que "Sincronizar solo" en Tabs).
    let sync = cancion.tabSync;
    if (!sync) {
      capaProgreso.hidden = true;
      if (!confirm("La tablatura todavía no está sincronizada con el mp3.\n"
          + "¿Sincronizarla sola ahora? (Después la podés corregir en la vista Tabs.)")) return;
      audio.pause();
      capaProgreso.hidden = false;
      const automatica = await calcularSincronizacionAutomatica(progreso, partitura, tiempos);
      sync = { inicio: automatica.inicio, puntos: automatica.puntos, confianzaInicio: automatica.confianzaInicio };
      await actualizarCancion(id, { tabSync: sync });
      if (id === idActual) cancionActual = { ...cancionActual, tabSync: sync };
      if (tabsDeCancion === id && tabsListas) {
        syncTabs = { ...sync, puntos: sync.puntos.slice(), automatica: true };
        mostrarSync();
        aplicarSyncTabs();
      }
    }

    progreso(0.9, "Armando los acordes");
    await new Promise((r) => setTimeout(r, 0));   // deja dibujar la barra
    const resultado = acordesDePartitura(partitura);
    const delAudio = juegoDe(cancion, "analisis") || {};
    const finAnalisis = Array.isArray(delAudio.acordes) && delAudio.acordes.length ? delAudio.acordes[delAudio.acordes.length - 1].fin : 0;
    const duracion = id === idActual && isFinite(audio.duration) ? audio.duration : finAnalisis;
    const juego = armarJuegoTablatura(resultado, partitura, tiempos, sync, delAudio, duracion);
    await guardarJuegoAcordes(id, "tablatura", juego);
    // Se pasa a usar los acordes nuevos (el análisis queda guardado aparte).
    const guardada = await cambiarFuenteAcordes(id, "tablatura");
    if (id === idActual && guardada) aplicarJuegoActivo(guardada);
    const { acompanamiento, bajo } = resultado.pistas;
    mostrarMensaje(`Acordes de “${acompanamiento}”${bajo ? " y el bajo" : ""}`);
  } catch (error) {
    alert("No pude armar los acordes de la tablatura: " + error.message);
  } finally {
    capaProgreso.hidden = true;
  }
});

// Elegir qué acordes usar: los del análisis del audio o los de la tablatura.
selectorFuente.addEventListener("change", async () => {
  if (idActual === null) return;
  const id = idActual;
  const fuente = selectorFuente.value;
  terminarEdicion();
  try {
    const cancion = await cambiarFuenteAcordes(id, fuente);
    if (id === idActual && cancion) aplicarJuegoActivo(cancion);
  } catch (error) {
    alert("No pude cambiar los acordes: " + error.message);
    return;
  }
  mostrarMensaje(fuente === "tablatura" ? "Usando los acordes de la tablatura" : "Usando el análisis del audio");
});
