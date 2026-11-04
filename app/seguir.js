"use strict";

/* ==================================================================
   Deslizar para mirar, tocar para saltar (Pulsos, Grilla y Tabs)

   Las vistas siguen solas a la canción (la tira se corre, la grilla
   centra la vuelta que suena, la tablatura acompaña al cursor). Pero:
     - si deslizás la tira, la grilla o la tablatura para mirar otra
       parte, la canción sigue sonando donde va y la vista deja de
       seguirla: aparece "Sincronización desactivada" con "Activar";
       a los 10 s sin tocar nada se vuelve a sincronizar sola;
     - si tocás un acorde, un compás o una nota, la canción salta ahí y
       la vista vuelve a seguirla.

   Cómo se sabe que el que desliza es el usuario (y no la app, que
   también desplaza estas vistas): un "scroll" cuenta solo si hay un dedo
   moviéndose sobre la vista (o recién soltado, por la inercia), si se
   está arrastrando la barra con el mouse o si se usó la rueda.
   ================================================================== */

const avisoSincronia = document.getElementById("aviso-sincronia");
const botonActivarSincronia = document.getElementById("activar-sincronia");

const ESPERA_RESINCRONIZAR_MS = 10000;
const INERCIA_MS = 1200;           // después de soltar, el desplazamiento sigue un rato solo

let vistaSincronizada = true;
let temporizadorSincronia = null;

function desincronizarVista() {
  clearTimeout(temporizadorSincronia);
  temporizadorSincronia = setTimeout(resincronizarVista, ESPERA_RESINCRONIZAR_MS);
  if (!vistaSincronizada) return;
  vistaSincronizada = false;
  avisoSincronia.hidden = false;
  // alphaTab deja de correr la tablatura detrás del cursor.
  if (apiTabs) apiTabs.settings.player.scrollMode = alphaTab.ScrollMode.Off;
}

// La vista vuelve a seguir a la canción y se lleva al lugar que suena.
function resincronizarVista() {
  clearTimeout(temporizadorSincronia);
  temporizadorSincronia = null;
  if (vistaSincronizada) return;
  vistaSincronizada = true;
  avisoSincronia.hidden = true;
  if (apiTabs) apiTabs.settings.player.scrollMode = alphaTab.ScrollMode.Continuous;
  // Que cada vista se vuelva a ubicar aunque no haya cambiado el pulso.
  indicePulso = -1;
  for (const celda of tira.querySelectorAll(".actual")) celda.classList.remove("actual");
  compasResaltado = -1;
  actualizar();
  if (typeof tabsListas !== "undefined" && tabsListas && !vistaTabs.hidden) apiTabs.scrollToCursor();
}

// Tocar un acorde, un compás o una nota: la canción salta y la vista la sigue.
function alTocarParaSaltar() {
  resincronizarVista();
}

botonActivarSincronia.addEventListener("click", resincronizarVista);

// Cada vista que se desliza: la tira, la grilla y la tablatura.
function vigilarDesplazamiento(elemento) {
  let tocando = false;       // dedo o botón del mouse apretado sobre la vista
  let movido = false;        // el dedo se movió (no es un toque)
  let finArrastre = -1e9;    // cuándo se soltó un arrastre (por la inercia)
  let ultimaRueda = -1e9;

  elemento.addEventListener("touchstart", () => { tocando = true; movido = false; }, { passive: true });
  elemento.addEventListener("touchmove", () => { movido = true; }, { passive: true });
  const soltar = () => {
    if (tocando && movido) finArrastre = performance.now();
    tocando = false;
  };
  elemento.addEventListener("touchend", soltar, { passive: true });
  elemento.addEventListener("touchcancel", soltar, { passive: true });
  // Con el mouse: arrastrar la barra de desplazamiento.
  elemento.addEventListener("mousedown", (evento) => { if (!evento.sourceCapabilities || !evento.sourceCapabilities.firesTouchEvents) { tocando = true; movido = true; } });
  addEventListener("mouseup", () => { if (tocando && movido) tocando = false; });
  elemento.addEventListener("wheel", () => { ultimaRueda = performance.now(); }, { passive: true });

  elemento.addEventListener("scroll", () => {
    const ahora = performance.now();
    const delUsuario = (tocando && movido) || ahora - finArrastre < INERCIA_MS || ahora - ultimaRueda < 500;
    if (delUsuario && idActual !== null && !editando) desincronizarVista();
  }, { passive: true });
}

vigilarDesplazamiento(tira);
vigilarDesplazamiento(lista);
vigilarDesplazamiento(cajaTabs);

// Tocar un pulso de la tira o un compás de la grilla ya salta (app.js y
// grilla.js); acá solo se vuelve a sincronizar la vista. (La tablatura lo
// hace en su propio salto, en tablaturas.js.)
tira.addEventListener("click", (evento) => {
  if (evento.target.closest(".pulso") && !editando) alTocarParaSaltar();
});
lista.addEventListener("click", (evento) => {
  if (evento.target.closest(".trozo")) alTocarParaSaltar();
});

// Otra canción o modo edición: la vista sigue a la canción.
audio.addEventListener("loadstart", resincronizarVista);
