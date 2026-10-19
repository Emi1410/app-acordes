# app-acordes

App para el celular que muestra los acordes de una canción sincronizados mientras suena el mp3, para tocar la guitarra encima.

El proyecto tiene dos partes:

- **Analizador (Python, en la compu):** recibe un mp3 y genera un archivo JSON con los acordes y el segundo en que empieza cada uno.
- **App del celular (`app/`):** página web que guarda las canciones en el celular, las puede analizar ahí mismo y muestra los acordes mientras suena el mp3.

## Estructura

- `analizador/`: código Python del analizador.
- `app/`: la app (HTML, CSS y JavaScript, sin librerías externas).
- `herramientas/`: scripts para generar y verificar las posiciones de acordes.
- `pruebas/`: página para comparar el analizador de JavaScript con el de Python.
- `canciones/`: los mp3 a analizar (no se suben a Git).
- `resultados/`: los JSON generados.

## Posiciones de acordes

Las posiciones de mayor, menor, 7 y m7 están en `app/acordes.js`. El resto de los tipos (sus2, sus4, dim, aug, maj7, add9, 6, 9, acordes con bajo como D/F#, etc.) están en `app/acordes-extra.js`, generado a partir de chords-db (ver Créditos).

Para verificar que todas las posiciones hagan sonar las notas correctas:

```powershell
python herramientas/verificar_acordes.py
```

Para regenerar `app/acordes-extra.js` desde chords-db:

```powershell
curl -L -o guitar.json https://raw.githubusercontent.com/tombatossals/chords-db/master/lib/guitar.json
python herramientas/convertir_chords_db.py guitar.json
```

El conversor solo incluye las posiciones que pasan la verificación.

## Activar el entorno en Windows (PowerShell)

Desde la carpeta del proyecto:

```powershell
.\venv\Scripts\Activate.ps1
```

Si PowerShell no deja ejecutar el script, habilitalo una sola vez para tu usuario:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Para salir del entorno: `deactivate`.

Si tenés que recrear el entorno desde cero:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Créditos

### alphaTab (tablaturas)

La vista "Tabs" usa [alphaTab](https://github.com/CoderLine/alphaTab) **1.8.4**, de Daniel Kuschny y colaboradores,
para leer y dibujar los archivos de Guitar Pro. Está publicada con la
[Mozilla Public License 2.0](https://mozilla.org/MPL/2.0/): los archivos están en `app/lib/alphatab/` sin
modificar, copiados del paquete npm `@coderline/alphatab@1.8.4`, con la licencia completa en
`app/lib/alphatab/LICENSE-MPL-2.0.txt`. El código fuente original está en el repositorio de alphaTab.

alphaTab usa la fuente musical **Bravura** (Steinberg Media Technologies), publicada con la
SIL Open Font License 1.1 (ver `app/lib/alphatab/font/Bravura-OFL.txt`).

### chords-db (posiciones de acordes)

Las posiciones de acordes de `app/acordes-extra.js` están convertidas de
[chords-db](https://github.com/tombatossals/chords-db), de David Rubert,
publicada con la siguiente licencia:

```
MIT License

Copyright (c) 2016 David Rubert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
