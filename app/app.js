"use strict";

/* ==================================================================
   Referencias a los elementos de la página
   ================================================================== */
const audio = document.getElementById("audio");
const inputMp3 = document.getElementById("input-mp3");
const inputJson = document.getElementById("input-json");
const nombreMp3 = document.getElementById("nombre-mp3");
const nombreJson = document.getElementById("nombre-json");
const titulo = document.getElementById("titulo");
const acordeActual = document.getElementById("acorde-actual");
const acordeSiguiente = document.getElementById("acorde-siguiente");
const cuentaRegresiva = document.getElementById("cuenta-regresiva");
const botonPlay = document.getElementById("boton-play");
const barraTiempo = document.getElementById("barra-tiempo");
const tiempoActual = document.getElementById("tiempo-actual");
const tiempoTotal = document.getElementById("tiempo-total");
const botonAntes = document.getElementById("boton-antes");
const botonDespues = document.getElementById("boton-despues");
const valorAjuste = document.getElementById("valor-ajuste");
const lista = document.getElementById("lista");
const diagramaActual = document.getElementById("diagrama-actual");
const diagramaSiguiente = document.getElementById("diagrama-siguiente");

/* ==================================================================
   Estado de la app
   ================================================================== */

// Lista de acordes leída del JSON: [{ inicio, fin, acorde }, ...]
let acordes = [];

// Ajuste de sincronización en segundos.
// Positivo = los acordes aparecen más tarde; negativo = más temprano.
let ajuste = 0;

// Posición en "acordes" del acorde que se está mostrando (-1 = ninguno).
let indiceActual = -1;

// true mientras el usuario arrastra la barra de tiempo con el dedo,
// para no pisarle la posición mientras la mueve.
let arrastrando = false;

// Bloqueo de pantalla: evita que el celular se apague mientras tocás.
let bloqueoPantalla = null;

// Posición elegida para cada acorde, por ejemplo { "G#": 1, "C#m": 0 }.
// Se guarda en el navegador para que se acuerde aunque cierres la app.
// El try/catch es porque algunos navegadores bloquean ese almacenamiento.
let posicionElegida = {};
try {
  posicionElegida = JSON.parse(localStorage.getItem("posicionElegida")) || {};
} catch {
  posicionElegida = {};
}

/* ==================================================================
   Utilidades
   ================================================================== */

// Convierte segundos en texto "m:ss" (por ejemplo 72.5 → "1:12").
function formatoTiempo(segundos) {
  if (!isFinite(segundos) || segundos < 0) segundos = 0;
  const s = Math.floor(segundos);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// El analizador usa "N" para "sin acorde"; en pantalla mostramos una raya.
function nombreVisible(acorde) {
  return acorde === "N" ? "–" : acorde;
}

/* ==================================================================
   1. Carga de archivos
   ================================================================== */

// Al elegir un mp3, creamos una URL temporal que apunta al archivo
// del dispositivo y se la damos al reproductor. No se sube a ningún lado.
inputMp3.addEventListener("change", () => {
  const archivo = inputMp3.files[0];
  if (!archivo) return;

  if (audio.src) URL.revokeObjectURL(audio.src); // liberamos la anterior
  audio.src = URL.createObjectURL(archivo);
  nombreMp3.textContent = archivo.name;
  botonPlay.disabled = false;
  barraTiempo.disabled = false;
});

// Al elegir el JSON, lo leemos como texto, lo convertimos a objeto y
// revisamos que tenga el formato que genera el analizador.
inputJson.addEventListener("change", async () => {
  const archivo = inputJson.files[0];
  if (!archivo) return;

  try {
    const datos = JSON.parse(await archivo.text());
    if (!Array.isArray(datos.acordes)) {
      throw new Error("no tiene la lista 'acordes'");
    }
    acordes = datos.acordes;
    // Título: nombre, tonalidad y tempo (los dos últimos solo si vienen en el JSON).
    const partes = [datos.cancion || archivo.name];
    if (datos.tonalidad) partes.push(datos.tonalidad);
    if (datos.tempo) partes.push(`${Math.round(datos.tempo)} BPM`);
    titulo.textContent = partes.join(" · ");
    nombreJson.textContent = archivo.name;
  } catch (error) {
    alert("No pude leer ese JSON: " + error.message);
    return;
  }

  dibujarLista();
  indiceActual = -1;
  actualizar();
});

/* ==================================================================
   4. Lista de acordes
   ================================================================== */

// Crea una "ficha" por acorde con su nombre y el minuto en que empieza.
// data-indice guarda su posición para saber cuál se tocó.
function dibujarLista() {
  lista.innerHTML = "";
  acordes.forEach((tramo, i) => {
    const item = document.createElement("li");
    item.dataset.indice = i;
    item.innerHTML = `<b>${nombreVisible(tramo.acorde)}</b><small>${formatoTiempo(tramo.inicio)}</small>`;
    lista.appendChild(item);
  });
}

// Un solo "escuchador" para toda la lista: averiguamos qué ficha se tocó
// y saltamos a ese momento (sumando el ajuste para que coincida).
lista.addEventListener("click", (evento) => {
  const item = evento.target.closest("li");
  if (!item || !audio.src) return;
  const tramo = acordes[Number(item.dataset.indice)];
  audio.currentTime = Math.max(0, tramo.inicio + ajuste);
  actualizar();
});

/* ==================================================================
   3. Sincronización: qué acorde corresponde al momento actual
   ================================================================== */

// Busca el último acorde que ya empezó en el tiempo "t".
// Como la lista está ordenada, usamos búsqueda binaria (rápida aunque
// haya cientos de acordes). Devuelve -1 si todavía no empezó ninguno.
function buscarIndice(t) {
  let bajo = 0;
  let alto = acordes.length - 1;
  let resultado = -1;
  while (bajo <= alto) {
    const medio = (bajo + alto) >> 1;
    if (acordes[medio].inicio <= t) {
      resultado = medio;
      bajo = medio + 1;
    } else {
      alto = medio - 1;
    }
  }
  return resultado;
}

// Actualiza toda la pantalla según el tiempo actual de la canción.
// Se llama muchas veces por segundo mientras suena.
function actualizar() {
  // Tiempo y barra
  tiempoActual.textContent = formatoTiempo(audio.currentTime);
  if (!arrastrando) barraTiempo.value = audio.currentTime;

  if (acordes.length === 0) return;

  // Restamos el ajuste: con ajuste +0.5, a los 10.5 s mostramos el acorde de los 10 s.
  const t = audio.currentTime - ajuste;
  const indice = buscarIndice(t);

  // Cuenta regresiva hasta el próximo cambio (se actualiza siempre)
  const siguiente = acordes[indice + 1];
  cuentaRegresiva.textContent = siguiente
    ? `en ${Math.max(0, siguiente.inicio - t).toFixed(1)} s`
    : "";

  // El resto solo cambia cuando cambia el acorde, para no trabajar de más.
  if (indice === indiceActual) return;
  indiceActual = indice;

  acordeActual.textContent = indice >= 0 ? nombreVisible(acordes[indice].acorde) : "–";
  acordeSiguiente.textContent = siguiente ? nombreVisible(siguiente.acorde) : "fin";
  mostrarDiagramas();

  // Marcamos las fichas: las anteriores como "pasado" y la actual resaltada.
  lista.querySelectorAll("li").forEach((item, i) => {
    item.classList.toggle("pasado", i < indice);
    item.classList.toggle("actual", i === indice);
  });

  // Desplazamos la lista para que el acorde actual quede a la vista.
  const itemActual = lista.children[indice];
  if (itemActual) itemActual.scrollIntoView({ block: "center", behavior: "smooth" });
}

// Mientras suena, pedimos al navegador que llame a "actualizar" en cada
// cuadro de la pantalla (~60 veces por segundo). Es mucho más preciso que
// el evento "timeupdate" del audio, que solo avisa unas 4 veces por segundo.
function bucle() {
  actualizar();
  if (!audio.paused) requestAnimationFrame(bucle);
}

/* ==================================================================
   Diagramas de posición (usa acordes.js y diagrama.js)
   ================================================================== */

// Devuelve la posición a dibujar para un acorde (la que el usuario eligió
// la última vez, o la primera) junto con cuántas hay. null si no hay diagrama.
function posicionParaDibujar(nombre) {
  const posiciones = posicionesDeAcorde(nombre); // [] para "N" o desconocidos
  if (posiciones.length === 0) return null;
  const elegida = posicionElegida[nombreNormalizado(nombre)] || 0;
  return {
    posicion: posiciones[elegida % posiciones.length],
    numero: (elegida % posiciones.length) + 1,
    total: posiciones.length,
  };
}

// Dibuja el diagrama grande (acorde actual) y el chico (siguiente acorde).
function mostrarDiagramas() {
  const actual = acordes[indiceActual];
  const siguiente = acordes[indiceActual + 1];

  // Diagrama grande + texto "1/3 · tocá para cambiar" debajo.
  const grande = actual ? posicionParaDibujar(actual.acorde) : null;
  diagramaActual.replaceChildren();
  diagramaActual.hidden = !grande;
  if (grande) {
    diagramaActual.appendChild(dibujarDiagrama(grande.posicion));
    if (grande.total > 1) {
      diagramaActual.append(`${grande.numero}/${grande.total} · tocá para cambiar`);
    }
  }

  // Diagrama chico del próximo acorde (vacío si es "N", desconocido o el final).
  const chico = siguiente ? posicionParaDibujar(siguiente.acorde) : null;
  diagramaSiguiente.replaceChildren();
  if (chico) diagramaSiguiente.appendChild(dibujarDiagrama(chico.posicion));
}

// Al tocar el diagrama grande pasamos a la siguiente posición de ese acorde
// (y después de la última, vuelve a la primera). La elección se recuerda.
diagramaActual.addEventListener("click", () => {
  const actual = acordes[indiceActual];
  if (!actual) return;
  const clave = nombreNormalizado(actual.acorde);
  const total = posicionesDeAcorde(actual.acorde).length;
  if (!clave || total < 2) return;

  posicionElegida[clave] = ((posicionElegida[clave] || 0) + 1) % total;
  try {
    localStorage.setItem("posicionElegida", JSON.stringify(posicionElegida));
  } catch {
    // Si no se puede guardar, igual queda recordada mientras la app esté abierta.
  }
  mostrarDiagramas();
});

/* ==================================================================
   2. Reproductor
   ================================================================== */

botonPlay.addEventListener("click", () => {
  if (audio.paused) audio.play();
  else audio.pause();
});

audio.addEventListener("play", () => {
  botonPlay.textContent = "❚❚";
  botonPlay.setAttribute("aria-label", "Pausar");
  pedirPantallaEncendida();
  requestAnimationFrame(bucle);
});

audio.addEventListener("pause", () => {
  botonPlay.textContent = "▶";
  botonPlay.setAttribute("aria-label", "Reproducir");
  soltarPantalla();
  actualizar();
});

// Cuando el navegador ya sabe cuánto dura la canción, configuramos la barra.
audio.addEventListener("loadedmetadata", () => {
  barraTiempo.max = audio.duration;
  tiempoTotal.textContent = formatoTiempo(audio.duration);
  actualizar();
});

// Después de saltar a otro momento (por la barra o la lista), refrescamos.
audio.addEventListener("seeked", actualizar);

// "input" se dispara mientras se arrastra: solo mostramos el tiempo.
barraTiempo.addEventListener("input", () => {
  arrastrando = true;
  tiempoActual.textContent = formatoTiempo(Number(barraTiempo.value));
});

// "change" se dispara al soltar: recién ahí movemos la canción.
barraTiempo.addEventListener("change", () => {
  audio.currentTime = Number(barraTiempo.value);
  arrastrando = false;
  actualizar();
});

/* ==================================================================
   5. Ajuste de sincronización
   ================================================================== */

// Suma o resta 0.1 s. Redondeamos para evitar errores de decimales
// (en JavaScript 0.1 + 0.2 da 0.30000000000000004).
function cambiarAjuste(delta) {
  ajuste = Math.round((ajuste + delta) * 10) / 10;
  valorAjuste.textContent = (ajuste > 0 ? "+" : "") + ajuste.toFixed(1) + " s";
  indiceActual = -1; // forzamos a redibujar aunque no cambie el acorde
  actualizar();
}

// "−": los acordes aparecen antes (si los ves tarde respecto a lo que suena).
// "+": los acordes aparecen después (si los ves antes de que suenen).
botonAntes.addEventListener("click", () => cambiarAjuste(-0.1));
botonDespues.addEventListener("click", () => cambiarAjuste(+0.1));

/* ==================================================================
   Pantalla encendida mientras suena
   ================================================================== */

// Pide al celular que no apague la pantalla. Solo funciona en navegadores
// que lo soportan y en páginas seguras (https o localhost); si no, se ignora.
async function pedirPantallaEncendida() {
  try {
    if ("wakeLock" in navigator) {
      bloqueoPantalla = await navigator.wakeLock.request("screen");
    }
  } catch {
    // No es grave: la app funciona igual, solo que la pantalla puede apagarse.
  }
}

function soltarPantalla() {
  if (bloqueoPantalla) bloqueoPantalla.release();
  bloqueoPantalla = null;
}

// Si salís de la app y volvés, el bloqueo se pierde: lo pedimos de nuevo.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !audio.paused) {
    pedirPantallaEncendida();
  }
});
