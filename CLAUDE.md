# app-acordes

## Reglas

- Claude Code puede usar Git para versionar: status, add, commit, push, tag y comandos de solo lectura. Los mensajes de commit van en español y describen el cambio. Antes de cada commit, mostrá qué archivos se van a incluir. Nunca uses push --force, reset --hard, ni borres ramas o tags, ni reescribas el historial: si alguna vez hace falta algo de eso, preguntame primero.
- Cada vez que cambies algo de la carpeta `app`, subí el número de versión (`?v=...`) en **todos** los enlaces de `app/index.html` (style.css y cada archivo .js), todos al mismo número. Así el celular descarga los archivos nuevos en lugar de usar los viejos guardados en caché.
