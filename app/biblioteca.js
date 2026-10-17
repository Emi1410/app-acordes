"use strict";

/* ==================================================================
   Biblioteca de canciones guardada en el celular (IndexedDB)

   IndexedDB es una base de datos que trae el navegador. A diferencia de
   localStorage, puede guardar archivos grandes como los mp3.

   Usamos dos "almacenes" (como dos tablas):
     - "canciones": los datos de cada canción (nombre, tonalidad, tempo,
       acordes, ajuste de sincronización, tamaño). Es liviano.
     - "audios":    el mp3 de cada canción, con el mismo id.
   Separarlos permite mostrar la lista y guardar el ajuste sin tener que
   leer ni reescribir los mp3, que pesan varios MB.
   ================================================================== */

const NOMBRE_BASE = "app-acordes";
const VERSION_BASE = 1;

// Abrimos la base una sola vez y reutilizamos la conexión.
let promesaBase = null;

function abrirBase() {
  if (!promesaBase) {
    promesaBase = new Promise((resolver, rechazar) => {
      const pedido = indexedDB.open(NOMBRE_BASE, VERSION_BASE);

      // Se ejecuta solo la primera vez (o al subir VERSION_BASE): crea los almacenes.
      pedido.onupgradeneeded = () => {
        const base = pedido.result;
        base.createObjectStore("canciones", { keyPath: "id", autoIncrement: true });
        base.createObjectStore("audios", { keyPath: "id" });
      };
      pedido.onsuccess = () => resolver(pedido.result);
      pedido.onerror = () => rechazar(pedido.error);
    });
  }
  return promesaBase;
}

/**
 * Ejecuta "trabajo" dentro de una transacción y espera a que termine.
 * Una transacción es un grupo de operaciones que se guardan todas juntas
 * o ninguna (por ejemplo, no puede quedar una canción sin su mp3).
 * "trabajo" recibe la transacción y puede devolver un pedido; la promesa
 * se resuelve con el resultado de ese pedido.
 */
async function transaccion(almacenes, modo, trabajo) {
  const base = await abrirBase();
  return new Promise((resolver, rechazar) => {
    const tx = base.transaction(almacenes, modo);
    let resultado;
    const pedido = trabajo(tx);
    if (pedido) pedido.addEventListener("success", () => { resultado = pedido.result; });
    tx.oncomplete = () => resolver(resultado);
    tx.onerror = () => rechazar(tx.error);
    tx.onabort = () => rechazar(tx.error);
  });
}

/** Guarda una canción nueva con su mp3. Devuelve el id que le asignó la base. */
function guardarCancion(datos, mp3) {
  return transaccion(["canciones", "audios"], "readwrite", (tx) => {
    const pedido = tx.objectStore("canciones").add(datos);
    // Cuando la base le da un id a la canción, guardamos el mp3 con ese mismo id.
    pedido.addEventListener("success", () => {
      tx.objectStore("audios").put({ id: pedido.result, mp3 });
    });
    return pedido;
  });
}

/** Todas las canciones (sin los mp3), ordenadas por nombre. */
async function listarCanciones() {
  const canciones = await transaccion(["canciones"], "readonly",
    (tx) => tx.objectStore("canciones").getAll());
  return canciones.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/** Los datos de una canción. */
function obtenerCancion(id) {
  return transaccion(["canciones"], "readonly", (tx) => tx.objectStore("canciones").get(id));
}

/** El mp3 de una canción (un Blob, que el reproductor puede abrir). */
async function obtenerAudio(id) {
  const registro = await transaccion(["audios"], "readonly", (tx) => tx.objectStore("audios").get(id));
  return registro ? registro.mp3 : null;
}

/** Borra la canción y su mp3 juntos. */
function borrarCancion(id) {
  return transaccion(["canciones", "audios"], "readwrite", (tx) => {
    tx.objectStore("canciones").delete(id);
    tx.objectStore("audios").delete(id);
  });
}

/** Guarda el ajuste de sincronización de una canción. */
function guardarAjuste(id, ajuste) {
  return transaccion(["canciones"], "readwrite", (tx) => {
    const almacen = tx.objectStore("canciones");
    const pedido = almacen.get(id);
    pedido.addEventListener("success", () => {
      if (pedido.result) almacen.put({ ...pedido.result, ajuste });
    });
  });
}

/* ==================================================================
   Almacenamiento persistente y espacio usado
   ================================================================== */

/**
 * Le pide al navegador que no borre nuestros datos cuando falte memoria.
 * Chrome decide solo si lo concede (suele hacerlo si la app está en la
 * pantalla de inicio o se usa seguido). Devuelve true si quedó persistente.
 */
async function pedirPersistencia() {
  if (!navigator.storage || !navigator.storage.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** ¿El almacenamiento ya es persistente? (null si el navegador no lo informa) */
async function esPersistente() {
  if (!navigator.storage || !navigator.storage.persisted) return null;
  try {
    return await navigator.storage.persisted();
  } catch {
    return null;
  }
}

/** Espacio libre aproximado que el navegador le deja a la app (null si no lo informa). */
async function espacioDisponible() {
  if (!navigator.storage || !navigator.storage.estimate) return null;
  try {
    const { quota, usage } = await navigator.storage.estimate();
    return quota - usage;
  } catch {
    return null;
  }
}

/* ==================================================================
   Validación del JSON del analizador
   ================================================================== */

/**
 * Revisa que los datos tengan el formato que genera analizar.py.
 * Devuelve un mensaje explicando el problema, o null si está todo bien.
 */
function validarDatosCancion(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return "El archivo no tiene el formato de acordes del analizador.";
  }
  if (!Array.isArray(datos.acordes)) {
    return "Al JSON le falta la lista \"acordes\". ¿Es el archivo que generó el analizador?";
  }
  if (datos.acordes.length === 0) {
    return "La lista de acordes está vacía.";
  }
  for (let i = 0; i < datos.acordes.length; i++) {
    const tramo = datos.acordes[i];
    const valido = tramo
      && typeof tramo.inicio === "number"
      && typeof tramo.fin === "number"
      && typeof tramo.acorde === "string"
      && tramo.fin >= tramo.inicio;
    if (!valido) {
      return `El acorde número ${i + 1} no tiene "inicio", "fin" y "acorde" válidos.`;
    }
    if (i > 0 && tramo.inicio < datos.acordes[i - 1].inicio) {
      return `Los acordes no están ordenados por tiempo (fijate el número ${i + 1}).`;
    }
  }
  if (datos.tempo !== undefined && typeof datos.tempo !== "number") {
    return "El \"tempo\" del JSON tiene que ser un número.";
  }
  return null;
}
