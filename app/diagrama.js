"use strict";

/* ==================================================================
   Dibujo del diagrama de un acorde con SVG

   SVG es un formato de dibujo con figuras (líneas, círculos, textos) que el
   navegador escala sin perder calidad. Lo armamos desde JavaScript a partir
   de una posición de la biblioteca (ver acordes.js).

   Todas las medidas están en "unidades" del dibujo (viewBox); después el
   CSS decide de qué tamaño se ve en la pantalla.
   ================================================================== */

const SVG_NS = "http://www.w3.org/2000/svg";

const MEDIDAS = {
  ancho: 110,
  alto: 130,
  izquierda: 25,          // x de la 6ª cuerda (deja lugar al número de traste)
  arriba: 28,             // y de la cejuela (deja lugar a las X y los círculos)
  entreCuerdas: 14,
  entreTrastes: 19,
  trastesVisibles: 5,
};

// Crea un elemento SVG con sus atributos y, si se indica, lo agrega a "padre".
function crearSvg(tipo, atributos, padre) {
  const elemento = document.createElementNS(SVG_NS, tipo);
  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }
  if (padre) padre.appendChild(elemento);
  return elemento;
}

// Crea un texto SVG centrado en (x, y).
function crearTexto(texto, x, y, clase, padre) {
  const elemento = crearSvg("text", { x, y, class: clase }, padre);
  elemento.textContent = texto;
  return elemento;
}

/**
 * Decide desde qué traste empieza el dibujo.
 *   - Si hay cejilla en un traste mayor que 1, el dibujo empieza ahí.
 *   - Si todos los dedos entran en los primeros 5 trastes, empieza en el 1
 *     (y se dibuja la cejuela, la línea gruesa de arriba).
 *   - Si no, empieza en el traste más bajo que se pisa.
 */
function primerTraste(posicion) {
  if (posicion.cejilla && posicion.cejilla.traste > 1) return posicion.cejilla.traste;
  const pisados = posicion.trastes.filter((t) => t > 0);
  if (pisados.length === 0 || Math.max(...pisados) <= MEDIDAS.trastesVisibles) return 1;
  return Math.min(...pisados);
}

/** Devuelve un <svg> con el diagrama de la posición. */
function dibujarDiagrama(posicion) {
  const m = MEDIDAS;
  const primero = primerTraste(posicion);

  // Funciones para pasar de cuerda/traste a coordenadas del dibujo.
  const xCuerda = (cuerda) => m.izquierda + cuerda * m.entreCuerdas;
  const yTraste = (traste) => m.arriba + (traste - primero + 0.5) * m.entreTrastes;
  const derecha = xCuerda(5);
  const abajo = m.arriba + m.trastesVisibles * m.entreTrastes;

  const svg = crearSvg("svg", {
    viewBox: `0 0 ${m.ancho} ${m.alto}`,
    class: "diagrama",
    "aria-hidden": "true",
  });

  // Trastes: líneas horizontales. La primera es la cejuela si empezamos en el 1.
  for (let i = 0; i <= m.trastesVisibles; i++) {
    const y = m.arriba + i * m.entreTrastes;
    const clase = i === 0 && primero === 1 ? "cejuela" : "traste";
    crearSvg("line", { x1: m.izquierda, y1: y, x2: derecha, y2: y, class: clase }, svg);
  }

  // Cuerdas: líneas verticales, de la 6ª (izquierda) a la 1ª (derecha).
  for (let cuerda = 0; cuerda < 6; cuerda++) {
    const x = xCuerda(cuerda);
    crearSvg("line", { x1: x, y1: m.arriba, x2: x, y2: abajo, class: "cuerda" }, svg);
  }

  // Número de traste al costado, cuando no empezamos en el primero.
  if (primero > 1) {
    crearTexto(String(primero), m.izquierda - 9, yTraste(primero), "numero-traste", svg);
  }

  // Arriba de cada cuerda: X si no se toca, círculo si va al aire.
  const yMarca = m.arriba - 10;
  posicion.trastes.forEach((traste, cuerda) => {
    const x = xCuerda(cuerda);
    if (traste < 0) {
      crearSvg("line", { x1: x - 4, y1: yMarca - 4, x2: x + 4, y2: yMarca + 4, class: "marca" }, svg);
      crearSvg("line", { x1: x - 4, y1: yMarca + 4, x2: x + 4, y2: yMarca - 4, class: "marca" }, svg);
    } else if (traste === 0) {
      crearSvg("circle", { cx: x, cy: yMarca, r: 4.5, class: "marca" }, svg);
    }
  });

  // Cejilla: una barra redondeada que cubre las cuerdas que apoya el índice.
  const cejilla = posicion.cejilla;
  if (cejilla) {
    const y = yTraste(cejilla.traste);
    crearSvg("rect", {
      x: xCuerda(cejilla.desde) - 6.5,
      y: y - 6.5,
      width: (cejilla.hasta - cejilla.desde) * m.entreCuerdas + 13,
      height: 13,
      rx: 6.5,
      class: "punto",
    }, svg);
    // Casi siempre la hace el índice (1), pero en algunas posiciones es otro dedo.
    const dedoCejilla = posicion.dedos[cejilla.desde] || 1;
    crearTexto(String(dedoCejilla), (xCuerda(cejilla.desde) + xCuerda(cejilla.hasta)) / 2, y, "dedo", svg);
  }

  // Puntos con el número de dedo. Los que ya cubre la cejilla no se repiten.
  posicion.trastes.forEach((traste, cuerda) => {
    if (traste <= 0) return;
    const bajoCejilla = cejilla
      && traste === cejilla.traste
      && cuerda >= cejilla.desde
      && cuerda <= cejilla.hasta;
    if (bajoCejilla) return;

    const x = xCuerda(cuerda);
    const y = yTraste(traste);
    crearSvg("circle", { cx: x, cy: y, r: 6.5, class: "punto" }, svg);
    const dedo = posicion.dedos[cuerda];
    if (dedo > 0) crearTexto(String(dedo), x, y, "dedo", svg);
  });

  return svg;
}
