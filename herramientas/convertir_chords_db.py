"""
Convierte los acordes de guitarra de chords-db al formato de app/acordes.js.

chords-db: https://github.com/tombatossals/chords-db
Licencia MIT, Copyright (c) 2016 David Rubert (ver README.md).

Uso (desde la carpeta del proyecto):
    curl -L -o guitar.json https://raw.githubusercontent.com/tombatossals/chords-db/master/lib/guitar.json
    python herramientas/convertir_chords_db.py guitar.json

Genera app/acordes-extra.js con:
  - solo los tipos que app/acordes.js no tiene (mayor, menor, 7 y m7 se
    quedan con las 106 posiciones propias, ya verificadas);
  - solo las posiciones que pasan herramientas/verificar_acordes.py
    (las que no pasan se descartan y se informan).
"""

import json
import sys
from collections import Counter
from pathlib import Path

# El verificador está en esta misma carpeta.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from verificar_acordes import NOTAS, TIPOS, nota, revisar  # noqa: E402

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent
SALIDA = RAIZ_PROYECTO / "app" / "acordes-extra.js"

# Sufijos de chords-db que incorporamos, y cómo se llaman en la app.
# (Los de chords-db que no están acá, como "alt" o "maj13", no se usan.)
SUFIJOS = {
    "5": "5", "dim": "dim", "dim7": "dim7", "aug": "aug",
    "sus2": "sus2", "sus4": "sus4", "7sus4": "7sus4",
    "6": "6", "m6": "m6", "69": "69", "9": "9", "m9": "m9",
    "maj7": "maj7", "maj9": "maj9", "add9": "add9", "madd9": "madd9", "add11": "add11",
    "m7b5": "m7b5", "mmaj7": "mmaj7", "7b5": "7b5", "aug7": "aug7",
    "7b9": "7b9", "7#9": "7#9", "11": "11", "m11": "m11", "13": "13",
}


def nombre_en_la_app(clave, sufijo):
    """
    Nombre del acorde como lo escribe la app (con sostenidos), o None si no lo usamos.
      ("C", "sus2") -> "Csus2"   ("D", "/F#") -> "D/F#"   ("A", "m/G") -> "Am/G"
    """
    raiz = NOTAS[nota(clave)]
    if sufijo in SUFIJOS:
        return raiz + SUFIJOS[sufijo]
    # Acordes con bajo: "/E" (mayor con bajo en E) y "m/E" (menor con bajo en E).
    for tipo, prefijo in (("", "/"), ("m", "m/")):
        if sufijo.startswith(prefijo) and len(sufijo) > len(prefijo):
            bajo = sufijo[len(prefijo):]
            try:
                return f"{raiz}{tipo}/{NOTAS[nota(bajo)]}"
            except ValueError:
                return None
    return None


def convertir(posicion):
    """
    chords-db escribe los trastes relativos a "baseFret" (1 = el primer traste
    dibujado). La app los usa absolutos, y la cejilla como { traste, desde, hasta }.
    """
    base = posicion["baseFret"]
    relativos = posicion["frets"]
    resultado = {
        "trastes": [t if t <= 0 else t + base - 1 for t in relativos],
        "dedos": list(posicion["fingers"]),
    }
    barras = posicion.get("barres") or []
    if barras:
        barra = min(barras)                     # la más baja es la del índice
        cuerdas = [i for i, t in enumerate(relativos) if t == barra]
        if len(cuerdas) >= 2:
            desde, hasta = min(cuerdas), max(cuerdas)
            # Solo si no hay cuerdas al aire o sin tocar debajo de la barra.
            if all(relativos[i] >= barra for i in range(desde, hasta + 1)):
                resultado["cejilla"] = {"traste": barra + base - 1, "desde": desde, "hasta": hasta}
    return resultado


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    datos = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    acordes = {}
    incluidas, descartadas = Counter(), Counter()
    for grupo in datos["chords"].values():
        for acorde in grupo:
            nombre = nombre_en_la_app(acorde["key"], acorde["suffix"])
            if not nombre:
                continue
            tipo = nombre.split("/")[0][2:] if nombre[1] == "#" else nombre.split("/")[0][1:]
            familia = (tipo + "/bajo") if "/" in nombre else tipo
            for posicion in acorde["positions"]:
                convertida = convertir(posicion)
                problemas = revisar(nombre, convertida)
                if problemas:
                    descartadas[familia] += 1
                    print(f"  descartada {nombre} {convertida['trastes']}: {'; '.join(problemas)}")
                    continue
                incluidas[familia] += 1
                acordes.setdefault(nombre, []).append(convertida)

    # Orden: posiciones abiertas primero, después de la más baja a la más alta.
    def orden(p):
        pisados = [t for t in p["trastes"] if t > 0]
        return (0 if 0 in p["trastes"] else 1, min(pisados) if pisados else 0)

    lineas = [
        '"use strict";',
        "",
        "/* ==================================================================",
        "   Posiciones de acordes convertidas de chords-db",
        "   https://github.com/tombatossals/chords-db",
        "   Licencia MIT, Copyright (c) 2016 David Rubert (ver README.md).",
        "",
        "   Archivo GENERADO por herramientas/convertir_chords_db.py: no editar",
        "   a mano. Mismo formato que app/acordes.js (trastes absolutos por",
        "   cuerda de la 6ª a la 1ª, dedos, y cejilla { traste, desde, hasta }).",
        "   Cada posición pasó herramientas/verificar_acordes.py.",
        "   ================================================================== */",
        "",
        "const POSICIONES_EXTRA = {",
    ]
    nombres = sorted(acordes, key=lambda n: (nota(n[:2] if n[1:2] == "#" else n[0]), n))
    for i, nombre in enumerate(nombres):
        posiciones = sorted(acordes[nombre], key=orden)
        lineas.append(f'  "{nombre}": [')
        for posicion in posiciones:
            lineas.append("    " + json.dumps(posicion, separators=(", ", ": ")) + ",")
        lineas[-1] = lineas[-1].rstrip(",")
        lineas.append("  ]" + ("," if i < len(nombres) - 1 else ""))
    lineas.append("};")
    SALIDA.write_text("\n".join(lineas) + "\n", encoding="utf-8")

    print(f"\nGuardado {SALIDA.relative_to(RAIZ_PROYECTO)}: {len(acordes)} acordes, "
          f"{sum(incluidas.values())} posiciones ({sum(descartadas.values())} descartadas).")
    for familia in sorted(set(incluidas) | set(descartadas)):
        print(f"  {familia or 'mayor'}: {incluidas[familia]} incluidas, {descartadas[familia]} descartadas")


if __name__ == "__main__":
    main()
