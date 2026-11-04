"use strict";

/* ==================================================================
   Geometría de las fotos de la guitarra (mástil "Foto")

   Lo usan la app (mastil-foto.js) y la página de calibración
   (calibrar-fotos.html).

   Las cuerdas están en un plano. En ese plano se mide en milímetros:
     X: a lo largo de las cuerdas, desde la cejuela (0) hacia el puente
        (ESCALA_MM); el traste n está en X = ESCALA · (1 − 2^(−n/12));
     Y: a lo ancho, desde el centro; la 6ª cuerda en −separación/2 y la
        1ª en +separación/2, con la separación creciendo de la cejuela
        (35 mm) al puente (51 mm). Los bordes del diapasón, en ±ancho/2
        (43 mm en la cejuela, 56,5 mm en el traste 22).
   La foto ve ese plano en perspectiva: una homografía (una matriz 3 × 3)
   lleva cada punto (X, Y) del plano a un punto (x, y) de la foto. Se
   calcula con los puntos de la calibración: las dos puntas (los bordes
   del diapasón, del lado de la 6ª y del lado de la 1ª) de la cejuela,
   del traste 12 y del último traste visible. Son seis puntos; con
   cuatro alcanza, los demás reparten el error. Se usan los bordes y no
   las cuerdas porque el filete crema se ve nítido en cualquier foto.

   Las coordenadas de la foto van de 0 a 1 (fracción del ancho y del alto),
   así sirven para cualquiera de los dos tamaños de la imagen.
   ================================================================== */

const ESCALA_MM = 628;                 // Les Paul: 24,75"
const SEPARACION_CEJUELA_MM = 35;      // de la 6ª a la 1ª cuerda
const SEPARACION_PUENTE_MM = 51;

const xDeTrasteMm = (n) => ESCALA_MM * (1 - Math.pow(2, -n / 12));
const separacionMm = (X) => SEPARACION_CEJUELA_MM + (SEPARACION_PUENTE_MM - SEPARACION_CEJUELA_MM) * X / ESCALA_MM;
// fila 0 = 1ª cuerda (la más aguda) … fila 5 = 6ª; con otra cantidad de cuerdas se reparte igual.
const yDeCuerdaMm = (X, fila, cuerdas = 6) => separacionMm(X) * (0.5 - fila / Math.max(1, cuerdas - 1));
const ANCHO_CEJUELA_MM = 43, ANCHO_TRASTE_22_MM = 56.5;
const anchoDiapasonMm = (X) => ANCHO_CEJUELA_MM + (ANCHO_TRASTE_22_MM - ANCHO_CEJUELA_MM) * X / xDeTrasteMm(22);

// Resuelve A·x = b (eliminación de Gauss con pivoteo), para matrices chicas.
function resolverSistema(A, b) {
  const n = b.length;
  const M = A.map((fila, i) => [...fila, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let f = c + 1; f < n; f++) if (Math.abs(M[f][c]) > Math.abs(M[p][c])) p = f;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) return null;
    for (let f = 0; f < n; f++) {
      if (f === c) continue;
      const k = M[f][c] / M[c][c];
      for (let j = c; j <= n; j++) M[f][j] -= k * M[c][j];
    }
  }
  return M.map((fila, i) => fila[n] / fila[i]);
}

/**
 * La homografía (h33 = 1) que mejor lleva los puntos del plano a los de la
 * foto, por mínimos cuadrados. pares: [{ X, Y, x, y }], al menos 4.
 */
function calcularHomografia(pares) {
  // Para que las cuentas sean estables, los puntos de la foto se usan tal cual (0 a 1)
  // y los del plano en metros.
  const filas = [], valores = [];
  for (const { X, Y, x, y } of pares) {
    const u = X / 1000, v = Y / 1000;
    filas.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); valores.push(x);
    filas.push([0, 0, 0, u, v, 1, -u * y, -v * y]); valores.push(y);
  }
  // Ecuaciones normales: (AᵀA) h = Aᵀb
  const AtA = Array.from({ length: 8 }, () => new Array(8).fill(0));
  const Atb = new Array(8).fill(0);
  filas.forEach((f, k) => {
    for (let i = 0; i < 8; i++) {
      Atb[i] += f[i] * valores[k];
      for (let j = 0; j < 8; j++) AtA[i][j] += f[i] * f[j];
    }
  });
  const h = resolverSistema(AtA, Atb);
  return h ? [...h, 1] : null;
}

// Del plano (mm) a la foto (0 a 1).
function aFoto(H, X, Y) {
  const u = X / 1000, v = Y / 1000;
  const w = H[6] * u + H[7] * v + H[8];
  return { x: (H[0] * u + H[1] * v + H[2]) / w, y: (H[3] * u + H[4] * v + H[5]) / w };
}

/**
 * Arma la geometría de una foto a partir de su calibración:
 *   { puntos: { cejuela: [b6, b1], traste12: [b6, b1], ultimo: { traste, puntos: [b6, b1] } } }
 * (b6 y b1: el borde del diapasón del lado de la 6ª y del lado de la 1ª, cada
 * uno { x, y } de 0 a 1). Devuelve funciones para ubicar trastes y cuerdas,
 * y el error de la calibración (en fracción de la foto).
 */
function geometriaDeFoto(calibracion) {
  const pares = [];
  const agregar = (traste, [b6, b1]) => {
    const X = xDeTrasteMm(traste);
    pares.push({ X, Y: -anchoDiapasonMm(X) / 2, x: b6.x, y: b6.y });
    pares.push({ X, Y: anchoDiapasonMm(X) / 2, x: b1.x, y: b1.y });
  };
  const p = calibracion.puntos;
  agregar(0, p.cejuela);
  agregar(12, p.traste12);
  agregar(p.ultimo.traste, p.ultimo.puntos);
  const H = calcularHomografia(pares);
  if (!H) return null;
  const error = Math.max(...pares.map((par) => {
    const q = aFoto(H, par.X, par.Y);
    return Math.hypot(q.x - par.x, q.y - par.y);
  }));
  return {
    H, error, ultimoTraste: p.ultimo.traste,
    // Un punto de la cuerda "fila" en la posición X (mm desde la cejuela)
    punto: (X, fila, cuerdas = 6, corrimientoMm = 0) => aFoto(H, X, yDeCuerdaMm(X, fila, cuerdas) + corrimientoMm),
    // Dónde va el dedo en el traste (puede ser fraccionario); al aire, un poco antes de la cejuela
    xDedoMm: (traste) => (traste <= 0 ? -9 : xDeTrasteMm(traste - 0.45)),
  };
}
