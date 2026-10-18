"""
Analizador de acordes para app-acordes.

Uso (con el entorno activado, desde la carpeta del proyecto):
    python analizador/analizar.py "canciones/Mi canción.mp3"

Las comillas son necesarias si el nombre tiene espacios.
Genera resultados/<nombre del mp3>.json y muestra los acordes en la terminal.
"""

import argparse
import json
from pathlib import Path

import librosa
import numpy as np

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

# Frecuencia de muestreo a la que se carga el audio. 22050 Hz alcanza de sobra
# para detectar notas y hace que el análisis sea más rápido que con 44100 Hz.
FRECUENCIA_MUESTREO = 22050

# Si la energía (volumen) de un pulso es menor que este porcentaje de la
# energía típica de la canción, se considera silencio y se marca como "N".
UMBRAL_SILENCIO = 0.10

# Los tramos de acorde que duren menos que esta cantidad de pulsos se
# consideran "ruido" y se absorben en el acorde vecino.
MINIMO_PULSOS = 2

# Tercera débil: si la tercera más fuerte (mayor o menor) tiene menos de este
# porcentaje de la energía de la fundamental y la quinta, se considera que
# casi no suena (típico de los power chords con distorsión).
UMBRAL_TERCERA_DEBIL = 0.5

# Tercera ambigua: si la tercera mayor y la menor tienen energías que se
# diferencian en menos de este porcentaje, no se puede saber cuál es.
MARGEN_TERCERA_AMBIGUA = 0.25

# Séptima: solo se agrega si la nota de séptima tiene al menos este porcentaje
# de la energía de la fundamental y la quinta del acorde. Con valores más
# bajos (0.6) aparecían séptimas en casi todos los C#m y E de la canción de
# prueba, porque esas notas también suenan en la melodía.
UMBRAL_SEPTIMA = 0.8

# Además, el tramo tiene que durar al menos esta cantidad de pulsos: en tramos
# muy cortos el promedio se ensucia con el acorde anterior o el siguiente.
MINIMO_PULSOS_SEPTIMA = 4

# Nombres de las 12 notas en cifrado americano. El orden es el mismo que usa
# librosa en el cromagrama: la fila 0 es C, la 1 es C#, etc.
NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Los mismos nombres en español, solo para mostrar la tonalidad en la terminal.
NOTAS_ESPANOL = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]

# Tipos de acorde: sufijo del nombre -> notas que lo forman, en semitonos
# desde la fundamental. Por ejemplo, para C: C=0, E=4, G=7, Bb=10.
#   ""   mayor              (C)   = fundamental + tercera mayor + quinta
#   "m"  menor              (Cm)  = fundamental + tercera menor + quinta
#   "7"  séptima dominante  (C7)  = mayor + séptima menor
#   "m7" menor séptima      (Cm7) = menor + séptima menor
INTERVALOS = {
    "": (0, 4, 7),
    "m": (0, 3, 7),
    "7": (0, 4, 7, 10),
    "m7": (0, 3, 7, 10),
}

# Versión con séptima de cada tipo básico.
CON_SEPTIMA = {"": "7", "m": "m7"}

# Perfiles de tonalidad de Krumhansl-Kessler: cuánto "pertenece" cada una de
# las 12 notas a una tonalidad mayor o menor que empieza en C. Salen de
# experimentos con oyentes y son el método clásico para estimar la tonalidad.
PERFIL_MAYOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
PERFIL_MENOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

# Acordes que pertenecen a cada tipo de tonalidad, como (semitonos desde la
# tónica, tipo). En menor se incluye el V mayor (por ejemplo G# en C#m),
# que es muy común aunque no esté en la escala menor natural.
ACORDES_MAYOR = {(0, ""), (2, "m"), (4, "m"), (5, ""), (7, ""), (9, "m")}
ACORDES_MENOR = {(0, "m"), (3, ""), (5, "m"), (7, "m"), (7, ""), (8, ""), (10, "")}

# Carpeta raíz del proyecto (la que contiene analizador/, canciones/ y resultados/).
RAIZ_PROYECTO = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# 1. Carga del audio
# ---------------------------------------------------------------------------

def cargar_audio(ruta):
    """Carga el mp3 como una sola señal mono (un array de números entre -1 y 1)."""
    y, sr = librosa.load(ruta, sr=FRECUENCIA_MUESTREO, mono=True)
    return y, sr


# ---------------------------------------------------------------------------
# 2. Tempo y pulsos
# ---------------------------------------------------------------------------

def detectar_pulsos(y_percusiva, sr):
    """
    Detecta el tempo (en pulsos por minuto) y en qué "frame" cae cada pulso.

    Un frame es un pedacito de audio de 512 muestras (unos 23 ms); librosa
    trabaja siempre con frames en lugar de muestras sueltas.
    Usamos la parte percusiva del audio porque la batería marca mejor el pulso.
    """
    tempo, frames_pulsos = librosa.beat.beat_track(y=y_percusiva, sr=sr)
    # Según la versión, librosa devuelve el tempo como número o como array.
    tempo = float(np.atleast_1d(tempo)[0])
    return tempo, frames_pulsos


# ---------------------------------------------------------------------------
# 3. Cromagrama
# ---------------------------------------------------------------------------

def calcular_cromagrama(y_armonica, sr, corregir_afinacion=True):
    """
    Calcula el cromagrama: para cada frame, cuánta energía tiene cada una de
    las 12 notas (sin importar la octava). Es una matriz de 12 filas x N frames.
    Usamos la parte armónica (sin batería) para que los golpes no ensucien las notas.
    También devuelve el volumen (RMS) de cada frame, para detectar silencios.

    corregir_afinacion: si la grabación está un poco desafinada respecto de
    La = 440 Hz (por ejemplo, la banda afinó "entre medio" de dos notas),
    librosa estima cuánto y corre las notas para compensar (tuning=None).
    Con False se supone afinación perfecta (tuning=0).
    """
    croma = librosa.feature.chroma_cqt(y=y_armonica, sr=sr, tuning=None if corregir_afinacion else 0.0)
    rms = librosa.feature.rms(y=y_armonica)
    return croma, rms


def subdividir_pulsos(frames_pulsos):
    """
    Agrega un punto en la mitad de cada pulso: así el análisis se hace cada
    medio pulso y no se pierden los acordes de paso que duran un solo tiempo.
    """
    frames_pulsos = np.asarray(frames_pulsos)
    if len(frames_pulsos) < 2:
        return frames_pulsos
    medios = (frames_pulsos[:-1] + frames_pulsos[1:]) // 2
    return np.unique(np.concatenate([frames_pulsos, medios]))


def promediar_por_pulso(croma, rms, sr, frames_pulsos):
    """
    Promedia el cromagrama entre pulso y pulso, así nos queda un solo "perfil
    de 12 notas" por cada pulso, que es mucho más estable que frame a frame.
    """
    # Agregamos un límite al principio (frame 0) y al final, para que el
    # primer tramo arranque en 0:00 y el último llegue hasta el final.
    limites = librosa.util.fix_frames(frames_pulsos, x_min=0, x_max=croma.shape[1])

    # librosa.util.sync promedia todas las columnas que caen entre dos límites.
    croma_pulsos = librosa.util.sync(croma, limites, aggregate=np.mean)
    rms_pulsos = librosa.util.sync(rms, limites, aggregate=np.mean)[0]

    # Pasamos los límites de frames a segundos para saber cuándo empieza cada pulso.
    tiempos = librosa.frames_to_time(limites, sr=sr)
    return croma_pulsos, rms_pulsos, tiempos


# ---------------------------------------------------------------------------
# 4. Tonalidad de la canción
# ---------------------------------------------------------------------------

def estimar_tonalidad(croma):
    """
    Estima la tonalidad comparando el perfil de notas de TODA la canción con
    los 24 perfiles de tonalidad (12 mayores y 12 menores).

    Para probar cada tónica "giramos" el perfil: np.roll(PERFIL_MAYOR, 2) es el
    perfil de D mayor. La comparación es una correlación: vale 1 si los dos
    perfiles suben y bajan igual. Devuelve (tónica, modo), con modo "" o "m".
    """
    perfil_cancion = croma.mean(axis=1)
    mejor, mejor_correlacion = None, -np.inf
    for tonica in range(12):
        for modo, perfil in (("", PERFIL_MAYOR), ("m", PERFIL_MENOR)):
            correlacion = np.corrcoef(perfil_cancion, np.roll(perfil, tonica))[0, 1]
            if correlacion > mejor_correlacion:
                mejor, mejor_correlacion = (tonica, modo), correlacion
    return mejor


def nombre_tonalidad(tonalidad):
    """(1, "m") -> "C#m"."""
    tonica, modo = tonalidad
    return NOTAS[tonica] + modo


def nombre_tonalidad_espanol(tonalidad):
    """(1, "m") -> "Do# menor"."""
    tonica, modo = tonalidad
    return f"{NOTAS_ESPANOL[tonica]} {'menor' if modo == 'm' else 'mayor'}"


def pertenece_a_tonalidad(raiz, tipo, tonalidad):
    """¿El acorde (raiz, tipo) es uno de los acordes propios de la tonalidad?"""
    tonica, modo = tonalidad
    acordes_propios = ACORDES_MENOR if modo == "m" else ACORDES_MAYOR
    return ((raiz - tonica) % 12, tipo) in acordes_propios


# ---------------------------------------------------------------------------
# 5. Elección de acordes con plantillas
# ---------------------------------------------------------------------------

def plantilla(raiz, tipo):
    """
    Arma la plantilla de un acorde: un vector de 12 posiciones con un 1 en las
    notas del acorde y 0 en el resto, normalizado a largo 1. Por ejemplo C:
        C  C# D  D# E  F  F# G  G# A  A# B
        1  0  0  0  1  0  0  1  0  0  0  0
    """
    vector = np.zeros(12)
    for intervalo in INTERVALOS[tipo]:
        vector[(raiz + intervalo) % 12] = 1
    return vector / np.linalg.norm(vector)


def normalizar(perfiles):
    """Lleva cada columna a largo 1 (el 1e-9 evita dividir por cero en silencios)."""
    return perfiles / (np.linalg.norm(perfiles, axis=0, keepdims=True) + 1e-9)


def energia_base(perfil, raiz):
    """Energía promedio de la fundamental y la quinta: la "referencia" del acorde."""
    return (perfil[raiz] + perfil[(raiz + 7) % 12]) / 2


def corregir_tercera(perfil, raiz, tipo, tonalidad):
    """
    Si la tercera es débil o ambigua, elige entre mayor y menor según la tonalidad.

    Con distorsión los guitarristas suelen tocar power chords (fundamental y
    quinta, sin tercera), así que el cromagrama no dice si es mayor o menor.
    En ese caso nos quedamos con la versión que pertenece a la tonalidad.
    Si las dos versiones pertenecen (o ninguna), se deja lo que se detectó.
    """
    tercera_mayor = perfil[(raiz + 4) % 12]
    tercera_menor = perfil[(raiz + 3) % 12]
    mas_fuerte = max(tercera_mayor, tercera_menor)

    debil = mas_fuerte < UMBRAL_TERCERA_DEBIL * energia_base(perfil, raiz)
    ambigua = abs(tercera_mayor - tercera_menor) < MARGEN_TERCERA_AMBIGUA * mas_fuerte
    if not (debil or ambigua):
        return tipo

    mayor_en_tono = pertenece_a_tonalidad(raiz, "", tonalidad)
    menor_en_tono = pertenece_a_tonalidad(raiz, "m", tonalidad)
    if mayor_en_tono and not menor_en_tono:
        return ""
    if menor_en_tono and not mayor_en_tono:
        return "m"
    return tipo


def elegir_acordes(croma_pulsos, rms_pulsos, tonalidad):
    """
    Para cada pulso, compara su perfil de 12 notas con las 24 plantillas de
    acordes mayores y menores y se queda con la más parecida. Después corrige
    la tercera con la tonalidad. Devuelve una lista de (raiz, tipo) o None
    para los pulsos en silencio.

    La comparación es una "similitud coseno": mide qué tan parecida es la
    forma de los dos vectores, sin importar el volumen. Vale 1 si son iguales.
    Las séptimas se deciden más adelante, por tramo (ver agregar_septimas).
    """
    candidatos = [(raiz, tipo) for raiz in range(12) for tipo in ("", "m")]
    plantillas = np.array([plantilla(raiz, tipo) for raiz, tipo in candidatos])

    # Multiplicar matrices calcula todas las similitudes de una vez:
    # (24 plantillas x 12 notas) @ (12 notas x N pulsos) = 24 x N similitudes.
    similitudes = plantillas @ normalizar(croma_pulsos)
    mejores = np.argmax(similitudes, axis=0)

    # Detección de silencio: comparamos el volumen de cada pulso con la mediana
    # de toda la canción (la mediana representa el volumen "típico").
    volumen_tipico = np.median(rms_pulsos)

    acordes = []
    for i, indice in enumerate(mejores):
        if rms_pulsos[i] < UMBRAL_SILENCIO * volumen_tipico:
            acordes.append(None)
            continue
        raiz, tipo = candidatos[indice]
        tipo = corregir_tercera(croma_pulsos[:, i], raiz, tipo, tonalidad)
        acordes.append((raiz, tipo))
    return acordes


# ---------------------------------------------------------------------------
# 6. Suavizado y unión en tramos
# ---------------------------------------------------------------------------

def agrupar(acordes):
    """
    Une pulsos seguidos con el mismo acorde.
    Devuelve una lista de [acorde, primer_pulso, cantidad_de_pulsos].
    """
    tramos = []
    for i, acorde in enumerate(acordes):
        if tramos and tramos[-1][0] == acorde:
            tramos[-1][2] += 1
        else:
            tramos.append([acorde, i, 1])
    return tramos


def suavizar(acordes, minimo=MINIMO_PULSOS):
    """
    Elimina los cambios de acorde "sueltos" que duran menos de "minimo" unidades
    (MINIMO_PULSOS pulsos, o el doble si se analiza a medio pulso).

    Esos tramos tan cortos suelen ser errores (una nota de paso, un golpe de
    batería, etc.). Cada uno se reemplaza por el acorde del tramo anterior
    (o del siguiente, si es el primero de la canción). Se repite hasta que
    no quede ninguno, porque al unir tramos pueden aparecer nuevos casos.
    """
    acordes = list(acordes)
    while True:
        tramos = agrupar(acordes)
        if len(tramos) < 2:
            return acordes
        cortos = [k for k, t in enumerate(tramos) if t[2] < minimo]
        if not cortos:
            return acordes

        # Arreglamos de a uno y volvemos a agrupar, para no pisar cambios.
        k = cortos[0]
        vecino = tramos[k - 1] if k > 0 else tramos[k + 1]
        _, inicio, largo = tramos[k]
        for i in range(inicio, inicio + largo):
            acordes[i] = vecino[0]


# Parámetros del suavizado de Viterbi (ver suavizar_viterbi). Elegidos con
# pruebas/medir_precision.py: con nitidez 40 el resultado casi no cambia
# aunque la probabilidad de cambio vaya de 0.06 a 0.25 o la preferencia por
# la tonalidad de 1 a 3, así que no dependen de esta canción en particular.
NITIDEZ_VITERBI = 40.0          # cuánto pesa el parecido con cada acorde
PROBABILIDAD_CAMBIO = 0.12      # chance de cambiar de acorde en cada pulso
PREFERENCIA_TONALIDAD = 3.0     # cuántas veces más probable es cambiar a un acorde de la tonalidad


def suavizar_viterbi(croma_unidades, rms_unidades, tonalidad, unidades_por_pulso=1):
    """
    Elige los acordes con el algoritmo de Viterbi, en lugar de elegir cada
    pulso por separado y después "borrar" los tramos cortos.

    Piensa la canción como una cadena: en cada pulso suena uno de los 24
    acordes. Busca la secuencia completa más probable combinando:
      - cuánto se parece cada pulso a cada acorde (similitud coseno), y
      - un "costo" por cambiar de acorde: quedarse en el mismo es lo más
        probable, y cambiar a un acorde de la tonalidad es más probable que
        cambiar a uno de afuera.
    Así, un acorde corto pero claro se mantiene (el parecido le gana al costo
    de cambiar), mientras que un pulso dudoso no alcanza para cambiar.
    Devuelve una lista de (raiz, tipo) por unidad, o None en los silencios.
    """
    candidatos = [(raiz, tipo) for raiz in range(12) for tipo in ("", "m")]
    plantillas = np.array([plantilla(raiz, tipo) for raiz, tipo in candidatos])
    similitudes = plantillas @ normalizar(croma_unidades)          # 24 x N
    emision = NITIDEZ_VITERBI * similitudes                         # log-probabilidades (sin normalizar)

    # Transiciones: la probabilidad de cambio es por pulso; si analizamos a
    # medio pulso, cada mitad tiene la mitad de chance de cambiar.
    p_cambio = PROBABILIDAD_CAMBIO / unidades_por_pulso
    en_tono = np.array([PREFERENCIA_TONALIDAD if pertenece_a_tonalidad(r, t, tonalidad) else 1.0
                        for r, t in candidatos])
    transicion = np.zeros((24, 24))
    for origen in range(24):
        pesos = en_tono.copy()
        pesos[origen] = 0
        transicion[origen] = p_cambio * pesos / pesos.sum()
        transicion[origen, origen] = 1 - p_cambio
    log_transicion = np.log(transicion)

    # Viterbi: para cada pulso y cada acorde, el mejor camino que termina ahí.
    n = croma_unidades.shape[1]
    puntaje = emision[:, 0].copy()
    desde = np.zeros((24, n), dtype=int)
    for i in range(1, n):
        opciones = puntaje[:, None] + log_transicion                  # 24 (origen) x 24 (destino)
        desde[:, i] = np.argmax(opciones, axis=0)
        puntaje = opciones[desde[:, i], np.arange(24)] + emision[:, i]

    # Recorremos el mejor camino de atrás para adelante.
    camino = [int(np.argmax(puntaje))]
    for i in range(n - 1, 0, -1):
        camino.append(int(desde[camino[-1], i]))
    camino.reverse()

    volumen_tipico = np.median(rms_unidades)
    acordes = [None if rms_unidades[i] < UMBRAL_SILENCIO * volumen_tipico else candidatos[k]
               for i, k in enumerate(camino)]

    # La tercera dudosa se corrige por TRAMO (con el perfil promedio, más confiable).
    for acorde, inicio, largo in agrupar(acordes):
        if acorde is None:
            continue
        perfil = croma_unidades[:, inicio:inicio + largo].mean(axis=1)
        tipo = corregir_tercera(perfil, acorde[0], acorde[1], tonalidad)
        for i in range(inicio, inicio + largo):
            acordes[i] = (acorde[0], tipo)
    return acordes


def agregar_septimas(tramos, croma_pulsos, unidades_por_pulso=1):
    """
    Decide para cada tramo (no para cada pulso) si el acorde lleva séptima.

    Hacerlo por tramo evita que aparezcan séptimas sueltas: se promedia el
    perfil de todos los pulsos del tramo y se exigen dos cosas:
      1. Que la plantilla con séptima (por ejemplo B7) se parezca más al
         perfil que la plantilla sin séptima (B).
      2. Que la nota de séptima tenga una energía claramente alta: al menos
         UMBRAL_SEPTIMA de la energía de la fundamental y la quinta. Esto
         descarta los casos en que la séptima es solo una nota de la melodía.
      3. Que el tramo dure al menos MINIMO_PULSOS_SEPTIMA pulsos.
    Devuelve los tramos como [nombre, primer_pulso, cantidad_de_pulsos].
    """
    resultado = []
    for acorde, inicio, largo in tramos:
        if acorde is None:
            resultado.append(["N", inicio, largo])
            continue

        raiz, tipo = acorde
        perfil = croma_pulsos[:, inicio:inicio + largo].mean(axis=1)
        perfil_normalizado = perfil / (np.linalg.norm(perfil) + 1e-9)

        tipo_septima = CON_SEPTIMA[tipo]
        parecido_triada = plantilla(raiz, tipo) @ perfil_normalizado
        parecido_septima = plantilla(raiz, tipo_septima) @ perfil_normalizado
        septima = perfil[(raiz + 10) % 12]

        # "largo" está en unidades (pulsos o medios pulsos): lo pasamos a pulsos.
        if (largo >= MINIMO_PULSOS_SEPTIMA * unidades_por_pulso
                and parecido_septima > parecido_triada
                and septima >= UMBRAL_SEPTIMA * energia_base(perfil, raiz)):
            tipo = tipo_septima
        resultado.append([NOTAS[raiz] + tipo, inicio, largo])
    return resultado


def armar_tramos(tramos, tiempos):
    """
    Convierte los tramos de pulsos en tramos con inicio y fin en segundos.
    tiempos[i] es cuándo empieza el pulso i, y tiempos[i + 1] cuándo termina.
    """
    return [
        {
            "inicio": round(float(tiempos[inicio]), 2),
            "fin": round(float(tiempos[inicio + largo]), 2),
            "acorde": nombre,
        }
        for nombre, inicio, largo in tramos
    ]


# ---------------------------------------------------------------------------
# 7. Compases
# ---------------------------------------------------------------------------

# Cantidad de pulsos por compás (4/4, lo más común en rock y pop).
PULSOS_POR_COMPAS = 4


def calcular_compases(tiempos_pulsos, tramos):
    """
    Elige en qué pulsos empieza cada compás.

    Con 4 pulsos por compás hay 4 posibilidades: que el primer compás empiece
    en el pulso 0, 1, 2 o 3 (el "desfasaje"). Elegimos la que hace que más
    cambios de acorde caigan en el primer tiempo de un compás, porque en la
    música los acordes suelen cambiar ahí.
    Devuelve los tiempos (en segundos) en que empieza cada compás.
    """
    if len(tiempos_pulsos) == 0:
        return np.array([])

    # Para cada cambio de acorde, buscamos el pulso en el que cae.
    cambios = []
    for tramo in tramos[1:]:
        distancias = np.abs(tiempos_pulsos - tramo["inicio"])
        pulso = int(np.argmin(distancias))
        if distancias[pulso] < 0.05:   # el cambio cae justo en un pulso
            cambios.append(pulso)

    # Puntaje de cada desfasaje: cuántos cambios caen en el primer tiempo.
    puntajes = [sum(1 for p in cambios if (p - desfasaje) % PULSOS_POR_COMPAS == 0)
                for desfasaje in range(PULSOS_POR_COMPAS)]
    mejor = int(np.argmax(puntajes))   # si empatan, el primero
    return tiempos_pulsos[mejor::PULSOS_POR_COMPAS]


# ---------------------------------------------------------------------------
# 8. Guardar el JSON y mostrar en la terminal
# ---------------------------------------------------------------------------

def formato_minutos(segundos):
    """Convierte 72.5 en '1:12'."""
    segundos = int(segundos)
    return f"{segundos // 60}:{segundos % 60:02d}"


def guardar_json(nombre, tempo, tonalidad, tramos, pulsos, compases):
    """
    Guarda el resultado en resultados/<nombre>.json y devuelve la ruta.

    "pulsos" y "compases" son listas de segundos (cuándo cae cada pulso y
    cuándo empieza cada compás). Se agregaron después: los programas que
    leían el formato anterior los ignoran y siguen funcionando.
    """
    carpeta = RAIZ_PROYECTO / "resultados"
    carpeta.mkdir(exist_ok=True)
    ruta = carpeta / f"{nombre}.json"
    datos = {
        "cancion": nombre,
        "tempo": round(tempo, 1),
        "tonalidad": nombre_tonalidad(tonalidad),
        "acordes": tramos,
        "pulsos": [round(float(t), 3) for t in pulsos],
        "compases": [round(float(t), 3) for t in compases],
    }
    # ensure_ascii=False mantiene los acentos y las eñes tal cual.
    with open(ruta, "w", encoding="utf-8") as archivo:
        json.dump(datos, archivo, ensure_ascii=False, indent=2)
    return ruta


# Opciones del análisis (se pueden combinar; ver analizar_audio).
#
# Lo que se usa: medido con pruebas/medir_precision.py sobre canciones/Prueba.mp3
# comparando con el cifrado real (F1: 90,4 % -> 93,0 %, y 6 veces más rápido):
#   - afinacion: sí. En la canción afinada no cambia nada, pero con la misma
#     canción desafinada 0,4 semitonos sube el F1 de 66,7 % a 78,8 %.
#   - hpss: no. Separar la batería no mejoró (con Viterbi, 92,6 % contra
#     93,0 % sin separar) y es lo que más tarda (unos 25 s).
#   - suavizado Viterbi: sí. Recupera acordes cortos que la mediana borraba
#     (la cobertura del cifrado sube de 84,7 % a 90,1 %).
#   - medio_pulso: no. Solo, empeora (88,0 %), y junto con Viterbi no suma.
OPCIONES_PREDETERMINADAS = {"afinacion": True, "hpss": False, "suavizado": "viterbi", "medio_pulso": False}

# Las de la versión anterior, para poder comparar.
OPCIONES_ORIGINALES = {"afinacion": True, "hpss": True, "suavizado": "mediana", "medio_pulso": False}


def analizar_audio(y, sr, opciones=None):
    """
    Analiza el audio con las opciones indicadas y devuelve un diccionario con
    tempo, tonalidad, tramos (acordes), tiempos de los pulsos y compases.
      afinacion:   corregir la desafinación de la grabación antes del cromagrama.
      hpss:        separar batería y parte armónica antes de analizar.
      suavizado:   "mediana" (absorber tramos cortos) o "viterbi".
      medio_pulso: analizar cada medio pulso en vez de cada pulso.
    Lo que no se indica se toma de OPCIONES_PREDETERMINADAS.
    """
    opciones = {**OPCIONES_PREDETERMINADAS, **(opciones or {})}

    # Separamos el audio en parte armónica (instrumentos con notas) y
    # percusiva (batería). Cada una se usa para lo que mejor sirve.
    if opciones["hpss"]:
        y_armonica, y_percusiva = librosa.effects.hpss(y)
    else:
        y_armonica = y_percusiva = y

    tempo, frames_pulsos = detectar_pulsos(y_percusiva, sr)
    croma, rms = calcular_cromagrama(y_armonica, sr, opciones["afinacion"])
    tonalidad = estimar_tonalidad(croma)

    # Unidades de análisis: pulsos, o medios pulsos.
    unidades_por_pulso = 2 if opciones["medio_pulso"] else 1
    frames_unidades = subdividir_pulsos(frames_pulsos) if opciones["medio_pulso"] else frames_pulsos
    croma_unidades, rms_unidades, tiempos = promediar_por_pulso(croma, rms, sr, frames_unidades)

    if opciones["suavizado"] == "viterbi":
        acordes = suavizar_viterbi(croma_unidades, rms_unidades, tonalidad, unidades_por_pulso)
    else:
        acordes = elegir_acordes(croma_unidades, rms_unidades, tonalidad)
        acordes = suavizar(acordes, MINIMO_PULSOS * unidades_por_pulso)
    tramos = agregar_septimas(agrupar(acordes), croma_unidades, unidades_por_pulso)
    tramos = armar_tramos(tramos, tiempos)

    # Pulsos en segundos y en qué pulsos empieza cada compás.
    tiempos_pulsos = librosa.frames_to_time(frames_pulsos, sr=sr)
    compases = calcular_compases(tiempos_pulsos, tramos)
    return {"tempo": tempo, "tonalidad": tonalidad, "tramos": tramos,
            "tiempos_pulsos": tiempos_pulsos, "compases": compases}


def main():
    # Leemos la ruta del mp3 desde la línea de comandos.
    parser = argparse.ArgumentParser(description="Detecta los acordes de un mp3.")
    parser.add_argument("mp3", help="Ruta del archivo mp3 (entre comillas si tiene espacios)")
    args = parser.parse_args()

    ruta_mp3 = Path(args.mp3)
    if not ruta_mp3.is_file():
        parser.error(f"No encuentro el archivo: {ruta_mp3}")
    nombre = ruta_mp3.stem  # el nombre del archivo sin ".mp3"

    print(f"Cargando {ruta_mp3.name}...")
    y, sr = cargar_audio(ruta_mp3)

    print("Analizando...")
    resultado = analizar_audio(y, sr)
    tempo, tonalidad, tramos = resultado["tempo"], resultado["tonalidad"], resultado["tramos"]
    tiempos_pulsos, compases = resultado["tiempos_pulsos"], resultado["compases"]

    ruta_json = guardar_json(nombre, tempo, tonalidad, tramos, tiempos_pulsos, compases)

    print(f"\nTempo: {tempo:.1f} BPM  |  Tonalidad: {nombre_tonalidad(tonalidad)} "
          f"({nombre_tonalidad_espanol(tonalidad)})  |  {len(tramos)} tramos de acordes  |  "
          f"{len(tiempos_pulsos)} pulsos, {len(compases)} compases\n")
    for tramo in tramos:
        print(f"{formato_minutos(tramo['inicio']):>5}  {tramo['acorde']}")
    print(f"\nGuardado en {ruta_json}")


if __name__ == "__main__":
    main()
