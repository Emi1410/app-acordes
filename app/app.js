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

// Vista de pulsos
const botonVistaPulsos = document.getElementById("boton-vista-pulsos");
const botonVistaGrilla = document.getElementById("boton-vista-grilla");
const vistaPulsos = document.getElementById("vista-pulsos");
const vistaGrilla = document.getElementById("vista-grilla");
const avisoPulsos = document.getElementById("aviso-pulsos");
const tira = document.getElementById("tira");
const diagramaAhora = document.getElementById("diagrama-ahora");
const diagramaDespues = document.getElementById("diagrama-despues");
const nombreAhora = document.getElementById("nombre-ahora");
const nombreDespues = document.getElementById("nombre-despues");
const cuentaDespues = document.getElementById("cuenta-despues");

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

// Pulsos de la canción abierta (en segundos), cuáles empiezan un compás y
// qué acorde suena en cada uno. Se arman al abrir la canción.
let pulsos = [];
let esCompas = [];
let acordePorPulso = [];

// Posición en "pulsos" del pulso que se está mostrando (-1 = ninguno).
let indicePulso = -1;

// Vista elegida en el reproductor: "pulsos" (tira tipo Chordify) o "grilla".
let vista = "pulsos";
try {
  if (localStorage.getItem("vista") === "grilla") vista = "grilla";
} catch {
  // sin localStorage: se usa la vista de pulsos
}

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
  // Si se está editando con cambios sin guardar, primero se pregunta (editor.js).
  if (!puedeSalirDelEditor()) return;
  if (pantallaEnHistorial) history.back();
  else alVolverABiblioteca();
}

function alVolverABiblioteca() {
  // El "atrás" de Android no se puede frenar: si hay cambios sin guardar y el
  // usuario prefiere quedarse, volvemos a poner la entrada en el historial.
  if (!puedeSalirDelEditor()) {
    history.pushState({ pantalla: "reproductor" }, "");
    return;
  }
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
//
// "contexto" dice desde dónde se abre la canción: { tipo: "lista", idLista }
// o { tipo: "todas" } (también para el buscador). Define el orden de
// "siguiente" y "anterior" en el reproductor.
//
// "manija": si es true, agrega a la izquierda una manija para arrastrar la
// canción y cambiar su lugar en la lista.
function crearItemCancion(cancion, { detalleExtra = "", accion = null, contexto = { tipo: "todas" }, manija = false } = {}) {
  const item = document.createElement("li");
  item.className = "cancion";
  item.dataset.id = cancion.id;

  if (manija) {
    const agarre = document.createElement("span");
    agarre.className = "manija";
    agarre.setAttribute("aria-hidden", "true");
    // Seis puntitos, el dibujo típico de "se puede arrastrar"
    agarre.innerHTML = '<svg viewBox="0 0 12 20"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/>'
      + '<circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>';
    item.appendChild(agarre);
  }

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
  abrir.addEventListener("click", () => abrirCancion(cancion.id, contexto));
  item.appendChild(abrir);

  if (accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "cancion-borrar" + (accion.clase ? " " + accion.clase : "");
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

// Botón de acción de una lista ("Renombrar" o "Borrar lista"), con su propio estilo.
function crearBotonLista(texto, clase, alTocar) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "boton-lista " + clase;
  boton.textContent = texto;
  boton.addEventListener("click", alTocar);
  return boton;
}

/**
 * Permite cambiar el orden de una lista arrastrando la manija de una
 * canción. Mientras el dedo se mueve, la canción va cambiando de lugar en
 * la pantalla; al soltar, el orden nuevo se guarda en la base.
 * Usa "pointer events" (dedo o mouse). La manija tiene touch-action: none
 * para que arrastrarla no desplace la pantalla.
 */
function habilitarArrastre(ul, idLista) {
  const contenedor = document.querySelector(".contenido-biblioteca");
  let arrastrado = null;
  let ordenInicial = "";

  ul.addEventListener("pointerdown", (evento) => {
    const manija = evento.target.closest(".manija");
    if (!manija) return;
    evento.preventDefault();
    arrastrado = manija.closest("li");
    ordenInicial = [...ul.children].map((li) => li.dataset.id).join();
    arrastrado.classList.add("arrastrando");
    try {
      manija.setPointerCapture(evento.pointerId);   // los movimientos siguen llegando a la manija
    } catch {
      // sin captura funciona igual mientras el dedo esté sobre la lista
    }
  });

  ul.addEventListener("pointermove", (evento) => {
    if (!arrastrado) return;
    // Cerca de los bordes, la pantalla se desplaza sola.
    const caja = contenedor.getBoundingClientRect();
    if (evento.clientY < caja.top + 48) contenedor.scrollTop -= 12;
    if (evento.clientY > caja.bottom - 48) contenedor.scrollTop += 12;

    // La canción va antes de la primera cuya mitad queda debajo del dedo.
    const otras = [...ul.children].filter((li) => li !== arrastrado);
    const siguiente = otras.find((li) => {
      const r = li.getBoundingClientRect();
      return evento.clientY < r.top + r.height / 2;
    });
    if (siguiente) {
      if (arrastrado.nextElementSibling !== siguiente) ul.insertBefore(arrastrado, siguiente);
    } else if (ul.lastElementChild !== arrastrado) {
      ul.appendChild(arrastrado);
    }
  });

  const soltar = async () => {
    if (!arrastrado) return;
    arrastrado.classList.remove("arrastrando");
    arrastrado = null;
    const ids = [...ul.children].map((li) => Number(li.dataset.id));
    if (ids.join() === ordenInicial) return;      // no cambió nada
    try {
      await ordenarLista(idLista, ids);
    } catch (error) {
      alert("No pude guardar el orden: " + error.message);
    }
    mostrarBiblioteca();
  };
  ul.addEventListener("pointerup", soltar);
  ul.addEventListener("pointercancel", soltar);
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
      crearBotonLista("Renombrar", "boton-renombrar", () => pedirNuevoNombre(listaCanc)),
      crearBotonLista("Borrar lista", "boton-borrar-lista", () => confirmarBorradoLista(listaCanc)),
    );
    seccion.appendChild(acciones);

    const ul = document.createElement("ul");
    ul.className = "lista-canciones";
    for (const cancion of cancionesLista) {
      ul.appendChild(crearItemCancion(cancion, {
        accion: {
          texto: "Quitar",
          clase: "cancion-quitar",
          etiqueta: `Quitar ${cancion.nombre} de la lista ${listaCanc.nombre}`,
          alTocar: () => confirmarSacarDeLista(listaCanc, cancion),
        },
        contexto: { tipo: "lista", idLista: listaCanc.id },
        manija: cancionesLista.length > 1,   // con una sola canción no hay nada que ordenar
      }));
    }
    habilitarArrastre(ul, listaCanc.id);
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
      pulsos: listaDeTiempos(datos.pulsos),       // undefined si el JSON es viejo
      compases: listaDeTiempos(datos.compases),
      // Si es un JSON exportado de una canción editada: correcciones y análisis original.
      acordesOriginales: Array.isArray(datos.acordesOriginales) ? datos.acordesOriginales : null,
      editada: Array.isArray(datos.acordesOriginales) && datos.editada === true,
      // Preferencias exportadas con la canción (si vienen y son válidas).
      ...preferenciasImportadas(datos),
      ajuste: typeof datos.ajuste === "number" ? Math.round(datos.ajuste * 10) / 10 : 0,
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

// De un JSON exportado por la app, toma solo las preferencias válidas
// (velocidad, transporte, cejilla y afinación dentro de sus rangos).
function preferenciasImportadas(datos) {
  const resultado = {};
  if ([0.5, 0.75, 1, 1.25, 1.5, 2].includes(datos.velocidad)) resultado.velocidad = datos.velocidad;
  if (Number.isInteger(datos.transporte) && Math.abs(datos.transporte) <= 6) resultado.transporte = datos.transporte;
  if (Number.isInteger(datos.cejilla) && datos.cejilla >= 0 && datos.cejilla <= 9) resultado.cejilla = datos.cejilla;
  if ([0, -1, -2].includes(datos.afinacion)) resultado.afinacion = datos.afinacion;
  return resultado;
}

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

// Desde dónde se abrió la canción actual (ver crearItemCancion).
let contextoActual = { tipo: "todas" };

// Abre una canción de la biblioteca en el reproductor.
async function abrirCancion(id, contexto = { tipo: "todas" }) {
  contextoActual = contexto;
  if (!(await cargarCancion(id))) return;
  abrirPantalla("reproductor");
  // Opción del panel "Más": que arranque sola al abrirla.
  if (reproducirAlAbrir) reproducirCancion();
}

// Carga los datos y el mp3 de una canción en el reproductor.
// Devuelve false si no se pudo.
async function cargarCancion(id) {
  terminarEdicion();   // por si se estaba editando otra canción (editor.js)
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
  // Transporte, cejilla y afinación guardados para esta canción.
  transporte = Number.isInteger(cancion.transporte) ? cancion.transporte : 0;
  cejilla = Number.isInteger(cancion.cejilla) ? cancion.cejilla : 0;
  afinacion = Number.isInteger(cancion.afinacion) ? cancion.afinacion : 0;
  tonalidadOriginal = leerTonalidad(cancion.tonalidad);
  cancionActual = cancion;
  indiceActual = -1;

  // Creamos una URL temporal que apunta al mp3 guardado y se la damos al reproductor.
  reiniciarMetronomo();
  audio.src = URL.createObjectURL(mp3);
  // load() fuerza a empezar de cero con el audio nuevo. En algunos celulares,
  // sin esto el reproductor podía quedar en el estado "terminado" de antes
  // (posición al final), y recién al tocar play volvía al principio.
  audio.load();
  recienAbierta = true;
  // Velocidad guardada para esta canción. Hay que ponerla DESPUÉS de cargar,
  // porque al cargar un audio nuevo el navegador la vuelve a x1.
  aplicarVelocidad(cancion.velocidad || 1);

  mostrarTitulo();
  mostrarOpcionesAcordes();
  mostrarOpcionesCancion();   // "Restaurar análisis original" (editor.js)
  tiempoTotal.textContent = "0:00";
  barraTiempo.value = 0;
  acordeActual.textContent = "–";
  acordeSiguiente.textContent = "–";
  cuentaRegresiva.textContent = "";
  mostrarAjuste();
  dibujarLista();
  prepararPulsos(cancion);
  mostrarDiagramas();
  actualizar();
  mostrarPosicionEnLista();
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
  panelOpciones.close();   // el botón está en el panel "Más"
  // Si la canción tiene acordes corregidos a mano, se avisa que se pierden.
  const pregunta = cancionActual && cancionActual.editada
    ? "Esta canción tiene acordes corregidos a mano.\nSi la volvés a analizar, se pierden esos cambios. ¿Seguir?"
    : "¿Volver a analizar esta canción en el celular?\nSe reemplazan los acordes actuales.";
  if (!confirm(pregunta)) return;

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
  reiniciarMetronomo();
  URL.revokeObjectURL(audio.src);
  audio.removeAttribute("src");
  audio.load();
  idActual = null;
  acordes = [];
}

/* ==================================================================
   Canción siguiente y anterior

   El orden sale de la lista desde la que se abrió la canción, o de
   "Todas las canciones" (por nombre) si se abrió desde ahí o desde el
   buscador. Siempre se lee de la base, por si algo cambió mientras tanto.
   ================================================================== */

const botonAnterior = document.getElementById("boton-anterior");
const botonSiguiente = document.getElementById("boton-siguiente");
const posicionLista = document.getElementById("posicion-lista");

// Nombre y orden de canciones (ids) de un contexto.
function ordenDe(contexto, canciones, listas) {
  const existen = new Set(canciones.map((c) => c.id));
  if (contexto.tipo === "lista") {
    const listaCanc = listas.find((l) => l.id === contexto.idLista);
    if (listaCanc) {
      return { nombre: listaCanc.nombre, ids: listaCanc.canciones.filter((id) => existen.has(id)) };
    }
  }
  // listarCanciones ya las devuelve ordenadas por nombre, como en la pantalla de inicio.
  return { nombre: "Todas las canciones", ids: canciones.map((c) => c.id) };
}

const mismoContexto = (a, b) => a.tipo === b.tipo && (a.tipo !== "lista" || a.idLista === b.idLista);

// La canción vecina en la misma lista (paso = +1 siguiente, -1 anterior), o null.
function vecina(paso, canciones, listas) {
  const { ids } = ordenDe(contextoActual, canciones, listas);
  const j = ids.indexOf(idActual) + paso;
  if (ids.indexOf(idActual) < 0 || j < 0 || j >= ids.length) return null;
  return { id: ids[j], contexto: contextoActual };
}

// Para la reproducción continua: la primera canción de la lista siguiente
// (en el orden de la pantalla de inicio, con "Todas las canciones" al final),
// salteando las listas vacías. null si no hay más.
function primeraDeListaSiguiente(canciones, listas) {
  const contextos = [...listas.map((l) => ({ tipo: "lista", idLista: l.id })), { tipo: "todas" }];
  const actual = contextos.findIndex((c) => mismoContexto(c, contextoActual));
  for (let k = actual + 1; k < contextos.length; k++) {
    const { ids } = ordenDe(contextos[k], canciones, listas);
    if (ids.length) return { id: ids[0], contexto: contextos[k] };
  }
  return null;
}

// Hacia dónde va "siguiente": la vecina, o con reproducción continua la
// primera de la lista siguiente cuando se termina la lista.
function destinoSiguiente(canciones, listas) {
  return vecina(+1, canciones, listas)
    || (reproduccionContinua ? primeraDeListaSiguiente(canciones, listas) : null);
}

async function leerBiblioteca() {
  const [canciones, listas] = await Promise.all([listarCanciones(), listarListas()]);
  return { canciones, listas };
}

// Muestra "Airbag · 3 de 12" y habilita o no los botones.
async function mostrarPosicionEnLista() {
  const id = idActual;
  // Borramos la de la canción anterior mientras leemos la base.
  posicionLista.textContent = "";
  let datos;
  try {
    datos = await leerBiblioteca();
  } catch {
    return;
  }
  if (id !== idActual) return;   // mientras leíamos se cambió de canción
  const { nombre, ids } = ordenDe(contextoActual, datos.canciones, datos.listas);
  const posicion = ids.indexOf(idActual);
  posicionLista.textContent = posicion >= 0 ? `${nombre} · ${posicion + 1} de ${ids.length}` : nombre;
  botonAnterior.disabled = !vecina(-1, datos.canciones, datos.listas);
  botonSiguiente.disabled = !destinoSiguiente(datos.canciones, datos.listas);
}

// Cambia a otra canción sin salir del reproductor. Si "reproducir" es
// true, arranca a sonar apenas se carga.
async function irACancion(destino, reproducir) {
  contextoActual = destino.contexto;
  if (!(await cargarCancion(destino.id))) return;
  if (reproducir) reproducirCancion();
}

async function pasarDeCancion(paso) {
  const seguia = !audio.paused;   // si estaba sonando, la nueva también suena
  const { canciones, listas } = await leerBiblioteca();
  const destino = paso > 0 ? destinoSiguiente(canciones, listas) : vecina(-1, canciones, listas);
  if (destino) await irACancion(destino, seguia);
}

botonAnterior.addEventListener("click", () => pasarDeCancion(-1));
botonSiguiente.addEventListener("click", () => pasarDeCancion(+1));

// Reproducción continua: al terminar una canción, empieza la siguiente.
audio.addEventListener("ended", async () => {
  if (!reproduccionContinua) return;
  const { canciones, listas } = await leerBiblioteca();
  const destino = destinoSiguiente(canciones, listas);
  if (destino) await irACancion(destino, true);
});

/* ==================================================================
   Sonido: volumen de la canción, metrónomo y velocidad

   La canción y el metrónomo pasan por el mismo AudioContext (Web Audio
   API). Así salen por el mismo camino, con la misma demora, y el clic no
   se adelanta ni se atrasa respecto de la música. También nos da un
   control de volumen propio para cada uno.
   ================================================================== */

const botonInicio = document.getElementById("boton-inicio");
const botonMetronomo = document.getElementById("boton-metronomo");
const botonMas = document.getElementById("boton-mas");
const resumenOpciones = document.getElementById("resumen-opciones");
const panelOpciones = document.getElementById("panel-opciones");
const botonCerrarOpciones = document.getElementById("boton-cerrar-opciones");
const velocidadMenos = document.getElementById("velocidad-menos");
const velocidadMas = document.getElementById("velocidad-mas");
const valorVelocidad = document.getElementById("valor-velocidad");
const volumenCancionControl = document.getElementById("volumen-cancion");
const volumenMetronomoControl = document.getElementById("volumen-metronomo");
const reproduccionContinuaControl = document.getElementById("reproduccion-continua");
const reproducirAlAbrirControl = document.getElementById("reproducir-al-abrir");

// Preferencias generales (no dependen de la canción), guardadas en el navegador.
let metronomoPrendido = false;
let volumenMetronomo = 0.7;
let volumenCancion = 1;
let reproduccionContinua = false;
let reproducirAlAbrir = false;     // que la canción arranque sola al abrirla
try {
  const guardadas = JSON.parse(localStorage.getItem("preferenciasReproductor")) || {};
  metronomoPrendido = guardadas.metronomoPrendido === true;
  if (typeof guardadas.volumenMetronomo === "number") volumenMetronomo = guardadas.volumenMetronomo;
  if (typeof guardadas.volumenCancion === "number") volumenCancion = guardadas.volumenCancion;
  reproduccionContinua = guardadas.reproduccionContinua === true;
  reproducirAlAbrir = guardadas.reproducirAlAbrir === true;
} catch {
  // sin localStorage: valores por defecto
}

function guardarPreferencias() {
  try {
    localStorage.setItem("preferenciasReproductor", JSON.stringify({
      metronomoPrendido, volumenMetronomo, volumenCancion, reproduccionContinua, reproducirAlAbrir,
    }));
  } catch {
    // no es grave: solo no se recuerda
  }
}

// El AudioContext se crea la primera vez que se toca play o el metrónomo:
// los navegadores no dejan sonar audio sin que el usuario toque algo antes.
let contextoAudio = null;
let gananciaCancion = null;     // volumen de la canción
let gananciaMetronomo = null;   // volumen del metrónomo

function asegurarAudio() {
  if (!contextoAudio) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return null;
    contextoAudio = new Contexto();
    gananciaMetronomo = contextoAudio.createGain();
    gananciaMetronomo.gain.value = volumenMetronomo;
    gananciaMetronomo.connect(contextoAudio.destination);
    // La canción (el <audio>) pasa a sonar a través del contexto.
    try {
      const fuente = contextoAudio.createMediaElementSource(audio);
      gananciaCancion = contextoAudio.createGain();
      fuente.connect(gananciaCancion).connect(contextoAudio.destination);
    } catch {
      gananciaCancion = null;   // si falla, el volumen se maneja con audio.volume
    }
    aplicarVolumenCancion();
  }
  if (contextoAudio.state === "suspended") contextoAudio.resume();
  return contextoAudio;
}

function aplicarVolumenCancion() {
  if (gananciaCancion) {
    gananciaCancion.gain.value = volumenCancion;
    audio.volume = 1;
  } else {
    audio.volume = volumenCancion;
  }
}

function reproducirCancion() {
  asegurarAudio();
  // Si quedó en el final (terminó, o el celular la dejó ahí), arranca desde 0:00.
  if (audio.ended || (isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05)) {
    audio.currentTime = 0;
  }
  audio.play().catch(() => {});
}

/* ------------------------------------------------------------------
   Metrónomo

   Cada 25 ms revisamos qué pulsos van a sonar en los próximos 0,2 s y
   los "programamos" en el reloj del AudioContext, que es muy preciso.
   Para saber CUÁNDO cae un pulso usamos la posición real del audio y la
   velocidad:  momento = ahora + (pulso + ajuste - posición) / velocidad.
   Si se adelanta, se pausa, cambia la velocidad o el ajuste, se cancelan
   los clics ya programados y se vuelve a calcular desde la nueva posición.
   ------------------------------------------------------------------ */

const ADELANTO_METRONOMO = 0.2;      // segundos que se programan por adelantado
const INTERVALO_METRONOMO = 25;      // ms entre revisiones
let proximoPulsoMetronomo = null;    // índice del próximo pulso a programar
let clicsProgramados = [];
let temporizadorMetronomo = null;

// Un clic corto: un tono que se apaga enseguida. Más agudo y fuerte en el
// primer tiempo del compás.
function sonarClic(cuando, primerTiempo) {
  const oscilador = contextoAudio.createOscillator();
  const envolvente = contextoAudio.createGain();
  oscilador.frequency.value = primerTiempo ? 1760 : 1100;
  envolvente.gain.setValueAtTime(0, cuando);
  envolvente.gain.linearRampToValueAtTime(primerTiempo ? 1 : 0.5, cuando + 0.002);
  envolvente.gain.exponentialRampToValueAtTime(0.001, cuando + 0.06);
  oscilador.connect(envolvente).connect(gananciaMetronomo);
  oscilador.start(cuando);
  oscilador.stop(cuando + 0.07);
  clicsProgramados.push(oscilador);
  oscilador.onended = () => {
    clicsProgramados = clicsProgramados.filter((o) => o !== oscilador);
    envolvente.disconnect();
  };
}

// Cancela los clics ya programados y hace que se recalcule desde la posición actual.
function reiniciarMetronomo() {
  proximoPulsoMetronomo = null;
  for (const oscilador of clicsProgramados) {
    try {
      oscilador.stop();     // si todavía no empezó, ya no va a sonar
    } catch {
      // ya había terminado
    }
  }
  clicsProgramados = [];
}

function programarMetronomo() {
  if (!metronomoPrendido || audio.paused || audio.seeking || pulsos.length === 0) return;
  if (!contextoAudio || contextoAudio.state !== "running") return;

  const velocidad = audio.playbackRate;
  const posicion = audio.currentTime;            // dónde está la canción ahora
  const ahora = contextoAudio.currentTime;       // y qué hora marca el reloj del contexto

  // La primera vez (o después de reiniciar): el primer pulso que todavía no sonó.
  if (proximoPulsoMetronomo === null) {
    proximoPulsoMetronomo = pulsos.findIndex((p) => p + ajuste >= posicion - 0.005);
    if (proximoPulsoMetronomo < 0) proximoPulsoMetronomo = pulsos.length;
  }

  while (proximoPulsoMetronomo < pulsos.length) {
    const i = proximoPulsoMetronomo;
    const cuando = ahora + (pulsos[i] + ajuste - posicion) / velocidad;
    if (cuando > ahora + ADELANTO_METRONOMO) break;      // todavía falta: lo programamos después
    if (cuando >= ahora - 0.02) sonarClic(Math.max(cuando, ahora), esCompas[i]);
    proximoPulsoMetronomo++;
  }
}

function arrancarMetronomo() {
  if (temporizadorMetronomo === null) {
    temporizadorMetronomo = setInterval(programarMetronomo, INTERVALO_METRONOMO);
  }
  programarMetronomo();
}

function pararMetronomo() {
  clearInterval(temporizadorMetronomo);
  temporizadorMetronomo = null;
  reiniciarMetronomo();
}

function mostrarMetronomo() {
  botonMetronomo.setAttribute("aria-pressed", String(metronomoPrendido));
}

botonMetronomo.addEventListener("click", () => {
  metronomoPrendido = !metronomoPrendido;
  mostrarMetronomo();
  guardarPreferencias();
  if (metronomoPrendido) {
    asegurarAudio();
    reiniciarMetronomo();
    if (!audio.paused) arrancarMetronomo();
  } else {
    pararMetronomo();
  }
});

// Todo lo que cambia la relación entre la canción y el reloj obliga a recalcular.
audio.addEventListener("seeking", reiniciarMetronomo);
audio.addEventListener("ratechange", reiniciarMetronomo);

/* ------------------------------------------------------------------
   Velocidad (sin cambiar el tono)
   ------------------------------------------------------------------ */

// Las velocidades posibles, de la más lenta a la más rápida.
const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2];

function textoVelocidad(v) {
  return "x" + String(v);
}

function aplicarVelocidad(v) {
  // preservesPitch: el navegador estira el audio sin volverlo más agudo o grave.
  audio.preservesPitch = true;
  audio.defaultPlaybackRate = v;
  audio.playbackRate = v;
  valorVelocidad.textContent = textoVelocidad(v);
  velocidadMenos.disabled = v <= VELOCIDADES[0];
  velocidadMas.disabled = v >= VELOCIDADES[VELOCIDADES.length - 1];
  resumenOpciones.textContent = textoVelocidad(v);
}

// − y + pasan a la velocidad anterior o siguiente de la lista.
function cambiarVelocidad(paso) {
  const actual = VELOCIDADES.indexOf(audio.playbackRate);
  const nueva = VELOCIDADES[Math.min(VELOCIDADES.length - 1, Math.max(0, (actual < 0 ? 2 : actual) + paso))];
  aplicarVelocidad(nueva);
  // Se recuerda por canción.
  if (idActual !== null) actualizarCancion(idActual, { velocidad: nueva }).catch(() => {});
}

velocidadMenos.addEventListener("click", () => cambiarVelocidad(-1));
velocidadMas.addEventListener("click", () => cambiarVelocidad(+1));

/* ------------------------------------------------------------------
   Panel de opciones, volúmenes y reproducción continua
   ------------------------------------------------------------------ */

botonMas.addEventListener("click", () => panelOpciones.showModal());
botonCerrarOpciones.addEventListener("click", () => panelOpciones.close());
// Tocar afuera del panel (en la parte oscura) también lo cierra.
panelOpciones.addEventListener("click", (evento) => {
  if (evento.target === panelOpciones) panelOpciones.close();
});

volumenCancionControl.addEventListener("input", () => {
  volumenCancion = Number(volumenCancionControl.value);
  aplicarVolumenCancion();
  guardarPreferencias();
});

volumenMetronomoControl.addEventListener("input", () => {
  volumenMetronomo = Number(volumenMetronomoControl.value);
  if (gananciaMetronomo) gananciaMetronomo.gain.value = volumenMetronomo;
  guardarPreferencias();
});

reproducirAlAbrirControl.addEventListener("change", () => {
  reproducirAlAbrir = reproducirAlAbrirControl.checked;
  guardarPreferencias();
});

reproduccionContinuaControl.addEventListener("change", () => {
  reproduccionContinua = reproduccionContinuaControl.checked;
  guardarPreferencias();
  mostrarPosicionEnLista();   // "siguiente" puede habilitarse al final de la lista
});

// Volver al principio de la canción.
botonInicio.addEventListener("click", () => {
  audio.currentTime = 0;
  actualizar();
});

// Muestra en los controles las preferencias guardadas.
function mostrarPreferencias() {
  volumenCancionControl.value = volumenCancion;
  volumenMetronomoControl.value = volumenMetronomo;
  reproduccionContinuaControl.checked = reproduccionContinua;
  reproducirAlAbrirControl.checked = reproducirAlAbrir;
  mostrarMetronomo();
  aplicarVolumenCancion();
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
    nombre.textContent = nombreParaMostrar(tramo.acorde);
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
  // Segundos reales hasta el cambio: a x0.5 la canción tarda el doble en llegar.
  const faltan = siguiente ? Math.max(0, siguiente.inicio - t) / audio.playbackRate : 0;
  const cuenta = siguiente ? `en ${faltan.toFixed(1)} s` : "";
  cuentaRegresiva.textContent = cuenta;
  cuentaDespues.textContent = cuenta || "Fin";

  // Tira de pulsos: como "t" ya tiene restado el ajuste, los botones ±0.1 s
  // también corren el pulso resaltado.
  actualizarTira(t);

  // El resto solo cambia cuando cambia el acorde, para no trabajar de más.
  if (indice === indiceActual) return;
  indiceActual = indice;

  acordeActual.textContent = indice >= 0 ? nombreParaMostrar(acordes[indice].acorde) : "–";
  acordeSiguiente.textContent = siguiente ? nombreParaMostrar(siguiente.acorde) : "fin";
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

/* ==================================================================
   Vista de pulsos (tipo Chordify)
   ================================================================== */

// Cantidad de pulsos por compás (igual que en los analizadores).
const PULSOS_POR_COMPAS = 4;

// Índice del valor de "lista" (ordenada) más cercano a t.
function masCercano(lista, t) {
  let bajo = 0, alto = lista.length - 1;
  while (bajo < alto) {
    const medio = (bajo + alto) >> 1;
    if (lista[medio] < t) bajo = medio + 1;
    else alto = medio;
  }
  if (bajo > 0 && Math.abs(lista[bajo - 1] - t) <= Math.abs(lista[bajo] - t)) return bajo - 1;
  return bajo;
}

/**
 * Elige dónde empiezan los compases: de los 4 desfasajes posibles, el que
 * hace que más cambios de acorde caigan en el primer tiempo. Es la misma
 * regla que usan analizar.py y analizador.js; acá se usa solo para las
 * canciones viejas, que no traen los compases guardados.
 */
function compasesPorCambios(tiemposPulsos) {
  const cambios = acordes.slice(1)
    .map((a) => masCercano(tiemposPulsos, a.inicio))
    .filter((p, k) => Math.abs(tiemposPulsos[p] - acordes[k + 1].inicio) < 0.08);
  let mejor = 0, mejorPuntaje = -1;
  for (let desfasaje = 0; desfasaje < PULSOS_POR_COMPAS; desfasaje++) {
    const puntaje = cambios.filter((p) => (p - desfasaje) % PULSOS_POR_COMPAS === 0).length;
    if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = desfasaje; }
  }
  return tiemposPulsos.filter((_, i) => i >= mejor && (i - mejor) % PULSOS_POR_COMPAS === 0);
}

/**
 * Para canciones analizadas antes de que se guardaran los pulsos: arma una
 * grilla pareja a partir del tempo. Como los acordes del analizador cambian
 * justo en un pulso, probamos alinear la grilla con cada cambio de acorde y
 * nos quedamos con la alineación que deja más cambios sobre un pulso.
 */
function pulsosAproximados(cancion) {
  const tempo = cancion.tempo > 30 ? cancion.tempo : 120;   // sin tempo: 120 BPM
  const periodo = 60 / tempo;
  const fin = acordes[acordes.length - 1].fin;
  const cambios = acordes.slice(1).map((a) => a.inicio);

  // Distancia de un tiempo a la grilla más cercana con esa fase.
  const distancia = (x, fase) => {
    const resto = (((x - fase) % periodo) + periodo) % periodo;
    return Math.min(resto, periodo - resto);
  };
  let fase = 0, mejor = -1;
  for (const c of cambios) {
    const candidata = c % periodo;
    const cerca = cambios.filter((x) => distancia(x, candidata) < 0.08).length;
    if (cerca > mejor) { mejor = cerca; fase = candidata; }
  }

  const resultado = [];
  for (let t = fase; t < fin; t += periodo) resultado.push(t);
  return resultado;
}

/**
 * Prepara la tira de la canción abierta: usa los pulsos y compases
 * guardados, o los aproxima si la canción es vieja.
 */
function prepararPulsos(cancion) {
  const tienePulsos = Array.isArray(cancion.pulsos) && cancion.pulsos.length >= 2;
  pulsos = tienePulsos ? cancion.pulsos : pulsosAproximados(cancion);
  avisoPulsos.hidden = tienePulsos;

  const compases = tienePulsos && Array.isArray(cancion.compases) && cancion.compases.length
    ? cancion.compases
    : compasesPorCambios(pulsos);
  esCompas = pulsos.map(() => false);
  for (const c of compases) esCompas[masCercano(pulsos, c)] = true;

  calcularAcordesPorPulso();

  indicePulso = -1;
  dibujarTira();
}

// Acorde de cada pulso: el que suena en la mitad del pulso (así no importa
// si el cambio de acorde quedó redondeado unos milisegundos antes o después).
// Se vuelve a calcular cada vez que el editor cambia los acordes.
function calcularAcordesPorPulso() {
  acordePorPulso = pulsos.map((inicio, i) => {
    const fin = i + 1 < pulsos.length ? pulsos[i + 1] : inicio + (inicio - pulsos[i - 1]);
    const k = buscarIndice((inicio + fin) / 2);
    return k >= 0 ? acordes[k].acorde : "N";
  });
}

// Un casillero por pulso. El nombre del acorde va solo donde cambia, y los
// casilleros que empiezan un compás tienen la línea izquierda más gruesa.
function dibujarTira() {
  tira.replaceChildren();
  pulsos.forEach((_, i) => {
    const celda = document.createElement("div");
    celda.className = "pulso";
    celda.dataset.indice = i;
    if (esCompas[i]) celda.classList.add("compas");
    const acorde = acordePorPulso[i];
    if (i === 0 || acorde !== acordePorPulso[i - 1]) {
      celda.textContent = nombreParaMostrar(acorde);
      celda.classList.add("cambio");
    }
    tira.appendChild(celda);
  });
  tira.scrollLeft = 0;
  marcarSeleccion();   // en modo edición, vuelve a pintar los pulsos elegidos (editor.js)
}

// Tocar un casillero salta a ese pulso (sumando el ajuste, para que coincida).
// En modo edición, tocar sirve para elegir pulsos (lo maneja editor.js).
tira.addEventListener("click", (evento) => {
  const celda = evento.target.closest(".pulso");
  if (!celda || idActual === null || editando) return;
  audio.currentTime = Math.max(0, pulsos[Number(celda.dataset.indice)] + ajuste);
  actualizar();
});

// Resalta el pulso que suena en "t" y desplaza la tira para que se vea.
function actualizarTira(t) {
  // Último pulso que ya empezó (-1 antes del primero).
  let indice = -1;
  if (pulsos.length && t >= pulsos[0]) {
    indice = masCercano(pulsos, t);
    if (pulsos[indice] > t) indice--;
  }
  if (indice === indicePulso) return;

  const anterior = tira.children[indicePulso];
  if (anterior) anterior.classList.remove("actual");
  indicePulso = indice;
  const celda = tira.children[indice];
  if (!celda) return;
  celda.classList.add("actual");

  // El pulso actual queda a un tercio del borde izquierdo: se ve lo que viene.
  if (!vistaPulsos.hidden) {
    tira.scrollTo({ left: celda.offsetLeft - tira.clientWidth / 3, behavior: "smooth" });
  }
}

// Alterna entre la vista de pulsos y la grilla, y recuerda la elección.
function aplicarVista(nueva) {
  vista = nueva;
  const enPulsos = vista === "pulsos";
  vistaPulsos.hidden = !enPulsos;
  vistaGrilla.hidden = enPulsos;
  lista.hidden = enPulsos;
  botonVistaPulsos.setAttribute("aria-pressed", String(enPulsos));
  botonVistaGrilla.setAttribute("aria-pressed", String(!enPulsos));
  try {
    localStorage.setItem("vista", vista);
  } catch {
    // no es grave: solo no se recuerda
  }
  // Forzamos a redibujar para que la vista que aparece quede en el lugar actual.
  indiceActual = -1;
  indicePulso = -1;
  for (const celda of tira.querySelectorAll(".actual")) celda.classList.remove("actual");
  actualizar();
}

botonVistaPulsos.addEventListener("click", () => aplicarVista("pulsos"));
botonVistaGrilla.addEventListener("click", () => aplicarVista("grilla"));

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

/* ==================================================================
   Transportar, cejilla y afinación

   Cambian solo los acordes que se MUESTRAN, no el sonido:
     - transporte: sube o baja el acorde que suena (de -6 a +6 semitonos).
     - cejilla (capo) y afinación: cambian la FORMA que se hace con la mano.
       La cejilla sube todo el diapasón y afinar más bajo lo baja, así que
         forma = acorde que suena - cejilla - afinación
       Con cejilla 4, un E se toca con forma de C (E - 4 = C).
       Con la guitarra en Eb (afinación -1), un C#m se toca como Dm.
   Los acordes guardados siempre están en el tono real de la canción.
   ================================================================== */

let transporte = 0;          // semitonos, de -6 a +6
let cejilla = 0;             // traste del capo, de 0 a 9
let afinacion = 0;           // 0 estándar, -1 medio tono abajo (Eb), -2 un tono abajo (D)
let tonalidadOriginal = null;   // { tonica, modo } de la canción, si se conoce

// Cuántos semitonos hay que mover un acorde original para obtener la forma que se toca.
function desplazamientoForma() {
  return transporte - cejilla - afinacion;
}

// Tonalidad que suena (con el transporte aplicado).
function tonalidadQueSuena() {
  return moverTonalidad(tonalidadOriginal, transporte);
}

// Forma que se toca para un acorde original, escrita con sostenidos o
// bemoles según la tonalidad de las formas (por ejemplo, Bb y no A# en F).
function formaDe(acordeOriginal) {
  const d = desplazamientoForma();
  return transportarAcorde(acordeOriginal, d, moverTonalidad(tonalidadOriginal, d));
}

// Lo que se muestra en pantalla para un acorde original ("N" se ve como una raya).
function nombreParaMostrar(acordeOriginal) {
  return acordeOriginal === "N" ? "–" : formaDe(acordeOriginal);
}

// Datos de la canción abierta (para el título).
let cancionActual = null;

const indicadorAcordes = document.getElementById("indicador-acordes");
const valorTransporte = document.getElementById("valor-transporte");
const valorCejilla = document.getElementById("valor-cejilla");
const transporteMenos = document.getElementById("transporte-menos");
const transporteMas = document.getElementById("transporte-mas");
const transporteCero = document.getElementById("transporte-cero");
const cejillaMenos = document.getElementById("cejilla-menos");
const cejillaMas = document.getElementById("cejilla-mas");
const selectorAfinacion = document.getElementById("selector-afinacion");

const NOMBRES_AFINACION = { "-1": "Afinación Eb", "-2": "Afinación D" };

// "+2", "−3" o "0".
const conSigno = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

// Título: nombre · tonalidad QUE SUENA (transportada) · BPM.
function mostrarTitulo() {
  if (!cancionActual) return;
  const partes = [cancionActual.nombre];
  const tonalidad = tonalidadQueSuena();
  if (tonalidad) partes.push(nombreDeTonalidad(tonalidad));
  else if (cancionActual.tonalidad) partes.push(cancionActual.tonalidad);
  if (cancionActual.tempo) partes.push(`${Math.round(cancionActual.tempo)} BPM`);
  titulo.textContent = partes.join(" · ");
}

// Actualiza los controles del panel y el aviso de la pantalla principal.
function mostrarOpcionesAcordes() {
  valorTransporte.textContent = conSigno(transporte);
  valorCejilla.textContent = cejilla ? String(cejilla) : "No";
  transporteMenos.disabled = transporte <= -6;
  transporteMas.disabled = transporte >= 6;
  transporteCero.disabled = transporte === 0;
  cejillaMenos.disabled = cejilla <= 0;
  cejillaMas.disabled = cejilla >= 9;
  selectorAfinacion.value = String(afinacion);

  // Aviso arriba de la tira: qué está activo y en qué tonalidad quedan las formas.
  const partes = [];
  if (transporte) partes.push(`Tono ${conSigno(transporte)}`);
  if (cejilla) partes.push(`Cejilla ${cejilla}`);
  if (afinacion) partes.push(NOMBRES_AFINACION[afinacion]);
  if ((cejilla || afinacion) && tonalidadOriginal) {
    partes.push(`formas de ${nombreDeTonalidad(moverTonalidad(tonalidadOriginal, desplazamientoForma()))}`);
  }
  indicadorAcordes.textContent = partes.join(" · ");
  indicadorAcordes.hidden = partes.length === 0;
}

// Después de cambiar algo: lo guardamos para esta canción y redibujamos
// todos los nombres y diagramas.
function cambiarOpcionesAcordes() {
  mostrarOpcionesAcordes();
  mostrarTitulo();
  if (idActual === null) return;
  actualizarCancion(idActual, { transporte, cejilla, afinacion }).catch(() => {});

  const desplazamiento = tira.scrollLeft;   // que la tira no salte al principio
  dibujarTira();
  tira.scrollLeft = desplazamiento;
  dibujarLista();
  indiceActual = -1;
  indicePulso = -1;
  actualizar();
  mostrarDiagramas();
}

transporteMenos.addEventListener("click", () => { transporte = Math.max(-6, transporte - 1); cambiarOpcionesAcordes(); });
transporteMas.addEventListener("click", () => { transporte = Math.min(6, transporte + 1); cambiarOpcionesAcordes(); });
transporteCero.addEventListener("click", () => { transporte = 0; cambiarOpcionesAcordes(); });
cejillaMenos.addEventListener("click", () => { cejilla = Math.max(0, cejilla - 1); cambiarOpcionesAcordes(); });
cejillaMas.addEventListener("click", () => { cejilla = Math.min(9, cejilla + 1); cambiarOpcionesAcordes(); });
selectorAfinacion.addEventListener("change", () => {
  afinacion = Number(selectorAfinacion.value);
  cambiarOpcionesAcordes();
});

// Clave con la que se recuerda la posición elegida de una forma. Con cejilla
// o afinación distinta de la estándar se recuerda aparte: así, aunque sin
// cejilla hayas elegido la versión con cejilla de un acorde, con el capo
// puesto se empieza por la posición abierta (la primera de la biblioteca).
function clavePosicion(forma) {
  const clave = nombreNormalizado(forma);
  if (!clave) return null;
  return cejilla || afinacion ? `capo:${clave}` : clave;
}

// Devuelve la posición a dibujar para un acorde ORIGINAL (se convierte a la
// forma que se toca con transporte, cejilla y afinación), junto con cuántas
// hay. null si no hay diagrama.
function posicionParaDibujar(acordeOriginal) {
  const forma = formaDe(acordeOriginal);
  const posiciones = posicionesDeAcorde(forma); // [] para "N" o desconocidos
  if (posiciones.length === 0) return null;
  const elegida = posicionElegida[clavePosicion(forma)] || 0;
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

  // Vista de pulsos: los dos diagramas del mismo tamaño, con el nombre abajo.
  // Si es "N" o no hay posición, el casillero queda vacío pero ocupa lugar,
  // así la pantalla no salta.
  dibujarDiagramaPar(diagramaAhora, nombreAhora, actual ? actual.acorde : null);
  dibujarDiagramaPar(diagramaDespues, nombreDespues, siguiente ? siguiente.acorde : null);
}

function dibujarDiagramaPar(boton, etiqueta, acorde) {
  const elegida = acorde ? posicionParaDibujar(acorde) : null;
  boton.replaceChildren();
  if (elegida) {
    boton.appendChild(dibujarDiagrama(elegida.posicion));
    if (elegida.total > 1) {
      const posicion = document.createElement("small");
      posicion.textContent = `${elegida.numero}/${elegida.total}`;
      boton.appendChild(posicion);
    }
  }
  boton.disabled = !elegida || elegida.total < 2;
  etiqueta.textContent = acorde ? nombreParaMostrar(acorde) : "–";
}

// Al tocar un diagrama pasamos a la siguiente posición de ese acorde
// (y después de la última, vuelve a la primera). La elección se recuerda
// y vale para todas las veces que aparece el acorde.
function cambiarPosicion(acorde) {
  if (!acorde) return;
  const forma = formaDe(acorde.acorde);
  const clave = clavePosicion(forma);
  const total = posicionesDeAcorde(forma).length;
  if (!clave || total < 2) return;

  posicionElegida[clave] = ((posicionElegida[clave] || 0) + 1) % total;
  try {
    localStorage.setItem("posicionElegida", JSON.stringify(posicionElegida));
  } catch {
    // Si no se puede guardar, igual queda recordada mientras la app esté abierta.
  }
  mostrarDiagramas();
}

diagramaActual.addEventListener("click", () => cambiarPosicion(acordes[indiceActual]));
diagramaAhora.addEventListener("click", () => cambiarPosicion(acordes[indiceActual]));
diagramaDespues.addEventListener("click", () => cambiarPosicion(acordes[indiceActual + 1]));

/* ==================================================================
   Controles del reproductor
   ================================================================== */

botonPlay.addEventListener("click", () => {
  if (audio.paused) reproducirCancion();
  else audio.pause();
});

audio.addEventListener("play", () => {
  botonPlay.textContent = "❚❚";
  botonPlay.setAttribute("aria-label", "Pausar");
  pedirPantallaEncendida();
  requestAnimationFrame(bucle);
  if (metronomoPrendido) arrancarMetronomo();
});

audio.addEventListener("pause", () => {
  botonPlay.textContent = "▶";
  botonPlay.setAttribute("aria-label", "Reproducir");
  pararMetronomo();
  soltarPantalla();
  actualizar();
});

// true desde que se abre una canción hasta que el navegador sabe cuánto dura.
let recienAbierta = false;

// Cuando el navegador sabe (o corrige) cuánto dura la canción, configuramos
// la barra. Algunos celulares informan la duración tarde, o primero como
// infinita, por eso escuchamos también "durationchange".
function alConocerDuracion() {
  if (!isFinite(audio.duration)) return;
  barraTiempo.max = audio.duration;
  tiempoTotal.textContent = formatoTiempo(audio.duration);
  // Una canción recién abierta que quedó EN EL FINAL (lo que pasaba en algunos
  // celulares) vuelve a 0:00, lista para tocar play. Si quedó en otro lugar es
  // porque alguien lo eligió (por ejemplo, tocó un pulso enseguida): se respeta.
  if (recienAbierta) {
    recienAbierta = false;
    if (audio.paused && (audio.ended || audio.currentTime >= audio.duration - 0.5)) audio.currentTime = 0;
  }
  actualizar();
}
audio.addEventListener("loadedmetadata", alConocerDuracion);
audio.addEventListener("durationchange", alConocerDuracion);

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
  reiniciarMetronomo();   // el ajuste también corre los clics
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

aplicarVista(vista);
mostrarPreferencias();
mostrarBiblioteca();
