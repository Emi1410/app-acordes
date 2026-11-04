"""
Prepara las fotos de la guitarra para el mástil "Foto" de la app.

Las fotos originales (fotos-guitarra/, sacadas sobre una tela azul lisa,
2448 × 3264) no se suben al repo: este programa genera, dentro de
app/fotos-mastil/, versiones livianas para el celular (WebP) con la
guitarra sobre un fondo oscuro de estudio, en dos tamaños: "chica" (para
empezar a mostrarla enseguida) y "grande", con toda la resolución de la
foto (la app la pide cuando la pantalla la necesita, para que de cerca
se vea nítida).

Uso (desde la carpeta del proyecto; necesita Pillow, numpy y scipy):
    pip install pillow numpy scipy
    python herramientas/preparar_fotos_mastil.py

Pasos, para cada foto:
  1. Recorte por color, como una pantalla verde pero azul: cada píxel tiene
     una "azulidad" (cuánto más azul que rojo y verde). La tela, también en
     su sombra (la del mástil sobre la tela es azul oscuro), da 0,4 o más;
     la guitarra da negativo o casi cero. Entre los dos umbrales el borde
     queda semitransparente (bordes suaves).
  2. Limpieza: se queda solo la mancha más grande (la guitarra) y se
     rellenan sus huecos: así los cromados, que reflejan la tela azul,
     no se recortan aunque su color se parezca al del fondo.
  3. Reflejo azul: en la guitarra el azul se baja hasta el nivel del rojo
     y el verde ("despill"), y los cromados quedan grises.
  4. Fondo de estudio: casi negro, con una luz cálida detrás de la guitarra
     y una sombra suave de la guitarra, corrida hacia abajo.
  5. Bordes de la foto: donde la guitarra sale del cuadro (el cuerpo
     cortado), se funde de a poco con el fondo.
  6. La diagonal se gira para que, con el celular acostado, el mástil quede
     tendido (el clavijero arriba a la derecha).
  7. Zona útil: si la guitarra sale del cuadro (el cuerpo cortado en una
     foto de cerca), el rectángulo de la imagen que no incluye esa parte
     fundida. La cámara de la app no sale de ahí (así nunca se ve fondo
     donde debería estar la guitarra). Se guarda, con el tamaño de cada
     foto, en app/fotos-mastil/fotos.js.
"""

from pathlib import Path

import json

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage

PROYECTO = Path(__file__).resolve().parent.parent
ORIGINALES = PROYECTO / "fotos-guitarra"
DESTINO = PROYECTO / "app" / "fotos-mastil"

# nombre en la app: (archivo original, giro en grados (antihorario), lado largo de la chica)
FOTOS = {
    "diagonal": ("IMG_20261104_010752.jpg", -41, 1400),   # la guitarra entera, de más lejos
    "perspectiva": ("PXL_20261104_001455417.jpg", 0, 1400),
    "frente": ("PXL_20261104_001415070.jpg", 0, 1400),
    "entera": ("PXL_20261104_001210344.jpg", 0, 700),
}

AZULIDAD_FONDO = 0.30     # desde acá, todo fondo
AZULIDAD_GUITARRA = 0.17  # hasta acá, todo guitarra (en el medio, borde suave)
AZULIDAD_TELA = 0.34      # aunque quede adentro de la silueta, esto es tela (entre las clavijas y el clavijero)
FUNDIDO_BORDE = 140       # px (en la foto original) en que la guitarra se funde al salir del cuadro


def azulidad(rgb):
    """Cuánto más azul que rojo y verde (el +20 evita que los píxeles muy oscuros salten)."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (b - np.maximum(r, g)) / (b + 20.0)


def mascara(rgb):
    """Transparencia (0 fondo, 1 guitarra), con bordes suaves y sin huecos."""
    k = azulidad(rgb)
    suave = np.clip((AZULIDAD_FONDO - k) / (AZULIDAD_FONDO - AZULIDAD_GUITARRA), 0, 1)
    # La mancha más grande (la guitarra), sin puntitos sueltos y con los huecos rellenos
    firme = ndimage.binary_opening(suave > 0.5, iterations=2)
    etiquetas, cuantas = ndimage.label(firme)
    if cuantas > 1:
        tamanos = ndimage.sum(firme, etiquetas, range(1, cuantas + 1))
        firme = etiquetas == (int(np.argmax(tamanos)) + 1)
    firme = ndimage.binary_closing(firme, iterations=3)
    firme = ndimage.binary_fill_holes(firme)
    # Adentro (un poco hacia el centro), opaco salvo lo que es tela segura; en el borde, lo que diga el color
    adentro = ndimage.binary_erosion(firme, iterations=3) & (k < AZULIDAD_TELA)
    cerca = ndimage.binary_dilation(firme, iterations=3)
    alfa = np.where(adentro, 1.0, np.where(cerca, suave, 0.0))
    alfa = ndimage.gaussian_filter(alfa, 0.8)
    return np.clip(alfa, 0, 1), firme


def sin_reflejo_azul(rgb):
    """Baja el azul que sobra (el reflejo de la tela) hasta el nivel del rojo y el verde."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    tope = np.maximum(r, g) * 1.04 + 3
    salida = rgb.copy()
    salida[..., 2] = np.minimum(b, tope)
    return salida


def fundido_en_bordes(alto, ancho):
    """1 lejos de los bordes de la foto, 0 en el borde (la guitarra sale del cuadro de a poco)."""
    y = np.minimum(np.arange(alto), np.arange(alto)[::-1])[:, None]
    x = np.minimum(np.arange(ancho), np.arange(ancho)[::-1])[None, :]
    d = np.minimum(y, x) / FUNDIDO_BORDE
    d = np.clip(d, 0, 1)
    return d * d * (3 - 2 * d)


def fondo_estudio(alto, ancho, alfa):
    """Casi negro, con una luz cálida y suave detrás de la guitarra (centrada en ella)."""
    ys, xs = np.nonzero(alfa[::8, ::8] > 0.5)
    cy, cx = ys.mean() * 8, xs.mean() * 8
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(np.float32)
    radio = 0.42 * max(alto, ancho)
    luz = np.exp(-(((yy - cy) ** 2 + (xx - cx) ** 2) / (2 * radio * radio)))
    base = np.array([9, 10, 12], np.float32)
    calida = np.array([52, 37, 23], np.float32)
    return base + luz[..., None] * (calida - base)


def preparar(nombre, archivo, giro, lado_chica):
    foto = ImageOps.exif_transpose(Image.open(ORIGINALES / archivo)).convert("RGB")
    rgb = np.asarray(foto).astype(np.float32)
    alto, ancho = rgb.shape[:2]
    alfa, _ = mascara(rgb)
    fundido = fundido_en_bordes(alto, ancho)
    # Guitarra que el borde de la foto corta (queda fundida con el fondo): la cámara la evita
    cortada = Image.fromarray(((alfa > 0.5) & (fundido < 0.98)).astype(np.uint8) * 255)
    alfa *= fundido
    limpio = sin_reflejo_azul(rgb)

    # La guitarra sola (con su transparencia); se gira antes de ponerle el fondo,
    # así el fondo cubre todo el cuadro nuevo (sin las esquinas del cuadro original).
    capa = np.dstack([limpio, alfa * 255]).clip(0, 255).astype(np.uint8)
    guitarra = Image.fromarray(capa, "RGBA")
    if giro:
        guitarra = guitarra.rotate(giro, resample=Image.BICUBIC, expand=True)
        cortada = cortada.rotate(giro, expand=True)
    capa = np.asarray(guitarra).astype(np.float32)
    rgb, alfa = capa[..., :3], capa[..., 3] / 255
    alto, ancho = alfa.shape

    # Fondo de estudio con la sombra de la guitarra (desenfocada, corrida hacia abajo y a la derecha)
    fondo = fondo_estudio(alto, ancho, alfa)
    sombra = ndimage.gaussian_filter(alfa, 45)
    sombra = ndimage.shift(sombra, (55, 35), order=1, mode="constant")
    fondo *= (1 - 0.65 * sombra)[..., None]
    final = fondo * (1 - alfa[..., None]) + rgb * alfa[..., None]
    imagen = Image.fromarray(np.clip(final, 0, 255).astype(np.uint8))

    # Recorte: la guitarra con un margen
    ys, xs = np.nonzero(alfa > 0.5)
    margen = 160
    caja = (max(0, xs.min() - margen), max(0, ys.min() - margen),
            min(ancho, xs.max() + margen), min(alto, ys.max() + margen))
    imagen = imagen.crop(caja)
    zona = zona_util(np.asarray(cortada.crop(caja)) > 127)

    DESTINO.mkdir(parents=True, exist_ok=True)
    for tamano in ("chica", "grande"):
        copia = imagen.copy()
        if tamano == "chica":
            copia.thumbnail((lado_chica, lado_chica), Image.LANCZOS)
            copia = copia.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
        ruta = DESTINO / f"{nombre}-{tamano}.webp"
        copia.save(ruta, "WEBP", quality=82, method=6)
        print(f"{ruta.relative_to(PROYECTO)}: {copia.width} x {copia.height}, {ruta.stat().st_size // 1024} KB")
    return {"ancho": imagen.width, "alto": imagen.height, "zona": zona}


def zona_util(cortada):
    """El rectángulo (de 0 a 1) sin la guitarra cortada: cada lado se corre hasta dejarla afuera."""
    alto, ancho = cortada.shape
    x0, y0, x1, y1 = 0, 0, ancho, alto
    ys, xs = np.nonzero(cortada)
    if len(ys):
        # De qué lado está cada pedazo cortado: del borde más cercano
        for y, x in zip(ys[::50], xs[::50]):
            distancias = {"arriba": y, "abajo": alto - y, "izquierda": x, "derecha": ancho - x}
            lado = min(distancias, key=distancias.get)
            if lado == "arriba": y0 = max(y0, y + 1)
            elif lado == "abajo": y1 = min(y1, y)
            elif lado == "izquierda": x0 = max(x0, x + 1)
            else: x1 = min(x1, x)
    return {"x0": round(x0 / ancho, 4), "y0": round(y0 / alto, 4), "x1": round(x1 / ancho, 4), "y1": round(y1 / alto, 4)}


if __name__ == "__main__":
    datos = {nombre: preparar(nombre, archivo, giro, lado_chica) for nombre, (archivo, giro, lado_chica) in FOTOS.items()}
    texto = ("// Tamaño de cada foto del mástil \"Foto\" (la grande) y su zona útil (de 0 a 1): la cámara\n"
             "// no sale de ahí. Lo genera herramientas/preparar_fotos_mastil.py: no editar a mano.\n"
             "window.FOTOS_MASTIL = " + json.dumps(datos, indent=2) + ";\n")
    (DESTINO / "fotos.js").write_text(texto, encoding="utf-8")
    print(texto)
