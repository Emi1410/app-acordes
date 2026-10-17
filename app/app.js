"use strict";

/* ==================================================================
   Referencias a los elementos de la página
   ================================================================== */

// Pantallas
const pantallas = {
  biblioteca: document.getElementById("pantalla-biblioteca"),
  agregar: document.getElementById("pantalla-agregar"),
  reproductor: document.getElementById("pantalla-reproductor"),
};

// Biblioteca
const botonAgregar = document.getElementById("boton-agregar");
const listaCanciones = document.getElementById("lista-canciones");
const bibliotecaVacia = document.getElementById("biblioteca-vacia");
const espacio = document.getElementById("espacio");

// Agregar canción
const botonCancelar = document.getElementById("boton-cancelar");
const inputMp3 = document.getElementById("input-mp3");
const inputJson = document.getElementById("input-json");
const nombreMp3 = document.getElementById("nombre-mp3");
const nombreJson = document.getElementById("nombre-json");
const inputNombre = document.getElementById("input-nombre");
const avisoAgregar = document.getElementById("aviso-agregar");
const botonGuardar = document.getElementById("boton-guardar");

// Reproductor
const botonVolver = document.getElementById("boton-volver");
const audio = document.getElementById("audio");
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

// id (en la biblioteca) de la canción abierta en el reproductor, o null.
let idActual = null;

// Lista de acordes de la canción abierta: [{ inicio, fin, acorde }, ...]
let acordes = [];

// Ajuste de sincronización en segundos (se guarda por canción).
// Positivo = los acordes aparecen más tarde; negativo = más temprano.
let ajuste = 0;

// Posición en "acordes" del acorde que se está mostrando (-1 = ninguno).
let indiceActual = -1;

// true mientras el usuario arrastra la barra de tiempo con el dedo,
// para no pisarle la posición mientras la mueve.
let arrastrando = false;

// Bloqueo de pantalla: evita que el celular se apague mientras tocás.
let bloqueoPantalla = null;

// Lo elegido en "Agregar canción" hasta que se guarda.
let mp3Elegido = null;      // el archivo mp3
let datosElegidos = null;   // el JSON ya leído y validado
let nombrePropuesto = "";   // el nombre que vino en el JSON

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

// Convierte bytes en texto legible: 4258562 → "4,1 MB".
function formatoTamano(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return (mb / 1024).toLocaleString("es", { maximumFractionDigits: 1 }) + " GB";
  return mb.toLocaleString("es", { maximumFractionDigits: 1 }) + " MB";
}

// "C#m · 118 BPM": tonalidad y tempo, solo los que existan.
function detalleCancion(cancion) {
  const partes = [];
  if (cancion.tonalidad) partes.push(cancion.tonalidad);
  if (cancion.tempo) partes.push(`${Math.round(cancion.tempo)} BPM`);
  return partes.join(" · ");
}

// El analizador usa "N" para "sin acorde"; en pantalla mostramos una raya.
function nombreVisible(acorde) {
  return acorde === "N" ? "–" : acorde;
}

/* ==================================================================
   Navegación entre pantallas

   Cada vez que se abre una pantalla que no es la biblioteca, se agrega
   una entrada al historial del navegador. Así el botón "atrás" de Android
   vuelve a la biblioteca en lugar de cerrar la app.
   ================================================================== */

let pantallaEnHistorial = false;

function mostrarPantalla(nombre) {
  for (const [clave, pantalla] of Object.entries(pantallas)) {
    pantalla.hidden = clave !== nombre;
  }
}

function abrirPantalla(nombre) {
  mostrarPantalla(nombre);
  try {
    history.pushState({ pantalla: nombre }, "");
    pantallaEnHistorial = true;
  } catch {
    pantallaEnHistorial = false; // si el navegador no deja, se vuelve con el botón
  }
}

// Botones "←": si hay una entrada en el historial, retrocedemos (eso
// dispara "popstate", que hace el resto). Si no, volvemos directo.
function volverABiblioteca() {
  if (pantallaEnHistorial) history.back();
  else alVolverABiblioteca();
}

function alVolverABiblioteca() {
  pantallaEnHistorial = false;
  cerrarReproductor();
  mostrarPantalla("biblioteca");
  mostrarBiblioteca();
}

window.addEventListener("popstate", alVolverABiblioteca);
botonVolver.addEventListener("click", volverABiblioteca);
botonCancelar.addEventListener("click", volverABiblioteca);

/* ==================================================================
   Pantalla 1: biblioteca
   ================================================================== */

// Dibuja la lista de canciones guardadas y el espacio que ocupan.
async function mostrarBiblioteca() {
  let canciones;
  try {
    canciones = await listarCanciones();
  } catch (error) {
    bibliotecaVacia.hidden = false;
    bibliotecaVacia.textContent = "No pude abrir la biblioteca: " + error.message;
    return;
  }

  listaCanciones.replaceChildren();
  bibliotecaVacia.hidden = canciones.length > 0;

  for (const cancion of canciones) {
    // Cada canción: un botón grande para abrirla y uno chico para borrarla.
    // Usamos textContent (no innerHTML) porque el nombre lo escribe el usuario.
    const item = document.createElement("li");
    item.className = "cancion";

    const abrir = document.createElement("button");
    abrir.type = "button";
    abrir.className = "cancion-abrir";
    const nombre = document.createElement("b");
    nombre.textContent = cancion.nombre;
    const detalle = document.createElement("small");
    detalle.textContent = detalleCancion(cancion);
    abrir.append(nombre, detalle);
    abrir.addEventListener("click", () => abrirCancion(cancion.id));

    const borrar = document.createElement("button");
    borrar.type = "button";
    borrar.className = "cancion-borrar";
    borrar.textContent = "✕";
    borrar.setAttribute("aria-label", `Borrar ${cancion.nombre}`);
    borrar.addEventListener("click", () => confirmarBorrado(cancion));

    item.append(abrir, borrar);
    listaCanciones.appendChild(item);
  }

  mostrarEspacio(canciones);
}

// Pie de la biblioteca: cuánto ocupan las canciones, cuánto espacio queda
// y si el navegador aceptó guardarlas de forma permanente.
async function mostrarEspacio(canciones) {
  if (canciones.length === 0) {
    espacio.textContent = "";
    return;
  }
  // Sumamos el tamaño de cada mp3 más el de sus acordes.
  const ocupado = canciones.reduce(
    (total, c) => total + (c.tamanoMp3 || 0) + JSON.stringify(c.acordes).length, 0);
  const cantidad = canciones.length === 1 ? "1 canción" : `${canciones.length} canciones`;

  const partes = [`${cantidad} · ${formatoTamano(ocupado)}`];
  const libre = await espacioDisponible();
  if (libre !== null) partes.push(`${formatoTamano(libre)} libres`);
  const persistente = await esPersistente();
  if (persistente === true) partes.push("guardado permanente");
  if (persistente === false) partes.push("el navegador podría borrarlas si falta memoria");
  espacio.textContent = partes.join(" · ");
}

// Pide confirmación antes de borrar.
async function confirmarBorrado(cancion) {
  if (!confirm(`¿Borrar "${cancion.nombre}" de la biblioteca?\nSe borra también su mp3 guardado en el celular.`)) {
    return;
  }
  try {
    await borrarCancion(cancion.id);
  } catch (error) {
    alert("No pude borrar la canción: " + error.message);
  }
  mostrarBiblioteca();
}

/* ==================================================================
   Pantalla 2: agregar canción
   ================================================================== */

botonAgregar.addEventListener("click", () => {
  limpiarFormulario();
  abrirPantalla("agregar");
});

function limpiarFormulario() {
  mp3Elegido = null;
  datosElegidos = null;
  nombrePropuesto = "";
  inputMp3.value = "";
  inputJson.value = "";
  nombreMp3.textContent = "Ningún archivo";
  nombreJson.textContent = "Ningún archivo";
  inputNombre.value = "";
  mostrarAviso("");
  revisarFormulario();
}

function mostrarAviso(texto) {
  avisoAgregar.textContent = texto;
  avisoAgregar.hidden = !texto;
}

// El botón "Guardar" se habilita solo cuando está todo: mp3, JSON y nombre.
function revisarFormulario() {
  botonGuardar.disabled = !(mp3Elegido && datosElegidos && inputNombre.value.trim());
}

inputMp3.addEventListener("change", () => {
  const archivo = inputMp3.files[0];
  if (!archivo) return;
  // Algunos celulares no informan el tipo; en ese caso miramos la extensión.
  const esAudio = archivo.type.startsWith("audio/") || /\.mp3$/i.test(archivo.name);
  if (!esAudio) {
    mp3Elegido = null;
    nombreMp3.textContent = "Ningún archivo";
    mostrarAviso(`"${archivo.name}" no parece un archivo de audio. Elegí el mp3 de la canción.`);
  } else {
    mp3Elegido = archivo;
    nombreMp3.textContent = archivo.name;
    mostrarAviso("");
  }
  revisarFormulario();
});

// Al elegir el JSON lo leemos y revisamos que tenga el formato del analizador.
// Si está bien, proponemos como nombre el que trae ("cancion").
inputJson.addEventListener("change", async () => {
  const archivo = inputJson.files[0];
  if (!archivo) return;
  datosElegidos = null;
  nombreJson.textContent = archivo.name;

  let datos;
  try {
    datos = JSON.parse(await archivo.text());
  } catch {
    mostrarAviso(`"${archivo.name}" no es un JSON válido. Elegí el archivo que generó el analizador (está en la carpeta resultados).`);
    revisarFormulario();
    return;
  }

  const problema = validarDatosCancion(datos);
  if (problema) {
    mostrarAviso(problema);
    revisarFormulario();
    return;
  }

  datosElegidos = datos;
  mostrarAviso("");
  // Solo reemplazamos el nombre si el usuario no escribió uno propio.
  const propuesta = typeof datos.cancion === "string" ? datos.cancion : "";
  if (!inputNombre.value.trim() || inputNombre.value === nombrePropuesto) {
    inputNombre.value = propuesta;
  }
  nombrePropuesto = propuesta;
  revisarFormulario();
});

inputNombre.addEventListener("input", revisarFormulario);

botonGuardar.addEventListener("click", async () => {
  botonGuardar.disabled = true;
  botonGuardar.textContent = "Guardando...";
  try {
    await guardarCancion({
      nombre: inputNombre.value.trim(),
      tonalidad: typeof datosElegidos.tonalidad === "string" ? datosElegidos.tonalidad : "",
      tempo: datosElegidos.tempo || 0,
      acordes: datosElegidos.acordes,
      ajuste: 0,
      tamanoMp3: mp3Elegido.size,
      agregada: Date.now(),
    }, mp3Elegido);
  } catch (error) {
    const sinEspacio = error && error.name === "QuotaExceededError";
    mostrarAviso(sinEspacio
      ? "No hay espacio suficiente en el celular para guardar esta canción."
      : "No pude guardar la canción: " + (error ? error.message : "error desconocido"));
    botonGuardar.textContent = "Guardar canción";
    revisarFormulario();
    return;
  }

  // Ya hay al menos una canción: pedimos que el navegador no la borre.
  await pedirPersistencia();
  botonGuardar.textContent = "Guardar canción";
  volverABiblioteca();
});

/* ==================================================================
   Pantalla 3: reproductor
   ================================================================== */

// Abre una canción de la biblioteca en el reproductor.
async function abrirCancion(id) {
  let cancion, mp3;
  try {
    [cancion, mp3] = await Promise.all([obtenerCancion(id), obtenerAudio(id)]);
  } catch (error) {
    alert("No pude abrir la canción: " + error.message);
    return;
  }
  if (!cancion || !mp3) {
    alert("No encontré esa canción en la biblioteca.");
    mostrarBiblioteca();
    return;
  }

  idActual = id;
  acordes = cancion.acordes;
  ajuste = cancion.ajuste || 0;
  indiceActual = -1;

  // Creamos una URL temporal que apunta al mp3 guardado y se la damos al reproductor.
  audio.src = URL.createObjectURL(mp3);

  const detalle = detalleCancion(cancion);
  titulo.textContent = detalle ? `${cancion.nombre} · ${detalle}` : cancion.nombre;
  tiempoTotal.textContent = "0:00";
  barraTiempo.value = 0;
  acordeActual.textContent = "–";
  acordeSiguiente.textContent = "–";
  cuentaRegresiva.textContent = "";
  mostrarAjuste();
  dibujarLista();
  mostrarDiagramas();
  actualizar();
  abrirPantalla("reproductor");
}

// Al salir del reproductor: paramos el audio y liberamos la URL temporal.
function cerrarReproductor() {
  if (idActual === null) return;
  audio.pause();
  URL.revokeObjectURL(audio.src);
  audio.removeAttribute("src");
  audio.load();
  idActual = null;
  acordes = [];
}

/* ==================================================================
   Lista de acordes
   ================================================================== */

// Crea una "ficha" por acorde con su nombre y el minuto en que empieza.
// data-indice guarda su posición para saber cuál se tocó.
function dibujarLista() {
  lista.innerHTML = "";
  acordes.forEach((tramo, i) => {
    const item = document.createElement("li");
    item.dataset.indice = i;
    const nombre = document.createElement("b");
    nombre.textContent = nombreVisible(tramo.acorde);
    const tiempo = document.createElement("small");
    tiempo.textContent = formatoTiempo(tramo.inicio);
    item.append(nombre, tiempo);
    lista.appendChild(item);
  });
}

// Un solo "escuchador" para toda la lista: averiguamos qué ficha se tocó
// y saltamos a ese momento (sumando el ajuste para que coincida).
lista.addEventListener("click", (evento) => {
  const item = evento.target.closest("li");
  if (!item || idActual === null) return;
  const tramo = acordes[Number(item.dataset.indice)];
  audio.currentTime = Math.max(0, tramo.inicio + ajuste);
  actualizar();
});

/* ==================================================================
   Sincronización: qué acorde corresponde al momento actual
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
   Controles del reproductor
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
   Ajuste de sincronización (se guarda por canción)
   ================================================================== */

function mostrarAjuste() {
  valorAjuste.textContent = (ajuste > 0 ? "+" : "") + ajuste.toFixed(1) + " s";
}

// Suma o resta 0.1 s. Redondeamos para evitar errores de decimales
// (en JavaScript 0.1 + 0.2 da 0.30000000000000004).
function cambiarAjuste(delta) {
  ajuste = Math.round((ajuste + delta) * 10) / 10;
  mostrarAjuste();
  indiceActual = -1; // forzamos a redibujar aunque no cambie el acorde
  actualizar();
  // Lo guardamos en la biblioteca para que quede listo la próxima vez.
  if (idActual !== null) guardarAjuste(idActual, ajuste).catch(() => {});
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

/* ==================================================================
   Inicio
   ================================================================== */

mostrarBiblioteca();
