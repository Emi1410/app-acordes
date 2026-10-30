"use strict";

/* ==================================================================
   Biblioteca de canciones guardada en el celular (IndexedDB)

   IndexedDB es una base de datos que trae el navegador. A diferencia de
   localStorage, puede guardar archivos grandes como los mp3.

   Usamos tres "almacenes" (como tres tablas):
     - "canciones": los datos de cada canción (nombre, tonalidad, tempo,
       acordes, ajuste de sincronización, tamaño). Es liviano.
     - "audios":    el mp3 de cada canción, con el mismo id.
     - "listas":    las listas de canciones. Cada una guarda su nombre y
       los ids de sus canciones EN ORDEN (la primera es la de arriba).
       Una canción puede estar en varias listas: solo se repite su id,
       el mp3 se guarda una sola vez.
   Separar canciones y audios permite mostrar la lista y guardar el ajuste
   sin tener que leer ni reescribir los mp3, que pesan varios MB.
   ================================================================== */

const NOMBRE_BASE = "app-acordes";

// Versión de la ESTRUCTURA de la base (no de la app). Historial:
//   1: almacenes "canciones" y "audios".
//   2: se agrega el almacén "listas".
//   3: se agrega el almacén "tablaturas" (archivos de Guitar Pro, uno por canción).
// Al subirla, el navegador ejecuta onupgradeneeded en los celulares que
// tenían una versión anterior. Ahí solo se AGREGA lo nuevo: nunca se
// borran ni se tocan los almacenes que ya existen, así no se pierde nada.
const VERSION_BASE = 3;

// Abrimos la base una sola vez y reutilizamos la conexión.
let promesaBase = null;

function abrirBase() {
  if (!promesaBase) {
    promesaBase = new Promise((resolver, rechazar) => {
      const pedido = indexedDB.open(NOMBRE_BASE, VERSION_BASE);

      // Se ejecuta la primera vez (versión 0) o cuando la base guardada es
      // más vieja que VERSION_BASE. "oldVersion" dice desde cuál venimos y
      // cada paso agrega solo lo que falta.
      pedido.onupgradeneeded = (evento) => {
        const base = pedido.result;
        if (evento.oldVersion < 1) {
          base.createObjectStore("canciones", { keyPath: "id", autoIncrement: true });
          base.createObjectStore("audios", { keyPath: "id" });
        }
        if (evento.oldVersion < 2) {
          base.createObjectStore("listas", { keyPath: "id", autoIncrement: true });
        }
        if (evento.oldVersion < 3) {
          // { id (el de la canción), archivo: Blob, nombre: "Tema.gp" }
          base.createObjectStore("tablaturas", { keyPath: "id" });
        }
      };
      pedido.onsuccess = () => {
        const base = pedido.result;
        // Si en el futuro otra pestaña con una versión más nueva necesita
        // actualizar la base, cerramos esta conexión para no trabarla.
        base.onversionchange = () => base.close();
        resolver(base);
      };
      pedido.onerror = () => {
        promesaBase = null;   // así se puede reintentar
        rechazar(pedido.error);
      };
      // La actualización espera a que se cierren otras pestañas con la app vieja.
      pedido.onblocked = () => {
        promesaBase = null;
        rechazar(new Error("Cerrá las otras pestañas de la app y volvé a abrirla para terminar de actualizarla."));
      };
    });
  }
  return promesaBase;
}

/**
 * Pasa un texto a una forma "comparable": sin tildes, en minúsculas y con
 * un solo espacio entre palabras. "  Cómo  UN Diamante" -> "como un diamante".
 * Se usa para buscar canciones y para reconocer listas con el mismo nombre.
 */
function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")                    // separa cada letra de su tilde
    .replace(/[̀-ͯ]/g, "")     // y borra las tildes
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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

/**
 * Guarda una canción nueva con su mp3. Si se indica "nombreLista", la
 * agrega también a esa lista (creándola si no existe). Todo en una sola
 * transacción: o se guarda completo o no se guarda nada.
 * Devuelve el id que le asignó la base.
 */
function guardarCancion(datos, mp3, nombreLista = "") {
  return transaccion(["canciones", "audios", "listas"], "readwrite", (tx) => {
    const pedido = tx.objectStore("canciones").add(datos);
    // Cuando la base le da un id a la canción, guardamos el mp3 con ese mismo id.
    pedido.addEventListener("success", () => {
      tx.objectStore("audios").put({ id: pedido.result, mp3 });
      if (nombreLista.trim()) ponerPrimeraEnLista(tx, nombreLista, pedido.result);
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

/** Borra la canción, su mp3 y su tablatura juntos, y la saca de todas las listas. */
function borrarCancion(id) {
  return transaccion(["canciones", "audios", "listas", "tablaturas"], "readwrite", (tx) => {
    tx.objectStore("canciones").delete(id);
    tx.objectStore("audios").delete(id);
    tx.objectStore("tablaturas").delete(id);
    const listas = tx.objectStore("listas");
    const pedido = listas.getAll();
    pedido.addEventListener("success", () => {
      for (const lista of pedido.result) {
        if (lista.canciones.includes(id)) {
          listas.put({ ...lista, canciones: lista.canciones.filter((c) => c !== id) });
        }
      }
    });
  });
}

/* ==================================================================
   Listas de canciones

   Cada lista es { id, nombre, canciones: [id1, id2, ...] }. El array
   "canciones" guarda el ORDEN: la posición 0 es la de arriba. Ese orden
   sirve para mostrarla y, más adelante, para pasar a la siguiente canción.
   Dos listas no pueden llamarse igual (sin contar mayúsculas ni tildes):
   "favoritos" y "Favoritos" son la misma lista.
   ================================================================== */

/** Todas las listas, ordenadas por nombre. */
async function listarListas() {
  const listas = await transaccion(["listas"], "readonly", (tx) => tx.objectStore("listas").getAll());
  return listas.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/**
 * Dentro de una transacción abierta: busca la lista por nombre y pone la
 * canción en la primera posición (si ya estaba, la sube arriba de todo).
 * Si la lista no existe, la crea con esa canción.
 */
function ponerPrimeraEnLista(tx, nombreLista, idCancion) {
  const almacen = tx.objectStore("listas");
  const nombre = nombreLista.replace(/\s+/g, " ").trim();
  const pedido = almacen.getAll();
  pedido.addEventListener("success", () => {
    const existente = pedido.result.find((l) => normalizarTexto(l.nombre) === normalizarTexto(nombre));
    if (existente) {
      const resto = existente.canciones.filter((c) => c !== idCancion);
      almacen.put({ ...existente, canciones: [idCancion, ...resto] });
    } else {
      almacen.add({ nombre, canciones: [idCancion] });
    }
  });
}

/** Agrega una canción ya guardada a una lista (la crea si no existe). */
function agregarALista(nombreLista, idCancion) {
  return transaccion(["listas"], "readwrite", (tx) => {
    ponerPrimeraEnLista(tx, nombreLista, idCancion);
  });
}

/**
 * Guarda un orden nuevo para una lista (por ejemplo, después de arrastrar
 * una canción). "ids" tiene que tener exactamente las mismas canciones que
 * la lista: si no coincide (porque algo cambió mientras tanto), no se toca.
 */
function ordenarLista(idLista, ids) {
  return transaccion(["listas"], "readwrite", (tx) => {
    const almacen = tx.objectStore("listas");
    const pedido = almacen.get(idLista);
    pedido.addEventListener("success", () => {
      const lista = pedido.result;
      if (!lista) return;
      const mismas = ids.length === lista.canciones.length
        && [...ids].sort((a, b) => a - b).join() === [...lista.canciones].sort((a, b) => a - b).join();
      if (mismas) almacen.put({ ...lista, canciones: ids });
    });
  });
}

/** Saca una canción de una lista. La canción sigue en la biblioteca. */
function sacarDeLista(idLista, idCancion) {
  return transaccion(["listas"], "readwrite", (tx) => {
    const almacen = tx.objectStore("listas");
    const pedido = almacen.get(idLista);
    pedido.addEventListener("success", () => {
      const lista = pedido.result;
      if (lista) almacen.put({ ...lista, canciones: lista.canciones.filter((c) => c !== idCancion) });
    });
  });
}

/**
 * Cambia el nombre de una lista. Si ya hay OTRA lista con ese nombre,
 * no cambia nada y avisa con un error.
 */
async function renombrarLista(idLista, nuevoNombre) {
  const nombre = nuevoNombre.replace(/\s+/g, " ").trim();
  if (!nombre) throw new Error("El nombre de la lista no puede quedar vacío.");
  let repetido = false;
  await transaccion(["listas"], "readwrite", (tx) => {
    const almacen = tx.objectStore("listas");
    const pedido = almacen.getAll();
    pedido.addEventListener("success", () => {
      repetido = pedido.result.some((l) => l.id !== idLista
        && normalizarTexto(l.nombre) === normalizarTexto(nombre));
      const lista = pedido.result.find((l) => l.id === idLista);
      if (!repetido && lista) almacen.put({ ...lista, nombre });
    });
  });
  if (repetido) throw new Error(`Ya hay una lista que se llama "${nombre}".`);
}

/** Borra una lista. Sus canciones siguen en la biblioteca. */
function borrarLista(idLista) {
  return transaccion(["listas"], "readwrite", (tx) => {
    tx.objectStore("listas").delete(idLista);
  });
}

/**
 * Cambia algunos datos de una canción sin tocar el resto.
 * Por ejemplo: actualizarCancion(3, { velocidad: 0.75 }).
 */
function actualizarCancion(id, cambios) {
  return transaccion(["canciones"], "readwrite", (tx) => {
    const almacen = tx.objectStore("canciones");
    const pedido = almacen.get(id);
    pedido.addEventListener("success", () => {
      if (pedido.result) almacen.put({ ...pedido.result, ...cambios });
    });
  });
}

/* ==================================================================
   Tablaturas (archivos de Guitar Pro) de cada canción
   ================================================================== */

/** Guarda (o reemplaza) la tablatura de una canción. */
function guardarTablatura(id, archivo, nombre) {
  return transaccion(["tablaturas"], "readwrite", (tx) => {
    tx.objectStore("tablaturas").put({ id, archivo, nombre });
  });
}

/** La tablatura de una canción: { id, archivo, nombre }, o undefined si no tiene. */
function obtenerTablatura(id) {
  return transaccion(["tablaturas"], "readonly", (tx) => tx.objectStore("tablaturas").get(id));
}

/** Guarda el ajuste de sincronización de una canción. */
function guardarAjuste(id, ajuste) {
  return actualizarCancion(id, { ajuste });
}

/* ==================================================================
   Dos juegos de acordes: el del análisis del audio y el de la tablatura

   Cada juego tiene sus acordes (con sus correcciones a mano), sus pulsos
   y compases y su ajuste de sincronización. El que se está usando va en
   los campos de siempre de la canción (acordes, acordesOriginales,
   editada, pulsos, compases, ajuste): así el editor, la tira, el
   metrónomo y "Exportar JSON" funcionan igual con cualquiera de los dos.
   El otro queda guardado en "juegosAcordes", y "fuenteAcordes" dice cuál
   se usa ("analisis", o "tablatura"; las canciones viejas no lo tienen y
   usan el análisis).
   ================================================================== */

const CAMPOS_JUEGO = ["acordes", "acordesOriginales", "editada", "pulsos", "compases", "ajuste", "infoJuego"];

function fuenteDe(cancion) {
  return cancion && cancion.fuenteAcordes === "tablatura" ? "tablatura" : "analisis";
}

/** El juego de acordes de una canción para una fuente, o null si no lo tiene. */
function juegoDe(cancion, fuente) {
  if (!cancion) return null;
  if (fuenteDe(cancion) === fuente) {
    return Object.fromEntries(CAMPOS_JUEGO.map((campo) => [campo, cancion[campo]]));
  }
  const guardados = cancion.juegosAcordes || {};
  return guardados[fuente] || null;
}

// Devuelve la canción con "juego" puesto en la fuente indicada (sin tocar el otro).
function conJuego(cancion, fuente, juego) {
  if (fuenteDe(cancion) === fuente) {
    const activos = Object.fromEntries(CAMPOS_JUEGO.map((campo) => [campo, juego[campo] ?? null]));
    return { ...cancion, ...activos };
  }
  return { ...cancion, juegosAcordes: { ...(cancion.juegosAcordes || {}), [fuente]: juego } };
}

/**
 * Guarda el juego de acordes de una fuente. Si es la que se está usando,
 * reemplaza los acordes de la canción; si no, queda guardado aparte.
 * "extra" son otros campos de la canción para guardar en la misma operación.
 * Devuelve la canción como quedó.
 */
function guardarJuegoAcordes(id, fuente, juego, extra = {}) {
  let resultado = null;
  return transaccion(["canciones"], "readwrite", (tx) => {
    const almacen = tx.objectStore("canciones");
    const pedido = almacen.get(id);
    pedido.addEventListener("success", () => {
      if (!pedido.result) return;
      resultado = { ...conJuego(pedido.result, fuente, juego), ...extra };
      almacen.put(resultado);
    });
  }).then(() => resultado);
}

/**
 * Cambia qué juego de acordes se usa ("analisis" o "tablatura"): el que se
 * estaba usando pasa a "juegosAcordes" y el elegido a los campos de siempre.
 * Devuelve la canción como quedó (o como estaba, si no tiene ese juego).
 */
function cambiarFuenteAcordes(id, fuente) {
  let resultado = null;
  return transaccion(["canciones"], "readwrite", (tx) => {
    const almacen = tx.objectStore("canciones");
    const pedido = almacen.get(id);
    pedido.addEventListener("success", () => {
      const cancion = pedido.result;
      if (!cancion) return;
      const actual = fuenteDe(cancion);
      const nuevo = (cancion.juegosAcordes || {})[fuente];
      if (actual === fuente || !nuevo) { resultado = cancion; return; }
      const guardados = { ...(cancion.juegosAcordes || {}), [actual]: juegoDe(cancion, actual) };
      delete guardados[fuente];
      const activos = Object.fromEntries(CAMPOS_JUEGO.map((campo) => [campo, nuevo[campo] ?? null]));
      resultado = { ...cancion, ...activos, juegosAcordes: guardados, fuenteAcordes: fuente };
      almacen.put(resultado);
    });
  }).then(() => resultado);
}

/**
 * Reemplaza el análisis de una canción (al volver a analizarla).
 * Se mantienen el nombre, el ajuste de sincronización y el mp3. Si se están
 * usando los acordes de la tablatura, esos no se tocan: el análisis nuevo
 * queda guardado en su juego.
 */
function actualizarAnalisis(id, { tonalidad, tempo, acordes, pulsos, compases }) {
  return transaccion(["canciones"], "readwrite", (tx) => {
    const almacen = tx.objectStore("canciones");
    const pedido = almacen.get(id);
    pedido.addEventListener("success", () => {
      const cancion = pedido.result;
      if (!cancion) return;
      // Un análisis nuevo reemplaza todo el juego del análisis: también las
      // correcciones a mano y la copia del análisis original que guarda el editor.
      const anterior = juegoDe(cancion, "analisis") || {};
      const juego = { acordes, pulsos, compases, acordesOriginales: null, editada: false, ajuste: anterior.ajuste || 0 };
      almacen.put({
        ...conJuego(cancion, "analisis", juego), tonalidad, tempo,
        pendiente: false,   // ya está analizada (por si se había agregado sin analizar)
      });
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
  const problema = validarTramos(datos.acordes);
  if (problema) return problema;
  // Un JSON exportado de una canción editada trae también el análisis original.
  if (datos.acordesOriginales !== undefined && datos.acordesOriginales !== null) {
    if (!Array.isArray(datos.acordesOriginales) || datos.acordesOriginales.length === 0
        || validarTramos(datos.acordesOriginales)) {
      return "La lista \"acordesOriginales\" del JSON no tiene el formato esperado.";
    }
  }
  if (datos.tempo !== undefined && typeof datos.tempo !== "number") {
    return "El \"tempo\" del JSON tiene que ser un número.";
  }
  // "pulsos" y "compases" son opcionales (los JSON viejos no los tienen),
  // pero si vienen tienen que ser listas de segundos en orden.
  for (const campo of ["pulsos", "compases"]) {
    if (datos[campo] === undefined) continue;
    const lista = datos[campo];
    const valida = Array.isArray(lista)
      && lista.every((t, i) => typeof t === "number" && (i === 0 || t >= lista[i - 1]));
    if (!valida) return `El campo "${campo}" del JSON tiene que ser una lista de segundos en orden.`;
  }
  return null;
}

/** Revisa una lista de tramos { inicio, fin, acorde }. Devuelve el problema o null. */
function validarTramos(acordes) {
  for (let i = 0; i < acordes.length; i++) {
    const tramo = acordes[i];
    const valido = tramo
      && typeof tramo.inicio === "number"
      && typeof tramo.fin === "number"
      && typeof tramo.acorde === "string"
      && tramo.fin >= tramo.inicio;
    if (!valido) {
      return `El acorde número ${i + 1} no tiene "inicio", "fin" y "acorde" válidos.`;
    }
    if (i > 0 && tramo.inicio < acordes[i - 1].inicio) {
      return `Los acordes no están ordenados por tiempo (fijate el número ${i + 1}).`;
    }
  }
  return null;
}

/** Devuelve la lista si es una lista de números, o undefined (para no guardar basura). */
function listaDeTiempos(lista) {
  return Array.isArray(lista) && lista.every((t) => typeof t === "number") ? lista : undefined;
}
