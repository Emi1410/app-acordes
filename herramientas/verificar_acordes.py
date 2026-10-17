"""
Verifica las posiciones de acordes de la app.

Uso (desde la carpeta del proyecto):
    python herramientas/verificar_acordes.py

Revisa:
  - app/acordes.js: las posiciones abiertas escritas a mano y las formas de
    cejilla (corridas a los 12 tonos).
  - app/acordes-extra.js: las posiciones convertidas de chords-db.

Para cada posición calcula qué nota suena en cada cuerda y comprueba que:
  1. no suene ninguna nota que no sea del acorde,
  2. estén las notas obligatorias (algunas, como la quinta, se pueden omitir),
  3. el bajo (la cuerda más grave que suena) sea la raíz, o la nota indicada
     después de la barra en los acordes con bajo (D/F#),
  4. los dedos coincidan con las cuerdas pisadas y un dedo no esté en dos trastes,
  5. la cejilla no tape cuerdas al aire y la posición no sea demasiado estirada.
"""

import json
import re
import sys
from pathlib import Path

RAIZ_PROYECTO = Path(__file__).resolve().parent.parent

NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
BEMOLES = {"Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"}

# Nota de cada cuerda al aire, de la 6ª (Mi grave) a la 1ª (Mi agudo).
AL_AIRE = [4, 9, 2, 7, 11, 4]

# Tipo de acorde -> (notas permitidas, notas obligatorias), en semitonos desde la raíz.
# 0 raíz · 2 novena · 3 tercera menor · 4 tercera mayor · 5 cuarta/oncena
# 6 quinta disminuida · 7 quinta · 8 quinta aumentada · 9 sexta/trecena
# 10 séptima menor · 11 séptima mayor · 1 novena menor · 3 (en 7#9) novena aumentada
TIPOS = {
    "":      ({0, 4, 7}, {0, 4, 7}),
    "m":     ({0, 3, 7}, {0, 3, 7}),
    "7":     ({0, 4, 7, 10}, {0, 4, 10}),
    "m7":    ({0, 3, 7, 10}, {0, 3, 10}),
    "5":     ({0, 7}, {0, 7}),
    "dim":   ({0, 3, 6}, {0, 3, 6}),
    "dim7":  ({0, 3, 6, 9}, {0, 3, 9}),
    "aug":   ({0, 4, 8}, {0, 4, 8}),
    "sus2":  ({0, 2, 7}, {0, 2}),
    "sus4":  ({0, 5, 7}, {0, 5}),
    "7sus4": ({0, 5, 7, 10}, {0, 5, 10}),
    "6":     ({0, 4, 7, 9}, {0, 4, 9}),
    "m6":    ({0, 3, 7, 9}, {0, 3, 9}),
    "69":    ({0, 2, 4, 7, 9}, {0, 2, 4, 9}),
    "9":     ({0, 2, 4, 7, 10}, {0, 2, 4, 10}),
    "m9":    ({0, 2, 3, 7, 10}, {0, 2, 3, 10}),
    "maj7":  ({0, 4, 7, 11}, {0, 4, 11}),
    "maj9":  ({0, 2, 4, 7, 11}, {0, 2, 4, 11}),
    "add9":  ({0, 2, 4, 7}, {0, 2, 4}),
    "madd9": ({0, 2, 3, 7}, {0, 2, 3}),
    "add11": ({0, 4, 5, 7}, {0, 4, 5}),
    "m7b5":  ({0, 3, 6, 10}, {0, 3, 6, 10}),
    "mmaj7": ({0, 3, 7, 11}, {0, 3, 11}),
    "7b5":   ({0, 4, 6, 10}, {0, 4, 6, 10}),
    "aug7":  ({0, 4, 8, 10}, {0, 4, 8, 10}),
    "7b9":   ({0, 1, 4, 7, 10}, {0, 1, 4, 10}),
    "7#9":   ({0, 3, 4, 7, 10}, {0, 3, 4, 10}),
    "11":    ({0, 2, 4, 5, 7, 10}, {0, 5, 10}),
    "m11":   ({0, 2, 3, 5, 7, 10}, {0, 3, 5, 10}),
    "13":    ({0, 2, 4, 7, 9, 10}, {0, 4, 9, 10}),
}


def nota(nombre):
    """'Bb' -> 10, 'C#' -> 1."""
    return NOTAS.index(BEMOLES.get(nombre, nombre))


def separar(nombre):
    """'D/F#' -> (2, '', 6); 'C#m7' -> (1, 'm7', None)."""
    partes = re.fullmatch(r"([A-G][#b]?)(.*?)(?:/([A-G][#b]?))?", nombre)
    if not partes:
        raise ValueError(f"nombre de acorde desconocido: {nombre}")
    bajo = nota(partes[3]) if partes[3] else None
    return nota(partes[1]), partes[2], bajo


def revisar(nombre, posicion):
    """Devuelve una lista de problemas (vacía si la posición es correcta)."""
    raiz, tipo, bajo = separar(nombre)
    if tipo not in TIPOS:
        return [f"tipo desconocido: {tipo!r}"]
    permitidas, obligatorias = TIPOS[tipo]
    permitidas = {(raiz + i) % 12 for i in permitidas}
    obligatorias = {(raiz + i) % 12 for i in obligatorias}
    if bajo is not None:          # en D/F#, el F# también es parte del acorde
        permitidas.add(bajo)
        obligatorias.add(bajo)

    trastes, dedos = posicion["trastes"], posicion["dedos"]
    if len(trastes) != 6 or len(dedos) != 6:
        return ["no tiene 6 cuerdas"]
    suenan = [(AL_AIRE[c] + t) % 12 for c, t in enumerate(trastes) if t >= 0]
    if not suenan:
        return ["no suena ninguna cuerda"]

    problemas = []
    sobran = set(suenan) - permitidas
    faltan = obligatorias - set(suenan)
    if sobran:
        problemas.append("suenan notas de más: " + ", ".join(NOTAS[n] for n in sorted(sobran)))
    if faltan:
        problemas.append("faltan notas: " + ", ".join(NOTAS[n] for n in sorted(faltan)))
    bajo_esperado = raiz if bajo is None else bajo
    if suenan[0] != bajo_esperado:
        problemas.append(f"el bajo es {NOTAS[suenan[0]]} y debería ser {NOTAS[bajo_esperado]}")

    traste_de_dedo = {}
    for c, (t, d) in enumerate(zip(trastes, dedos)):
        if (t > 0) != (d > 0):
            problemas.append(f"el dedo de la cuerda {6 - c} no coincide con el traste")
        if d > 0:
            if traste_de_dedo.setdefault(d, t) != t:
                problemas.append(f"el dedo {d} está en dos trastes distintos")

    cejilla = posicion.get("cejilla")
    if cejilla:
        for c in range(cejilla["desde"], cejilla["hasta"] + 1):
            if trastes[c] < cejilla["traste"]:
                problemas.append(f"la cejilla tapa la cuerda {6 - c}")

    pisados = [t for t in trastes if t > 0]
    if pisados and max(pisados) - min(pisados) > 3:
        problemas.append("demasiado estirada (más de 4 trastes)")
    return problemas


# ---------------------------------------------------------------------------
# Lectura de los archivos de la app
# ---------------------------------------------------------------------------

def numeros(texto):
    return [int(x) for x in texto.split(",")]


def posiciones_de_acordes_js(ruta):
    """Lee app/acordes.js: posiciones abiertas y formas de cejilla corridas a los 12 tonos."""
    fuente = ruta.read_text(encoding="utf-8")
    resultado = []

    # Posiciones abiertas: "C7":  [{ trastes: [...], dedos: [...], cejilla?: {...} }],
    bloque = fuente[fuente.index("const ACORDES_ABIERTOS"):fuente.index("const FORMAS_CEJILLA")]
    for nombre, cuerpo in re.findall(r'"([A-G]#?m?7?)":\s*\[\{(.*?)\}\]', bloque, re.S):
        posicion = {
            "trastes": numeros(re.search(r"trastes: \[(.*?)\]", cuerpo)[1]),
            "dedos": numeros(re.search(r"dedos: \[(.*?)\]", cuerpo)[1]),
        }
        cejilla = re.search(r"cejilla: \{ traste: (\d+), desde: (\d+), hasta: (\d+)", cuerpo)
        if cejilla:
            posicion["cejilla"] = dict(zip(("traste", "desde", "hasta"), map(int, cejilla.groups())))
        resultado.append(("abierta", nombre, posicion))

    # Formas de cejilla: se corren a cada raíz, como hace moverForma().
    bloque = fuente[fuente.index("const FORMAS_CEJILLA"):fuente.index("function normalizarAcorde")]
    tipo = None
    for linea in bloque.splitlines():
        encabezado = re.match(r'\s*"(m7|m|7|)": \[', linea)
        if encabezado:
            tipo = encabezado[1]
            continue
        forma = re.search(r"notaAlAire: (\d+), trastes: \[(.*?)\], dedos: \[(.*?)\], desde: (\d)", linea)
        if not forma:
            continue
        al_aire, trastes, dedos, desde = forma.groups()
        for raiz in range(12):
            traste = (raiz - int(al_aire)) % 12
            if traste == 0:
                continue
            posicion = {
                "trastes": [t if t < 0 else t + traste for t in numeros(trastes)],
                "dedos": numeros(dedos),
                "cejilla": {"traste": traste, "desde": int(desde), "hasta": 5},
            }
            resultado.append(("cejilla", NOTAS[raiz] + tipo, posicion))
    return resultado


def posiciones_de_extra_js(ruta):
    """Lee app/acordes-extra.js (un objeto JSON asignado a POSICIONES_EXTRA)."""
    fuente = ruta.read_text(encoding="utf-8")
    inicio = fuente.index("{", fuente.index("const POSICIONES_EXTRA"))
    fin = fuente.rindex("}") + 1
    datos = json.loads(fuente[inicio:fin])
    return [("chords-db", nombre, p) for nombre, lista in datos.items() for p in lista]


def main():
    todas = posiciones_de_acordes_js(RAIZ_PROYECTO / "app" / "acordes.js")
    extra = RAIZ_PROYECTO / "app" / "acordes-extra.js"
    if extra.exists():
        todas += posiciones_de_extra_js(extra)

    errores = 0
    for origen, nombre, posicion in todas:
        problemas = revisar(nombre, posicion)
        if problemas:
            errores += 1
            print(f"[{origen}] {nombre} {posicion['trastes']}: " + "; ".join(problemas))

    por_origen = {}
    for origen, _, _ in todas:
        por_origen[origen] = por_origen.get(origen, 0) + 1
    detalle = ", ".join(f"{cantidad} {origen}" for origen, cantidad in por_origen.items())
    print(f"{len(todas)} posiciones revisadas ({detalle}), {errores} con errores")
    sys.exit(1 if errores else 0)


if __name__ == "__main__":
    main()
