"""
Mide la precisión del analizador comparando la SECUENCIA de acordes detectada
con el cifrado real de la canción, sin importar los tiempos exactos.

Uso (desde la carpeta del proyecto, con el entorno activado):
    python pruebas/medir_precision.py              # prueba las variantes de analizar.py
    python pruebas/medir_precision.py otro.json    # evalúa un JSON ya generado (por ejemplo, el del celu)

Cómo se compara:
  1. De los dos lados se arma la secuencia de acordes: se unen los acordes
     iguales seguidos ("C#m C#m" cuenta como uno), las séptimas cuentan como
     el acorde sin séptima (B7 = B, G#7 = G#) y se saca "N" (sin acorde).
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
import sys
import time
from pathlib import Path

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ_PROYECTO / "analizador"))
import analizar  # noqa: E402

# ---------------------------------------------------------------------------
# Cifrado real de canciones/Prueba.mp3 (Airbag, "Cuchillos Guantanamera"),
# solo los nombres de los acordes de cada sección.
# ---------------------------------------------------------------------------

VUELTA = ["A", "E", "G#", "C#m"]
ESTROFA = VUELTA * 3 + ["A", "E", "G#", "G#7"]
ESTRIBILLO = VUELTA * 3 + ["A", "E", "B", "B7"]
CIFRADO_PRUEBA = (
    ["C#m", "C#m", "A", "E", "G#", "C#m", "A", "E", "B", "B7"]   # intro
    + ESTROFA + ESTRIBILLO
    + ESTROFA + ESTRIBILLO
    + VUELTA * 3 + ["A", "E", "G#"]                               # solo
    + VUELTA * 5                                                  # estribillo final
    + ["A", "E", "G#", "C#m", "A", "E", "B", "B7", "C#m"]         # instrumental
)


def secuencia(acordes):
    """Lista de nombres -> secuencia comparable (sin 7, sin N, sin repetidos seguidos)."""
    resultado = []
    for acorde in acordes:
        if acorde == "N":
            continue
        acorde = acorde[:-1] if acorde.endswith("7") else acorde      # B7 -> B, C#m7 -> C#m
        if not resultado or resultado[-1] != acorde:
            resultado.append(acorde)
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


def evaluar(nombres_detectados, cifrado=CIFRADO_PRUEBA):
    detectada, real = secuencia(nombres_detectados), secuencia(cifrado)
    comunes = subsecuencia_comun(detectada, real)
    cobertura = comunes / len(real)
    precision = comunes / len(detectada) if detectada else 0.0
    f1 = 2 * cobertura * precision / (cobertura + precision) if comunes else 0.0
    return {"detectados": len(detectada), "reales": len(real), "comunes": comunes,
            "cobertura": cobertura, "precision": precision, "f1": f1}


def fila(nombre, r, segundos=None):
    tiempo = f"{segundos:6.1f} s" if segundos is not None else "      -"
    return (f"| {nombre:<34} | {r['cobertura']:6.1%} | {r['precision']:6.1%} | {r['f1']:6.1%} "
            f"| {r['comunes']:3d}/{r['reales']:3d} | {r['detectados']:4d} | {tiempo} |")


ENCABEZADO = ("| Versión                            | Cobert. | Precis. |   F1   | Comunes | Det. | Tiempo   |\n"
              "|------------------------------------|--------:|--------:|-------:|--------:|-----:|---------:|")

# Variantes a medir: cada mejora por separado sobre la versión original, y
# al final la combinación que quedó como predeterminada en analizar.py.
BASE = analizar.OPCIONES_ORIGINALES
VARIANTES = [
    ("Original (HPSS, mediana)", BASE),
    ("Sin corregir afinación", {**BASE, "afinacion": False}),
    ("Sin HPSS", {**BASE, "hpss": False}),
    ("Viterbi", {**BASE, "suavizado": "viterbi"}),
    ("Medio pulso", {**BASE, "medio_pulso": True}),
    ("Viterbi + medio pulso", {**BASE, "suavizado": "viterbi", "medio_pulso": True}),
    ("Nueva: afinación + Viterbi, sin HPSS", analizar.OPCIONES_PREDETERMINADAS),
]


def sensibilidad(y, sr, opciones):
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
                r = evaluar([t["acorde"] for t in analizar.analizar_audio(y, sr, opciones)["tramos"]])
                print(f"| {nitidez:7} | {cambio:12} | {preferencia:15} | {r['f1']:6.1%} |", flush=True)
    analizar.NITIDEZ_VITERBI, analizar.PROBABILIDAD_CAMBIO, analizar.PREFERENCIA_TONALIDAD = originales


def main():
    archivos = [a for a in sys.argv[1:] if not a.startswith("--")]
    if archivos:
        # Evaluar JSON ya generados (por ejemplo, los de la versión del celu).
        print(ENCABEZADO)
        for ruta in archivos:
            datos = json.loads(Path(ruta).read_text(encoding="utf-8"))
            print(fila(Path(ruta).stem[:34], evaluar([t["acorde"] for t in datos["acordes"]])))
        return

    print("Cargando canciones/Prueba.mp3...")
    y, sr = analizar.cargar_audio(RAIZ_PROYECTO / "canciones" / "Prueba.mp3")
    # La primera vez librosa compila funciones y tarda de más: hacemos una
    # pasada de "entrada en calor" para que los tiempos sean comparables.
    analizar.analizar_audio(y, sr, {"hpss": False})
    print(f"Cifrado real: {len(secuencia(CIFRADO_PRUEBA))} acordes en secuencia\n")
    print(ENCABEZADO)
    for nombre, opciones in VARIANTES:
        inicio = time.perf_counter()
        resultado = analizar.analizar_audio(y, sr, opciones)
        segundos = time.perf_counter() - inicio
        print(fila(nombre, evaluar([t["acorde"] for t in resultado["tramos"]]), segundos), flush=True)

    if "--sensibilidad" in sys.argv:
        sensibilidad(y, sr, analizar.OPCIONES_PREDETERMINADAS)


if __name__ == "__main__":
    main()
