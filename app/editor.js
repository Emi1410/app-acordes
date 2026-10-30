"use strict";

/* ==================================================================
   Editor de acordes

   Sirve para corregir lo que detectó el analizador. Se usa sobre la
   tira de pulsos: se toca un pulso, o se arrastra para elegir varios, y
   sobre esa selección se puede:
     - cambiar el acorde de los tramos que toca la selección,
     - poner un acorde "de paso" que dura solo los pulsos elegidos,
     - marcar "sin acorde" (por ejemplo, una intro de ruido o de público),
     - copiar una parte y pegarla en otra.
   Todo se puede deshacer y rehacer, y se guarda con "Guardar".

   Los acordes se guardan siempre en el tono REAL de la canción: si hay
   transporte, cejilla o afinación, lo que se elige en pantalla (la forma)
   se pasa al tono real antes de guardarlo.

   Usa variables y funciones de app.js (acordes, pulsos, acordePorPulso,
   formaDe, dibujarTira...), que se carga antes que este archivo.
   ================================================================== */

// ¿Está activo el modo edición?
let editando = false;

// Pulsos elegidos: { desde, hasta } (índices de "pulsos", inclusive), o null.
let seleccion = null;

// Para deshacer y rehacer: copias de la lista de acordes.
let historialDeshacer = [];
let historialRehacer = [];

// Acordes de cada pulso copiados con "Copiar" (en el tono real).
let portapapeles = null;

// Acordes como estaban guardados al entrar al editor o al último "Guardar".
let acordesGuardados = null;

const botonEditar = document.getElementById("boton-editar");
const pantallaReproductor = document.getElementById("pantalla-reproductor");
const textoSeleccion = document.getElementById("seleccion-edicion");
const editarCambiar = document.getElementById("editar-cambiar");
const editarPaso = document.getElementById("editar-paso");
const editarSin = document.getElementById("editar-sin");
const editarCopiar = document.getElementById("editar-copiar");
const editarPegar = document.getElementById("editar-pegar");
const editarDeshacer = document.getElementById("editar-deshacer");
const editarRehacer = document.getElementById("editar-rehacer");
const editarSalir = document.getElementById("editar-salir");
const editarGuardar = document.getElementById("editar-guardar");

// Ventana para elegir un acorde
const dialogoAcorde = document.getElementById("dialogo-acorde");
const tituloDialogoAcorde = document.getElementById("titulo-dialogo-acorde");
const ayudaDialogoAcorde = document.getElementById("ayuda-dialogo-acorde");
const previaDiagrama = document.getElementById("previa-diagrama");
const previaNombre = document.getElementById("previa-nombre");
const selectorRaiz = document.getElementById("selector-raiz");
const selectorTipo = document.getElementById("selector-tipo");
const selectorBajo = document.getElementById("selector-bajo");
const acordeCancelar = document.getElementById("acorde-cancelar");
const acordeConfirmar = document.getElementById("acorde-confirmar");

// Copia profunda de una lista de tramos (para el historial).
const copiarTramos = (lista) => lista.map((t) => ({ inicio: t.inicio, fin: t.fin, acorde: t.acorde }));

const hayCambiosSinGuardar = () => editando && JSON.stringify(acordes) !== JSON.stringify(acordesGuardados);

/* ------------------------------------------------------------------
   Entrar y salir del modo edición
   ------------------------------------------------------------------ */

function empezarEdicion() {
  if (idActual === null || editando) return;
  audio.pause();
  aplicarVista("pulsos");              // se edita sobre la tira de pulsos
  editando = true;
  acordesGuardados = copiarTramos(acordes);
  historialDeshacer = [];
  historialRehacer = [];
  seleccion = null;
  pantallaReproductor.classList.add("editando");
  mostrarVelocidadEdicion();
  mostrarEstadoEditor();
}

// Sale del editor sin preguntar. Si quedaban cambios sin guardar, se descartan.
function terminarEdicion() {
  if (!editando) return;
  if (hayCambiosSinGuardar()) {
    acordes = copiarTramos(acordesGuardados);
    refrescarDespuesDeEditar();
  }
  editando = false;
  seleccion = null;
  pantallaReproductor.classList.remove("editando");
  marcarSeleccion();
}

// Antes de salir (del editor o del reproductor): si hay cambios sin guardar, pregunta.
// Devuelve false si el usuario prefiere quedarse.
function puedeSalirDelEditor() {
  if (hayCambiosSinGuardar()
      && !confirm("Hay cambios sin guardar en los acordes.\n¿Salir y descartarlos?")) {
    return false;
  }
  terminarEdicion();
  return true;
}

// Velocidad dentro del editor: usa la misma función que el panel "Más"
// (cambiarVelocidad, en app.js), así se guarda igual por canción.
const edicionVelMenos = document.getElementById("edicion-vel-menos");
const edicionVelMas = document.getElementById("edicion-vel-mas");
const edicionVel = document.getElementById("edicion-vel");

function mostrarVelocidadEdicion() {
  edicionVel.textContent = textoVelocidad(audio.playbackRate);
  edicionVelMenos.disabled = audio.playbackRate <= VELOCIDADES[0];
  edicionVelMas.disabled = audio.playbackRate >= VELOCIDADES[VELOCIDADES.length - 1];
}
edicionVelMenos.addEventListener("click", () => { cambiarVelocidad(-1); mostrarVelocidadEdicion(); });
edicionVelMas.addEventListener("click", () => { cambiarVelocidad(+1); mostrarVelocidadEdicion(); });
audio.addEventListener("ratechange", mostrarVelocidadEdicion);

// El botón está en el panel "Más": lo cerramos y entramos al editor.
botonEditar.addEventListener("click", () => {
  panelOpciones.close();
  empezarEdicion();
});
editarSalir.addEventListener("click", puedeSalirDelEditor);

/* ------------------------------------------------------------------
   Selección de pulsos en la tira (tocar o arrastrar)

   Usamos "pointer events", que funcionan igual con el dedo y con el
   mouse. En modo edición la tira no se desplaza con el dedo (CSS
   touch-action: none) para poder arrastrar; si el dedo llega a un borde,
   la tira se corre sola. Para ir a otra parte de la canción se usan el
   play y la barra de tiempo, que siguen visibles: se escucha, se pausa
   donde hace falta y la tira queda en ese lugar. Al empezar a elegir
   pulsos, la canción se pausa sola.
   ------------------------------------------------------------------ */

let arrastreDesde = null;   // pulso donde empezó el arrastre

function pulsoBajoElDedo(evento) {
  const elemento = document.elementFromPoint(evento.clientX, evento.clientY);
  const celda = elemento && elemento.closest(".pulso");
  return celda && tira.contains(celda) ? Number(celda.dataset.indice) : null;
}

tira.addEventListener("pointerdown", (evento) => {
  if (!editando) return;
  const indice = pulsoBajoElDedo(evento);
  if (indice === null) return;
  evento.preventDefault();
  // Si estaba sonando (para escuchar dónde editar), se pausa al empezar a elegir.
  if (!audio.paused) audio.pause();
  arrastreDesde = indice;
  seleccion = { desde: indice, hasta: indice };
  // "Capturar" el dedo: los movimientos siguen llegando aunque salga de la tira.
  try {
    tira.setPointerCapture(evento.pointerId);
  } catch {
    // si el navegador no lo permite, la selección funciona igual
  }
  mostrarEstadoEditor();
});

tira.addEventListener("pointermove", (evento) => {
  if (!editando || arrastreDesde === null) return;
  // Cerca de los bordes, la tira se corre para poder seguir eligiendo.
  const caja = tira.getBoundingClientRect();
  if (evento.clientX < caja.left + 40) tira.scrollLeft -= 16;
  if (evento.clientX > caja.right - 40) tira.scrollLeft += 16;

  const indice = pulsoBajoElDedo(evento);
  if (indice === null) return;
  seleccion = { desde: Math.min(arrastreDesde, indice), hasta: Math.max(arrastreDesde, indice) };
  mostrarEstadoEditor();
});

const terminarArrastre = () => { arrastreDesde = null; };
tira.addEventListener("pointerup", terminarArrastre);
tira.addEventListener("pointercancel", terminarArrastre);

// Pinta los pulsos elegidos. Se llama también desde dibujarTira (app.js).
function marcarSeleccion() {
  for (const celda of tira.querySelectorAll(".seleccionado")) celda.classList.remove("seleccionado");
  if (!editando || !seleccion) return;
  for (let i = seleccion.desde; i <= seleccion.hasta; i++) {
    const celda = tira.children[i];
    if (celda) celda.classList.add("seleccionado");
  }
}

// Texto de la selección y botones habilitados según lo que se puede hacer.
function mostrarEstadoEditor() {
  marcarSeleccion();
  const hay = seleccion !== null;
  if (hay) {
    const cantidad = seleccion.hasta - seleccion.desde + 1;
    const nombres = [...new Set(acordePorPulso.slice(seleccion.desde, seleccion.hasta + 1))]
      .map(nombreParaMostrar).join(", ");
    const pulsosTexto = cantidad === 1 ? `Pulso ${seleccion.desde + 1}` : `Pulsos ${seleccion.desde + 1} a ${seleccion.hasta + 1} (${cantidad})`;
    textoSeleccion.textContent = `${pulsosTexto} · ${nombres}`;
  } else {
    textoSeleccion.textContent = "Tocá un pulso o arrastrá para elegir varios.";
  }
  for (const boton of [editarCambiar, editarPaso, editarSin, editarCopiar]) boton.disabled = !hay;
  editarPegar.disabled = !hay || !portapapeles;
  editarDeshacer.disabled = historialDeshacer.length === 0;
  editarRehacer.disabled = historialRehacer.length === 0;
  editarGuardar.disabled = !hayCambiosSinGuardar();
}

/* ------------------------------------------------------------------
   Operaciones sobre la lista de tramos { inicio, fin, acorde }
   ------------------------------------------------------------------ */

// Tiempo en que empieza / termina un pulso. El primero empieza en 0:00 (así
// se puede editar también la intro antes del primer pulso) y el último
// termina al final de la canción.
function inicioDePulso(i) {
  return i === 0 ? 0 : pulsos[i];
}

function finDePulso(i) {
  if (i + 1 < pulsos.length) return pulsos[i + 1];
  const finAcordes = acordes.length ? acordes[acordes.length - 1].fin : 0;
  return Math.max(finAcordes, isFinite(audio.duration) ? audio.duration : 0, pulsos[i]);
}

// Une tramos seguidos con el mismo acorde y saca los que quedaron sin duración.
function unirTramos(lista) {
  const resultado = [];
  for (const tramo of lista) {
    if (tramo.fin - tramo.inicio < 0.001) continue;
    const anterior = resultado[resultado.length - 1];
    if (anterior && anterior.acorde === tramo.acorde && Math.abs(anterior.fin - tramo.inicio) < 0.001) {
      anterior.fin = tramo.fin;
    } else {
      resultado.push({ ...tramo });
    }
  }
  return resultado;
}

// Pone "acorde" entre t0 y t1: corta los tramos que quedan en el borde y
// reemplaza lo de adentro. Lo que está afuera queda igual.
function ponerAcordeEntre(lista, t0, t1, acorde) {
  const resultado = [];
  for (const tramo of lista) {
    if (tramo.fin <= t0 || tramo.inicio >= t1) {
      resultado.push({ ...tramo });
      continue;
    }
    if (tramo.inicio < t0) resultado.push({ inicio: tramo.inicio, fin: t0, acorde: tramo.acorde });
    if (tramo.fin > t1) resultado.push({ inicio: t1, fin: tramo.fin, acorde: tramo.acorde });
  }
  resultado.push({ inicio: t0, fin: t1, acorde });
  resultado.sort((a, b) => a.inicio - b.inicio);
  return unirTramos(resultado);
}

// Cambia el acorde de TODOS los tramos que toca el rango (enteros, no solo la parte elegida).
function cambiarAcordeDeTramos(lista, t0, t1, acorde) {
  return unirTramos(lista.map((tramo) => (tramo.fin > t0 && tramo.inicio < t1 ? { ...tramo, acorde } : { ...tramo })));
}

// Aplica un cambio guardando el estado anterior para poder deshacerlo.
function aplicarCambio(nuevosAcordes) {
  historialDeshacer.push(copiarTramos(acordes));
  historialRehacer = [];
  acordes = nuevosAcordes;
  refrescarDespuesDeEditar();
}

// Redibuja todo lo que depende de los acordes.
function refrescarDespuesDeEditar() {
  calcularAcordesPorPulso();
  const desplazamiento = tira.scrollLeft;
  dibujarTira();
  tira.scrollLeft = desplazamiento;
  dibujarLista();
  indiceActual = -1;
  indicePulso = -1;
  actualizar();
  mostrarDiagramas();
  if (editando) mostrarEstadoEditor();
}

/* ------------------------------------------------------------------
   Botones de edición
   ------------------------------------------------------------------ */

// Pasa un acorde elegido en pantalla (forma, con transporte/cejilla/afinación)
// al tono real de la canción, escrito según su tonalidad.
function aTonoReal(acordeEnPantalla) {
  if (acordeEnPantalla === "N") return "N";
  return transportarAcorde(acordeEnPantalla, -desplazamientoForma(), tonalidadOriginal);
}

editarCambiar.addEventListener("click", () => {
  const { desde, hasta } = seleccion;
  elegirAcorde("Cambiar acorde",
    "Cambia el acorde completo de los tramos que tocan los pulsos elegidos.",
    formaDe(acordePorPulso[desde]), (elegido) => {
      aplicarCambio(cambiarAcordeDeTramos(acordes, inicioDePulso(desde), finDePulso(hasta), aTonoReal(elegido)));
    });
});

editarPaso.addEventListener("click", () => {
  const { desde, hasta } = seleccion;
  elegirAcorde("Acorde de paso",
    "Dura solo los pulsos elegidos; el resto de la canción queda igual.",
    formaDe(acordePorPulso[desde]), (elegido) => {
      aplicarCambio(ponerAcordeEntre(acordes, inicioDePulso(desde), finDePulso(hasta), aTonoReal(elegido)));
    });
});

editarSin.addEventListener("click", () => {
  const { desde, hasta } = seleccion;
  aplicarCambio(ponerAcordeEntre(acordes, inicioDePulso(desde), finDePulso(hasta), "N"));
});

editarCopiar.addEventListener("click", () => {
  portapapeles = acordePorPulso.slice(seleccion.desde, seleccion.hasta + 1);
  const cantidad = portapapeles.length;
  mostrarMensaje(`Copiado${cantidad === 1 ? " 1 pulso" : `s ${cantidad} pulsos`}: elegí dónde pegar`);
  mostrarEstadoEditor();
});

// Pega lo copiado a partir del primer pulso elegido, pulso por pulso.
editarPegar.addEventListener("click", () => {
  let nuevos = copiarTramos(acordes);
  const desde = seleccion.desde;
  portapapeles.forEach((acorde, m) => {
    const i = desde + m;
    if (i < pulsos.length) nuevos = ponerAcordeEntre(nuevos, inicioDePulso(i), finDePulso(i), acorde);
  });
  aplicarCambio(nuevos);
  // Queda elegido lo que se pegó, para ver qué cambió.
  seleccion = { desde, hasta: Math.min(pulsos.length - 1, desde + portapapeles.length - 1) };
  mostrarEstadoEditor();
});

editarDeshacer.addEventListener("click", () => {
  if (!historialDeshacer.length) return;
  historialRehacer.push(copiarTramos(acordes));
  acordes = historialDeshacer.pop();
  refrescarDespuesDeEditar();
});

editarRehacer.addEventListener("click", () => {
  if (!historialRehacer.length) return;
  historialDeshacer.push(copiarTramos(acordes));
  acordes = historialRehacer.pop();
  refrescarDespuesDeEditar();
});

// Guardar: la primera vez que se edita una canción, se guarda también una
// copia del análisis original, para poder restaurarlo.
editarGuardar.addEventListener("click", async () => {
  try {
    const guardada = await obtenerCancion(idActual);
    const originales = guardada.acordesOriginales || guardada.acordes;
    await actualizarCancion(idActual, { acordes: copiarTramos(acordes), acordesOriginales: originales, editada: true });
    cancionActual = { ...cancionActual, acordes: copiarTramos(acordes), acordesOriginales: originales, editada: true };
  } catch (error) {
    alert("No pude guardar los cambios: " + error.message);
    return;
  }
  acordesGuardados = copiarTramos(acordes);
  mostrarEstadoEditor();
  mostrarOpcionesCancion();
  mostrarMensaje("Cambios guardados");
});

/* ------------------------------------------------------------------
   Ventana para elegir un acorde (raíz + tipo + bajo opcional)

   Muestra el nombre y el diagrama ANTES de confirmar. Los nombres se ven
   como en pantalla (con transporte, cejilla y afinación aplicados).
   ------------------------------------------------------------------ */

let eleccion = { raiz: 0, tipo: "", bajo: null };
let alConfirmarAcorde = null;

// Nombres de las notas como se ven en pantalla (sostenidos o bemoles según la tonalidad).
const nombresEnPantalla = () => nombresDeNotas(moverTonalidad(tonalidadOriginal, desplazamientoForma()));

function nombreElegido() {
  const nombres = nombresEnPantalla();
  const bajo = eleccion.bajo === null ? "" : "/" + nombres[eleccion.bajo];
  return nombres[eleccion.raiz] + eleccion.tipo + bajo;
}

// Arma los botones de raíz y tipo, y las opciones de bajo.
function armarSelectores() {
  const nombres = nombresEnPantalla();
  selectorRaiz.replaceChildren(...nombres.map((nombre, i) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = nombre;
    boton.addEventListener("click", () => { eleccion.raiz = i; mostrarEleccion(); });
    return boton;
  }));
  selectorTipo.replaceChildren(...TIPOS_DE_ACORDE.map(({ tipo, nombre }) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = nombre;
    boton.dataset.tipo = tipo;
    boton.addEventListener("click", () => { eleccion.tipo = tipo; mostrarEleccion(); });
    return boton;
  }));
  selectorBajo.replaceChildren(new Option("Sin bajo distinto", ""),
    ...nombres.map((nombre, i) => new Option(`Bajo en ${nombre}`, String(i))));
}

selectorBajo.addEventListener("change", () => {
  eleccion.bajo = selectorBajo.value === "" ? null : Number(selectorBajo.value);
  mostrarEleccion();
});

// Marca lo elegido y dibuja la vista previa con el diagrama.
function mostrarEleccion() {
  [...selectorRaiz.children].forEach((b, i) => b.setAttribute("aria-pressed", String(i === eleccion.raiz)));
  [...selectorTipo.children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tipo === eleccion.tipo)));
  selectorBajo.value = eleccion.bajo === null ? "" : String(eleccion.bajo);

  const nombre = nombreElegido();
  previaNombre.textContent = nombre;
  previaDiagrama.replaceChildren();
  const posiciones = posicionesDeAcorde(nombre);
  if (posiciones.length) {
    previaDiagrama.appendChild(dibujarDiagrama(posiciones[0]));
  } else {
    const aviso = document.createElement("small");
    aviso.textContent = "Sin diagrama para este acorde";
    previaDiagrama.appendChild(aviso);
  }
}

// Abre la ventana con un acorde inicial; al confirmar llama a alConfirmar(nombre).
function elegirAcorde(titulo, ayuda, inicial, alConfirmar) {
  tituloDialogoAcorde.textContent = titulo;
  ayudaDialogoAcorde.textContent = ayuda;
  armarSelectores();
  const leido = inicial && inicial !== "N" ? normalizarAcorde(inicial) : null;
  eleccion = leido
    ? { raiz: leido.raiz, tipo: TIPOS_DE_ACORDE.some((t) => t.tipo === leido.tipo) ? leido.tipo : "", bajo: leido.bajo }
    : { raiz: 0, tipo: "", bajo: null };
  alConfirmarAcorde = alConfirmar;
  mostrarEleccion();
  dialogoAcorde.showModal();
}

acordeCancelar.addEventListener("click", () => dialogoAcorde.close());
acordeConfirmar.addEventListener("click", () => {
  dialogoAcorde.close();
  if (alConfirmarAcorde) alConfirmarAcorde(nombreElegido());
});

/* ------------------------------------------------------------------
   Opciones de la canción en el panel "Más": exportar y restaurar
   ------------------------------------------------------------------ */

const botonExportar = document.getElementById("boton-exportar");
const botonRestaurar = document.getElementById("boton-restaurar");

// "Restaurar análisis original" solo aparece si la canción fue editada.
// Con los acordes de la tablatura, vuelve a los que se calcularon de ella.
function mostrarOpcionesCancion() {
  botonRestaurar.hidden = !(cancionActual && cancionActual.editada && cancionActual.acordesOriginales);
  botonRestaurar.textContent = fuenteDe(cancionActual) === "tablatura" ? "Restaurar acordes de la tablatura" : "Restaurar análisis original";
}

// Baja un JSON con la canción (acordes editados incluidos). Tiene el mismo
// formato que el del analizador, más el análisis original y las opciones,
// así se puede cargar en otro celular o en otra compu con "Agregar canción".
botonExportar.addEventListener("click", async () => {
  if (idActual === null) return;
  const c = await obtenerCancion(idActual);
  const datos = {
    cancion: c.nombre,
    tempo: c.tempo,
    tonalidad: c.tonalidad,
    acordes: c.acordes,
    pulsos: c.pulsos,
    compases: c.compases,
    // Solo si fue editada: el análisis original, para poder restaurarlo.
    acordesOriginales: c.editada ? c.acordesOriginales : undefined,
    editada: c.editada || undefined,
    // Preferencias de esta canción
    ajuste: c.ajuste, velocidad: c.velocidad,
    transporte: c.transporte, cejilla: c.cejilla, afinacion: c.afinacion,
    // Partes de la canción (Intro, Estrofa, Estribillo...)
    partes: Array.isArray(c.partes) && c.partes.length ? c.partes : undefined,
  };
  const archivo = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = c.nombre.replace(/[\\/:*?"<>|]/g, "-") + ".json";   // sin caracteres prohibidos en nombres de archivo
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 2000);
});

botonRestaurar.addEventListener("click", async () => {
  const deTablatura = fuenteDe(cancionActual) === "tablatura";
  const pregunta = deTablatura
    ? "¿Volver a los acordes que salieron de la tablatura?\nSe pierden las correcciones hechas a mano."
    : "¿Volver a los acordes del análisis original?\nSe pierden las correcciones hechas a mano.";
  if (!confirm(pregunta)) return;
  terminarEdicion();
  try {
    const c = await obtenerCancion(idActual);
    await actualizarCancion(idActual, { acordes: c.acordesOriginales, acordesOriginales: null, editada: false });
  } catch (error) {
    alert("No pude restaurar el análisis: " + error.message);
    return;
  }
  panelOpciones.close();
  await cargarCancion(idActual);
  mostrarMensaje(deTablatura ? "Acordes de la tablatura restaurados" : "Análisis original restaurado");
});
