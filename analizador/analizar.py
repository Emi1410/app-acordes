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

# Nombres de las 12 notas en cifrado americano. El orden es el mismo que usa
# librosa en el cromagrama: la fila 0 es C, la 1 es C#, etc.
NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

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
# 3. Cromagrama promediado por pulso
# ---------------------------------------------------------------------------

def cromagrama_por_pulso(y_armonica, sr, frames_pulsos):
    """
    Calcula el cromagrama: para cada frame, cuánta energía tiene cada una de
    las 12 notas (sin importar la octava). Es una matriz de 12 filas x N frames.

    Después lo promedia entre pulso y pulso, así nos queda un solo "perfil de
    12 notas" por cada pulso, que es mucho más estable que frame a frame.
    También devuelve el volumen (RMS) promedio de cada pulso para detectar silencios.
    """
    # Usamos la parte armónica (sin batería) para que los golpes no ensucien las notas.
    croma = librosa.feature.chroma_cqt(y=y_armonica, sr=sr)
    rms = librosa.feature.rms(y=y_armonica)

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
# 4. Comparación con plantillas de acordes
# ---------------------------------------------------------------------------

def crear_plantillas():
    """
    Arma las 24 plantillas: 12 acordes mayores y 12 menores.

    Cada plantilla es un vector de 12 posiciones con un 1 en las notas del
    acorde y 0 en el resto. Por ejemplo, C mayor = C, E, G:
        C  C# D  D# E  F  F# G  G# A  A# B
        1  0  0  0  1  0  0  1  0  0  0  0
    Mayor = fundamental + 4 semitonos + 7 semitonos.
    Menor = fundamental + 3 semitonos + 7 semitonos.
    """
    nombres = []
    plantillas = []
    for i, nota in enumerate(NOTAS):
        for sufijo, intervalos in (("", (0, 4, 7)), ("m", (0, 3, 7))):
            vector = np.zeros(12)
            for intervalo in intervalos:
                vector[(i + intervalo) % 12] = 1
            nombres.append(nota + sufijo)
            plantillas.append(vector)

    plantillas = np.array(plantillas)
    # Normalizamos cada plantilla para que tenga largo 1 (necesario para la
    # similitud coseno de más abajo).
    plantillas /= np.linalg.norm(plantillas, axis=1, keepdims=True)
    return nombres, plantillas


def elegir_acordes(croma_pulsos, rms_pulsos):
    """
    Para cada pulso, compara su perfil de 12 notas con las 24 plantillas y se
    queda con la más parecida. Devuelve una lista de nombres de acordes.

    La comparación es una "similitud coseno": mide qué tan parecida es la
    forma de los dos vectores, sin importar el volumen. Vale 1 si son iguales.
    """
    nombres, plantillas = crear_plantillas()

    # Normalizamos cada perfil (cada columna) a largo 1. El 1e-9 evita dividir por cero.
    perfiles = croma_pulsos / (np.linalg.norm(croma_pulsos, axis=0, keepdims=True) + 1e-9)

    # Multiplicar matrices calcula todas las similitudes de una vez:
    # (24 plantillas x 12 notas) @ (12 notas x N pulsos) = 24 x N similitudes.
    similitudes = plantillas @ perfiles
    mejores = np.argmax(similitudes, axis=0)
    acordes = [nombres[i] for i in mejores]

    # Detección de silencio: comparamos el volumen de cada pulso con la mediana
    # de toda la canción (la mediana representa el volumen "típico").
    volumen_tipico = np.median(rms_pulsos)
    for i, volumen in enumerate(rms_pulsos):
        if volumen < UMBRAL_SILENCIO * volumen_tipico:
            acordes[i] = "N"
    return acordes


# ---------------------------------------------------------------------------
# 5. Suavizado y unión en tramos
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


def suavizar(acordes):
    """
    Elimina los cambios de acorde "sueltos" que duran menos de MINIMO_PULSOS.

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
        cortos = [k for k, t in enumerate(tramos) if t[2] < MINIMO_PULSOS]
        if not cortos:
            return acordes

        # Arreglamos de a uno y volvemos a agrupar, para no pisar cambios.
        k = cortos[0]
        vecino = tramos[k - 1] if k > 0 else tramos[k + 1]
        _, inicio, largo = tramos[k]
        for i in range(inicio, inicio + largo):
            acordes[i] = vecino[0]


def armar_tramos(acordes, tiempos):
    """
    Convierte la lista de acordes por pulso en tramos con inicio y fin en segundos.
    tiempos[i] es cuándo empieza el pulso i, y tiempos[i + 1] cuándo termina.
    """
    resultado = []
    for acorde, inicio, largo in agrupar(acordes):
        resultado.append({
            "inicio": round(float(tiempos[inicio]), 2),
            "fin": round(float(tiempos[inicio + largo]), 2),
            "acorde": acorde,
        })
    return resultado


# ---------------------------------------------------------------------------
# 6 y 7. Guardar el JSON y mostrar en la terminal
# ---------------------------------------------------------------------------

def formato_minutos(segundos):
    """Convierte 72.5 en '1:12'."""
    segundos = int(segundos)
    return f"{segundos // 60}:{segundos % 60:02d}"


def guardar_json(nombre, tempo, tramos):
    """Guarda el resultado en resultados/<nombre>.json y devuelve la ruta."""
    carpeta = RAIZ_PROYECTO / "resultados"
    carpeta.mkdir(exist_ok=True)
    ruta = carpeta / f"{nombre}.json"
    datos = {
        "cancion": nombre,
        "tempo": round(tempo, 1),
        "acordes": tramos,
    }
    # ensure_ascii=False mantiene los acentos y las eñes tal cual.
    with open(ruta, "w", encoding="utf-8") as archivo:
        json.dump(datos, archivo, ensure_ascii=False, indent=2)
    return ruta


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

    # Separamos el audio en parte armónica (instrumentos con notas) y
    # percusiva (batería). Cada una se usa para lo que mejor sirve.
    y_armonica, y_percusiva = librosa.effects.hpss(y)

    print("Detectando pulsos...")
    tempo, frames_pulsos = detectar_pulsos(y_percusiva, sr)

    print("Analizando acordes...")
    croma_pulsos, rms_pulsos, tiempos = cromagrama_por_pulso(y_armonica, sr, frames_pulsos)
    acordes = elegir_acordes(croma_pulsos, rms_pulsos)
    acordes = suavizar(acordes)
    tramos = armar_tramos(acordes, tiempos)

    ruta_json = guardar_json(nombre, tempo, tramos)

    print(f"\nTempo: {tempo:.1f} BPM  |  {len(tramos)} tramos de acordes\n")
    for tramo in tramos:
        print(f"{formato_minutos(tramo['inicio']):>5}  {tramo['acorde']}")
    print(f"\nGuardado en {ruta_json}")


if __name__ == "__main__":
    main()
