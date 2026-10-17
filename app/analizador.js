"use strict";

/* ==================================================================
   Analizador de acordes en el celular

   Es la traducción a JavaScript de analizador/analizar.py. El trabajo se
   divide en dos partes:

   1. En la página (este archivo, abajo de todo): se decodifica el mp3 con
      la Web Audio API y se baja a 22050 Hz y mono, igual que librosa.load.
   2. En un Web Worker (la función codigoAnalizador): todo el cálculo
      pesado. Un worker corre en otro hilo, así la pantalla no se congela
      mientras analiza, y va avisando el progreso.

   Diferencias con la versión de Python (librosa hace cosas muy pesadas
   para un celular, así que acá usamos versiones más livianas):
     - Cromagrama: librosa usa una transformada CQT. Acá usamos una FFT
       larga (8192 muestras) y repartimos la energía de cada frecuencia
       entre sus dos semitonos más cercanos.
     - Separación armónica/percusiva: librosa separa el audio entero.
       Acá, para el cromagrama, aplicamos un filtro de mediana en el
       tiempo, que borra los golpes cortos (batería) y deja las notas que
       se sostienen. Para los pulsos se usa el audio completo.
   Todo lo demás (tempo, pulsos, tonalidad, plantillas, tercera, séptimas,
   suavizado y tramos) sigue las mismas reglas y números que el de Python.
   ================================================================== */

const FRECUENCIA_ANALISIS = 22050;

/**
 * Código del worker. Está escrito como una función para poder crear el
 * worker desde un "Blob" (ver crearWorkerAnalizador): Chrome no deja
 * crear workers desde archivos cuando la app se abre con doble clic
 * (file://), pero sí desde un Blob. Esta función nunca se ejecuta en la
 * página: su texto se copia al worker.
 */
function codigoAnalizador() {
  "use strict";

  /* ----------------------------------------------------------------
     Configuración (los mismos valores que analizar.py)
     ---------------------------------------------------------------- */
  const SR = 22050;              // frecuencia de muestreo
  const SALTO = 512;             // muestras entre frames (como librosa)
  const N_FFT = 2048;            // tamaño de ventana para los pulsos
  const N_MELS = 128;            // bandas mel para detectar ataques

  const N_FFT_CROMA = 8192;      // ventana larga: distingue bien las notas graves
  const SALTO_CROMA = 1024;      // la mitad de frames que con 512 (más rápido)
  const FMIN_CROMA = 32.70;      // C1, igual que chroma_cqt
  const OCTAVAS_CROMA = 7;
  const MEDIANA_ARMONICA = 15;   // frames (≈0,7 s) del filtro de mediana

  const UMBRAL_SILENCIO = 0.10;
  const MINIMO_PULSOS = 2;
  const UMBRAL_TERCERA_DEBIL = 0.5;
  const MARGEN_TERCERA_AMBIGUA = 0.25;
  const UMBRAL_SEPTIMA = 0.8;
  const MINIMO_PULSOS_SEPTIMA = 4;

  const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const INTERVALOS = { "": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10] };
  const CON_SEPTIMA = { "": "7", "m": "m7" };

  // Perfiles de tonalidad de Krumhansl-Kessler (ver analizar.py).
  const PERFIL_MAYOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const PERFIL_MENOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

  // Acordes propios de cada tonalidad: "semitonos desde la tónica|tipo".
  const ACORDES_MAYOR = new Set(["0|", "2|m", "4|m", "5|", "7|", "9|m"]);
  const ACORDES_MENOR = new Set(["0|m", "3|", "5|m", "7|m", "7|", "8|", "10|"]);

  /* ----------------------------------------------------------------
     Comunicación con la página
     ---------------------------------------------------------------- */

  // Recibe las muestras (22050 Hz, mono) y el nombre; responde con el JSON.
  self.onmessage = (evento) => {
    try {
      const datos = analizar(evento.data.muestras, evento.data.nombre);
      self.postMessage({ tipo: "listo", datos });
    } catch (error) {
      self.postMessage({ tipo: "error", mensaje: error.message || String(error) });
    }
  };

  // Avisa el progreso: "fraccion" va de 0 a 1 dentro del worker.
  function avisar(etapa, fraccion) {
    self.postMessage({ tipo: "progreso", etapa, fraccion });
  }

  /* ----------------------------------------------------------------
     Análisis completo (mismo orden que main() en analizar.py)
     ---------------------------------------------------------------- */
  function analizar(y, nombre) {
    if (y.length < SR) throw new Error("El audio es demasiado corto para analizarlo.");

    avisar("Buscando los pulsos", 0);
    const ataques = envolventeDeAtaques(y, (f) => avisar("Buscando los pulsos", 0.25 * f));
    const tempo = estimarTempo(ataques);
    const pulsos = seguirPulsos(ataques, tempo);
    avisar("Calculando las notas", 0.3);

    const { croma, nFramesCroma } = cromagrama(y, (f) => avisar("Calculando las notas", 0.3 + 0.6 * f));
    avisar("Eligiendo los acordes", 0.92);

    const tonalidad = estimarTonalidad(croma, nFramesCroma);
    const rms = volumenPorFrame(y);
    const { cromaPulsos, rmsPulsos, tiempos } = promediarPorPulso(croma, nFramesCroma, rms, pulsos);

    let acordes = elegirAcordes(cromaPulsos, rmsPulsos, tonalidad);
    acordes = suavizar(acordes);
    const tramos = armarTramos(agregarSeptimas(agrupar(acordes), cromaPulsos), tiempos);

    // Pulsos en segundos y en qué pulsos empieza cada compás.
    const tiemposPulsos = pulsos.map((frame) => frame * SALTO / SR);
    const compases = calcularCompases(tiemposPulsos, tramos);
    avisar("Listo", 1);

    const redondear3 = (x) => Math.round(x * 1000) / 1000;
    return {
      cancion: nombre,
      tempo: Math.round(tempo * 10) / 10,
      tonalidad: NOTAS[tonalidad.tonica] + tonalidad.modo,
      acordes: tramos,
      pulsos: tiemposPulsos.map(redondear3),
      compases: compases.map(redondear3),
    };
  }

  /* ----------------------------------------------------------------
     Compases (calcular_compases en Python)

     Con 4 pulsos por compás hay 4 posibilidades para el primero: que
     empiece en el pulso 0, 1, 2 o 3. Elegimos la que hace que más cambios
     de acorde caigan en el primer tiempo de un compás.
     ---------------------------------------------------------------- */
  function calcularCompases(tiemposPulsos, tramos) {
    const PULSOS_POR_COMPAS = 4;
    if (tiemposPulsos.length === 0) return [];

    // Para cada cambio de acorde, el pulso en el que cae.
    const cambios = [];
    for (const tramo of tramos.slice(1)) {
      let pulso = 0;
      for (let i = 1; i < tiemposPulsos.length; i++) {
        if (Math.abs(tiemposPulsos[i] - tramo.inicio) < Math.abs(tiemposPulsos[pulso] - tramo.inicio)) pulso = i;
      }
      if (Math.abs(tiemposPulsos[pulso] - tramo.inicio) < 0.05) cambios.push(pulso);
    }

    let mejor = 0, mejorPuntaje = -1;
    for (let desfasaje = 0; desfasaje < PULSOS_POR_COMPAS; desfasaje++) {
      const puntaje = cambios.filter((p) => (p - desfasaje) % PULSOS_POR_COMPAS === 0).length;
      if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = desfasaje; }   // si empatan, el primero
    }
    return tiemposPulsos.filter((_, i) => i >= mejor && (i - mejor) % PULSOS_POR_COMPAS === 0);
  }

  /* ----------------------------------------------------------------
     FFT (transformada rápida de Fourier)

     Convierte un pedazo de audio en sus frecuencias. Es la versión clásica
     "radix-2" (el tamaño tiene que ser potencia de 2). Trabaja sobre dos
     arrays: parte real (re) y parte imaginaria (im), y los modifica.
     ---------------------------------------------------------------- */
  function crearFFT(n) {
    const bits = Math.round(Math.log2(n));
    // Orden de "bits invertidos": el reordenamiento inicial que necesita el algoritmo.
    const invertido = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      let r = 0;
      for (let b = 0, x = i; b < bits; b++, x >>= 1) r = (r << 1) | (x & 1);
      invertido[i] = r;
    }
    // Senos y cosenos precalculados.
    const cos = new Float64Array(n / 2);
    const sen = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      cos[i] = Math.cos(-2 * Math.PI * i / n);
      sen[i] = Math.sin(-2 * Math.PI * i / n);
    }

    return function fft(re, im) {
      for (let i = 0; i < n; i++) {
        const j = invertido[i];
        if (j > i) {
          let t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
        }
      }
      for (let tam = 2; tam <= n; tam <<= 1) {
        const mitad = tam >> 1;
        const paso = n / tam;
        for (let inicio = 0; inicio < n; inicio += tam) {
          for (let k = 0; k < mitad; k++) {
            const c = cos[k * paso], s = sen[k * paso];
            const a = inicio + k, b = a + mitad;
            const tr = re[b] * c - im[b] * s;
            const ti = re[b] * s + im[b] * c;
            re[b] = re[a] - tr; im[b] = im[a] - ti;
            re[a] += tr; im[a] += ti;
          }
        }
      }
    };
  }

  // Ventana de Hann "periódica" (la misma que usa librosa).
  function ventanaHann(n) {
    const v = new Float64Array(n);
    for (let i = 0; i < n; i++) v[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n);
    return v;
  }

  /**
   * Recorre el audio de a frames y llama a alFrame(t, magnitudes) con el
   * espectro de cada uno (magnitudes de 0 a kMax). Los frames están
   * centrados en t * salto, con ceros afuera del audio, como librosa.
   *
   * Truco para ir el doble de rápido: el audio es real, así que metemos
   * un frame en la parte real y el siguiente en la imaginaria, hacemos
   * UNA sola FFT y después separamos los dos espectros.
   */
  function recorrerEspectro(x, nfft, salto, kMax, alFrame, alAvance) {
    const nFrames = 1 + Math.floor(x.length / salto);
    const ventana = ventanaHann(nfft);
    const fft = crearFFT(nfft);
    const re = new Float64Array(nfft);
    const im = new Float64Array(nfft);
    const magA = new Float32Array(kMax + 1);
    const magB = new Float32Array(kMax + 1);
    const mitad = nfft / 2;

    for (let t = 0; t < nFrames; t += 2) {
      const hayB = t + 1 < nFrames;
      const inicioA = t * salto - mitad;
      const inicioB = inicioA + salto;
      for (let i = 0; i < nfft; i++) {
        const ia = inicioA + i, ib = inicioB + i;
        re[i] = ia >= 0 && ia < x.length ? x[ia] * ventana[i] : 0;
        im[i] = hayB && ib >= 0 && ib < x.length ? x[ib] * ventana[i] : 0;
      }
      fft(re, im);
      // Separación: A[k] = (Z[k] + conj(Z[N-k])) / 2,  B[k] = (Z[k] - conj(Z[N-k])) / 2i
      for (let k = 0; k <= kMax; k++) {
        const nk = (nfft - k) % nfft;
        magA[k] = Math.hypot((re[k] + re[nk]) / 2, (im[k] - im[nk]) / 2);
        magB[k] = Math.hypot((im[k] + im[nk]) / 2, (re[k] - re[nk]) / 2);
      }
      alFrame(t, magA);
      if (hayB) alFrame(t + 1, magB);
      if (alAvance && t % 128 === 0) alAvance(t / nFrames);
    }
    return nFrames;
  }

  /* ----------------------------------------------------------------
     Pulsos: envolvente de ataques (librosa.onset.onset_strength)

     Mide, frame a frame, cuánto "aumenta" la energía en cada banda de
     frecuencia. Los golpes de batería y los rasguidos dan picos.
     ---------------------------------------------------------------- */

  // Escala mel de Slaney (la que usa librosa por defecto).
  function hzAMel(f) {
    const fSp = 200 / 3, minLogHz = 1000, minLogMel = minLogHz / fSp, paso = Math.log(6.4) / 27;
    return f < minLogHz ? f / fSp : minLogMel + Math.log(f / minLogHz) / paso;
  }
  function melAHz(m) {
    const fSp = 200 / 3, minLogHz = 1000, minLogMel = minLogHz / fSp, paso = Math.log(6.4) / 27;
    return m < minLogMel ? m * fSp : minLogHz * Math.exp(paso * (m - minLogMel));
  }

  // Banco de filtros mel triangulares con normalización "slaney", como librosa.filters.mel.
  function filtrosMel() {
    const nBins = N_FFT / 2 + 1;
    const melMax = hzAMel(SR / 2);
    const puntos = [];
    for (let i = 0; i < N_MELS + 2; i++) puntos.push(melAHz(melMax * i / (N_MELS + 1)));
    const filtros = [];
    for (let m = 0; m < N_MELS; m++) {
      const pesos = new Float32Array(nBins);
      const norma = 2 / (puntos[m + 2] - puntos[m]);
      for (let k = 0; k < nBins; k++) {
        const f = k * SR / N_FFT;
        const subida = (f - puntos[m]) / (puntos[m + 1] - puntos[m]);
        const bajada = (puntos[m + 2] - f) / (puntos[m + 2] - puntos[m + 1]);
        pesos[k] = Math.max(0, Math.min(subida, bajada)) * norma;
      }
      // Guardamos solo el tramo distinto de cero (más rápido al aplicarlo).
      let k0 = 0, k1 = nBins - 1;
      while (k0 < nBins && pesos[k0] === 0) k0++;
      while (k1 > k0 && pesos[k1] === 0) k1--;
      filtros.push({ k0, pesos: pesos.slice(k0, k1 + 1) });
    }
    return filtros;
  }

  function envolventeDeAtaques(y, alAvance) {
    const filtros = filtrosMel();
    const nFrames = 1 + Math.floor(y.length / SALTO);
    const melDb = new Float32Array(nFrames * N_MELS);
    let maximo = -Infinity;

    // Espectrograma mel en decibeles (power_to_db con amin = 1e-10).
    recorrerEspectro(y, N_FFT, SALTO, N_FFT / 2, (t, mag) => {
      for (let m = 0; m < N_MELS; m++) {
        const { k0, pesos } = filtros[m];
        let suma = 0;
        for (let j = 0; j < pesos.length; j++) {
          const v = mag[k0 + j];
          suma += pesos[j] * v * v;
        }
        const db = 10 * Math.log10(Math.max(1e-10, suma));
        melDb[t * N_MELS + m] = db;
        if (db > maximo) maximo = db;
      }
    }, alAvance);

    // top_db = 80: nada queda más de 80 dB por debajo del máximo.
    const piso = maximo - 80;
    for (let i = 0; i < melDb.length; i++) if (melDb[i] < piso) melDb[i] = piso;

    // Aumento promedio entre frames (solo las subidas). librosa lo corre
    // 2 frames por el centrado de las ventanas; hacemos lo mismo.
    const envolvente = new Float64Array(nFrames);
    for (let t = 1; t < nFrames; t++) {
      let suma = 0;
      for (let m = 0; m < N_MELS; m++) {
        const d = melDb[t * N_MELS + m] - melDb[(t - 1) * N_MELS + m];
        if (d > 0) suma += d;
      }
      if (t + 2 < nFrames) envolvente[t + 2] = suma / N_MELS;
    }
    return envolvente;
  }

  /* ----------------------------------------------------------------
     Tempo (librosa.feature.tempo)

     Busca cada cuántos frames se repiten los ataques (autocorrelación en
     ventanas de 8 segundos) y elige el período más fuerte, favoreciendo
     tempos cercanos a 120 BPM.
     ---------------------------------------------------------------- */
  function estimarTempo(envolvente) {
    const n = envolvente.length;
    const largo = Math.floor(8 * SR / SALTO);          // 344 frames ≈ 8 s
    const mitad = Math.floor(largo / 2);
    const ventana = ventanaHann(largo);
    const tamFFT = 1 << Math.ceil(Math.log2(2 * largo));
    const fft = crearFFT(tamFFT);
    const re = new Float64Array(tamFFT);
    const im = new Float64Array(tamFFT);

    // Relleno "rampa" a los costados, como np.pad(mode="linear_ramp").
    const relleno = new Float64Array(n + 2 * mitad);
    for (let i = 0; i < mitad; i++) {
      relleno[i] = envolvente[0] * i / mitad;
      relleno[n + mitad + i] = envolvente[n - 1] * (mitad - 1 - i) / mitad;
    }
    relleno.set(envolvente, mitad);

    // Promedio de las autocorrelaciones (cada una normalizada a máximo 1).
    // Tomamos 1 de cada 4 ventanas: el promedio casi no cambia y es 4 veces más rápido.
    const promedio = new Float64Array(largo);
    let cantidad = 0;
    for (let t = 0; t < n; t += 4) {
      re.fill(0); im.fill(0);
      for (let i = 0; i < largo; i++) re[i] = relleno[t + i] * ventana[i];
      fft(re, im);
      for (let k = 0; k < tamFFT; k++) { re[k] = re[k] * re[k] + im[k] * im[k]; im[k] = 0; }
      fft(re, im);                     // FFT de la potencia = autocorrelación (sin dividir)
      const maximo = re[0];
      if (maximo > 0) {
        for (let k = 0; k < largo; k++) promedio[k] += re[k] / maximo;
      }
      cantidad++;
    }

    // Elegimos el período con más fuerza + preferencia por ~120 BPM.
    let mejor = 1, mejorPuntaje = -Infinity;
    for (let k = 1; k < largo; k++) {
      const bpm = 60 * SR / (SALTO * k);
      if (bpm >= 320) continue;
      const preferencia = -0.5 * Math.pow(Math.log2(bpm) - Math.log2(120), 2);
      const puntaje = Math.log1p(1e6 * promedio[k] / cantidad) + preferencia;
      if (puntaje > mejorPuntaje) { mejorPuntaje = puntaje; mejor = k; }
    }
    return 60 * SR / (SALTO * mejor);
  }

  /* ----------------------------------------------------------------
     Pulsos (librosa.beat.beat_track, método de Ellis)

     Con programación dinámica busca la secuencia de pulsos que cae sobre
     ataques fuertes y que mantiene el tempo lo más parejo posible.
     ---------------------------------------------------------------- */
  function seguirPulsos(envolvente, tempo) {
    const n = envolvente.length;
    const framesPorPulso = Math.round(60 * SR / SALTO / tempo);

    // Normalizamos por el desvío estándar.
    let media = 0;
    for (const v of envolvente) media += v;
    media /= n;
    let varianza = 0;
    for (const v of envolvente) varianza += (v - media) ** 2;
    const desvio = Math.sqrt(varianza / (n - 1)) || 1;

    // Puntaje local: la envolvente suavizada con una campana del ancho de un pulso.
    const campana = [];
    for (let i = -framesPorPulso; i <= framesPorPulso; i++) {
      campana.push(Math.exp(-0.5 * Math.pow(i * 32 / framesPorPulso, 2)));
    }
    const local = new Float64Array(n);
    for (let t = 0; t < n; t++) {
      let suma = 0;
      for (let j = 0; j < campana.length; j++) {
        const i = t + j - framesPorPulso;
        if (i >= 0 && i < n) suma += (envolvente[i] / desvio) * campana[j];
      }
      local[t] = suma;
    }

    // Programación dinámica: para cada frame, el mejor pulso anterior.
    const acumulado = new Float64Array(n);
    const anterior = new Int32Array(n).fill(-1);
    let maxLocal = 0;
    for (const v of local) if (v > maxLocal) maxLocal = v;
    const umbral = 0.01 * maxLocal;
    let primerPulso = true;
    const logPeriodo = Math.log(framesPorPulso);
    for (let i = 0; i < n; i++) {
      let mejor = -Infinity, donde = -1;
      for (let loc = i - Math.round(framesPorPulso / 2); loc >= i - 2 * framesPorPulso; loc--) {
        if (loc < 0) break;
        const p = acumulado[loc] - 100 * Math.pow(Math.log(i - loc) - logPeriodo, 2);
        if (p > mejor) { mejor = p; donde = loc; }
      }
      acumulado[i] = donde >= 0 ? local[i] + mejor : local[i];
      if (primerPulso && local[i] < umbral) {
        anterior[i] = -1;
      } else {
        anterior[i] = donde;
        primerPulso = false;
      }
    }

    // Último pulso: el último máximo local que supere la mitad de la mediana de los máximos.
    const maximos = [];
    const esMaximo = (i) => (i > 0 && acumulado[i] > acumulado[i - 1])
      && (i === n - 1 || acumulado[i] >= acumulado[i + 1]);
    for (let i = 0; i < n; i++) if (esMaximo(i)) maximos.push(acumulado[i]);
    const umbralFinal = 0.5 * mediana(maximos);
    let ultimo = n - 1;
    for (let i = n - 1; i >= 0; i--) {
      if (esMaximo(i) && acumulado[i] >= umbralFinal) { ultimo = i; break; }
    }

    // Recorremos hacia atrás siguiendo "anterior".
    let pulsos = [ultimo];
    while (anterior[pulsos[pulsos.length - 1]] >= 0) pulsos.push(anterior[pulsos[pulsos.length - 1]]);
    pulsos.reverse();

    // Sacamos pulsos débiles del principio y del final (como trim=True).
    const suave = pulsos.map((_, k) => {
      const w = [0, 0.5, 1, 0.5, 0];
      let s = 0;
      for (let j = 0; j < 5; j++) {
        const idx = k + j - 2;
        if (idx >= 0 && idx < pulsos.length) s += local[pulsos[idx]] * w[j];
      }
      return s;
    });
    const umbralRecorte = 0.5 * Math.sqrt(suave.reduce((a, v) => a + v * v, 0) / suave.length);
    let desde = 0, hasta = pulsos.length - 1;
    while (desde <= hasta && local[pulsos[desde]] <= umbralRecorte) desde++;
    while (hasta >= desde && local[pulsos[hasta]] <= umbralRecorte) hasta--;
    pulsos = pulsos.slice(desde, hasta + 1);
    return pulsos;
  }

  function mediana(valores) {
    if (valores.length === 0) return 0;
    const v = Array.from(valores).sort((a, b) => a - b);
    const m = v.length >> 1;
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }

  /* ----------------------------------------------------------------
     Cromagrama: energía de cada una de las 12 notas, frame a frame
     ---------------------------------------------------------------- */
  function cromagrama(y, alAvance) {
    const resolucion = SR / N_FFT_CROMA;                       // Hz por bin (≈2,7)
    const nSemitonos = 12 * OCTAVAS_CROMA;                     // 84 semitonos desde C1

    // Qué bins de la FFT caen dentro de cada semitono (medio semitono para
    // cada lado de su frecuencia central). En los graves, donde un semitono
    // es más angosto que un bin, usamos el bin más cercano.
    // Por qué no sumar todos los bins: la FFT tiene bins cada 2,7 Hz, así
    // que una octava aguda tiene cientos y una grave muy pocos. Sumándolos,
    // el ruido de los agudos taparía a las notas graves. Tomando el pico de
    // cada semitono, cada nota cuenta igual en cualquier octava (como en la
    // CQT de librosa).
    //
    // Además, cada semitono se multiplica por un peso que favorece a los
    // graves: la CQT de librosa (con scale=True) escala cada nota por la raíz
    // del largo de su filtro, que es más largo cuanto más grave es la nota.
    // Una octava más abajo pesa √2 veces más. Así el bajo, que suele marcar
    // la tónica del acorde, cuenta como en la versión de Python.
    const binesDesde = new Int32Array(nSemitonos);
    const binesHasta = new Int32Array(nSemitonos);
    const pesoGraves = new Float64Array(nSemitonos);
    for (let s = 0; s < nSemitonos; s++) {
      const centro = FMIN_CROMA * Math.pow(2, s / 12);
      let desde = Math.ceil(centro * Math.pow(2, -1 / 24) / resolucion);
      let hasta = Math.floor(centro * Math.pow(2, 1 / 24) / resolucion);
      if (hasta < desde) desde = hasta = Math.round(centro / resolucion);
      binesDesde[s] = desde;
      binesHasta[s] = hasta;
      pesoGraves[s] = Math.pow(2, -s / 24);
    }
    const kMax = binesHasta[nSemitonos - 1];

    // Energía de cada semitono en cada frame: el pico dentro de su rango.
    const nFrames = 1 + Math.floor(y.length / SALTO_CROMA);
    const semitonos = new Float32Array(nFrames * nSemitonos);
    recorrerEspectro(y, N_FFT_CROMA, SALTO_CROMA, kMax, (t, mag) => {
      for (let s = 0; s < nSemitonos; s++) {
        let pico = 0;
        for (let k = binesDesde[s]; k <= binesHasta[s]; k++) if (mag[k] > pico) pico = mag[k];
        semitonos[t * nSemitonos + s] = pico * pesoGraves[s];
      }
    }, (f) => alAvance(0.9 * f));

    // Parte "armónica": mediana en el tiempo de cada semitono. Una nota
    // que dura se mantiene; un golpe de batería (muy corto) desaparece.
    const radio = MEDIANA_ARMONICA >> 1;
    const ventana = new Float32Array(MEDIANA_ARMONICA);
    const croma = new Float64Array(nFrames * 12);
    for (let s = 0; s < nSemitonos; s++) {
      const nota = s % 12;   // C1 es la fila 0, así que s % 12 ya es la nota (0 = C)
      for (let t = 0; t < nFrames; t++) {
        let cant = 0;
        for (let o = -radio; o <= radio; o++) {
          const u = t + o;
          if (u < 0 || u >= nFrames) continue;
          // Inserción ordenada (para 15 valores es lo más rápido).
          const v = semitonos[u * nSemitonos + s];
          let j = cant++;
          while (j > 0 && ventana[j - 1] > v) { ventana[j] = ventana[j - 1]; j--; }
          ventana[j] = v;
        }
        const armonico = cant % 2 ? ventana[cant >> 1] : (ventana[cant / 2 - 1] + ventana[cant / 2]) / 2;
        // Sumamos todas las octavas de la misma nota.
        croma[t * 12 + nota] += armonico;
      }
    }

    // Normalizamos para que la nota más fuerte de cada frame valga 1 (como librosa).
    for (let t = 0; t < nFrames; t++) {
      const base = t * 12;
      let maximo = 0;
      for (let c = 0; c < 12; c++) maximo = Math.max(maximo, croma[base + c]);
      if (maximo > 0) for (let c = 0; c < 12; c++) croma[base + c] /= maximo;
    }
    alAvance(1);
    return { croma, nFramesCroma: nFrames };
  }

  // Volumen (RMS) de cada frame de 2048 muestras cada 512, como librosa.feature.rms.
  function volumenPorFrame(y) {
    const acumulada = new Float64Array(y.length + 1);
    for (let i = 0; i < y.length; i++) acumulada[i + 1] = acumulada[i] + y[i] * y[i];
    const nFrames = 1 + Math.floor(y.length / SALTO);
    const rms = new Float64Array(nFrames);
    for (let t = 0; t < nFrames; t++) {
      const desde = Math.max(0, t * SALTO - N_FFT / 2);
      const hasta = Math.min(y.length, t * SALTO + N_FFT / 2);
      rms[t] = Math.sqrt(Math.max(0, acumulada[hasta] - acumulada[desde]) / N_FFT);
    }
    return rms;
  }

  /* ----------------------------------------------------------------
     Promedio por pulso (librosa.util.fix_frames + librosa.util.sync)
     ---------------------------------------------------------------- */
  function promediarPorPulso(croma, nFramesCroma, rms, pulsos) {
    const nFrames = rms.length;   // frames de 512 muestras
    // Límites: 0, los pulsos y el final, sin repetir y en orden.
    const limites = Array.from(new Set([0, ...pulsos.map((p) => Math.min(Math.max(p, 0), nFrames)), nFrames]))
      .sort((a, b) => a - b);

    const cromaPulsos = [];
    const rmsPulsos = [];
    for (let i = 0; i < limites.length - 1; i++) {
      // Volumen promedio entre los dos límites.
      let suma = 0;
      for (let t = limites[i]; t < limites[i + 1]; t++) suma += rms[t];
      rmsPulsos.push(suma / (limites[i + 1] - limites[i]));

      // El cromagrama tiene frames cada 1024 muestras: pasamos los límites a esa escala.
      let desde = Math.round(limites[i] * SALTO / SALTO_CROMA);
      let hasta = Math.round(limites[i + 1] * SALTO / SALTO_CROMA);
      desde = Math.min(desde, nFramesCroma - 1);
      hasta = Math.min(Math.max(hasta, desde + 1), nFramesCroma);
      const perfil = new Float64Array(12);
      for (let t = desde; t < hasta; t++) for (let c = 0; c < 12; c++) perfil[c] += croma[t * 12 + c];
      for (let c = 0; c < 12; c++) perfil[c] /= (hasta - desde);
      cromaPulsos.push(perfil);
    }
    const tiempos = limites.map((f) => f * SALTO / SR);
    return { cromaPulsos, rmsPulsos, tiempos };
  }

  /* ----------------------------------------------------------------
     Tonalidad (estimar_tonalidad en Python)
     ---------------------------------------------------------------- */
  function correlacion(a, b) {
    const n = a.length;
    let ma = 0, mb = 0;
    for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
    ma /= n; mb /= n;
    let cov = 0, va = 0, vb = 0;
    for (let i = 0; i < n; i++) {
      cov += (a[i] - ma) * (b[i] - mb);
      va += (a[i] - ma) ** 2;
      vb += (b[i] - mb) ** 2;
    }
    return cov / Math.sqrt(va * vb);
  }

  // "Gira" un perfil: girar(PERFIL_MAYOR, 2) es el perfil de D mayor.
  function girar(perfil, pasos) {
    return perfil.map((_, i) => perfil[(i - pasos + 12) % 12]);
  }

  function estimarTonalidad(croma, nFrames) {
    const perfilCancion = new Array(12).fill(0);
    for (let t = 0; t < nFrames; t++) for (let c = 0; c < 12; c++) perfilCancion[c] += croma[t * 12 + c];
    let mejor = null, mejorCorrelacion = -Infinity;
    for (let tonica = 0; tonica < 12; tonica++) {
      for (const [modo, perfil] of [["", PERFIL_MAYOR], ["m", PERFIL_MENOR]]) {
        const r = correlacion(perfilCancion, girar(perfil, tonica));
        if (r > mejorCorrelacion) { mejorCorrelacion = r; mejor = { tonica, modo }; }
      }
    }
    return mejor;
  }

  function perteneceATonalidad(raiz, tipo, tonalidad) {
    const propios = tonalidad.modo === "m" ? ACORDES_MENOR : ACORDES_MAYOR;
    return propios.has(`${(raiz - tonalidad.tonica + 12) % 12}|${tipo}`);
  }

  /* ----------------------------------------------------------------
     Plantillas y elección de acordes (igual que en Python)
     ---------------------------------------------------------------- */
  function plantilla(raiz, tipo) {
    const v = new Array(12).fill(0);
    for (const intervalo of INTERVALOS[tipo]) v[(raiz + intervalo) % 12] = 1;
    const norma = Math.sqrt(INTERVALOS[tipo].length);
    return v.map((x) => x / norma);
  }

  function similitud(plantillaAcorde, perfil) {
    let norma = 0;
    for (const v of perfil) norma += v * v;
    norma = Math.sqrt(norma) + 1e-9;
    let producto = 0;
    for (let c = 0; c < 12; c++) producto += plantillaAcorde[c] * perfil[c];
    return producto / norma;
  }

  function energiaBase(perfil, raiz) {
    return (perfil[raiz] + perfil[(raiz + 7) % 12]) / 2;
  }

  function corregirTercera(perfil, raiz, tipo, tonalidad) {
    const terceraMayor = perfil[(raiz + 4) % 12];
    const terceraMenor = perfil[(raiz + 3) % 12];
    const masFuerte = Math.max(terceraMayor, terceraMenor);
    const debil = masFuerte < UMBRAL_TERCERA_DEBIL * energiaBase(perfil, raiz);
    const ambigua = Math.abs(terceraMayor - terceraMenor) < MARGEN_TERCERA_AMBIGUA * masFuerte;
    if (!(debil || ambigua)) return tipo;

    const mayorEnTono = perteneceATonalidad(raiz, "", tonalidad);
    const menorEnTono = perteneceATonalidad(raiz, "m", tonalidad);
    if (mayorEnTono && !menorEnTono) return "";
    if (menorEnTono && !mayorEnTono) return "m";
    return tipo;
  }

  // Devuelve un acorde por pulso como texto "raiz|tipo" (por ejemplo "1|m"), o null si es silencio.
  function elegirAcordes(cromaPulsos, rmsPulsos, tonalidad) {
    const candidatos = [];
    for (let raiz = 0; raiz < 12; raiz++) {
      for (const tipo of ["", "m"]) candidatos.push({ raiz, tipo, plantilla: plantilla(raiz, tipo) });
    }
    const volumenTipico = mediana(rmsPulsos);

    return cromaPulsos.map((perfil, i) => {
      if (rmsPulsos[i] < UMBRAL_SILENCIO * volumenTipico) return null;
      let mejor = candidatos[0], mejorParecido = -Infinity;
      for (const c of candidatos) {
        const s = similitud(c.plantilla, perfil);
        if (s > mejorParecido) { mejorParecido = s; mejor = c; }
      }
      const tipo = corregirTercera(perfil, mejor.raiz, mejor.tipo, tonalidad);
      return `${mejor.raiz}|${tipo}`;
    });
  }

  /* ----------------------------------------------------------------
     Suavizado y tramos (igual que en Python)
     ---------------------------------------------------------------- */

  // Une pulsos seguidos iguales: [[acorde, primerPulso, cantidad], ...]
  function agrupar(acordes) {
    const tramos = [];
    acordes.forEach((acorde, i) => {
      const ultimo = tramos[tramos.length - 1];
      if (ultimo && ultimo[0] === acorde) ultimo[2]++;
      else tramos.push([acorde, i, 1]);
    });
    return tramos;
  }

  // Absorbe los tramos de menos de MINIMO_PULSOS en el tramo vecino.
  function suavizar(acordes) {
    acordes = acordes.slice();
    for (;;) {
      const tramos = agrupar(acordes);
      if (tramos.length < 2) return acordes;
      const k = tramos.findIndex((t) => t[2] < MINIMO_PULSOS);
      if (k < 0) return acordes;
      const vecino = k > 0 ? tramos[k - 1] : tramos[k + 1];
      const [, inicio, largo] = tramos[k];
      for (let i = inicio; i < inicio + largo; i++) acordes[i] = vecino[0];
    }
  }

  // Decide por tramo si el acorde lleva séptima (mismas 3 condiciones que en Python).
  function agregarSeptimas(tramos, cromaPulsos) {
    return tramos.map(([acorde, inicio, largo]) => {
      if (acorde === null) return ["N", inicio, largo];
      const [textoRaiz, tipoBase] = acorde.split("|");
      const raiz = Number(textoRaiz);
      let tipo = tipoBase;

      const perfil = new Array(12).fill(0);
      for (let i = inicio; i < inicio + largo; i++) for (let c = 0; c < 12; c++) perfil[c] += cromaPulsos[i][c];
      for (let c = 0; c < 12; c++) perfil[c] /= largo;

      const tipoSeptima = CON_SEPTIMA[tipo];
      const parecidoTriada = similitud(plantilla(raiz, tipo), perfil);
      const parecidoSeptima = similitud(plantilla(raiz, tipoSeptima), perfil);
      const septima = perfil[(raiz + 10) % 12];
      if (largo >= MINIMO_PULSOS_SEPTIMA
          && parecidoSeptima > parecidoTriada
          && septima >= UMBRAL_SEPTIMA * energiaBase(perfil, raiz)) {
        tipo = tipoSeptima;
      }
      return [NOTAS[raiz] + tipo, inicio, largo];
    });
  }

  function armarTramos(tramos, tiempos) {
    const redondear = (x) => Math.round(x * 100) / 100;
    return tramos.map(([nombre, inicio, largo]) => ({
      inicio: redondear(tiempos[inicio]),
      fin: redondear(tiempos[inicio + largo]),
      acorde: nombre,
    }));
  }
}

/* ==================================================================
   Parte que corre en la página
   ================================================================== */

/**
 * Decodifica el mp3 y lo deja como lo carga librosa: mono y a 22050 Hz.
 * Usamos un OfflineAudioContext, que procesa el audio sin reproducirlo:
 * al conectar el mp3 (por ejemplo estéreo a 44100 Hz) a un destino de
 * 1 canal a 22050 Hz, el navegador mezcla los canales y remuestrea solo.
 */
async function decodificarMp3(archivo) {
  const bytes = await archivo.arrayBuffer();
  let audio;
  try {
    audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes);
  } catch {
    throw new Error("No pude leer ese archivo de audio. ¿Es un mp3 válido?");
  }
  const largo = Math.ceil(audio.duration * FRECUENCIA_ANALISIS);
  const contexto = new OfflineAudioContext(1, largo, FRECUENCIA_ANALISIS);
  const fuente = contexto.createBufferSource();
  fuente.buffer = audio;
  fuente.connect(contexto.destination);
  fuente.start();
  const resultado = await contexto.startRendering();
  return resultado.getChannelData(0);
}

// Crea el worker a partir del texto de codigoAnalizador (ver su comentario).
function crearWorkerAnalizador() {
  const codigo = "(" + codigoAnalizador.toString() + ")();";
  const url = URL.createObjectURL(new Blob([codigo], { type: "text/javascript" }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

/**
 * Analiza un mp3 (File o Blob) y devuelve los datos con el mismo formato
 * que el JSON de analizar.py: { cancion, tempo, tonalidad, acordes }.
 *
 *   alProgreso(fraccion, etapa): se llama a medida que avanza (0 a 1).
 *   senal: un AbortSignal opcional para cancelar el análisis.
 */
async function analizarMp3(archivo, nombre, alProgreso = () => {}, senal = null) {
  const cancelado = () => new DOMException("Análisis cancelado", "AbortError");
  if (senal && senal.aborted) throw cancelado();

  // Decodificar ocupa el primer 10 % de la barra.
  alProgreso(0, "Leyendo el mp3");
  const muestras = await decodificarMp3(archivo);
  if (senal && senal.aborted) throw cancelado();
  alProgreso(0.1, "Leyendo el mp3");

  return new Promise((resolver, rechazar) => {
    const worker = crearWorkerAnalizador();
    const terminar = () => {
      worker.terminate();
      if (senal) senal.removeEventListener("abort", alCancelar);
    };
    const alCancelar = () => { terminar(); rechazar(cancelado()); };
    if (senal) senal.addEventListener("abort", alCancelar);

    worker.onmessage = ({ data }) => {
      if (data.tipo === "progreso") {
        alProgreso(0.1 + 0.9 * data.fraccion, data.etapa);
      } else if (data.tipo === "listo") {
        terminar();
        resolver(data.datos);
      } else if (data.tipo === "error") {
        terminar();
        rechazar(new Error(data.mensaje));
      }
    };
    worker.onerror = (evento) => {
      terminar();
      rechazar(new Error(evento.message || "Falló el análisis."));
    };

    // "Transferimos" las muestras en lugar de copiarlas: es instantáneo.
    worker.postMessage({ muestras, nombre }, [muestras.buffer]);
  });
}
