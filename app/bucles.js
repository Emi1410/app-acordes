"use strict";

/* ==================================================================
   Bucle con corchetes, bucles guardados y entrenador de velocidad

   El estado del bucle (bucleAB: a y b en segundos del mp3) y la vuelta
   al inicio están en practica.js. Acá está lo que se ve y se toca:

   Corchetes: con el bucle activo, la zona que se repite se sombrea en
   la vista que se esté mirando (tira de Pulsos, Grilla o tablatura), con
   dos manijas, inicio y fin, que se arrastran con el dedo. Se mueven de
   a pulso (no solo de a compás):
     - Pulsos y Grilla: los pulsos del análisis (los casilleros);
     - Tabs: las negras de la partitura, con la sincronización con el mp3.
   Cada vista se adapta con tres funciones: dónde está cada pulso
   (puntos), qué rectángulos sombrear y qué pulso queda bajo el dedo.

   Barra del bucle (arriba de la vista): cuántos compases, la lista de
   bucles guardados de la canción ("Solo", "Riff de la intro"), Guardar
   (o Borrar, si el bucle es uno guardado), Entrenador y ✕.

   Entrenador de velocidad: el bucle arranca a una velocidad (70 %), se
   repite N veces (3) y sube de a un paso (5 %) hasta la final (100 %).
   ================================================================== */

const barraBucle = document.getElementById("barra-bucle");
const textoBucle = document.getElementById("texto-bucle");
const selectorBuclesGuardados = document.getElementById("bucles-guardados");
const botonGuardarBucle = document.getElementById("guardar-bucle");
const botonEntrenador = document.getElementById("boton-entrenador");
const botonSacarBucle = document.getElementById("sacar-bucle");
const dialogoEntrenador = document.getElementById("dialogo-entrenador");
const camposEntrenador = {
  inicio: document.getElementById("entrenador-inicio"),
  veces: document.getElementById("entrenador-veces"),
  paso: document.getElementById("entrenador-paso"),
  final: document.getElementById("entrenador-final"),
};


/* ------------------------------------------------------------------
   Pulsos de cada vista: { t (segundos del mp3), x, y, alto, fila }
   "fila" agrupa los que están en el mismo renglón (para sombrear).
   ------------------------------------------------------------------ */

// Posición de un elemento dentro del contenido desplazable de "contenedor".
function enContenido(rect, contenedor) {
  const caja = contenedor.getBoundingClientRect();
  return {
    x: rect.left - caja.left + contenedor.scrollLeft,
    y: rect.top - caja.top + contenedor.scrollTop,
    ancho: rect.width,
    alto: rect.height,
  };
}

// Tira de Pulsos: un punto al principio de cada casillero y uno al final del último.
function puntosDeTira() {
  const celdas = tira.querySelectorAll(".pulso");
  const puntos = [];
  for (let i = 0; i < celdas.length; i++) {
    const r = enContenido(celdas[i].getBoundingClientRect(), tira);
    puntos.push({ t: pulsos[i] + ajuste, x: r.x, y: r.y, alto: r.alto, fila: 0 });
    if (i === celdas.length - 1) {
      const fin = isFinite(audio.duration) ? audio.duration : pulsos[i] + ajuste + 0.5;
      puntos.push({ t: fin, x: r.x + r.ancho, y: r.y, alto: r.alto, fila: 0 });
    }
  }
  return puntos;
}

// Grilla: cada casillero es un compás; sus pulsos se reparten a lo ancho.
function puntosDeGrilla() {
  const puntos = [];
  let fila = -1, ultimoY = null;
  for (const casillero of lista.querySelectorAll(".compas-grilla")) {
    const compas = compasesGrilla[Number(casillero.dataset.compas)];
    if (!compas) continue;
    const r = enContenido(casillero.getBoundingClientRect(), lista);
    if (ultimoY === null || Math.abs(r.y - ultimoY) > 2) { fila++; ultimoY = r.y; }
    const cuantos = compas.hasta - compas.desde;
    for (let k = 0; k <= cuantos; k++) {
      const i = compas.desde + k;
      const t = i < pulsos.length ? pulsos[i] + ajuste : (isFinite(audio.duration) ? audio.duration : pulsos[pulsos.length - 1] + ajuste + 0.5);
      // El final de un casillero cae en el mismo tiempo que el principio del
      // siguiente (quizás en otro renglón): el inicio del bucle prefiere el
      // principio y el fin prefiere el final.
      puntos.push({ t, x: r.x + r.ancho * k / cuantos, y: r.y, alto: r.alto, fila, finDeCompas: k === cuantos });
    }
  }
  return puntos;
}

// Tablatura: las negras de cada compás, ubicadas entre las notas que dibujó alphaTab.
let puntosTabsGuardados = null;    // se arman al terminar de dibujar (son muchos)

function puntosDeTabs() {
  if (puntosTabsGuardados) return puntosTabsGuardados;
  const vista = apiTabs && apiTabs.renderer && apiTabs.renderer.boundsLookup;
  if (!vista || !mapaMastil || !apiTabs.score) return [];
  const superficie = contenedorTabs.querySelector(".at-surface");
  if (!superficie) return [];
  const origen = enContenido(superficie.getBoundingClientRect(), cajaTabs);
  const msDeTick = crearMapaDeTempo(apiTabs.score);
  const segundosDeTick = (tick) => mapaMastil.aMp3(msDeTick(tick)) / 1000;
  const puntos = [];
  vista.staffSystems.forEach((sistema, fila) => {
    const caja = sistema.realBounds;
    for (const delCompas of sistema.bars) {
      const compas = delCompas.masterBar || (delCompas.bars[0] && delCompas.bars[0].bar.masterBar);
      if (!compas) continue;
      const x0 = delCompas.realBounds.x, x1 = delCompas.realBounds.x + delCompas.realBounds.w;
      const inicio = compas.start, fin = compas.start + compas.calculateDuration();
      // Dónde dibujó alphaTab cada nota (tick → x); entre nota y nota, en línea recta.
      const marcas = [{ tick: inicio, x: x0 }];
      const pulsosDibujados = delCompas.bars[0] ? delCompas.bars[0].beats : [];
      for (const b of pulsosDibujados) {
        const tick = b.beat.absolutePlaybackStart;
        const x = b.onNotesX || b.realBounds.x;
        if (tick > marcas[marcas.length - 1].tick && x > marcas[marcas.length - 1].x) marcas.push({ tick, x });
      }
      marcas.push({ tick: fin, x: x1 });
      const xDeTick = (tick) => {
        let k = 0;
        while (k + 2 < marcas.length && marcas[k + 1].tick <= tick) k++;
        const a = marcas[k], b = marcas[k + 1];
        return a.x + (tick - a.tick) / Math.max(1, b.tick - a.tick) * (b.x - a.x);
      };
      for (let tick = inicio; tick < fin; tick += TICKS_NEGRA) {
        puntos.push({ t: segundosDeTick(tick), x: origen.x + xDeTick(tick), y: origen.y + caja.y, alto: caja.h, fila });
      }
      puntos.push({ t: segundosDeTick(fin), x: origen.x + x1, y: origen.y + caja.y, alto: caja.h, fila, finDeCompas: true });
    }
  });
  puntosTabsGuardados = puntos;
  return puntos;
}

// La vista que se está mirando: { contenedor, puntos() }.
function vistaDelBucle() {
  if (!vistaTabs.hidden) return tabsListas ? { contenedor: cajaTabs, puntos: puntosDeTabs, nombre: "tabs" } : null;
  if (!vistaPulsos.hidden) return { contenedor: tira, puntos: puntosDeTira, nombre: "pulsos" };
  if (!lista.hidden) return { contenedor: lista, puntos: puntosDeGrilla, nombre: "grilla" };
  return null;
}

/* ------------------------------------------------------------------
   Dibujar: sombra y manijas
   ------------------------------------------------------------------ */

let capaBucle = null;          // la capa dentro del contenedor de la vista
let manijas = null;            // { inicio, fin }
let manijaArrastrada = null;        // "inicio" | "fin" mientras se arrastra una manija

function crearCapa() {
  capaBucle = document.createElement("div");
  capaBucle.className = "capa-bucle";
  capaBucle.setAttribute("aria-hidden", "true");
  manijas = {};
  for (const lado of ["inicio", "fin"]) {
    const manija = document.createElement("div");
    manija.className = `manija-bucle manija-${lado}`;
    manija.dataset.lado = lado;
    manija.addEventListener("pointerdown", empezarArrastre);
    manijas[lado] = manija;
  }
}

// Los puntos de la vista más cerca de los tiempos a y b (el fin, en el renglón donde termina).
function puntoMasCerca(puntos, t, preferirFin) {
  let mejor = null, distancia = Infinity;
  for (const p of puntos) {
    const d = Math.abs(p.t - t) - (preferirFin === !!p.finDeCompas ? 0.0001 : 0);
    if (d < distancia) { distancia = d; mejor = p; }
  }
  return mejor;
}

function dibujarCorchetes() {
  const vista = bucleAB.estado === "activo" ? vistaDelBucle() : null;
  if (!vista) {
    if (capaBucle) capaBucle.remove();
    return;
  }
  if (!capaBucle) crearCapa();
  if (capaBucle.parentElement !== vista.contenedor) vista.contenedor.appendChild(capaBucle);
  const puntos = vista.puntos();
  if (puntos.length < 2) {
    capaBucle.replaceChildren();
    return;
  }
  const inicio = puntoMasCerca(puntos, bucleAB.a, false);
  const fin = puntoMasCerca(puntos, bucleAB.b, true);
  const piezas = [];
  // La sombra: un rectángulo por renglón, desde el inicio hasta el fin.
  if (vista.nombre !== "pulsos") {   // en la tira ya se pintan los casilleros (practica.js)
    const filas = new Map();
    for (const p of puntos) {
      if (p.t < inicio.t - 0.001 || p.t > fin.t + 0.001) continue;
      const fila = filas.get(p.fila) || { x0: Infinity, x1: -Infinity, y: p.y, alto: p.alto };
      fila.x0 = Math.min(fila.x0, p.x);
      fila.x1 = Math.max(fila.x1, p.x);
      filas.set(p.fila, fila);
    }
    for (const fila of filas.values()) {
      if (fila.x1 - fila.x0 < 1) continue;
      const sombra = document.createElement("div");
      sombra.className = "sombra-bucle";
      Object.assign(sombra.style, { left: `${fila.x0}px`, top: `${fila.y}px`, width: `${fila.x1 - fila.x0}px`, height: `${fila.alto}px` });
      piezas.push(sombra);
    }
  }
  for (const [lado, punto] of [["inicio", inicio], ["fin", fin]]) {
    const manija = manijas[lado];
    Object.assign(manija.style, { left: `${punto.x}px`, top: `${punto.y}px`, height: `${punto.alto}px` });
    piezas.push(manija);
  }
  capaBucle.replaceChildren(...piezas);
  capaBucle.dataset.vista = vista.nombre;
}

// Arrastrar una manija: el pulso más cerca del dedo (en el renglón bajo el dedo).
function empezarArrastre(evento) {
  evento.preventDefault();
  evento.stopPropagation();
  manijaArrastrada = evento.currentTarget.dataset.lado;
  try { evento.currentTarget.setPointerCapture(evento.pointerId); } catch { /* sin captura: igual se sigue al dedo */ }
  evento.currentTarget.classList.add("arrastrando");
  const mover = (e) => moverManija(e);
  const soltar = (e) => {
    e.currentTarget.removeEventListener("pointermove", mover);
    e.currentTarget.removeEventListener("pointerup", soltar);
    e.currentTarget.removeEventListener("pointercancel", soltar);
    e.currentTarget.classList.remove("arrastrando");
    manijaArrastrada = null;
    mostrarBarraBucle();
    // Si quedó adelante del inicio lo que suena, se vuelve al inicio del bucle.
    const ahora = posicionQueSuena(true);
    if (ahora < bucleAB.a - 0.05 || ahora > bucleAB.b + 0.05) { audio.currentTime = bucleAB.a; actualizar(); }
  };
  evento.currentTarget.addEventListener("pointermove", mover);
  evento.currentTarget.addEventListener("pointerup", soltar);
  evento.currentTarget.addEventListener("pointercancel", soltar);
}

function moverManija(evento) {
  const vista = vistaDelBucle();
  if (!vista || !manijaArrastrada) return;
  const puntos = vista.puntos();
  const caja = vista.contenedor.getBoundingClientRect();
  const x = evento.clientX - caja.left + vista.contenedor.scrollLeft;
  const y = evento.clientY - caja.top + vista.contenedor.scrollTop;
  // El renglón bajo el dedo (o el más cercano) y, en él, el pulso más cerca.
  let mejor = null, distancia = Infinity;
  for (const p of puntos) {
    const dy = y < p.y ? p.y - y : y > p.y + p.alto ? y - p.y - p.alto : 0;
    const d = dy * 4 + Math.abs(p.x - x);
    if (d < distancia) { distancia = d; mejor = p; }
  }
  if (!mejor) return;
  // Al menos un pulso de largo.
  const minimo = 0.15;
  if (manijaArrastrada === "inicio") bucleAB.a = Math.min(mejor.t, bucleAB.b - minimo);
  else bucleAB.b = Math.max(mejor.t, bucleAB.a + minimo);
  bucleAB.finA = bucleAB.b;
  pintarBucleEnTira();
  dibujarCorchetes();
  mostrarTextoBucle();
}

// Volver a ubicar todo cuando cambia el tamaño o se vuelve a dibujar una vista.
function alRedibujarVista() {
  puntosTabsGuardados = null;
  if (!manijaArrastrada) dibujarCorchetes();
}
new ResizeObserver(alRedibujarVista).observe(document.getElementById("pantalla-reproductor"));

/* ------------------------------------------------------------------
   Barra del bucle
   ------------------------------------------------------------------ */

// Cuántos compases (de la tira) tiene el bucle.
function compasesDelBucle() {
  return pulsos.filter((p, i) => esCompas[i] && p + ajuste >= bucleAB.a - 0.03 && p + ajuste < bucleAB.b - 0.03).length;
}

const buclesDeCancion = () => (cancionActual && Array.isArray(cancionActual.bucles) ? cancionActual.bucles : []);
const mismoBucle = (guardado) => Math.abs(guardado.a - bucleAB.a) < 0.02 && Math.abs(guardado.b - bucleAB.b) < 0.02;

function mostrarTextoBucle() {
  const compases = compasesDelBucle();
  const pulsosDentro = pulsos.filter((p) => p + ajuste >= bucleAB.a - 0.03 && p + ajuste < bucleAB.b - 0.03).length;
  let texto = compases >= 1 && pulsosDentro % PULSOS_POR_COMPAS === 0
    ? (compases === 1 ? "1 compás" : `${compases} compases`)
    : `${pulsosDentro} pulsos`;
  if (entrenador.activo) texto += ` · ${entrenador.velocidad} % (${entrenador.vueltas + 1}/${entrenador.veces})`;
  textoBucle.textContent = texto;
}

function mostrarBarraBucle() {
  const activo = bucleAB.estado === "activo";
  barraBucle.hidden = !activo;
  if (!activo) return;
  mostrarTextoBucle();
  const guardados = buclesDeCancion();
  const actual = guardados.findIndex(mismoBucle);
  selectorBuclesGuardados.replaceChildren(
    new Option(guardados.length ? "Mis bucles…" : "Sin bucles guardados", ""),
    ...guardados.map((b, i) => new Option(b.nombre, String(i))),
  );
  selectorBuclesGuardados.value = actual >= 0 ? String(actual) : "";
  selectorBuclesGuardados.hidden = guardados.length === 0;   // sin guardados, no ocupa lugar
  botonGuardarBucle.textContent = actual >= 0 ? "Borrar" : "Guardar";
  botonEntrenador.setAttribute("aria-pressed", String(entrenador.activo));
}

// Lo llama practica.js cada vez que cambia el bucle.
function alCambiarBucle() {
  if (bucleAB.estado !== "activo" && entrenador.activo) apagarEntrenador();
  mostrarBarraBucle();
  dibujarCorchetes();
}

botonSacarBucle.addEventListener("click", () => {
  sacarBucle();
  mostrarMensaje("Sin bucle");
});

// Elegir un bucle guardado: se activa y la canción va a su inicio.
selectorBuclesGuardados.addEventListener("change", () => {
  const guardado = buclesDeCancion()[Number(selectorBuclesGuardados.value)];
  if (!guardado) return;
  bucleAB.estado = "activo";
  bucleAB.a = guardado.a;
  bucleAB.b = guardado.b;
  bucleAB.finA = guardado.b;
  mostrarBucle();
  audio.currentTime = guardado.a;
  actualizar();
  mostrarMensaje(`Bucle “${guardado.nombre}”`);
});

// Guardar con un nombre (o borrar, si el bucle activo es uno guardado).
botonGuardarBucle.addEventListener("click", () => {
  if (idActual === null) return;
  const guardados = buclesDeCancion().slice();
  const actual = guardados.findIndex(mismoBucle);
  if (actual >= 0) {
    if (!confirm(`¿Borrar el bucle “${guardados[actual].nombre}”?`)) return;
    guardados.splice(actual, 1);
  } else {
    const propuesta = `Bucle ${guardados.length + 1}`;
    const nombre = (prompt("Nombre del bucle (por ejemplo «Solo» o «Riff de la intro»):", propuesta) || "").trim();
    if (!nombre) return;
    const repetido = guardados.findIndex((b) => b.nombre.toLowerCase() === nombre.toLowerCase());
    const nuevo = { nombre: nombre.slice(0, 40), a: Math.round(bucleAB.a * 1000) / 1000, b: Math.round(bucleAB.b * 1000) / 1000 };
    if (repetido >= 0) guardados[repetido] = nuevo;
    else guardados.push(nuevo);
    guardados.sort((x, y) => x.a - y.a);
  }
  cancionActual = { ...cancionActual, bucles: guardados };
  actualizarCancion(idActual, { bucles: guardados }).catch(() => {});
  mostrarBarraBucle();
  mostrarMensaje(actual >= 0 ? "Bucle borrado" : "Bucle guardado");
});

/* ------------------------------------------------------------------
   Entrenador de velocidad
   ------------------------------------------------------------------ */

const entrenador = { activo: false, inicio: 70, veces: 3, paso: 5, final: 100, vueltas: 0, velocidad: 70 };
try {
  const guardado = JSON.parse(localStorage.getItem("entrenador") || "null");
  if (guardado) for (const clave of ["inicio", "veces", "paso", "final"]) if (Number.isFinite(guardado[clave])) entrenador[clave] = guardado[clave];
} catch { /* valores por defecto */ }

botonEntrenador.addEventListener("click", () => {
  for (const [clave, campo] of Object.entries(camposEntrenador)) campo.value = entrenador[clave];
  dialogoEntrenador.showModal();
});

dialogoEntrenador.addEventListener("close", () => {
  if (dialogoEntrenador.returnValue === "apagar") {
    apagarEntrenador();
    return;
  }
  if (dialogoEntrenador.returnValue !== "empezar") return;
  const leer = (clave, minimo, maximo) => Math.min(maximo, Math.max(minimo, Math.round(Number(camposEntrenador[clave].value) || entrenador[clave])));
  entrenador.inicio = leer("inicio", 30, 200);
  entrenador.veces = leer("veces", 1, 20);
  entrenador.paso = leer("paso", 1, 50);
  entrenador.final = Math.max(entrenador.inicio, leer("final", 30, 200));
  try {
    localStorage.setItem("entrenador", JSON.stringify({ inicio: entrenador.inicio, veces: entrenador.veces, paso: entrenador.paso, final: entrenador.final }));
  } catch { /* queda para esta sesión */ }
  entrenador.activo = true;
  entrenador.vueltas = 0;
  entrenador.velocidad = entrenador.inicio;
  aplicarVelocidad(entrenador.velocidad / 100, true);
  audio.currentTime = bucleAB.a;
  actualizar();
  mostrarBarraBucle();
  mostrarMensaje(`Entrenador: empieza a ${entrenador.inicio} %`);
});

// Al terminar el entrenador (o sacar el bucle) vuelve la velocidad de la canción.
function apagarEntrenador() {
  if (!entrenador.activo) return;
  entrenador.activo = false;
  aplicarVelocidad((cancionActual && cancionActual.velocidad) || 1);
  mostrarBarraBucle();
}

// Lo llama practica.js cada vez que el bucle vuelve al inicio.
function vueltaDelEntrenador() {
  if (!entrenador.activo) return;
  entrenador.vueltas++;
  if (entrenador.vueltas >= entrenador.veces && entrenador.velocidad < entrenador.final) {
    entrenador.vueltas = 0;
    entrenador.velocidad = Math.min(entrenador.final, entrenador.velocidad + entrenador.paso);
    aplicarVelocidad(entrenador.velocidad / 100, true);
    mostrarMensaje(entrenador.velocidad >= entrenador.final ? `Entrenador: ¡velocidad final, ${entrenador.velocidad} %!` : `Entrenador: ${entrenador.velocidad} %`);
  } else if (entrenador.vueltas >= entrenador.veces) {
    entrenador.vueltas = entrenador.veces - 1;   // ya en la final: sigue repitiendo
  }
  mostrarTextoBucle();
}

// Otra canción: sin entrenador.
audio.addEventListener("loadstart", () => { entrenador.activo = false; });

mostrarBucle();
