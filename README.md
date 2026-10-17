# app-acordes

App para el celular que muestra los acordes de una canción sincronizados mientras suena el mp3, para tocar la guitarra encima.

El proyecto tiene dos partes:

- **Analizador (Python, en la compu):** recibe un mp3 y genera un archivo JSON con los acordes y el segundo en que empieza cada uno.
- **App del celular (más adelante):** lee ese JSON y muestra los acordes mientras suena la canción.

## Estructura

- `analizador/`: código Python del analizador.
- `canciones/`: los mp3 a analizar (no se suben a Git).
- `resultados/`: los JSON generados.

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
