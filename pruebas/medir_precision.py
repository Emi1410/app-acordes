"""
Mide la precisión del analizador comparando la SECUENCIA de acordes detectada
con el cifrado real de cada canción de referencia, sin importar los tiempos exactos.

Uso (desde la carpeta del proyecto, con el entorno activado):
    python pruebas/medir_precision.py                      # prueba las variantes de analizar.py en las dos canciones
    python pruebas/medir_precision.py --cancion intoxicarme   # solo una canción
    python pruebas/medir_precision.py otro.json            # evalúa un JSON ya generado (por ejemplo, el del celu)
    python pruebas/medir_precision.py otro.json --cancion intoxicarme

Canciones de referencia (en canciones/):
    cuchillos    Airbag, "Cuchillos Guantanamera" (Prueba.mp3, la versión de River Plate)
    intoxicarme  Airbag, "Intoxicarme" (Vivo en Vélez)
Un JSON se compara con la canción que diga --cancion; si no se indica, se
adivina por el nombre del archivo o el campo "cancion" (si no, Cuchillos).

Cómo se compara:
  1. De los dos lados se arma la secuencia de acordes: cada acorde se reduce a
     su raíz y si es mayor o menor (B7 = B, C#m7 = C#m, Asus4 = A, A/C# = A,
     Bb = A#), se unen los acordes iguales seguidos ("C#m C#m" cuenta como uno)
     y se saca "N" (sin acorde).
  2. Se busca la subsecuencia común más larga (LCS): los acordes que aparecen
     en el mismo orden en las dos secuencias, aunque haya otros en el medio.
  3. Con eso se calculan:
       cobertura = acordes del cifrado real que se detectaron / total del cifrado
       precisión = acordes detectados que están en el cifrado / total detectados
       F1        = promedio armónico de las dos (resume ambas en un número)
     Si faltan acordes de la base, baja la cobertura; si sobran acordes
     inventados, baja la precisión.
"""

import json
import re
import sys
import time
from pathlib import Path

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ_PROYECTO / "analizador"))
import analizar  # noqa: E402

# ---------------------------------------------------------------------------
# Cifrados reales: solo los nombres de los acordes de cada sección.
# ---------------------------------------------------------------------------

# Airbag, "Cuchillos Guantanamera" (canciones/Prueba.mp3)
VUELTA = ["A", "E", "G#", "C#m"]
ESTROFA = VUELTA * 3 + ["A", "E", "G#", "G#7"]
ESTRIBILLO = VUELTA * 3 + ["A", "E", "B", "B7"]
CIFRADO_CUCHILLOS = (
    ["C#m", "C#m", "A", "E", "G#", "C#m", "A", "E", "B", "B7"]   # intro
    + ESTROFA + ESTRIBILLO
    + ESTROFA + ESTRIBILLO
    + VUELTA * 3 + ["A", "E", "G#"]                               # solo
    + VUELTA * 5                                                  # estribillo final
    + ["A", "E", "G#", "C#m", "A", "E", "B", "B7", "C#m"]         # instrumental
)
CIFRADO_PRUEBA = CIFRADO_CUCHILLOS   # nombre anterior

# Airbag, "Intoxicarme" (Vivo en Vélez)
def _acordes(texto):
    return texto.split()

CIFRADO_INTOXICARME = (
    _acordes("Am Am Am C G  Am Am Am C G")                        # intro
    + _acordes("Am F E  Am F E")                                  # estrofa 1
    + _acordes("Am C G  Am C G")                                  # estribillo
    + _acordes("Am F E  Am F E")                                  # estrofa 2
    + _acordes("Am C G  Am C G Am  C G Am C G")                   # estribillo
    + _acordes("Am F E  Am F E")                                  # estrofa 3
    + _acordes("F E  F E  F E D  E")                              # puente
    + _acordes("Am F E Am F E  Am F E Am F E")                    # solo
    + _acordes("Am C G  Am C G Am  C G Dm Am  C G Dm Am  C G Dm Am")   # estribillo final
)

CANCIONES = {
    "cuchillos": {"titulo": "Cuchillos Guantanamera", "mp3": "Prueba.mp3", "cifrado": CIFRADO_CUCHILLOS},
    "intoxicarme": {"titulo": "Intoxicarme",
                    "mp3": "AIRBAG - Intoxicarme - Vivo en Velez (Live at Velez Stadium).mp3",
                    "cifrado": CIFRADO_INTOXICARME},
}

# ---------------------------------------------------------------------------
# Comparación
# ---------------------------------------------------------------------------

SEMITONO = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
# Tipos con tercera menor (el resto cuenta como mayor: 7, maj7, sus, add9, 5...).
TIPOS_MENORES = {"m", "m7", "m6", "m9", "m11", "madd9", "mmaj7", "m7b5", "dim", "dim7", "min", "min7", "-", "-7"}


def familia(acorde):
    """'C#m7' -> 'C#m', 'Bb' -> 'A#', 'Asus4' -> 'A', 'D/F#' -> 'D'. None si no se reconoce."""
    partes = re.match(r"^([A-G])([#b]?)([^/]*)", acorde.strip())
    if not partes:
        return None
    letra, alteracion, tipo = partes.groups()
    raiz = (SEMITONO[letra] + (1 if alteracion == "#" else -1 if alteracion == "b" else 0)) % 12
    return NOTAS[raiz] + ("m" if tipo in TIPOS_MENORES else "")


def secuencia(acordes):
    """Lista de nombres -> secuencia comparable (raíz y mayor/menor, sin N, sin repetidos seguidos)."""
    resultado = []
    for acorde in acordes:
        if acorde == "N":
            continue
        nombre = familia(acorde)
        if nombre and (not resultado or resultado[-1] != nombre):
            resultado.append(nombre)
    return resultado


def subsecuencia_comun(a, b):
    """Largo de la subsecuencia común más larga (programación dinámica clásica)."""
    fila = [0] * (len(b) + 1)
    for x in a:
        anterior = 0
        for j, y in enumerate(b, start=1):
            guardado = fila[j]
            fila[j] = anterior + 1 if x == y else max(fila[j], fila[j - 1])
            anterior = guardado
    return fila[-1]


def evaluar(nombres_detectados, cifrado=CIFRADO_CUCHILLOS):
    detectada, real = secuencia(nombres_detectados), secuencia(cifrado)
    comunes = subsecuencia_comun(detectada, real)
    cobertura = comunes / len(real)
    precision = comunes / len(detectada) if detectada else 0.0
    f1 = 2 * cobertura * precision / (cobertura + precision) if comunes else 0.0
    return {"detectados": len(detectada), "reales": len(real), "comunes": comunes,
            "cobertura": cobertura, "precision": precision, "f1": f1}


def fila(nombre, r, segundos=None):
    tiempo = f"{segundos:6.1f} s" if segundos is not None else "      -"
    return (f"| {nombre:<40} | {r['cobertura']:6.1%} | {r['precision']:6.1%} | {r['f1']:6.1%} "
            f"| {r['comunes']:3d}/{r['reales']:3d} | {r['detectados']:4d} | {tiempo} |")


ENCABEZADO = ("| Versión                                  | Cobert. | Precis. |   F1   | Comunes | Det. | Tiempo   |\n"
              "|------------------------------------------|--------:|--------:|-------:|--------:|-----:|---------:|")

# ---------------------------------------------------------------------------
# Variantes del analizador
# ---------------------------------------------------------------------------

# Cada mejora por separado sobre la versión anterior (afinación + Viterbi, sin
# el bajo); la primera fila es la base con la que se compara el resumen.
ACTUAL = analizar.OPCIONES_PREDETERMINADAS
ANTERIOR = {**ACTUAL, "bajo": False}
VARIANTES = [
    ("Anterior (afinación + Viterbi)", ANTERIOR),
    ("Original (HPSS, mediana)", analizar.OPCIONES_ORIGINALES),
    ("+ HPSS (separar batería)", {**ANTERIOR, "hpss": True}),
    ("+ medio pulso", {**ANTERIOR, "medio_pulso": True}),
    ("+ croma con compresión logarítmica", {**ANTERIOR, "log": True}),
    ("+ croma reforzado con repeticiones", {**ANTERIOR, "repeticiones": True}),
    ("Actual: + croma del bajo para la raíz", ACTUAL),
]


def sensibilidad(y, sr, opciones, cifrado):
    """
    Prueba el Viterbi con otros valores de sus parámetros, para ver si la
    mejora depende de un valor exacto (eso sería "ajustar a esta canción").
    """
    print("\nSensibilidad del Viterbi (F1 con cada combinación de parámetros):")
    originales = (analizar.NITIDEZ_VITERBI, analizar.PROBABILIDAD_CAMBIO, analizar.PREFERENCIA_TONALIDAD)
    print("| Nitidez | Cambio/pulso | Pref. tonalidad |   F1   |\n|--------:|-------------:|----------------:|-------:|")
    for nitidez in (15, 25, 40):
        for cambio in (0.06, 0.12, 0.25):
            for preferencia in (1.0, 3.0):
                analizar.NITIDEZ_VITERBI, analizar.PROBABILIDAD_CAMBIO, analizar.PREFERENCIA_TONALIDAD = nitidez, cambio, preferencia
                r = evaluar([t["acorde"] for t in analizar.analizar_audio(y, sr, opciones)["tramos"]], cifrado)
                print(f"| {nitidez:7} | {cambio:12} | {preferencia:15} | {r['f1']:6.1%} |", flush=True)
    analizar.NITIDEZ_VITERBI, analizar.PROBABILIDAD_CAMBIO, analizar.PREFERENCIA_TONALIDAD = originales


def adivinar_cancion(ruta, datos):
    texto = (Path(ruta).stem + " " + str(datos.get("cancion", ""))).lower()
    for clave in CANCIONES:
        if clave in texto:
            return clave
    return "cuchillos"


def main():
    argumentos = sys.argv[1:]
    elegida = None
    if "--cancion" in argumentos:
        i = argumentos.index("--cancion")
        elegida = argumentos[i + 1].lower()
        del argumentos[i:i + 2]
        if elegida not in CANCIONES:
            sys.exit(f"No conozco la canción '{elegida}'. Opciones: {', '.join(CANCIONES)}")
    archivos = [a for a in argumentos if not a.startswith("--")]

    if archivos:
        # Evaluar JSON ya generados (por ejemplo, los de la versión del celu).
        print(ENCABEZADO)
        for ruta in archivos:
            datos = json.loads(Path(ruta).read_text(encoding="utf-8"))
            clave = elegida or adivinar_cancion(ruta, datos)
            nombre = f"{Path(ruta).stem[:28]} ({clave})"
            print(fila(nombre, evaluar([t["acorde"] for t in datos["acordes"]], CANCIONES[clave]["cifrado"])))
        return

    claves = [elegida] if elegida else list(CANCIONES)
    resultados = {}   # (variante, canción) -> F1
    for clave in claves:
        cancion = CANCIONES[clave]
        print(f"\n## {cancion['titulo']} (canciones/{cancion['mp3']})")
        y, sr = analizar.cargar_audio(RAIZ_PROYECTO / "canciones" / cancion["mp3"])
        # La primera vez librosa compila funciones y tarda de más: hacemos una
        # pasada de "entrada en calor" para que los tiempos sean comparables.
        analizar.analizar_audio(y, sr, {"hpss": False})
        print(f"Cifrado real: {len(secuencia(cancion['cifrado']))} acordes en secuencia\n")
        print(ENCABEZADO)
        for nombre, opciones in VARIANTES:
            inicio = time.perf_counter()
            resultado = analizar.analizar_audio(y, sr, opciones)
            segundos = time.perf_counter() - inicio
            r = evaluar([t["acorde"] for t in resultado["tramos"]], cancion["cifrado"])
            resultados[(nombre, clave)] = r["f1"]
            print(fila(nombre, r, segundos), flush=True)
        if "--sensibilidad" in sys.argv:
            sensibilidad(y, sr, ACTUAL, cancion["cifrado"])

    # Resumen: ¿qué variante mejora el F1 en TODAS las canciones?
    if len(claves) > 1:
        base = VARIANTES[0][0]
        print("\n## Resumen (F1)\n")
        print("| Versión                                  | " + " | ".join(f"{CANCIONES[c]['titulo'][:12]:>12}" for c in claves) + " | ¿Mejora en todas? |")
        print("|------------------------------------------|" + "|".join("-------------:" for _ in claves) + "|:-----------------:|")
        for nombre, _ in VARIANTES:
            valores = [resultados[(nombre, c)] for c in claves]
            mejora = nombre != base and all(resultados[(nombre, c)] > resultados[(base, c)] for c in claves)
            print(f"| {nombre:<40} | " + " | ".join(f"{v:12.1%}" for v in valores)
                  + f" | {'sí' if mejora else '-':^17} |")


if __name__ == "__main__":
    main()
