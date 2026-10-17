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
const buscador = document.getElementById("buscador");
const botonAgregar = document.getElementById("boton-agregar");
const resultadosBusqueda = document.getElementById("resultados-busqueda");
const sinResultados = document.getElementById("sin-resultados");
const secciones = document.getElementById("secciones");
const bibliotecaVacia = document.getElementById("biblioteca-vacia");
const espacio = document.getElementById("espacio");
const sugerenciasListas = document.getElementById("sugerencias-listas");
const mensaje = document.getElementById("mensaje");

// Ventana "Agregar a lista"
const botonAgregarLista = document.getElementById("boton-agregar-lista");
const dialogoLista = document.getElementById("dialogo-lista");
const formLista = document.getElementById("form-lista");
const listasDeCancion = document.getElementById("listas-de-cancion");
const inputListaDialogo = document.getElementById("input-lista-dialogo");
const botonCerrarDialogo = document.getElementById("boton-cerrar-dialogo");

// Agregar canción
const botonCancelar = document.getElementById("boton-cancelar");
const inputMp3 = document.getElementById("input-mp3");
const inputJson = document.getElementById("input-json");
const nombreMp3 = document.getElementById("nombre-mp3");
const nombreJson = document.getElementById("nombre-json");
const inputNombre = document.getElementById("input-nombre");
const inputLista = document.getElementById("input-lista");
const avisoAgregar = document.getElementById("aviso-agregar");
const botonGuardar = document.getElementById("boton-guardar");

// Capa de progreso del análisis
const capaProgreso = document.getElementById("capa-progreso");
const textoProgreso = document.getElementById("texto-progreso");
const barraProgreso = document.getElementById("barra-progreso");
const botonCancelarAnalisis = document.getElementById("boton-cancelar-analisis");

// Reproductor
const botonVolver = document.getElementById("boton-volver");
const botonReanalizar = document.getElementById("boton-reanalizar");
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
let datosElegidos = null;   // el JSON (opcional) ya leído y validado
let nombrePropuesto = "";   // el último nombre que propuso la app (del mp3 o del JSON)

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

// Número de la última vez que se pidió dibujar la biblioteca. Como leer la
// base y calcular el espacio tarda, dos pedidos seguidos pueden terminar en
// otro orden; con este número solo dibuja el más reciente.
let dibujoBiblioteca = 0;

// Última copia leída de la base, para que el buscador filtre sin volver a leerla.
let todasLasCanciones = [];
let todasLasListas = [];

// Qué secciones desplegables están abiertas ("todas" o "lista-<id>").
// Se recuerdan para que no se cierren cada vez que se redibuja la pantalla.
let seccionesAbiertas = new Set(["todas"]);
try {
  const guardadas = JSON.parse(localStorage.getItem("seccionesAbiertas"));
  if (Array.isArray(guardadas)) seccionesAbiertas = new Set(guardadas);
} catch {
  // sin localStorage: se usa la opción por defecto
}

function recordarSecciones() {
  try {
    localStorage.setItem("seccionesAbiertas", JSON.stringify([...seccionesAbiertas]));
  } catch {
    // no es grave
  }
}

// Lee canciones y listas de la base y redibuja la pantalla de inicio.
async function mostrarBiblioteca() {
  const numero = ++dibujoBiblioteca;
  let canciones, listas;
  try {
    [canciones, listas] = await Promise.all([listarCanciones(), listarListas()]);
  } catch (error) {
    bibliotecaVacia.hidden = false;
    bibliotecaVacia.textContent = "No pude abrir la biblioteca: " + error.message;
    return;
  }
  if (numero !== dibujoBiblioteca) return;   // ya hay un pedido más nuevo

  todasLasCanciones = canciones;
  todasLasListas = listas;
  actualizarSugerencias();
  dibujarInicio();
  mostrarEspacio(canciones, numero);
}

// Elige qué mostrar: los resultados de búsqueda (si hay algo escrito) o las secciones.
function dibujarInicio() {
  const buscando = buscador.value.trim() !== "";
  secciones.hidden = buscando;
  resultadosBusqueda.hidden = !buscando;
  sinResultados.hidden = true;
  bibliotecaVacia.hidden = buscando || todasLasCanciones.length > 0;
  if (buscando) dibujarResultados();
  else dibujarSecciones();
}

// Las sugerencias que aparecen al escribir el nombre de una lista.
function actualizarSugerencias() {
  sugerenciasListas.replaceChildren(...todasLasListas.map((l) => {
    const opcion = document.createElement("option");
    opcion.value = l.nombre;
    return opcion;
  }));
}

/**
 * Crea el <li> de una canción: un botón grande para abrirla (nombre y
 * detalle) y, si se pide, un botón chico a la derecha (borrar o sacar).
 * Usamos textContent (no innerHTML) porque los nombres los escribe el usuario.
 */
function crearItemCancion(cancion, { detalleExtra = "", accion = null } = {}) {
  const item = document.createElement("li");
  item.className = "cancion";

  const abrir = document.createElement("button");
  abrir.type = "button";
  abrir.className = "cancion-abrir";
  const nombre = document.createElement("b");
  nombre.textContent = cancion.nombre;
  abrir.appendChild(nombre);
  for (const texto of [detalleCancion(cancion), detalleExtra]) {
    if (!texto) continue;
    const linea = document.createElement("small");
    linea.textContent = texto;
    abrir.appendChild(linea);
  }
  abrir.addEventListener("click", () => abrirCancion(cancion.id));
  item.appendChild(abrir);

  if (accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "cancion-borrar";
    boton.textContent = accion.texto;
    boton.setAttribute("aria-label", accion.etiqueta);
    boton.addEventListener("click", accion.alTocar);
    item.appendChild(boton);
  }
  return item;
}

/**
 * Crea una sección desplegable (<details>) con un título y un contador.
 * "clave" identifica la sección para recordar si estaba abierta.
 */
function crearSeccion(clave, tituloSeccion, cantidad) {
  const seccion = document.createElement("details");
  seccion.className = "seccion";
  seccion.open = seccionesAbiertas.has(clave);
  seccion.addEventListener("toggle", () => {
    if (seccion.open) seccionesAbiertas.add(clave);
    else seccionesAbiertas.delete(clave);
    recordarSecciones();
  });

  const resumen = document.createElement("summary");
  const nombre = document.createElement("span");
  nombre.textContent = tituloSeccion;
  const contador = document.createElement("small");
  contador.textContent = String(cantidad);
  resumen.append(nombre, contador);
  seccion.appendChild(resumen);
  return seccion;
}

// Botón chico de texto (para "Renombrar" y "Borrar lista").
function crearBotonChico(texto, alTocar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton boton-chico";
  boton.textContent = texto;
  boton.addEventListener("click", alTocar);
  return boton;
}

// Pantalla de inicio sin búsqueda: una sección por lista y al final "Todas las canciones".
function dibujarSecciones() {
  const porId = new Map(todasLasCanciones.map((c) => [c.id, c]));
  secciones.replaceChildren();

  for (const listaCanc of todasLasListas) {
    // Solo las canciones que existen, en el orden guardado en la lista.
    const cancionesLista = listaCanc.canciones.map((id) => porId.get(id)).filter(Boolean);
    const seccion = crearSeccion(`lista-${listaCanc.id}`, listaCanc.nombre, cancionesLista.length);

    const acciones = document.createElement("div");
    acciones.className = "seccion-acciones";
    acciones.append(
      crearBotonChico("Renombrar", () => pedirNuevoNombre(listaCanc)),
      crearBotonChico("Borrar lista", () => confirmarBorradoLista(listaCanc)),
    );
    seccion.appendChild(acciones);

    const ul = document.createElement("ul");
    ul.className = "lista-canciones";
    for (const cancion of cancionesLista) {
      ul.appendChild(crearItemCancion(cancion, {
        accion: {
          texto: "−",
          etiqueta: `Sacar ${cancion.nombre} de ${listaCanc.nombre}`,
          alTocar: () => confirmarSacarDeLista(listaCanc, cancion),
        },
      }));
    }
    if (cancionesLista.length === 0) {
      const vacia = document.createElement("p");
      vacia.className = "aviso aviso-chico";
      vacia.textContent = "Esta lista está vacía.";
      seccion.appendChild(vacia);
    }
    seccion.appendChild(ul);
    secciones.appendChild(seccion);
  }

  // "Todas las canciones": cada una con el botón para borrarla de la biblioteca.
  if (todasLasCanciones.length > 0) {
    const seccion = crearSeccion("todas", "Todas las canciones", todasLasCanciones.length);
    const ul = document.createElement("ul");
    ul.className = "lista-canciones";
    for (const cancion of todasLasCanciones) {
      ul.appendChild(crearItemCancion(cancion, {
        accion: {
          texto: "✕",
          etiqueta: `Borrar ${cancion.nombre}`,
          alTocar: () => confirmarBorrado(cancion),
        },
      }));
    }
    seccion.appendChild(ul);
    secciones.appendChild(seccion);
  }
}

/* ------------------------------------------------------------------
   Buscador
   ------------------------------------------------------------------ */

/**
 * ¿La canción coincide con lo buscado? Se separa la búsqueda en palabras y
 * TODAS tienen que aparecer en el nombre (en cualquier lugar, sin importar
 * mayúsculas ni tildes). Así "como un diam" encuentra "Airbag - Como un
 * diamante", y "airbag" encuentra todas las que tienen "Airbag" en el nombre.
 */
function coincideBusqueda(cancion, palabras) {
  const nombre = normalizarTexto(cancion.nombre);
  return palabras.every((palabra) => nombre.includes(palabra));
}

// Nombres de las listas en las que está cada canción: Map(id -> ["Airbag", ...]).
function listasPorCancion() {
  const mapa = new Map();
  for (const l of todasLasListas) {
    for (const id of l.canciones) {
      if (!mapa.has(id)) mapa.set(id, []);
      mapa.get(id).push(l.nombre);
    }
  }
  return mapa;
}

function dibujarResultados() {
  const palabras = normalizarTexto(buscador.value).split(" ").filter(Boolean);
  const encontradas = todasLasCanciones.filter((c) => coincideBusqueda(c, palabras));
  const enListas = listasPorCancion();

  resultadosBusqueda.replaceChildren(...encontradas.map((cancion) => {
    const nombres = enListas.get(cancion.id);
    return crearItemCancion(cancion, {
      detalleExtra: nombres ? `En: ${nombres.join(", ")}` : "Sin lista",
    });
  }));

  sinResultados.hidden = encontradas.length > 0;
  sinResultados.textContent = `No encontré canciones con “${buscador.value.trim()}”.`;
}

// Mientras se escribe, filtramos con los datos que ya están en memoria.
buscador.addEventListener("input", dibujarInicio);

/* ------------------------------------------------------------------
   Acciones sobre las listas (todas piden confirmación)
   ------------------------------------------------------------------ */

async function pedirNuevoNombre(listaCanc) {
  const nuevo = prompt("Nuevo nombre de la lista:", listaCanc.nombre);
  if (nuevo === null || nuevo.trim() === listaCanc.nombre) return;   // canceló o no cambió
  try {
    await renombrarLista(listaCanc.id, nuevo);
  } catch (error) {
    alert(error.message);
    return;
  }
  mostrarBiblioteca();
}

async function confirmarBorradoLista(listaCanc) {
  if (!confirm(`¿Borrar la lista "${listaCanc.nombre}"?\nLas canciones siguen guardadas en la biblioteca.`)) return;
  try {
    await borrarLista(listaCanc.id);
  } catch (error) {
    alert("No pude borrar la lista: " + error.message);
  }
  seccionesAbiertas.delete(`lista-${listaCanc.id}`);
  recordarSecciones();
  mostrarBiblioteca();
}

async function confirmarSacarDeLista(listaCanc, cancion) {
  if (!confirm(`¿Sacar "${cancion.nombre}" de la lista "${listaCanc.nombre}"?\nLa canción sigue guardada en la biblioteca.`)) return;
  try {
    await sacarDeLista(listaCanc.id, cancion.id);
  } catch (error) {
    alert("No pude sacarla de la lista: " + error.message);
  }
  mostrarBiblioteca();
}

// Aviso corto abajo de la pantalla, que desaparece solo.
let temporizadorMensaje = null;
function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.hidden = false;
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => { mensaje.hidden = true; }, 2500);
}

// Pie de la biblioteca: cuánto ocupan las canciones, cuánto espacio queda
// y si el navegador aceptó guardarlas de forma permanente.
async function mostrarEspacio(canciones, numero) {
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
  if (numero !== dibujoBiblioteca) return;   // llegó tarde: hay datos más nuevos
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
  nombreJson.textContent = "Lo analiza el celu";
  inputNombre.value = "";
  inputLista.value = "";
  mostrarAviso("");
  revisarFormulario();
}

function mostrarAviso(texto) {
  avisoAgregar.textContent = texto;
  avisoAgregar.hidden = !texto;
}

// El botón se habilita cuando hay mp3 y nombre. Su texto avisa si va a
// analizar en el celular o si usa el JSON de la compu.
function revisarFormulario() {
  botonGuardar.disabled = !(mp3Elegido && inputNombre.value.trim());
  botonGuardar.textContent = datosElegidos ? "Guardar canción" : "Analizar y guardar";
}

// Propone un nombre, salvo que el usuario ya haya escrito uno propio.
function proponerNombre(nombre) {
  if (!nombre) return;
  if (!inputNombre.value.trim() || inputNombre.value === nombrePropuesto) {
    inputNombre.value = nombre;
  }
  nombrePropuesto = nombre;
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
    // Si no hay JSON, proponemos el nombre del archivo sin ".mp3".
    if (!datosElegidos) proponerNombre(archivo.name.replace(/\.[^.]+$/, ""));
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
    nombreJson.textContent = "Lo analiza el celu";
    mostrarAviso(`"${archivo.name}" no es un JSON válido. Elegí el archivo que generó el analizador (está en la carpeta resultados), o guardá sin JSON para que lo analice el celu.`);
    revisarFormulario();
    return;
  }

  const problema = validarDatosCancion(datos);
  if (problema) {
    nombreJson.textContent = "Lo analiza el celu";
    mostrarAviso(problema);
    revisarFormulario();
    return;
  }

  datosElegidos = datos;
  mostrarAviso("");
  if (typeof datos.cancion === "string") proponerNombre(datos.cancion);
  revisarFormulario();
});

inputNombre.addEventListener("input", revisarFormulario);

botonGuardar.addEventListener("click", async () => {
  botonGuardar.disabled = true;

  // Sin JSON de la compu: analizamos el mp3 acá mismo.
  let datos = datosElegidos;
  if (!datos) {
    try {
      datos = await analizarConProgreso(mp3Elegido, inputNombre.value.trim());
    } catch (error) {
      mostrarAviso("No pude analizar el mp3: " + error.message);
      revisarFormulario();
      return;
    }
    if (!datos) {            // el usuario canceló
      revisarFormulario();
      return;
    }
  }

  botonGuardar.textContent = "Guardando...";
  try {
    await guardarCancion({
      nombre: inputNombre.value.trim(),
      tonalidad: typeof datos.tonalidad === "string" ? datos.tonalidad : "",
      tempo: datos.tempo || 0,
      acordes: datos.acordes,
      ajuste: 0,
      tamanoMp3: mp3Elegido.size,
      agregada: Date.now(),
    }, mp3Elegido, inputLista.value);   // si hay lista, se agrega en la misma operación
  } catch (error) {
    const sinEspacio = error && error.name === "QuotaExceededError";
    mostrarAviso(sinEspacio
      ? "No hay espacio suficiente en el celular para guardar esta canción."
      : "No pude guardar la canción: " + (error ? error.message : "error desconocido"));
    revisarFormulario();
    return;
  }

  // Ya hay al menos una canción: pedimos que el navegador no la borre.
  await pedirPersistencia();
  revisarFormulario();
  volverABiblioteca();
});

/* ==================================================================
   Análisis en el celular, con barra de progreso
   ================================================================== */

// Para poder cancelar: AbortController es la forma estándar de avisarle
// a una tarea en curso que se detenga.
let controladorAnalisis = null;

/**
 * Analiza un mp3 mostrando la capa de progreso. Devuelve los datos
 * (mismo formato que el JSON de la compu), o null si el usuario canceló.
 */
async function analizarConProgreso(mp3, nombre) {
  controladorAnalisis = new AbortController();
  barraProgreso.value = 0;
  textoProgreso.textContent = "Preparando…";
  capaProgreso.hidden = false;
  try {
    return await analizarMp3(mp3, nombre, (fraccion, etapa) => {
      barraProgreso.value = fraccion;
      textoProgreso.textContent = `${etapa}… ${Math.round(fraccion * 100)} %`;
    }, controladorAnalisis.signal);
  } catch (error) {
    if (error.name === "AbortError") return null;
    throw error;
  } finally {
    capaProgreso.hidden = true;
    controladorAnalisis = null;
  }
}

botonCancelarAnalisis.addEventListener("click", () => {
  if (controladorAnalisis) controladorAnalisis.abort();
});

/* ==================================================================
   Pantalla 3: reproductor
   ================================================================== */

// Abre una canción de la biblioteca en el reproductor.
async function abrirCancion(id) {
  if (await cargarCancion(id)) abrirPantalla("reproductor");
}

// Carga los datos y el mp3 de una canción en el reproductor.
// Devuelve false si no se pudo.
async function cargarCancion(id) {
  let cancion, mp3;
  try {
    [cancion, mp3] = await Promise.all([obtenerCancion(id), obtenerAudio(id)]);
  } catch (error) {
    alert("No pude abrir la canción: " + error.message);
    return false;
  }
  if (!cancion || !mp3) {
    alert("No encontré esa canción en la biblioteca.");
    mostrarBiblioteca();
    return false;
  }

  if (audio.src) URL.revokeObjectURL(audio.src); // liberamos la anterior (al recargar)
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
  return true;
}

// Botón "↻": vuelve a analizar en el celular el mp3 guardado y reemplaza
// los acordes. Se mantienen el nombre y el ajuste de sincronización.
// Botón "+ Lista": abre la ventana para agregar la canción a una lista.
botonAgregarLista.addEventListener("click", async () => {
  if (idActual === null) return;
  // Mostramos en qué listas ya está (leemos de nuevo por si cambió algo).
  try {
    todasLasListas = await listarListas();
  } catch {
    // si falla, usamos lo que ya teníamos
  }
  actualizarSugerencias();
  const nombres = todasLasListas.filter((l) => l.canciones.includes(idActual)).map((l) => l.nombre);
  listasDeCancion.textContent = nombres.length
    ? `Ya está en: ${nombres.join(", ")}.`
    : "Todavía no está en ninguna lista.";
  inputListaDialogo.value = "";
  dialogoLista.showModal();
  inputListaDialogo.focus();
});

botonCerrarDialogo.addEventListener("click", () => dialogoLista.close());

// Al confirmar: la canción va primera en esa lista (que se crea si no existe).
formLista.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const nombreLista = inputListaDialogo.value.replace(/\s+/g, " ").trim();
  if (!nombreLista || idActual === null) return;
  try {
    await agregarALista(nombreLista, idActual);
  } catch (error) {
    alert("No pude agregarla a la lista: " + error.message);
    return;
  }
  dialogoLista.close();
  mostrarMensaje(`Agregada a “${nombreLista}”`);
});

botonReanalizar.addEventListener("click", async () => {
  if (idActual === null) return;
  if (!confirm("¿Volver a analizar esta canción en el celular?\nSe reemplazan los acordes actuales.")) return;

  const id = idActual;
  audio.pause();
  let datos;
  try {
    const [cancion, mp3] = await Promise.all([obtenerCancion(id), obtenerAudio(id)]);
    datos = await analizarConProgreso(mp3, cancion.nombre);
    if (!datos) return;          // canceló
    await actualizarAnalisis(id, datos);
  } catch (error) {
    alert("No pude volver a analizar la canción: " + error.message);
    return;
  }
  await cargarCancion(id);
});

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
