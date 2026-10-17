"use strict";

/* ==================================================================
   Posiciones de acordes convertidas de chords-db
   https://github.com/tombatossals/chords-db
   Licencia MIT, Copyright (c) 2016 David Rubert (ver README.md).

   Archivo GENERADO por herramientas/convertir_chords_db.py: no editar
   a mano. Mismo formato que app/acordes.js (trastes absolutos por
   cuerda de la 6ª a la 1ª, dedos, y cejilla { traste, desde, hasta }).
   Cada posición pasó herramientas/verificar_acordes.py.
   ================================================================== */

const POSICIONES_EXTRA = {
  "C/A": [
    {"trastes": [-1, 0, 2, 0, 1, 0], "dedos": [0, 0, 2, 0, 1, 0]},
    {"trastes": [-1, 0, 2, 0, 1, 3], "dedos": [0, 0, 2, 0, 1, 3]},
    {"trastes": [-1, 0, 5, 5, 5, 3], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 0, 5, 5, 5, 8], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}}
  ],
  "C/A#": [
    {"trastes": [-1, 1, 2, 0, 1, 0], "dedos": [0, 1, 3, 0, 2, 0]},
    {"trastes": [-1, 1, 2, 0, 1, 3], "dedos": [0, 1, 3, 0, 2, 4]},
    {"trastes": [6, 7, 5, 5, 5, 8], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [6, 7, 5, 5, 8, 8], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}}
  ],
  "C/B": [
    {"trastes": [-1, 2, 2, 0, 1, 0], "dedos": [0, 2, 3, 0, 1, 0]},
    {"trastes": [-1, 2, 2, 0, 1, 3], "dedos": [0, 2, 3, 0, 1, 4]},
    {"trastes": [7, 7, 5, 5, 5, 8], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [7, 7, 5, 5, 8, 8], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}}
  ],
  "C/C#": [
    {"trastes": [-1, 4, 2, 0, 1, 0], "dedos": [0, 4, 2, 0, 1, 0]},
    {"trastes": [-1, 4, 2, 0, 1, 3], "dedos": [0, 4, 2, 0, 1, 3]},
    {"trastes": [-1, -1, 11, 9, 8, 8], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 11, 12, 13, 12], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "C/D": [
    {"trastes": [-1, -1, 0, 0, 1, 0], "dedos": [0, 0, 0, 0, 1, 0]},
    {"trastes": [-1, -1, 0, 5, 5, 3], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, -1, 0, 9, 8, 8], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 5, 5, 5, 8], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 1, "hasta": 4}}
  ],
  "C/D#": [
    {"trastes": [-1, -1, 1, 0, 1, 0], "dedos": [0, 0, 1, 0, 2, 0]},
    {"trastes": [-1, 6, 5, 5, 5, 8], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 6, 5, 5, 5, -1], "dedos": [0, 2, 1, 1, 1, 0], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [11, 10, 10, 9, -1, -1], "dedos": [4, 2, 3, 1, 0, 0]}
  ],
  "C/E": [
    {"trastes": [0, 3, 2, 0, 1, 0], "dedos": [0, 3, 2, 0, 1, 0]},
    {"trastes": [0, 3, 2, 0, 1, 3], "dedos": [0, 3, 2, 0, 1, 4]},
    {"trastes": [-1, -1, 2, 0, 1, 0], "dedos": [0, 0, 2, 0, 1, 0]},
    {"trastes": [-1, -1, 2, 0, 1, 3], "dedos": [0, 0, 2, 0, 1, 3]}
  ],
  "C/F": [
    {"trastes": [-1, -1, 3, 0, 1, 0], "dedos": [0, 0, 3, 0, 1, 0]},
    {"trastes": [-1, -1, 3, 5, 5, 3], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 8, 5, 5, 5, -1], "dedos": [0, 4, 1, 1, 1, 0], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 8, 10, 9, 8, 8], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}}
  ],
  "C/F#": [
    {"trastes": [2, 3, 2, 0, 1, 0], "dedos": [2, 4, 3, 0, 1, 0]},
    {"trastes": [-1, -1, 4, 0, 1, 0], "dedos": [0, 0, 4, 0, 1, 0]},
    {"trastes": [-1, -1, 4, 5, 5, 3], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 9, 10, 9, 8, 8], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}}
  ],
  "C/G": [
    {"trastes": [3, 3, 2, 0, 1, 0], "dedos": [3, 4, 2, 0, 1, 0]},
    {"trastes": [3, 3, 5, 5, 5, 3], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 5, 5, 5, 3], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 5, 5, 5, 8], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}}
  ],
  "C/G#": [
    {"trastes": [4, 3, 2, 0, 1, 0], "dedos": [4, 3, 2, 0, 1, 0]},
    {"trastes": [-1, -1, 6, 5, 5, 3], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 6, 9, 8, 8], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 11, 10, 9, 8, 8], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}}
  ],
  "C11": [
    {"trastes": [8, 7, 0, 0, 6, 6], "dedos": [3, 2, 0, 0, 1, 1], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 3, 2, 3, 1, 1], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 3, 3, 3, 5, 3], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [8, 8, 8, 9, 8, 8], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "C13": [
    {"trastes": [-1, 3, 2, 3, 5, 5], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [8, 7, 7, 7, 8, 6], "dedos": [3, 2, 2, 2, 4, 1], "cejilla": {"traste": 7, "desde": 1, "hasta": 3}},
    {"trastes": [8, 10, 8, 9, 10, 8], "dedos": [1, 3, 1, 2, 4, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "C5": [
    {"trastes": [-1, 3, 5, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [8, 10, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [8, 10, 10, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "C6": [
    {"trastes": [-1, 3, 2, 2, 1, 0], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 3, 5, 5, 5, 5], "dedos": [0, 1, 3, 3, 3, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [8, -1, 7, 9, 8, -1], "dedos": [2, 0, 1, 4, 3, 0]},
    {"trastes": [8, -1, 10, 9, 10, 8], "dedos": [1, 0, 3, 2, 4, 1]}
  ],
  "C69": [
    {"trastes": [-1, 3, 0, 0, 5, 5], "dedos": [0, 1, 0, 0, 3, 4]},
    {"trastes": [-1, 3, 2, 2, 3, 3], "dedos": [0, 3, 1, 1, 3, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [8, 7, 7, 7, 8, 8], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 7, "desde": 1, "hasta": 3}}
  ],
  "C7#9": [
    {"trastes": [-1, 3, 5, 3, 4, 0], "dedos": [0, 1, 3, 1, 2, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 3, 2, 3, 4, -1], "dedos": [0, 2, 1, 3, 4, 0]},
    {"trastes": [8, 10, 8, 9, 8, 11], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 10, 9, 11, 11], "dedos": [0, 0, 2, 1, 3, 4]}
  ],
  "C7b5": [
    {"trastes": [8, -1, 8, 9, 7, 0], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, 3, 4, 3, 5, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 10, 11, 11, 12], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "C7b9": [
    {"trastes": [-1, 3, 2, 3, 2, 3], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [8, 7, 8, 6, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]},
    {"trastes": [8, -1, 8, 9, 8, 9], "dedos": [1, 0, 1, 2, 1, 3]},
    {"trastes": [-1, -1, 10, 9, 11, 9], "dedos": [0, 0, 3, 1, 4, 2]}
  ],
  "C7sus4": [
    {"trastes": [-1, 3, 3, 3, 1, 1], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [8, 10, 8, 10, 8, 8], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "C9": [
    {"trastes": [8, 7, 8, 7, 8, 8], "dedos": [2, 1, 3, 1, 4, 4], "cejilla": {"traste": 7, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 10, 9, 11, 10], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "Cadd11": [
    {"trastes": [-1, 3, 2, 0, 1, 1], "dedos": [0, 3, 2, 0, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [8, 7, 5, 5, 6, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [8, 7, 10, 10, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "Cadd9": [
    {"trastes": [-1, 3, 2, 0, 3, 0], "dedos": [0, 2, 1, 0, 3, 0]},
    {"trastes": [-1, 3, 0, 0, 3, 0], "dedos": [0, 1, 0, 0, 3, 0]},
    {"trastes": [8, 7, 0, 0, 8, 0], "dedos": [2, 1, 0, 0, 3, 0]},
    {"trastes": [-1, -1, 10, 9, 8, 10], "dedos": [0, 0, 3, 2, 1, 4]}
  ],
  "Caug": [
    {"trastes": [-1, 3, 2, 1, 1, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 3, 6, 5, 5, -1], "dedos": [0, 1, 4, 2, 3, 0]},
    {"trastes": [8, 7, 6, 5, 5, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 10, 9, 9, 8], "dedos": [0, 0, 4, 2, 3, 1]}
  ],
  "Caug7": [
    {"trastes": [8, -1, 8, 9, 9, 0], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, 3, 2, 3, -1, 4], "dedos": [0, 2, 1, 3, 0, 4]},
    {"trastes": [-1, 3, 6, 3, 5, 4], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 10, 13, 11, 12], "dedos": [0, 0, 1, 4, 2, 3]}
  ],
  "Cdim": [
    {"trastes": [-1, 3, 1, -1, 1, 2], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 3, 4, 5, 4, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [8, 6, -1, 8, 7, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 10, 11, -1, 11], "dedos": [0, 0, 1, 2, 0, 3]}
  ],
  "Cdim7": [
    {"trastes": [-1, 3, 4, 2, 4, 2], "dedos": [0, 2, 3, 1, 4, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [8, -1, 7, 8, 7, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 10, 11, 10, 11], "dedos": [0, 0, 1, 3, 1, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}}
  ],
  "Cm/A": [
    {"trastes": [-1, 0, 1, 0, 1, 3], "dedos": [0, 0, 1, 0, 2, 4]},
    {"trastes": [-1, 0, 5, 5, 4, 3], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, 0, 5, 8, 8, 8], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [5, 6, 5, 5, 8, 8], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 0, "hasta": 3}}
  ],
  "Cm/A#": [
    {"trastes": [-1, 1, 1, 0, 1, -1], "dedos": [0, 1, 2, 0, 3, 0]},
    {"trastes": [6, 6, 5, 5, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [6, -1, 5, 8, 8, 8], "dedos": [2, 0, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 8, 8, 8], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "Cm/B": [
    {"trastes": [-1, 2, 1, 0, 1, 3], "dedos": [0, 3, 1, 0, 2, 4]},
    {"trastes": [7, 6, 5, 5, 8, 8], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [7, 6, 5, 8, 8, 8], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 8, 8, 8], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "Cm/C#": [
    {"trastes": [-1, 4, 1, 0, 1, -1], "dedos": [0, 4, 1, 0, 2, 0]},
    {"trastes": [9, 10, 10, 8, 8, 8], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 8, 8, 8], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 12, 13, 11], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "Cm/D": [
    {"trastes": [-1, -1, 0, 5, 4, 3], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, -1, 0, 8, 8, 8], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 5, 8, 8, 8], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 5, "desde": 1, "hasta": 2}},
    {"trastes": [10, 10, 10, 8, 8, 8], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "Cm/D#": [
    {"trastes": [-1, -1, 1, 0, 1, 3], "dedos": [0, 0, 1, 0, 2, 4]},
    {"trastes": [-1, 6, 5, 5, 8, 8], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 6, 5, 8, 8, 8], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [11, 10, 10, 8, 8, 8], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "Cm/E": [
    {"trastes": [0, 3, 5, 5, 4, 3], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [0, 6, 5, 5, 8, 8], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [0, 6, 5, 8, 8, 8], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 2, 5, 4, 3], "dedos": [0, 0, 1, 4, 3, 2]}
  ],
  "Cm/F": [
    {"trastes": [-1, -1, 3, 5, 4, 3], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 8, 10, 8, 8, 8], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 8, 10, 8, 8, 11], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 8, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 8, 10, 8, 8, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 8, "desde": 1, "hasta": 4}}
  ],
  "Cm/F#": [
    {"trastes": [2, 3, 1, 0, 1, -1], "dedos": [3, 4, 1, 0, 2, 0]},
    {"trastes": [-1, -1, 4, 5, 4, 3], "dedos": [0, 0, 2, 4, 3, 1]},
    {"trastes": [-1, 9, 10, 8, 8, 8], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 10, 8, 8, 11], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 4}}
  ],
  "Cm/G": [
    {"trastes": [3, 3, 5, 5, 4, 3], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 5, 5, 4, 3], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 5, 8, 8, 8], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 10, 8, 8, 8], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "Cm/G#": [
    {"trastes": [-1, -1, 6, 5, 4, 3], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 6, 8, 8, 8], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 10, 8, 8, 8], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 13, 12, 13, 11], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "Cm11": [
    {"trastes": [-1, 3, 1, 3, 3, 1], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 3, 3, 3, 4, 3], "dedos": [0, 1, 1, 1, 2, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [8, 6, 8, 7, 6, 6], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [8, 8, 8, 8, 8, 10], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 4}}
  ],
  "Cm6": [
    {"trastes": [-1, 3, 1, 2, 1, 3], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 3, 5, -1, 4, 5], "dedos": [0, 1, 3, 0, 2, 4]},
    {"trastes": [8, -1, 7, 8, 8, 8], "dedos": [2, 0, 1, 3, 3, 4]},
    {"trastes": [8, 10, 10, 8, 10, 8], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "Cm7b5": [
    {"trastes": [-1, 3, 4, 3, 4, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [8, 9, 10, 8, 11, 8], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 10, 11, 11, 11], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "Cm9": [
    {"trastes": [-1, 3, 0, 3, 4, 3], "dedos": [0, 1, 0, 2, 4, 3]},
    {"trastes": [-1, 3, 1, 3, 3, 3], "dedos": [0, 2, 1, 3, 4, 4]},
    {"trastes": [8, 10, 8, 8, 8, 10], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 4}}
  ],
  "Cmadd9": [
    {"trastes": [-1, 3, 1, 0, 3, 3], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, 3, 0, 5, 4, 3], "dedos": [0, 1, 0, 4, 3, 2]},
    {"trastes": [8, 6, 0, 7, 8, 8], "dedos": [3, 1, 0, 2, 4, 4]},
    {"trastes": [-1, -1, 10, 8, 8, 10], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 8, "desde": 3, "hasta": 4}}
  ],
  "Cmaj7": [
    {"trastes": [-1, -1, 10, 12, 12, 12], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 12, "desde": 3, "hasta": 5}}
  ],
  "Cmaj9": [
    {"trastes": [-1, 3, 0, 0, 0, 0], "dedos": [0, 3, 0, 0, 0, 0]},
    {"trastes": [8, -1, 9, 9, 8, 10], "dedos": [1, 0, 2, 3, 1, 4]}
  ],
  "Cmmaj7": [
    {"trastes": [-1, 3, 1, 0, 0, -1], "dedos": [0, 3, 1, 0, 0, 0]},
    {"trastes": [8, 10, 9, 8, 8, 8], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 10, 12, 12, 11], "dedos": [0, 0, 1, 3, 4, 2]}
  ],
  "Csus2": [
    {"trastes": [-1, 3, 0, 0, 1, 3], "dedos": [0, 3, 0, 0, 1, 4]},
    {"trastes": [-1, 3, 0, 0, 3, 3], "dedos": [0, 1, 0, 0, 2, 3]},
    {"trastes": [8, -1, 0, 7, 8, 8], "dedos": [2, 0, 0, 1, 3, 4]}
  ],
  "Csus4": [
    {"trastes": [-1, 3, 3, 0, 1, 1], "dedos": [0, 3, 4, 0, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [8, 8, -1, 0, 6, 8], "dedos": [2, 3, 0, 0, 1, 4]},
    {"trastes": [8, 10, 10, 10, 8, 8], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "C#/A": [
    {"trastes": [-1, 0, 3, 1, 2, 1], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 3, 1, 2, 4], "dedos": [0, 0, 3, 1, 2, 4]},
    {"trastes": [-1, 0, 6, 6, 6, 4], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 7, 6, 6, 4], "dedos": [0, 0, 4, 2, 3, 1]}
  ],
  "C#/A#": [
    {"trastes": [-1, 1, 3, 1, 2, 1], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 1, 3, 1, 2, 4], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 1, "desde": 1, "hasta": 3}},
    {"trastes": [6, 8, 6, 6, 6, 9], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 4}},
    {"trastes": [6, 8, 6, 6, 9, 9], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 3}}
  ],
  "C#/B": [
    {"trastes": [-1, 2, 3, 1, 2, 1], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [7, 8, 6, 6, 6, 9], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [7, 8, 6, 6, 9, 9], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 9, 10, 9, 9], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "C#/C": [
    {"trastes": [-1, 3, 3, 1, 2, 1], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [8, 8, 6, 6, 6, 9], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [8, 8, 6, 6, 9, 9], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 10, 10, 9, 9], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}}
  ],
  "C#/D": [
    {"trastes": [-1, -1, 0, 1, 2, 1], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 6, 6, 4], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, -1, 0, 10, 9, 9], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 12, 10, 9, 9], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}}
  ],
  "C#/D#": [
    {"trastes": [-1, -1, 1, 1, 2, 1], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 6, 6, 6, 9], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 6, 6, 6, 6, -1], "dedos": [0, 1, 1, 1, 1, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 4}},
    {"trastes": [11, 11, 11, 13, 14, 13], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 11, "desde": 0, "hasta": 2}}
  ],
  "C#/E": [
    {"trastes": [0, 4, 3, 1, 2, 1], "dedos": [0, 4, 3, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [0, 4, 6, 6, 6, 4], "dedos": [0, 1, 2, 3, 4, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [0, 8, 6, 6, 6, 9], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 2, 1, 2, 1], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}}
  ],
  "C#/F": [
    {"trastes": [1, 4, 3, 1, 2, 1], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 3, 1, 2, 1], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 3, 1, 2, 4], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "C#/F#": [
    {"trastes": [-1, -1, 4, 1, 2, 1], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 4, 6, 6, 4], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 9, 6, 6, 6, -1], "dedos": [0, 4, 1, 1, 1, 0], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 9, 11, 10, 9, 9], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 9, "desde": 1, "hasta": 5}}
  ],
  "C#/G": [
    {"trastes": [3, 4, 6, 6, 6, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 5, 6, 6, 4], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 10, 11, 10, 9, 9], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 10, 11, 10, 9, -1], "dedos": [0, 2, 4, 3, 1, 0]}
  ],
  "C#/G#": [
    {"trastes": [4, 4, 6, 6, 6, 4], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 6, 6, 6, 4], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 6, 6, 6, 9], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 11, 11, 10, 9, 9], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}}
  ],
  "C#13": [
    {"trastes": [9, 8, 8, 8, 9, 7], "dedos": [3, 2, 2, 2, 4, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 3}}
  ],
  "C#5": [
    {"trastes": [-1, 4, 6, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [9, 11, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [9, 11, 11, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "C#6": [
    {"trastes": [-1, 4, 3, 3, 2, -1], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 4, 6, 6, 6, 6], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [9, 8, 8, 6, 6, 6], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [9, -1, 11, 10, 11, 9], "dedos": [1, 0, 3, 2, 4, 1]}
  ],
  "C#69": [
    {"trastes": [-1, 4, 1, 3, 2, 1], "dedos": [0, 4, 1, 3, 2, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 4, 3, 3, 4, 4], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [9, 8, 8, 8, 9, 9], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 8, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 11, 10, 11, 11], "dedos": [0, 0, 2, 1, 3, 4]}
  ],
  "C#7#9": [
    {"trastes": [-1, 4, 3, 4, 2, 0], "dedos": [0, 3, 2, 4, 1, 0]},
    {"trastes": [-1, 4, 3, 4, 5, -1], "dedos": [0, 2, 1, 3, 4, 0]},
    {"trastes": [9, 11, 9, 10, 9, 12], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 4}}
  ],
  "C#7b5": [
    {"trastes": [-1, 4, 3, 0, 0, 1], "dedos": [0, 4, 3, 0, 0, 1]},
    {"trastes": [-1, 4, 5, 4, 6, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 4, "desde": 1, "hasta": 3}},
    {"trastes": [9, -1, 9, 10, 8, -1], "dedos": [2, 0, 3, 4, 1, 0]}
  ],
  "C#7b9": [
    {"trastes": [-1, 4, 0, 4, 6, 7], "dedos": [0, 1, 0, 2, 3, 4]},
    {"trastes": [9, 8, 9, 7, 0, -1], "dedos": [3, 2, 4, 1, 0, 0]},
    {"trastes": [-1, 4, 3, 4, 3, 4], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}}
  ],
  "C#7sus4": [
    {"trastes": [-1, 4, 4, 4, 2, 2], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, -1, 6, 7, 7], "dedos": [0, 0, 0, 1, 2, 3]},
    {"trastes": [9, 11, 9, 11, 9, 9], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "C#9": [
    {"trastes": [9, 8, 9, 8, -1, -1], "dedos": [3, 1, 4, 2, 0, 0]},
    {"trastes": [9, 11, 9, 10, 9, 11], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 11, 10, 12, 11], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "C#add11": [
    {"trastes": [-1, 4, 3, 1, 2, 2], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [9, 8, 6, 6, 7, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [9, 8, 11, 11, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "C#add9": [
    {"trastes": [-1, 4, 3, 1, 4, 1], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 3, -1, 4, 4], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [9, 8, -1, 8, 9, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 11, 10, 9, 11], "dedos": [0, 0, 3, 2, 1, 4]}
  ],
  "C#aug": [
    {"trastes": [9, 8, 7, 6, 6, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 6, "desde": 3, "hasta": 4}},
    {"trastes": [9, -1, 11, 10, 10, 9], "dedos": [1, 0, 4, 2, 3, 1]}
  ],
  "C#aug7": [
    {"trastes": [-1, 4, 3, 2, 0, 1], "dedos": [0, 4, 3, 2, 0, 1]},
    {"trastes": [9, 8, 7, -1, 0, 7], "dedos": [4, 3, 1, 0, 0, 2]},
    {"trastes": [-1, 4, 7, 4, 6, 5], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 4, "desde": 1, "hasta": 3}},
    {"trastes": [9, -1, 9, 10, 10, -1], "dedos": [1, 0, 2, 3, 4, 0]}
  ],
  "C#dim": [
    {"trastes": [-1, 4, 2, -1, 2, 3], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 4, 5, 6, 5, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [9, 7, -1, 9, 8, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 11, 12, -1, 12], "dedos": [0, 0, 1, 2, 0, 3]}
  ],
  "C#dim7": [
    {"trastes": [-1, 4, 5, 3, 5, 3], "dedos": [0, 2, 3, 1, 4, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [9, -1, 8, 9, 8, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 11, 12, 11, 12], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "C#m/A": [
    {"trastes": [-1, 0, 2, 1, 2, 0], "dedos": [0, 0, 2, 1, 3, 0]},
    {"trastes": [-1, 0, 6, 6, 5, 4], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, 0, 6, 9, 9, 9], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 7, 6, 5, 4], "dedos": [0, 0, 4, 3, 2, 1]}
  ],
  "C#m/A#": [
    {"trastes": [-1, 1, 2, 1, 2, 0], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [6, 7, 6, 6, 9, 9], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 3}},
    {"trastes": [6, 7, 6, 9, 9, 9], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 8, 9, 9, 9], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m/B": [
    {"trastes": [-1, 2, 2, 1, 2, 0], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [-1, 2, 2, 1, 2, -1], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [7, 7, 6, 6, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 9, 9, 9, 9], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "C#m/C": [
    {"trastes": [-1, 3, 2, 1, 2, 0], "dedos": [0, 4, 2, 1, 3, 0]},
    {"trastes": [8, 7, 6, 6, 9, 9], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [8, 7, 6, 9, 9, 9], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 10, 9, 9, 9], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m/D": [
    {"trastes": [-1, -1, 0, 1, 2, 0], "dedos": [0, 0, 0, 1, 2, 0]},
    {"trastes": [-1, -1, 0, 6, 5, 4], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, -1, 0, 9, 9, 9], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [10, 11, 11, 9, 9, 9], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m/D#": [
    {"trastes": [-1, -1, 1, 1, 2, 0], "dedos": [0, 0, 1, 2, 3, 0]},
    {"trastes": [-1, 6, 6, 9, 9, 9], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 1, "hasta": 2}},
    {"trastes": [11, 11, 11, 9, 9, 9], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [11, 11, 11, 13, 14, 12], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 11, "desde": 0, "hasta": 2}}
  ],
  "C#m/E": [
    {"trastes": [-1, -1, 2, 1, 2, 0], "dedos": [0, 0, 2, 1, 3, 0]},
    {"trastes": [0, 4, 6, 6, 5, 4], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [0, 7, 6, 6, 9, 9], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [0, 7, 6, 9, 9, 9], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m/F": [
    {"trastes": [-1, -1, 3, 1, 2, 0], "dedos": [0, 0, 3, 1, 2, 0]},
    {"trastes": [1, 4, 2, 1, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 1, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 3, 6, 5, 4], "dedos": [0, 0, 1, 4, 3, 2]},
    {"trastes": [-1, 8, 6, 9, 9, 9], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m/F#": [
    {"trastes": [-1, -1, 4, 1, 2, 0], "dedos": [0, 0, 4, 1, 2, 0]},
    {"trastes": [-1, -1, 4, 6, 5, 4], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 9, 11, 9, 9, 9], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 9, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 9, 11, 9, 9, 12], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 9, "desde": 1, "hasta": 4}}
  ],
  "C#m/G": [
    {"trastes": [-1, -1, 5, 6, 5, 4], "dedos": [0, 0, 2, 4, 3, 1]},
    {"trastes": [-1, 10, 11, 9, 9, 9], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 11, 9, 9, 12], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 10, 11, 9, 9, -1], "dedos": [0, 2, 3, 1, 1, 0], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}}
  ],
  "C#m/G#": [
    {"trastes": [4, 4, 6, 6, 5, 4], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 6, 6, 5, 4], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 6, 9, 9, 9], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 11, 9, 9, 9], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "C#m11": [
    {"trastes": [-1, 4, 2, 4, 2, 2], "dedos": [0, 2, 1, 3, 1, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}},
    {"trastes": [9, 7, 9, 8, 7, 7], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 7, "desde": 1, "hasta": 5}},
    {"trastes": [9, 9, 9, 9, 9, 11], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 11, 11, 12, 12], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "C#m6": [
    {"trastes": [-1, 4, 2, 3, 2, 4], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [9, -1, 8, 9, 9, -1], "dedos": [2, 0, 1, 3, 4, 0]},
    {"trastes": [9, 11, 11, 9, 11, 9], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "C#m7b5": [
    {"trastes": [-1, 4, 5, 4, 5, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [9, -1, 9, 9, 8, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 11, 12, 12, 12], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 12, "desde": 3, "hasta": 5}}
  ],
  "C#m9": [
    {"trastes": [-1, 4, 2, 4, 4, 4], "dedos": [0, 2, 1, 3, 4, 4]},
    {"trastes": [9, 11, 9, 9, 9, 11], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 4}}
  ],
  "C#madd9": [
    {"trastes": [-1, 4, 6, 6, 4, 0], "dedos": [0, 1, 3, 4, 2, 0]},
    {"trastes": [9, 7, -1, 8, 9, 0], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, 4, 2, 1, 4, -1], "dedos": [0, 3, 2, 1, 4, 0]},
    {"trastes": [-1, -1, 11, 9, 9, 11], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}}
  ],
  "C#maj7": [
    {"trastes": [-1, 4, 3, 1, 1, 1], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, -1, 6, 6, 8], "dedos": [0, 0, 0, 1, 1, 3], "cejilla": {"traste": 6, "desde": 3, "hasta": 4}},
    {"trastes": [9, -1, 10, 10, 9, -1], "dedos": [1, 0, 3, 4, 2, 0]}
  ],
  "C#maj9": [
    {"trastes": [-1, 4, 1, 1, 1, 1], "dedos": [0, 4, 1, 1, 1, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 4, 3, 5, 4, -1], "dedos": [0, 2, 1, 4, 3, 0]},
    {"trastes": [9, 8, 10, 8, 9, 8], "dedos": [2, 1, 4, 1, 3, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 11, 10, 13, 11], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "C#mmaj7": [
    {"trastes": [-1, 4, 2, 1, 1, -1], "dedos": [0, 4, 2, 1, 1, 0], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [9, 11, 10, 9, 9, 9], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "C#sus2": [
    {"trastes": [9, 11, 11, -1, 9, 11], "dedos": [1, 2, 3, 0, 1, 4]}
  ],
  "C#sus4": [
    {"trastes": [-1, 4, 4, 1, 2, -1], "dedos": [0, 3, 4, 1, 2, 0]},
    {"trastes": [9, 11, 11, 11, 9, 9], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "D/A": [
    {"trastes": [-1, 0, 0, 2, 3, 2], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 4, 2, 3, 2], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 4, 2, 3, 5], "dedos": [0, 0, 3, 1, 2, 4]},
    {"trastes": [-1, 0, 7, 7, 7, 5], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "D/A#": [
    {"trastes": [-1, 1, 0, 2, 3, 2], "dedos": [0, 1, 0, 2, 4, 3]},
    {"trastes": [-1, -1, 8, 7, 7, 5], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 8, 11, 10, 10], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 13, 12, 11, 10, 10], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}}
  ],
  "D/B": [
    {"trastes": [-1, 2, 4, 2, 3, 2], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 2, 4, 2, 3, 5], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 3}},
    {"trastes": [7, 9, 7, 7, 7, 10], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 4}},
    {"trastes": [7, 9, 7, 7, 10, 10], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 3}}
  ],
  "D/C": [
    {"trastes": [-1, 3, 0, 2, 3, 2], "dedos": [0, 2, 0, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 3, 4, 2, 3, 2], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [8, 9, 7, 7, 7, 10], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [8, 9, 7, 7, 10, 10], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}}
  ],
  "D/C#": [
    {"trastes": [-1, 4, 0, 2, 3, 2], "dedos": [0, 3, 0, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 4, 2, 3, 2], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [9, 9, 7, 7, 7, 10], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [9, 9, 7, 7, 10, 10], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}}
  ],
  "D/D#": [
    {"trastes": [-1, -1, 1, 2, 3, 2], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, 6, 7, 7, 7, -1], "dedos": [0, 1, 2, 2, 2, 0], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 13, 11, 10, 10], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}},
    {"trastes": [11, 12, 12, 11, -1, -1], "dedos": [1, 2, 3, 1, 0, 0], "cejilla": {"traste": 11, "desde": 0, "hasta": 3}}
  ],
  "D/E": [
    {"trastes": [0, 0, 0, 2, 3, 2], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [0, 0, 4, 2, 3, 2], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [0, 5, 4, 2, 3, 2], "dedos": [0, 4, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 2, 2, 3, 2], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "D/F": [
    {"trastes": [1, 0, 0, 2, 3, 2], "dedos": [1, 0, 0, 2, 4, 3]},
    {"trastes": [1, 0, 4, 2, 3, -1], "dedos": [1, 0, 4, 2, 3, 0]},
    {"trastes": [-1, -1, 3, 2, 3, 2], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 7, 7, 7, 10], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}}
  ],
  "D/F#": [
    {"trastes": [2, 5, 4, 2, 3, 2], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 4, 2, 3, 2], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 4, 2, 3, 5], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "D/G": [
    {"trastes": [3, 0, 0, 2, 3, 2], "dedos": [2, 0, 0, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [3, 0, 4, 2, 3, 2], "dedos": [2, 0, 4, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 2, 3, 2], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 7, 7, 5], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}}
  ],
  "D/G#": [
    {"trastes": [4, 0, 0, 2, 3, 2], "dedos": [3, 0, 0, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [4, 0, 4, 2, 3, 2], "dedos": [3, 0, 4, 1, 2, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 7, 7, 5], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 11, 12, 11, 10, 10], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}}
  ],
  "D11": [
    {"trastes": [-1, -1, 0, 0, 1, 2], "dedos": [0, 0, 0, 0, 1, 2]},
    {"trastes": [-1, 5, 4, 5, 3, 3], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 5, 5, 7, 5], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}}
  ],
  "D13": [
    {"trastes": [-1, -1, 0, 4, 1, 2], "dedos": [0, 0, 0, 4, 1, 2]},
    {"trastes": [10, 9, 0, 9, 0, 8], "dedos": [4, 2, 0, 3, 0, 1]},
    {"trastes": [10, -1, 10, 11, 12, -1], "dedos": [1, 0, 2, 3, 4, 0]}
  ],
  "D5": [
    {"trastes": [-1, 5, 7, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [10, 12, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [10, 12, 12, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "D6": [
    {"trastes": [-1, -1, 0, 2, 0, 2], "dedos": [0, 0, 0, 2, 0, 3]},
    {"trastes": [-1, 5, 4, 4, 3, -1], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 5, 7, 7, 7, 7], "dedos": [0, 1, 3, 3, 3, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 5}}
  ],
  "D69": [
    {"trastes": [-1, 5, 4, 2, 0, 0], "dedos": [0, 4, 3, 1, 0, 0]},
    {"trastes": [-1, 5, 4, 4, 5, 5], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [10, 9, 9, 9, 10, 10], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 9, "desde": 1, "hasta": 3}}
  ],
  "D7#9": [
    {"trastes": [-1, 5, 4, 5, 6, -1], "dedos": [0, 2, 1, 3, 4, 0]},
    {"trastes": [10, 12, 10, 11, 10, 13], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 10, "desde": 0, "hasta": 4}}
  ],
  "D7b5": [
    {"trastes": [-1, -1, 0, 1, 1, 2], "dedos": [0, 0, 0, 1, 1, 2], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 5, 6, 5, 7, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}},
    {"trastes": [10, -1, 10, 11, 9, -1], "dedos": [2, 0, 3, 4, 1, 0]}
  ],
  "D7b9": [
    {"trastes": [-1, -1, 0, 5, 4, 2], "dedos": [0, 0, 0, 4, 3, 1]},
    {"trastes": [-1, 5, 4, 5, 4, 5], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [10, 9, 10, 8, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]}
  ],
  "D7sus4": [
    {"trastes": [-1, -1, 0, 2, 1, 3], "dedos": [0, 0, 0, 2, 1, 4]},
    {"trastes": [-1, 5, 5, 5, 3, -1], "dedos": [0, 2, 3, 4, 1, 0]},
    {"trastes": [10, 12, 10, 12, 10, 10], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 10, "desde": 0, "hasta": 5}}
  ],
  "D9": [
    {"trastes": [10, 9, 10, 9, 10, -1], "dedos": [2, 1, 3, 1, 4, 0], "cejilla": {"traste": 9, "desde": 1, "hasta": 3}},
    {"trastes": [10, 12, 10, 11, 10, 12], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 10, "desde": 0, "hasta": 4}}
  ],
  "Dadd11": [
    {"trastes": [-1, -1, 0, 11, 8, 10], "dedos": [0, 0, 0, 4, 1, 3]},
    {"trastes": [-1, 5, 4, 2, 3, 3], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [10, 9, 7, 7, 8, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}},
    {"trastes": [10, 9, 12, 12, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 12, "desde": 2, "hasta": 3}}
  ],
  "Dadd9": [
    {"trastes": [-1, 5, 7, 7, 7, 0], "dedos": [0, 1, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 0, 9, 7, 10], "dedos": [0, 0, 0, 3, 1, 4]},
    {"trastes": [-1, 5, 4, 2, 5, 2], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 12, 11, 10, 12], "dedos": [0, 0, 3, 2, 1, 4]}
  ],
  "Daug": [
    {"trastes": [-1, -1, 0, 3, 3, 2], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, 5, 4, 3, 3, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [10, 9, 8, 7, 7, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}},
    {"trastes": [10, -1, 12, 11, 11, -1], "dedos": [1, 0, 4, 2, 3, 0]}
  ],
  "Daug7": [
    {"trastes": [-1, -1, 0, 3, 1, 2], "dedos": [0, 0, 0, 4, 1, 2]},
    {"trastes": [-1, 5, 4, 5, -1, 6], "dedos": [0, 2, 1, 3, 0, 4]},
    {"trastes": [-1, 5, 8, 5, 7, 6], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}},
    {"trastes": [10, -1, 10, 11, 11, -1], "dedos": [1, 0, 2, 3, 4, 0]}
  ],
  "Ddim": [
    {"trastes": [-1, -1, 0, 1, -1, 1], "dedos": [0, 0, 0, 1, 0, 2]},
    {"trastes": [-1, 5, 3, -1, 3, 4], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 5, 6, 7, 6, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [10, 8, -1, 10, 9, -1], "dedos": [3, 1, 0, 4, 2, 0]}
  ],
  "Ddim7": [
    {"trastes": [-1, -1, 0, 1, 0, 1], "dedos": [0, 0, 0, 2, 0, 3]},
    {"trastes": [-1, 5, 6, 4, 6, 4], "dedos": [0, 2, 3, 1, 4, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [10, 11, 12, 10, 12, 10], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 10, "desde": 0, "hasta": 5}}
  ],
  "Dm/A": [
    {"trastes": [-1, 0, 0, 2, 3, 1], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, 0, 3, 2, 3, 1], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 0, 7, 7, 6, 5], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [5, 5, 7, 7, 6, 5], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "Dm/A#": [
    {"trastes": [-1, 1, 3, 2, 3, 1], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 8, 7, 6, 5], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 8, 10, 10, 10], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 13, 12, 10, 10, 10], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/B": [
    {"trastes": [-1, 2, 0, 2, 3, 1], "dedos": [0, 2, 0, 3, 4, 1]},
    {"trastes": [7, 8, 7, 7, 10, 10], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 3}},
    {"trastes": [7, 8, 7, 10, 10, 10], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 9, 10, 10, 10], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/C": [
    {"trastes": [-1, 3, 0, 2, 3, 1], "dedos": [0, 3, 0, 2, 4, 1]},
    {"trastes": [-1, 3, 3, 2, 3, -1], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [8, 8, 7, 7, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 10, 10, 10, 10], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 10, "desde": 2, "hasta": 5}}
  ],
  "Dm/C#": [
    {"trastes": [-1, 4, 0, 2, 3, 1], "dedos": [0, 4, 0, 2, 3, 1]},
    {"trastes": [9, 8, 7, 7, 10, 10], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}},
    {"trastes": [9, 8, 7, 10, 10, 10], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 10, 10, 10], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/D#": [
    {"trastes": [-1, -1, 1, 2, 3, 1], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 7, 7, 6, -1], "dedos": [0, 1, 2, 3, 1, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 4}},
    {"trastes": [11, 12, 12, 10, 10, 10], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 13, 10, 10, 10], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/E": [
    {"trastes": [0, 0, 0, 2, 3, 1], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [0, 0, 3, 2, 3, 1], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [0, 5, 7, 7, 6, 5], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 2, 2, 3, 1], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "Dm/F": [
    {"trastes": [-1, -1, 3, 2, 3, 1], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 8, 7, 7, 10, 10], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 8, 7, 10, 10, 10], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}},
    {"trastes": [13, 12, 12, 10, 10, 10], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/F#": [
    {"trastes": [2, 0, 0, 2, 3, 1], "dedos": [2, 0, 0, 3, 4, 1]},
    {"trastes": [-1, -1, 4, 2, 3, 1], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 4, 7, 6, 5], "dedos": [0, 0, 1, 4, 3, 2]},
    {"trastes": [-1, 9, 7, 10, 10, 10], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Dm/G": [
    {"trastes": [3, 0, 0, 2, 3, 1], "dedos": [3, 0, 0, 2, 4, 1]},
    {"trastes": [-1, -1, 5, 7, 6, 5], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 10, 12, 10, 10, 10], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 10, 12, 10, 10, 13], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 10, "desde": 1, "hasta": 4}}
  ],
  "Dm/G#": [
    {"trastes": [4, 0, 0, 2, 3, 1], "dedos": [4, 0, 0, 2, 3, 1]},
    {"trastes": [-1, -1, 6, 7, 6, 5], "dedos": [0, 0, 2, 4, 3, 1]},
    {"trastes": [-1, 11, 12, 10, 10, 10], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 12, 10, 10, 13], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 10, "desde": 3, "hasta": 4}}
  ],
  "Dm11": [
    {"trastes": [-1, -1, 0, 0, 1, 1], "dedos": [0, 0, 0, 0, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 3, 5, 5, 3], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [10, 8, 10, 9, 8, 8], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}},
    {"trastes": [10, 10, 10, 10, 10, 12], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 10, "desde": 0, "hasta": 4}}
  ],
  "Dm6": [
    {"trastes": [-1, -1, 0, 2, 0, 1], "dedos": [0, 0, 0, 2, 0, 1]},
    {"trastes": [-1, 5, 3, 4, 3, 5], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 5, 7, -1, 6, 7], "dedos": [0, 1, 3, 0, 2, 4]},
    {"trastes": [10, -1, 9, 10, 10, 10], "dedos": [2, 0, 1, 3, 3, 3]}
  ],
  "Dm7b5": [
    {"trastes": [-1, -1, 0, 1, 1, 1], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 3, 5, 3, 4], "dedos": [0, 3, 1, 4, 1, 2], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 5, 6, 5, 6, -1], "dedos": [0, 1, 3, 2, 4, 0]}
  ],
  "Dm9": [
    {"trastes": [-1, 5, 7, 5, 6, 0], "dedos": [0, 1, 4, 2, 3, 0]},
    {"trastes": [-1, 5, 3, 5, 5, 5], "dedos": [0, 2, 1, 3, 4, 4]},
    {"trastes": [10, 12, 10, 10, 10, 12], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 10, "desde": 0, "hasta": 4}}
  ],
  "Dmadd9": [
    {"trastes": [-1, 5, 3, 2, 3, 0], "dedos": [0, 4, 2, 1, 3, 0]},
    {"trastes": [-1, 5, 7, 7, 6, 0], "dedos": [0, 1, 3, 4, 2, 0]},
    {"trastes": [-1, 5, 3, 2, 5, -1], "dedos": [0, 3, 2, 1, 4, 0]},
    {"trastes": [-1, -1, 12, 10, 10, 12], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 10, "desde": 3, "hasta": 4}}
  ],
  "Dmaj7": [
    {"trastes": [-1, -1, 0, 2, 2, 2], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 4, 2, 2, 2], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}}
  ],
  "Dmaj9": [
    {"trastes": [-1, 5, 2, 2, 2, 2], "dedos": [0, 4, 1, 1, 1, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}},
    {"trastes": [10, -1, 11, 11, 10, 12], "dedos": [1, 0, 2, 3, 1, 4]}
  ],
  "Dmmaj7": [
    {"trastes": [-1, -1, 0, 2, 2, 1], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [10, 12, 11, 10, 10, 10], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 10, "desde": 0, "hasta": 5}}
  ],
  "Dsus2": [
    {"trastes": [-1, -1, 0, 2, 3, 0], "dedos": [0, 0, 0, 2, 3, 0]}
  ],
  "Dsus4": [
    {"trastes": [-1, -1, 0, 2, 3, 3], "dedos": [0, 0, 0, 1, 2, 3]},
    {"trastes": [-1, 5, 0, 0, 3, 5], "dedos": [0, 3, 0, 0, 1, 4]},
    {"trastes": [10, 12, 12, 12, 10, 10], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 10, "desde": 0, "hasta": 5}}
  ],
  "D#/A": [
    {"trastes": [-1, 0, 1, 3, 4, 3], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, 0, 5, 3, 4, 3], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 5, 3, 4, 6], "dedos": [0, 0, 3, 1, 2, 4]},
    {"trastes": [-1, 0, 8, 8, 8, 6], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "D#/A#": [
    {"trastes": [-1, 1, 1, 3, 4, 3], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 1, "desde": 1, "hasta": 2}},
    {"trastes": [6, 6, 8, 8, 8, 6], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 8, 8, 8, 6], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 8, 8, 8, 11], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}}
  ],
  "D#/B": [
    {"trastes": [-1, 2, 5, 3, 4, -1], "dedos": [0, 1, 4, 2, 3, 0]},
    {"trastes": [-1, -1, 9, 8, 8, 6], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 9, 12, 11, 11], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 14, 13, 12, 11, 11], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 11, "desde": 4, "hasta": 5}}
  ],
  "D#/C": [
    {"trastes": [-1, 3, 5, 3, 4, 3], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 3, 5, 3, 4, 6], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [8, 10, 8, 8, 8, 11], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 4}},
    {"trastes": [8, 10, 8, 8, 11, 11], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 3}}
  ],
  "D#/C#": [
    {"trastes": [-1, 4, 5, 3, 4, 3], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [9, 10, 8, 8, 8, 11], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}},
    {"trastes": [9, 10, 8, 8, 11, 11], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 11, 12, 11, 11], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "D#/D": [
    {"trastes": [-1, -1, 0, 3, 4, 3], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 8, 8, 6], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, 5, 5, 3, 4, 3], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [10, 10, 8, 8, 8, 11], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}}
  ],
  "D#/E": [
    {"trastes": [0, 1, 1, 3, 4, 3], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 1, "desde": 1, "hasta": 2}},
    {"trastes": [0, 6, 5, 3, 4, 3], "dedos": [0, 4, 3, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [0, 6, 8, 8, 8, 6], "dedos": [0, 1, 2, 3, 4, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 2, 3, 4, 3], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "D#/F": [
    {"trastes": [1, 1, 1, 3, 4, 3], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 1, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 3, 3, 4, 3], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 8, 8, 8, 8, 11], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 8, 8, 8, 8, -1], "dedos": [0, 1, 1, 1, 1, 0], "cejilla": {"traste": 8, "desde": 1, "hasta": 4}}
  ],
  "D#/F#": [
    {"trastes": [2, 1, 1, 0, -1, -1], "dedos": [3, 1, 2, 0, 0, 0]},
    {"trastes": [-1, -1, 4, 3, 4, 3], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 8, 8, 8, 11], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 9, 8, 8, 8, -1], "dedos": [0, 2, 1, 1, 1, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}}
  ],
  "D#/G": [
    {"trastes": [3, 6, 5, 3, 4, 3], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 5, 3, 4, 3], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 3, 4, 6], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "D#/G#": [
    {"trastes": [-1, -1, 6, 3, 4, 3], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 8, 8, 6], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 11, 8, 8, 8, -1], "dedos": [0, 4, 1, 1, 1, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 11, 13, 12, 11, 11], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "D#11": [
    {"trastes": [-1, 6, 5, 6, 4, 4], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [11, 11, 11, 12, 11, 11], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "D#13": [
    {"trastes": [-1, 6, 5, 6, 8, 8], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}}
  ],
  "D#5": [
    {"trastes": [-1, 6, 8, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [11, 13, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [11, 13, 13, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "D#6": [
    {"trastes": [-1, -1, 1, 3, 1, 3], "dedos": [0, 0, 1, 3, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 6, 5, 5, 4, -1], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 6, 8, 8, 8, 8], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}},
    {"trastes": [11, -1, 10, 12, 11, -1], "dedos": [2, 0, 1, 4, 3, 0]}
  ],
  "D#69": [
    {"trastes": [-1, -1, 1, 0, 1, 1], "dedos": [0, 0, 2, 0, 3, 4]},
    {"trastes": [-1, 6, 5, 5, 6, 6], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 3}},
    {"trastes": [11, 10, 10, 10, 11, 11], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 10, "desde": 1, "hasta": 3}}
  ],
  "D#7#9": [
    {"trastes": [-1, -1, 1, 0, 2, 2], "dedos": [0, 0, 2, 0, 3, 4]},
    {"trastes": [-1, 6, 5, 6, 7, -1], "dedos": [0, 2, 1, 3, 4, 0]},
    {"trastes": [11, 10, 11, 11, -1, -1], "dedos": [2, 1, 3, 4, 0, 0]}
  ],
  "D#7b5": [
    {"trastes": [-1, -1, 1, 2, 2, 3], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [11, -1, 11, 12, 10, -1], "dedos": [2, 0, 3, 4, 1, 0]}
  ],
  "D#7b9": [
    {"trastes": [-1, -1, 1, 0, 2, 0], "dedos": [0, 0, 2, 0, 4, 0]},
    {"trastes": [-1, 6, 8, 6, 8, 0], "dedos": [0, 1, 3, 1, 4, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 6, 5, 6, 5, 6], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}},
    {"trastes": [11, 10, 11, 9, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]}
  ],
  "D#7sus4": [
    {"trastes": [-1, -1, 1, 3, 2, 4], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [-1, 6, 6, 6, 4, 4], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [11, 13, 11, 13, 11, 11], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "D#9": [
    {"trastes": [-1, -1, 1, 0, 2, 1], "dedos": [0, 0, 1, 0, 3, 2]},
    {"trastes": [-1, 6, 5, 6, 6, 6], "dedos": [0, 2, 1, 3, 3, 4]},
    {"trastes": [11, 10, 11, 10, -1, -1], "dedos": [3, 1, 4, 2, 0, 0]},
    {"trastes": [11, 13, 11, 12, 11, 13], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 4}}
  ],
  "D#add11": [
    {"trastes": [-1, -1, 1, 0, 4, 4], "dedos": [0, 0, 1, 0, 4, 4], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 6, 5, 3, 4, 4], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [11, 10, 8, 8, 9, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [11, 10, 13, 13, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 13, "desde": 2, "hasta": 3}}
  ],
  "D#add9": [
    {"trastes": [-1, 6, 5, 0, 6, 6], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, 6, 5, 3, 6, 3], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [11, 10, -1, 10, 11, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 13, 12, 11, 13], "dedos": [0, 0, 3, 2, 1, 4]}
  ],
  "D#aug": [
    {"trastes": [-1, 6, 5, 4, 4, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}},
    {"trastes": [11, 10, 9, 8, 8, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 8, "desde": 3, "hasta": 4}},
    {"trastes": [11, -1, 13, 12, 12, -1], "dedos": [1, 0, 4, 2, 3, 0]}
  ],
  "D#aug7": [
    {"trastes": [11, 10, 11, 0, 0, 9], "dedos": [3, 2, 4, 0, 0, 1]},
    {"trastes": [-1, -1, 1, 4, 2, 3], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 6, 9, 6, 8, 7], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [11, -1, 11, 12, 12, -1], "dedos": [1, 0, 2, 3, 4, 0]}
  ],
  "D#dim": [
    {"trastes": [-1, -1, 1, 2, -1, 2], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 6, 4, -1, 4, 5], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 6, 7, 8, 7, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [11, 9, -1, 11, 10, -1], "dedos": [3, 1, 0, 4, 2, 0]}
  ],
  "D#dim7": [
    {"trastes": [-1, -1, 1, 2, 1, 2], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [-1, 6, 7, 5, 7, 5], "dedos": [0, 2, 3, 1, 4, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [11, -1, 10, 11, 10, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}}
  ],
  "D#m/A": [
    {"trastes": [-1, 0, 1, 3, 4, 2], "dedos": [0, 0, 1, 3, 4, 2]},
    {"trastes": [-1, 0, 4, 3, 4, 2], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 0, 8, 8, 7, 6], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 7, 8, 7, 6], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "D#m/A#": [
    {"trastes": [-1, 1, 1, 3, 4, 2], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 1, "desde": 1, "hasta": 2}},
    {"trastes": [6, 6, 8, 8, 7, 6], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 8, 8, 7, 6], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 8, 11, 11, 11], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/B": [
    {"trastes": [-1, 2, 4, 3, 4, 2], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 9, 8, 7, 6], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 9, 11, 11, 11], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 14, 13, 11, 11, 11], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/C": [
    {"trastes": [-1, 3, 4, 3, 4, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [8, 9, 8, 8, 11, 11], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 3}},
    {"trastes": [8, 9, 8, 11, 11, 11], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 10, 11, 11, 11], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/C#": [
    {"trastes": [-1, 4, -1, 3, 4, 2], "dedos": [0, 3, 0, 2, 4, 1]},
    {"trastes": [-1, 4, 4, 3, 4, -1], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [9, 9, 8, 8, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 11, 11, 11, 11], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "D#m/D": [
    {"trastes": [-1, -1, 0, 3, 4, 2], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, -1, 0, 8, 7, 6], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [10, 9, 8, 8, 11, 11], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [10, 9, 8, 11, 11, 11], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/E": [
    {"trastes": [0, 1, 1, 3, 4, 2], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 1, "desde": 1, "hasta": 2}},
    {"trastes": [0, 6, 8, 8, 7, 6], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [0, 9, 8, 8, 11, 11], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 2, 3, 4, 2], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "D#m/F": [
    {"trastes": [1, 1, 1, 3, 4, 2], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 1, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 3, 3, 4, 2], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 8, 8, 11, 11, 11], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 8, "desde": 1, "hasta": 2}},
    {"trastes": [13, 13, 13, 11, 11, 11], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/F#": [
    {"trastes": [-1, -1, 4, 3, 4, 2], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 9, 8, 8, 11, 11], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 9, 8, 11, 11, 11], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}},
    {"trastes": [14, 13, 13, 11, 11, 11], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/G": [
    {"trastes": [-1, -1, 5, 3, 4, 2], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [3, 6, 4, 3, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 3, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 5, 8, 7, 6], "dedos": [0, 0, 1, 4, 3, 2]},
    {"trastes": [-1, 10, 8, 11, 11, 11], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "D#m/G#": [
    {"trastes": [-1, -1, 6, 8, 7, 6], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 11, 13, 11, 11, 11], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 11, 13, 11, 11, 14], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 11, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 11, 13, 11, 11, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 11, "desde": 1, "hasta": 4}}
  ],
  "D#m11": [
    {"trastes": [-1, -1, 1, 1, 2, 2], "dedos": [0, 0, 1, 1, 3, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 6, 4, 6, 6, 4], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [11, 9, 11, 10, 9, 9], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 9, "desde": 1, "hasta": 5}},
    {"trastes": [11, 11, 11, 11, 11, 13], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 4}}
  ],
  "D#m6": [
    {"trastes": [-1, 6, 4, 5, 4, 6], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [11, 13, 13, 11, 13, 11], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "D#m7b5": [
    {"trastes": [-1, -1, 1, 2, 2, 2], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 7, 6, 7, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [11, -1, 11, 11, 10, -1], "dedos": [2, 0, 3, 4, 1, 0]}
  ],
  "D#m9": [
    {"trastes": [-1, 6, 4, 6, 6, 6], "dedos": [0, 2, 1, 3, 4, 4]},
    {"trastes": [11, 13, 11, 11, 11, 13], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 4}}
  ],
  "D#madd9": [
    {"trastes": [-1, 6, 4, 3, 6, -1], "dedos": [0, 3, 2, 1, 4, 0]},
    {"trastes": [-1, 6, 4, -1, 6, 6], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, -1, 13, 11, 11, 13], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 11, "desde": 3, "hasta": 4}}
  ],
  "D#maj7": [
    {"trastes": [-1, 6, 5, 3, 3, 3], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}}
  ],
  "D#maj9": [
    {"trastes": [-1, 6, 3, 3, 3, 3], "dedos": [0, 4, 1, 1, 1, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 5, 7, 6, -1], "dedos": [0, 2, 1, 4, 3, 0]}
  ],
  "D#mmaj7": [
    {"trastes": [-1, -1, 1, 3, 3, 2], "dedos": [0, 0, 1, 3, 4, 2]},
    {"trastes": [-1, 6, 4, 3, 3, -1], "dedos": [0, 4, 3, 1, 2, 0]},
    {"trastes": [-1, 6, 8, 7, 7, 6], "dedos": [0, 1, 4, 2, 3, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [11, 13, 12, 11, 11, 11], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "D#sus2": [
    {"trastes": [11, 8, 8, 10, 11, -1], "dedos": [3, 1, 1, 2, 4, 0], "cejilla": {"traste": 8, "desde": 1, "hasta": 2}},
    {"trastes": [11, 13, 13, -1, 11, 13], "dedos": [1, 2, 3, 0, 1, 4]}
  ],
  "D#sus4": [
    {"trastes": [-1, -1, 1, 3, 4, 4], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [11, 13, 13, 13, 11, 11], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "E/A": [
    {"trastes": [-1, 0, 2, 1, 0, 0], "dedos": [0, 0, 2, 1, 0, 0]},
    {"trastes": [-1, 0, 2, 1, 0, 4], "dedos": [0, 0, 2, 1, 0, 4]},
    {"trastes": [-1, 0, 2, 4, 0, 4], "dedos": [0, 0, 1, 3, 0, 4]},
    {"trastes": [-1, 0, 2, 4, 5, 4], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "E/A#": [
    {"trastes": [-1, 1, 2, 1, 0, 0], "dedos": [0, 1, 3, 2, 0, 0]},
    {"trastes": [-1, 1, 2, 1, 0, -1], "dedos": [0, 1, 3, 2, 0, 0]},
    {"trastes": [6, 7, 9, 9, 9, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 8, 9, 9, 7], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "E/B": [
    {"trastes": [-1, 2, 2, 1, 0, 0], "dedos": [0, 2, 3, 1, 0, 0]},
    {"trastes": [-1, 2, 2, 4, 5, 4], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 2, "desde": 1, "hasta": 2}},
    {"trastes": [7, 7, 9, 9, 9, 7], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 9, 9, 9, 7], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "E/C": [
    {"trastes": [-1, 3, 2, 1, 0, 0], "dedos": [0, 3, 2, 1, 0, 0]},
    {"trastes": [-1, 3, 2, 1, 0, 4], "dedos": [0, 3, 2, 1, 0, 4]},
    {"trastes": [-1, 3, 2, 4, 0, 4], "dedos": [0, 2, 1, 3, 0, 4]},
    {"trastes": [-1, -1, 10, 9, 9, 7], "dedos": [0, 0, 4, 2, 3, 1]}
  ],
  "E/C#": [
    {"trastes": [-1, 4, 2, 1, 0, 0], "dedos": [0, 4, 2, 1, 0, 0]},
    {"trastes": [-1, 4, 6, 4, 5, 4], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 4, 6, 4, 5, 7], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 4, "desde": 1, "hasta": 3}},
    {"trastes": [9, 11, 9, 9, 9, 12], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 4}}
  ],
  "E/D": [
    {"trastes": [-1, -1, 0, 1, 0, 0], "dedos": [0, 0, 0, 1, 0, 0]},
    {"trastes": [-1, -1, 0, 4, 5, 4], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 9, 9, 7], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, 5, 6, 4, 5, 4], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}}
  ],
  "E/D#": [
    {"trastes": [-1, -1, 1, 1, 0, 0], "dedos": [0, 0, 1, 2, 0, 0]},
    {"trastes": [-1, 6, 6, 4, 5, 4], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [11, 11, 9, 9, 9, 12], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}},
    {"trastes": [11, 11, 9, 9, 12, 12], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 3}}
  ],
  "E/F": [
    {"trastes": [1, 2, 2, 1, 0, 0], "dedos": [1, 3, 4, 2, 0, 0]},
    {"trastes": [-1, -1, 3, 1, 0, 0], "dedos": [0, 0, 3, 1, 0, 0]},
    {"trastes": [1, 2, 2, 1, 0, -1], "dedos": [1, 3, 4, 2, 0, 0]},
    {"trastes": [-1, -1, 3, 4, 5, 4], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "E/F#": [
    {"trastes": [2, 2, 2, 1, 0, 0], "dedos": [2, 3, 4, 1, 0, 0]},
    {"trastes": [-1, -1, 4, 1, 0, 0], "dedos": [0, 0, 4, 1, 0, 0]},
    {"trastes": [2, 2, 2, 4, 5, 4], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 2, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 4, 4, 5, 4], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}}
  ],
  "E/G": [
    {"trastes": [3, 2, 2, 1, 0, 0], "dedos": [4, 2, 3, 1, 0, 0]},
    {"trastes": [3, 2, 2, 1, 0, -1], "dedos": [4, 2, 3, 1, 0, 0]},
    {"trastes": [-1, -1, 5, 4, 5, 4], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 9, 9, 9, 12], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}}
  ],
  "E/G#": [
    {"trastes": [4, 7, 6, 4, 5, 4], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 6, 4, 5, 4], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 4, 5, 7], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "E11": [
    {"trastes": [0, 0, 0, 1, 0, 0], "dedos": [0, 0, 0, 1, 0, 0]},
    {"trastes": [0, 0, 4, 4, 3, 4], "dedos": [0, 0, 2, 3, 1, 4]},
    {"trastes": [-1, 7, 6, 7, 5, 5], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 7, 7, 7, 9, 7], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 7, "desde": 1, "hasta": 5}}
  ],
  "E13": [
    {"trastes": [0, 2, 0, 1, 2, 0], "dedos": [0, 2, 0, 1, 3, 0]},
    {"trastes": [0, 5, 6, 6, 5, 0], "dedos": [0, 1, 3, 4, 2, 0]}
  ],
  "E5": [
    {"trastes": [0, 2, 2, -1, -1, -1], "dedos": [0, 2, 3, 0, 0, 0]},
    {"trastes": [-1, 7, 9, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [12, 14, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [12, 14, 14, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "E6": [
    {"trastes": [0, 2, 2, 1, 2, 0], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [0, 2, 2, 4, 2, 4], "dedos": [0, 1, 1, 3, 1, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 7, 6, 6, 5, -1], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 7, 9, 9, 9, 9], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "E69": [
    {"trastes": [0, 2, 2, 1, 2, 2], "dedos": [0, 2, 2, 1, 3, 4]},
    {"trastes": [0, 11, 11, 11, 12, 12], "dedos": [0, 1, 1, 1, 3, 4], "cejilla": {"traste": 11, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 7, 6, 6, 7, 7], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}}
  ],
  "E7#9": [
    {"trastes": [0, 2, 0, 1, 0, 3], "dedos": [0, 2, 0, 1, 0, 4]},
    {"trastes": [0, 5, 0, 0, 3, 4], "dedos": [0, 3, 0, 0, 1, 2]},
    {"trastes": [0, 10, 9, 9, 9, 10], "dedos": [0, 2, 1, 1, 1, 3], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 7, 6, 7, 8, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "E7b5": [
    {"trastes": [0, 1, 0, 1, 3, 0], "dedos": [0, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 2, 3, 3, 4], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [-1, 7, 8, 7, 9, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 7, "desde": 1, "hasta": 3}}
  ],
  "E7b9": [
    {"trastes": [0, 2, 0, 1, 0, 1], "dedos": [0, 3, 0, 1, 0, 2]},
    {"trastes": [0, 5, 0, 4, 6, 4], "dedos": [0, 3, 0, 1, 4, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 7, 6, 7, 6, 7], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}},
    {"trastes": [12, 11, 12, 10, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]}
  ],
  "E7sus4": [
    {"trastes": [0, 2, 0, 2, 0, 0], "dedos": [0, 2, 0, 3, 0, 0]},
    {"trastes": [-1, 7, 7, 7, 5, 5], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}}
  ],
  "E9": [
    {"trastes": [0, 2, 0, 1, 0, 2], "dedos": [0, 2, 0, 1, 0, 3]},
    {"trastes": [0, 9, 9, 9, 9, 10], "dedos": [0, 1, 1, 1, 1, 2], "cejilla": {"traste": 9, "desde": 1, "hasta": 4}}
  ],
  "Eadd11": [
    {"trastes": [0, 2, 2, 2, 5, 4], "dedos": [0, 1, 1, 1, 4, 3], "cejilla": {"traste": 2, "desde": 1, "hasta": 3}},
    {"trastes": [0, 7, 6, 4, 5, 5], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [0, 7, 7, 9, 9, 7], "dedos": [0, 1, 1, 3, 4, 1], "cejilla": {"traste": 7, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 7, 6, 4, 5, 5], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}}
  ],
  "Eadd9": [
    {"trastes": [0, 2, 2, 1, 0, 2], "dedos": [0, 2, 3, 1, 0, 4]},
    {"trastes": [-1, 7, 6, 4, 7, 4], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 7, 6, -1, 7, 7], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, -1, 14, 13, 12, 14], "dedos": [0, 0, 3, 2, 1, 4]}
  ],
  "Eaug": [
    {"trastes": [0, 3, 2, 1, 1, 0], "dedos": [0, 4, 3, 1, 2, 0]},
    {"trastes": [12, 11, 10, 9, 9, 0], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 7, 6, 5, 5, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}}
  ],
  "Eaug7": [
    {"trastes": [0, 3, 0, 1, 1, 0], "dedos": [0, 4, 0, 1, 2, 0]},
    {"trastes": [-1, -1, 2, 5, 3, 4], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 7, 10, 7, 9, 8], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 7, "desde": 1, "hasta": 3}},
    {"trastes": [12, -1, 12, 13, 13, -1], "dedos": [1, 0, 2, 3, 4, 0]}
  ],
  "Edim": [
    {"trastes": [-1, -1, 2, 3, -1, 3], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 7, 5, -1, 5, 6], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 7, 8, 9, 8, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [12, 10, -1, 12, 11, -1], "dedos": [3, 1, 0, 4, 2, 0]}
  ],
  "Edim7": [
    {"trastes": [0, 1, 2, 0, 2, 0], "dedos": [0, 1, 2, 0, 3, 0]},
    {"trastes": [-1, -1, 2, 3, 2, 3], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [-1, 7, 8, 6, 8, -1], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [12, -1, 11, 12, 11, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 11, "desde": 2, "hasta": 4}}
  ],
  "Em/A": [
    {"trastes": [-1, 0, 2, 0, 0, 0], "dedos": [0, 0, 1, 0, 0, 0]},
    {"trastes": [-1, 0, 2, 0, 0, 3], "dedos": [0, 0, 1, 0, 0, 2]},
    {"trastes": [-1, 0, 2, 4, 0, 3], "dedos": [0, 0, 1, 3, 0, 2]},
    {"trastes": [-1, 0, 2, 4, 5, 3], "dedos": [0, 0, 1, 3, 4, 2]}
  ],
  "Em/A#": [
    {"trastes": [-1, 1, 2, 0, 0, 0], "dedos": [0, 1, 2, 0, 0, 0]},
    {"trastes": [-1, 1, 2, 0, 0, 3], "dedos": [0, 1, 2, 0, 0, 3]},
    {"trastes": [-1, 1, 2, 4, 0, 3], "dedos": [0, 1, 2, 4, 0, 3]},
    {"trastes": [-1, -1, 8, 9, 8, 7], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "Em/B": [
    {"trastes": [-1, 2, 2, 0, 0, 0], "dedos": [0, 1, 2, 0, 0, 0]},
    {"trastes": [-1, 2, 2, 0, 0, 3], "dedos": [0, 1, 2, 0, 0, 3]},
    {"trastes": [-1, 2, 2, 4, 0, 3], "dedos": [0, 1, 2, 4, 0, 3]},
    {"trastes": [-1, 2, 2, 4, 5, 3], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 2, "desde": 1, "hasta": 2}}
  ],
  "Em/C": [
    {"trastes": [-1, 3, 2, 0, 0, 0], "dedos": [0, 2, 1, 0, 0, 0]},
    {"trastes": [-1, 3, 2, 0, 0, 3], "dedos": [0, 2, 1, 0, 0, 3]},
    {"trastes": [-1, 3, 2, 4, 0, 3], "dedos": [0, 2, 1, 4, 0, 3]},
    {"trastes": [-1, 3, 5, 4, 5, 3], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}}
  ],
  "Em/C#": [
    {"trastes": [-1, 4, 2, 0, 0, 0], "dedos": [0, 3, 1, 0, 0, 0]},
    {"trastes": [-1, 4, 2, 0, 0, 3], "dedos": [0, 3, 1, 0, 0, 2]},
    {"trastes": [-1, 4, 2, 4, 0, 3], "dedos": [0, 3, 1, 4, 0, 2]},
    {"trastes": [9, 10, 9, 9, 12, 12], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 9, "desde": 0, "hasta": 3}}
  ],
  "Em/D": [
    {"trastes": [-1, -1, 0, 0, 0, 0], "dedos": [0, 0, 0, 0, 0, 0]},
    {"trastes": [-1, -1, 0, 4, 5, 3], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, -1, 0, 9, 8, 7], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, 5, 5, 4, 5, -1], "dedos": [0, 2, 3, 1, 4, 0]}
  ],
  "Em/D#": [
    {"trastes": [-1, -1, 1, 0, 0, 0], "dedos": [0, 0, 1, 0, 0, 0]},
    {"trastes": [-1, 6, 5, 4, 5, -1], "dedos": [0, 4, 2, 1, 3, 0]},
    {"trastes": [11, 10, 9, 9, 12, 12], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 3}},
    {"trastes": [11, 10, 9, 12, 12, 12], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 12, "desde": 3, "hasta": 5}}
  ],
  "Em/F": [
    {"trastes": [1, 2, 2, 0, 0, 0], "dedos": [1, 2, 3, 0, 0, 0]},
    {"trastes": [1, 2, 2, 0, 0, 3], "dedos": [1, 2, 3, 0, 0, 4]},
    {"trastes": [-1, -1, 3, 0, 0, 0], "dedos": [0, 0, 1, 0, 0, 0]},
    {"trastes": [-1, -1, 3, 4, 5, 3], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}}
  ],
  "Em/F#": [
    {"trastes": [2, 2, 2, 0, 0, 0], "dedos": [1, 2, 3, 0, 0, 0]},
    {"trastes": [2, 2, 2, 0, 0, 3], "dedos": [1, 2, 3, 0, 0, 4]},
    {"trastes": [2, 2, 2, 4, 5, 3], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 2, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 4, 4, 5, 3], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "Em/G": [
    {"trastes": [3, 2, 2, 0, 0, 0], "dedos": [3, 1, 2, 0, 0, 0]},
    {"trastes": [3, 2, 2, 0, 0, 3], "dedos": [3, 1, 2, 0, 0, 4]},
    {"trastes": [3, 2, 2, 4, 0, 0], "dedos": [3, 1, 2, 4, 0, 0]},
    {"trastes": [-1, -1, 5, 4, 5, 3], "dedos": [0, 0, 3, 2, 4, 1]}
  ],
  "Em/G#": [
    {"trastes": [4, 2, 2, 0, 0, 0], "dedos": [4, 1, 2, 0, 0, 0]},
    {"trastes": [4, 2, 2, 0, 0, 3], "dedos": [4, 1, 2, 0, 0, 3]},
    {"trastes": [-1, -1, 6, 4, 5, 3], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 6, 9, 8, 7], "dedos": [0, 0, 1, 4, 3, 2]}
  ],
  "Em11": [
    {"trastes": [0, 0, 0, 0, 0, 2], "dedos": [0, 0, 0, 0, 0, 1]},
    {"trastes": [0, 0, 5, 4, 3, 0], "dedos": [0, 0, 3, 2, 1, 0]},
    {"trastes": [-1, 7, 5, 7, 7, 5], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [12, 10, 12, 11, 10, 10], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "Em6": [
    {"trastes": [0, 2, 2, 0, 2, 0], "dedos": [0, 1, 2, 0, 3, 0]},
    {"trastes": [0, 2, 2, 4, 2, 3], "dedos": [0, 1, 1, 3, 1, 2], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 7, 5, 6, 5, 7], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 5, "desde": 2, "hasta": 4}}
  ],
  "Em7b5": [
    {"trastes": [0, 1, 2, 3, 3, 3], "dedos": [0, 1, 2, 3, 3, 3], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 7, 8, 7, 8, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [12, -1, 12, 12, 11, -1], "dedos": [2, 0, 3, 4, 1, 0]}
  ],
  "Em9": [
    {"trastes": [0, 2, 0, 0, 0, 2], "dedos": [0, 2, 0, 0, 0, 4]},
    {"trastes": [0, 2, 2, 0, 3, 2], "dedos": [0, 1, 2, 0, 4, 3]},
    {"trastes": [0, 10, 12, 11, 12, 10], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 7, 5, 7, 7, 7], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "Emaj7": [
    {"trastes": [0, 2, 1, 1, 0, 0], "dedos": [0, 3, 1, 2, 0, 0]},
    {"trastes": [-1, -1, 2, 4, 4, 4], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 7, 6, 4, 4, 4], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}}
  ],
  "Emaj9": [
    {"trastes": [0, 2, 1, 1, 0, 2], "dedos": [0, 3, 1, 2, 0, 4]},
    {"trastes": [-1, 7, 6, 8, 7, -1], "dedos": [0, 2, 1, 4, 3, 0]}
  ],
  "Emmaj7": [
    {"trastes": [0, 2, 1, 0, 0, 0], "dedos": [0, 2, 1, 0, 0, 0]},
    {"trastes": [0, 2, 2, 4, 4, 3], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 2, "desde": 1, "hasta": 2}},
    {"trastes": [-1, 7, 5, 4, 4, -1], "dedos": [0, 4, 2, 1, 1, 0], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}}
  ],
  "Esus2": [
    {"trastes": [0, 7, 9, 9, 7, 7], "dedos": [0, 1, 3, 4, 1, 1], "cejilla": {"traste": 7, "desde": 1, "hasta": 5}},
    {"trastes": [0, 9, 9, 9, 0, 0], "dedos": [0, 1, 2, 3, 0, 0]},
    {"trastes": [12, 14, 14, -1, 12, 14], "dedos": [1, 3, 4, 0, 1, 4]}
  ],
  "Esus4": [
    {"trastes": [0, 2, 2, 2, 0, 0], "dedos": [0, 2, 3, 4, 0, 0]},
    {"trastes": [0, 2, 2, 4, 5, 5], "dedos": [0, 1, 1, 2, 3, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 2}}
  ],
  "F/A": [
    {"trastes": [-1, 0, 3, 2, 1, 1], "dedos": [0, 0, 3, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 0, 3, 5, 6, 5], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, 0, 7, 5, 6, 5], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 7, 5, 6, 8], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "F/A#": [
    {"trastes": [-1, 1, 3, 2, 1, 1], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 1, 3, 2, 1, -1], "dedos": [0, 1, 3, 2, 1, 0], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 8, 5, 6, 5], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 10, 10, 8], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "F/B": [
    {"trastes": [-1, 2, 3, 2, 1, 1], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 2, 3, 2, 1, -1], "dedos": [0, 2, 4, 3, 1, 0]},
    {"trastes": [7, 8, 10, 10, 10, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 9, 10, 10, 8], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "F/C": [
    {"trastes": [-1, 3, 3, 2, 1, 1], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 3, 3, 5, 6, 5], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [8, 8, 10, 10, 10, 8], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 10, 10, 10, 8], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "F/C#": [
    {"trastes": [-1, 4, 3, 2, 1, 1], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 4, 3, 2, 1, -1], "dedos": [0, 4, 3, 2, 1, 0]},
    {"trastes": [-1, -1, 11, 10, 10, 8], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 11, 14, 13, 13], "dedos": [0, 0, 1, 4, 2, 3]}
  ],
  "F/D": [
    {"trastes": [-1, -1, 0, 2, 1, 1], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 0, 5, 6, 5], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 7, 5, 6, 5], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 5, 7, 5, 6, 8], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}}
  ],
  "F/D#": [
    {"trastes": [-1, -1, 1, 2, 1, 1], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 7, 5, 6, 5], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [11, 12, 10, 10, 10, 13], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}},
    {"trastes": [11, 12, 10, 10, 13, 13], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "F/E": [
    {"trastes": [0, 0, 3, 2, 1, 1], "dedos": [0, 0, 3, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [0, 3, 3, 2, 1, 1], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [0, 3, 3, 5, 6, 5], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [-1, -1, 2, 2, 1, 1], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}}
  ],
  "F/F#": [
    {"trastes": [2, 0, 3, 2, 1, 1], "dedos": [2, 0, 4, 3, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [2, 0, 3, 2, 1, -1], "dedos": [2, 0, 4, 3, 1, 0]},
    {"trastes": [-1, -1, 4, 2, 1, 1], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 4, 5, 6, 5], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "F/G": [
    {"trastes": [3, 0, 3, 2, 1, 1], "dedos": [3, 0, 4, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [3, 3, 3, 5, 6, 5], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 3, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 5, 5, 6, 5], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 10, 10, 10, 10, 13], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 10, "desde": 1, "hasta": 4}}
  ],
  "F/G#": [
    {"trastes": [4, 0, 3, 2, 1, 1], "dedos": [4, 0, 3, 2, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [4, 0, 3, 2, 1, -1], "dedos": [4, 0, 3, 2, 1, 0]},
    {"trastes": [-1, -1, 6, 5, 6, 5], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 10, 10, 10, 13], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}}
  ],
  "F11": [
    {"trastes": [1, 1, 1, 2, 1, 1], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 8, 7, 8, 6, 6], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 8, 8, 8, 10, 8], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}}
  ],
  "F13": [
    {"trastes": [1, 3, 1, 2, 3, 1], "dedos": [1, 3, 1, 2, 4, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 8, 7, 8, 10, 10], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}}
  ],
  "F5": [
    {"trastes": [1, 3, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [1, 3, 3, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]},
    {"trastes": [-1, 8, 10, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]}
  ],
  "F6": [
    {"trastes": [1, -1, 3, 2, 3, 1], "dedos": [1, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 8, 7, 7, 6, -1], "dedos": [0, 4, 2, 3, 1, 0]}
  ],
  "F69": [
    {"trastes": [1, 0, 0, 0, 1, 1], "dedos": [1, 0, 0, 0, 2, 3]},
    {"trastes": [-1, -1, 3, 2, 3, 3], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 8, 7, 7, 8, 8], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}}
  ],
  "F7#9": [
    {"trastes": [1, 3, 1, 2, 1, 4], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 3, 2, 4, 4], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 8, 7, 8, 9, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "F7b5": [
    {"trastes": [1, 0, 1, 2, 0, 1], "dedos": [1, 0, 2, 4, 0, 3]},
    {"trastes": [-1, -1, 3, 4, 4, 5], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [-1, 8, 9, 8, 10, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 8, "desde": 1, "hasta": 3}}
  ],
  "F7b9": [
    {"trastes": [1, 3, 1, 2, 1, 2], "dedos": [1, 4, 1, 2, 1, 3], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 3, 2, 4, 2], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 7, 8, 7, 8], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [13, 12, 13, 11, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]}
  ],
  "F7sus4": [
    {"trastes": [1, 3, 1, 3, 1, 1], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}}
  ],
  "F9": [
    {"trastes": [1, 3, 1, 2, 1, 3], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 3, 2, 4, 3], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "Fadd11": [
    {"trastes": [-1, 8, 7, 5, 6, 6], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}},
    {"trastes": [13, 12, 10, 10, 11, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "Fadd9": [
    {"trastes": [-1, -1, 3, 0, 6, 5], "dedos": [0, 0, 1, 0, 4, 3]},
    {"trastes": [-1, 8, 7, 0, 8, 8], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, -1, 3, 2, 1, 3], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, 8, 7, 5, 8, 5], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}}
  ],
  "Faug": [
    {"trastes": [-1, -1, 3, 2, 2, 1], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, 8, 7, 6, 6, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 6, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 8, -1, 10, 10, 9], "dedos": [0, 1, 0, 3, 4, 2]},
    {"trastes": [13, 12, 11, 10, 10, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 10, "desde": 3, "hasta": 4}}
  ],
  "Faug7": [
    {"trastes": [1, 0, 1, 2, 2, -1], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 3, 6, 4, 5], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 8, 11, 8, 10, 9], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 8, "desde": 1, "hasta": 3}},
    {"trastes": [13, 12, 13, -1, 14, -1], "dedos": [2, 1, 3, 0, 4, 0]}
  ],
  "Fdim": [
    {"trastes": [-1, -1, 3, 4, -1, 4], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 8, 6, -1, 6, 7], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 8, 9, 10, 9, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [13, 11, -1, 13, 12, -1], "dedos": [3, 1, 0, 4, 2, 0]}
  ],
  "Fdim7": [
    {"trastes": [1, -1, 0, 1, 0, 1], "dedos": [1, 0, 0, 2, 0, 3]},
    {"trastes": [-1, -1, 3, 4, 3, 4], "dedos": [0, 0, 1, 3, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [13, -1, 12, 13, 12, -1], "dedos": [3, 0, 1, 4, 2, 0]}
  ],
  "Fm/A": [
    {"trastes": [-1, 0, 3, 1, 1, 1], "dedos": [0, 0, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 3, 1, 1, 4], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 0, 3, 5, 6, 4], "dedos": [0, 0, 1, 3, 4, 2]},
    {"trastes": [-1, 0, 6, 5, 6, 4], "dedos": [0, 0, 3, 2, 4, 1]}
  ],
  "Fm/A#": [
    {"trastes": [-1, 1, 3, 1, 1, 1], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 1, 3, 1, 1, 4], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 1, 3, 1, 1, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 8, 10, 9, 8], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "Fm/B": [
    {"trastes": [-1, 2, 3, 1, 1, 1], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 2, 3, 1, 1, 4], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 2, 3, 1, 1, -1], "dedos": [0, 2, 3, 1, 1, 0], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 9, 10, 9, 8], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "Fm/C": [
    {"trastes": [-1, 3, 3, 1, 1, 1], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 3, 3, 1, 1, 4], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 3, 3, 5, 6, 4], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [8, 8, 10, 10, 9, 8], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "Fm/C#": [
    {"trastes": [-1, 4, 3, 1, 1, 1], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 6, 5, 6, 4], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 11, 10, 9, 8], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 11, 13, 13, 13], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 13, "desde": 3, "hasta": 5}}
  ],
  "Fm/D": [
    {"trastes": [-1, -1, 0, 1, 1, 1], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 5, 6, 4], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, -1, 0, 10, 9, 8], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [10, 11, 10, 10, 13, 13], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 10, "desde": 0, "hasta": 3}}
  ],
  "Fm/D#": [
    {"trastes": [-1, -1, 1, 1, 1, 1], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, -1, 5, 6, 4], "dedos": [0, 3, 0, 2, 4, 1]},
    {"trastes": [-1, 6, 6, 5, 6, -1], "dedos": [0, 2, 3, 1, 4, 0]},
    {"trastes": [11, 11, 10, 10, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "Fm/E": [
    {"trastes": [0, 3, 3, 1, 1, 1], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [0, 3, 3, 1, 1, 4], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [0, 3, 3, 5, 6, 4], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [-1, -1, 2, 1, 1, 1], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}}
  ],
  "Fm/F#": [
    {"trastes": [2, 3, 3, 1, 1, 1], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 4, 1, 1, 1], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [2, 3, 3, 1, 1, -1], "dedos": [2, 3, 4, 1, 1, 0], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 4, 5, 6, 4], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}}
  ],
  "Fm/G": [
    {"trastes": [3, 3, 3, 1, 1, 1], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [3, 3, 3, 5, 6, 4], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 3, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 5, 5, 6, 4], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 10, 10, 13, 13, 13], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 10, "desde": 1, "hasta": 2}}
  ],
  "Fm/G#": [
    {"trastes": [4, 3, 3, 1, 1, 1], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 5, 6, 4], "dedos": [0, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 11, 10, 10, 13, 13], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 11, 10, 13, 13, 13], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 13, "desde": 3, "hasta": 5}}
  ],
  "Fm11": [
    {"trastes": [1, 1, 1, 1, 1, 3], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 3, 3, 4, 4], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 8, 6, 8, 8, 6], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [13, 11, 13, 12, 11, 11], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "Fm6": [
    {"trastes": [1, -1, 0, 1, 1, 1], "dedos": [1, 0, 0, 2, 3, 4]},
    {"trastes": [-1, -1, 3, 5, 3, 4], "dedos": [0, 0, 1, 3, 1, 2], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 8, 6, 7, 6, 8], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 6, "desde": 2, "hasta": 4}}
  ],
  "Fm7b5": [
    {"trastes": [1, -1, 1, 1, 0, -1], "dedos": [1, 0, 2, 3, 0, 0]},
    {"trastes": [13, 11, 13, 13, 0, -1], "dedos": [2, 1, 3, 4, 0, 0]},
    {"trastes": [-1, -1, 3, 4, 4, 4], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 9, 8, 9, -1], "dedos": [0, 1, 3, 2, 4, 0]}
  ],
  "Fm9": [
    {"trastes": [13, 11, 13, 0, 13, 13], "dedos": [2, 1, 3, 0, 4, 4]},
    {"trastes": [1, 3, 1, 1, 1, 3], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 8, 6, 8, 8, 8], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "Fmadd9": [
    {"trastes": [-1, 8, 6, 0, 6, 8], "dedos": [0, 3, 1, 0, 2, 4]},
    {"trastes": [-1, 8, 10, 0, 9, 8], "dedos": [0, 1, 4, 0, 3, 2]},
    {"trastes": [-1, -1, 3, 1, 1, 3], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 8, 6, 5, 8, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "Fmaj7": [
    {"trastes": [-1, -1, 3, 2, 1, 0], "dedos": [0, 0, 3, 2, 1, 0]},
    {"trastes": [1, 3, 2, 2, 1, 1], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}}
  ],
  "Fmaj9": [
    {"trastes": [1, 0, 2, 0, 1, 0], "dedos": [1, 0, 3, 0, 2, 0]},
    {"trastes": [-1, 8, 7, 9, 8, -1], "dedos": [0, 2, 1, 4, 3, 0]}
  ],
  "Fmmaj7": [
    {"trastes": [1, 3, 2, 1, 1, 1], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 3, 5, 5, 4], "dedos": [0, 0, 1, 3, 4, 2]},
    {"trastes": [-1, -1, 15, 13, 13, 12], "dedos": [0, 0, 4, 2, 3, 1]}
  ],
  "Fsus2": [
    {"trastes": [1, 3, 3, -1, 1, 3], "dedos": [1, 2, 3, 0, 1, 4]},
    {"trastes": [13, 10, 10, 12, 13, -1], "dedos": [3, 1, 1, 2, 4, 0], "cejilla": {"traste": 10, "desde": 1, "hasta": 2}}
  ],
  "Fsus4": [
    {"trastes": [1, 3, 3, 3, 1, 1], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 3, 5, 6, 6], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "F#/A": [
    {"trastes": [-1, 0, 4, 3, 2, 2], "dedos": [0, 0, 3, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 0, 4, 6, 7, 6], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, 0, 8, 6, 7, 6], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 8, 6, 7, 9], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "F#/A#": [
    {"trastes": [6, 9, 8, 6, 7, 6], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 8, 6, 7, 6], "dedos": [0, 0, 3, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 6, 7, 9], "dedos": [0, 0, 3, 1, 2, 4]}
  ],
  "F#/B": [
    {"trastes": [-1, 2, 4, 3, 2, 2], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 2, 4, 3, 2, -1], "dedos": [0, 1, 3, 2, 1, 0], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 9, 6, 7, 6], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 11, 11, 9], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "F#/C": [
    {"trastes": [-1, 3, 4, 3, 2, 2], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 3, 4, 3, 2, -1], "dedos": [0, 2, 4, 3, 1, 0]},
    {"trastes": [8, 9, 11, 11, 11, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 11, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 10, 11, 11, 9], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "F#/C#": [
    {"trastes": [-1, 4, 4, 3, 2, 2], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 4, 4, 6, 7, 6], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 4, "desde": 1, "hasta": 2}},
    {"trastes": [9, 9, 11, 11, 11, 9], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 11, 11, 11, 9], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "F#/D": [
    {"trastes": [-1, -1, 0, 3, 2, 2], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 0, 6, 7, 6], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 11, 11, 9], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, 5, 4, 3, 2, 2], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}}
  ],
  "F#/D#": [
    {"trastes": [-1, -1, 1, 3, 2, 2], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 6, 8, 6, 7, 6], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 6, 8, 6, 7, 9], "dedos": [0, 1, 3, 1, 2, 4], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [11, 13, 11, 11, 11, 14], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 4}}
  ],
  "F#/E": [
    {"trastes": [0, 4, 4, 3, 2, 2], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [0, 4, 4, 6, 7, 6], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 4, "desde": 1, "hasta": 2}},
    {"trastes": [0, 9, 8, 6, 7, 6], "dedos": [0, 4, 3, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 2, 3, 2, 2], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "F#/F": [
    {"trastes": [-1, -1, 3, 3, 2, 2], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 8, 8, 6, 7, 6], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [13, 13, 11, 11, 11, 14], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 4}},
    {"trastes": [13, 13, 11, 11, 14, 14], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "F#/G": [
    {"trastes": [-1, -1, 5, 3, 2, 2], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [3, 4, 4, 3, -1, -1], "dedos": [1, 2, 3, 1, 0, 0], "cejilla": {"traste": 3, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 5, 6, 7, 6], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, 10, 11, 11, 11, -1], "dedos": [0, 1, 2, 2, 2, 0], "cejilla": {"traste": 11, "desde": 2, "hasta": 4}}
  ],
  "F#/G#": [
    {"trastes": [4, 4, 4, 6, 7, 6], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 4, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 6, 6, 7, 6], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 11, 11, 11, 11, 14], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 11, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 11, 11, 11, 11, -1], "dedos": [0, 1, 1, 1, 1, 0], "cejilla": {"traste": 11, "desde": 1, "hasta": 4}}
  ],
  "F#11": [
    {"trastes": [2, 1, 2, 1, 0, 0], "dedos": [3, 1, 4, 2, 0, 0]},
    {"trastes": [-1, 9, 8, 9, 7, 7], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 9, 9, 9, 11, 9], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 9, "desde": 1, "hasta": 5}}
  ],
  "F#13": [
    {"trastes": [-1, 9, 8, 8, 7, 0], "dedos": [0, 4, 2, 3, 1, 0]}
  ],
  "F#5": [
    {"trastes": [2, 4, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [2, 4, 4, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]},
    {"trastes": [-1, 9, 11, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]}
  ],
  "F#6": [
    {"trastes": [2, -1, 1, 3, 2, -1], "dedos": [2, 0, 1, 4, 3, 0]},
    {"trastes": [2, -1, 4, 3, 4, 2], "dedos": [1, 0, 3, 2, 4, 1]},
    {"trastes": [-1, 9, 11, 11, 11, 11], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "F#69": [
    {"trastes": [2, 1, 1, 1, 2, 2], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 1, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 4, 3, 4, 4], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 9, 8, 8, 9, 9], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}}
  ],
  "F#7#9": [
    {"trastes": [2, 1, 2, 2, 2, 2], "dedos": [2, 1, 3, 3, 3, 4]},
    {"trastes": [2, 4, 2, 3, 2, 5], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 4, 3, 5, 5], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 9, 8, 9, 10, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "F#7b5": [
    {"trastes": [-1, 9, 10, 9, 11, 0], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 9, "desde": 1, "hasta": 3}},
    {"trastes": [2, -1, 2, 3, 1, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 4, 5, 5, 6], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "F#7b9": [
    {"trastes": [2, 1, 2, 0, 2, 0], "dedos": [2, 1, 3, 0, 4, 0]},
    {"trastes": [-1, -1, 4, 3, 5, 3], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 8, 9, 8, 9], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}},
    {"trastes": [14, 13, 14, 12, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]}
  ],
  "F#7sus4": [
    {"trastes": [2, 4, 2, 4, 2, 2], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 4, 6, 5, 7], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [-1, 9, 9, 9, 7, 7], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}}
  ],
  "F#9": [
    {"trastes": [2, 4, 2, 3, 2, 4], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 4, 3, 5, 4], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "F#add11": [
    {"trastes": [2, 1, 4, 3, 0, -1], "dedos": [2, 1, 4, 3, 0, 0]},
    {"trastes": [2, 4, 4, 3, 0, -1], "dedos": [1, 3, 4, 2, 0, 0]},
    {"trastes": [-1, 9, 8, 6, 7, 7], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [14, 13, 11, 11, 12, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "F#add9": [
    {"trastes": [2, 1, -1, 1, 2, 2], "dedos": [3, 1, 0, 2, 4, 4]},
    {"trastes": [-1, -1, 4, 3, 2, 4], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, 9, 8, 6, 9, 6], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 8, -1, 9, 9], "dedos": [0, 2, 1, 0, 3, 4]}
  ],
  "F#aug": [
    {"trastes": [-1, -1, 4, 3, 3, 2], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 4, 3, 3, -1], "dedos": [0, 0, 2, 1, 1, 0], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 9, 8, 7, 7, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}},
    {"trastes": [14, 13, 12, 11, 11, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 11, "desde": 3, "hasta": 4}}
  ],
  "F#aug7": [
    {"trastes": [-1, 9, 8, 7, 7, 0], "dedos": [0, 4, 3, 1, 2, 0]},
    {"trastes": [2, -1, 2, 3, 3, -1], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 4, 7, 5, 6], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 9, 12, 9, 11, 10], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 9, "desde": 1, "hasta": 3}}
  ],
  "F#dim": [
    {"trastes": [2, 0, -1, 2, 1, -1], "dedos": [2, 0, 0, 3, 1, 0]},
    {"trastes": [-1, -1, 4, 5, -1, 5], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 9, 7, -1, 7, 8], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 9, 10, 11, 10, -1], "dedos": [0, 1, 2, 4, 3, 0]}
  ],
  "F#dim7": [
    {"trastes": [2, -1, 1, 2, 1, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [2, 3, 4, 2, 4, 2], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 4, 5, 4, 5], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "F#m/A": [
    {"trastes": [-1, 0, 4, 2, 2, 2], "dedos": [0, 0, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 4, 2, 2, 5], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 0, 4, 6, 7, 5], "dedos": [0, 0, 1, 3, 4, 2]},
    {"trastes": [5, 4, 4, 2, 2, 2], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}}
  ],
  "F#m/A#": [
    {"trastes": [-1, -1, 8, 6, 7, 5], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [6, 9, 7, 6, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 6, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 8, 11, 10, 9], "dedos": [0, 0, 1, 4, 3, 2]},
    {"trastes": [-1, 13, 11, 14, 14, 14], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 14, "desde": 3, "hasta": 5}}
  ],
  "F#m/B": [
    {"trastes": [-1, 2, 4, 2, 2, 2], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 2, 4, 2, 2, 5], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 2, 4, 2, 2, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 9, 11, 10, 9], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "F#m/C": [
    {"trastes": [-1, 3, 4, 2, 2, 2], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 3, 4, 2, 2, 5], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 3, 4, 2, 2, -1], "dedos": [0, 2, 3, 1, 1, 0], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 10, 11, 10, 9], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "F#m/C#": [
    {"trastes": [-1, 4, 4, 2, 2, 2], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 4, 2, 2, 5], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 4, 4, 6, 7, 5], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 4, "desde": 1, "hasta": 2}},
    {"trastes": [9, 9, 11, 11, 10, 9], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "F#m/D": [
    {"trastes": [-1, -1, 0, 2, 2, 2], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 6, 7, 5], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, 5, 4, 2, 2, 2], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 7, 6, 7, 5], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}}
  ],
  "F#m/D#": [
    {"trastes": [-1, -1, 1, 2, 2, 2], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 7, 6, 7, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [11, 12, 11, 11, 14, 14], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 3}},
    {"trastes": [11, 12, 11, 14, 14, 14], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 11, "desde": 0, "hasta": 2}}
  ],
  "F#m/E": [
    {"trastes": [0, 0, 4, 2, 2, 2], "dedos": [0, 0, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [0, 4, 4, 2, 2, 2], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [0, 4, 4, 2, 2, 5], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 2, 2, 2, 2], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "F#m/F": [
    {"trastes": [-1, -1, 3, 2, 2, 2], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 7, 6, 7, -1], "dedos": [0, 4, 2, 1, 3, 0]},
    {"trastes": [13, 12, 11, 11, 14, 14], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}},
    {"trastes": [13, 12, 11, 14, 14, 14], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 14, "desde": 3, "hasta": 5}}
  ],
  "F#m/G": [
    {"trastes": [3, 0, 4, 2, 2, 2], "dedos": [2, 0, 3, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [3, 4, 4, 2, 2, 2], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 2, 2, 2], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 6, 7, 5], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}}
  ],
  "F#m/G#": [
    {"trastes": [4, 0, 4, 2, 2, 2], "dedos": [3, 0, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [4, 4, 4, 2, 2, 2], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 2, "desde": 3, "hasta": 5}},
    {"trastes": [4, 4, 4, 6, 7, 5], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 4, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 6, 6, 7, 5], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "F#m11": [
    {"trastes": [2, 0, 2, 1, 0, 0], "dedos": [2, 0, 3, 1, 0, 0]},
    {"trastes": [2, 2, 2, 2, 2, 4], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 4, 4, 5, 5], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 9, 7, 9, 9, 7], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 7, "desde": 2, "hasta": 5}}
  ],
  "F#m6": [
    {"trastes": [2, -1, 1, 2, 2, 2], "dedos": [2, 0, 1, 3, 3, 4]},
    {"trastes": [-1, 9, 7, 8, 7, 9], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 9, 11, 8, 10, -1], "dedos": [0, 2, 4, 1, 3, 0]}
  ],
  "F#m7b5": [
    {"trastes": [2, 0, 2, 2, 1, 0], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 4, 5, 5, 5], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 10, 9, 10, -1], "dedos": [0, 1, 3, 2, 4, 0]}
  ],
  "F#m9": [
    {"trastes": [2, 0, 2, 1, 2, 0], "dedos": [2, 0, 3, 1, 4, 0]},
    {"trastes": [2, 4, 2, 2, 2, 4], "dedos": [1, 2, 1, 1, 1, 3], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 9, 7, 9, 9, 9], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "F#madd9": [
    {"trastes": [-1, -1, 4, 2, 2, 4], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [2, 4, 4, 2, 2, 4], "dedos": [1, 2, 3, 1, 1, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 9, 7, 6, 9, -1], "dedos": [0, 3, 2, 1, 4, 0]},
    {"trastes": [-1, 9, 7, -1, 9, 9], "dedos": [0, 2, 1, 0, 3, 4]}
  ],
  "F#maj7": [
    {"trastes": [2, 4, 3, 3, 2, 2], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 9, 8, 6, 6, 6], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}}
  ],
  "F#maj9": [
    {"trastes": [2, 1, 3, 1, 2, 1], "dedos": [2, 1, 4, 1, 3, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [2, -1, 3, 3, 2, 4], "dedos": [1, 0, 2, 3, 1, 4]},
    {"trastes": [-1, -1, 4, 3, 6, 4], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "F#mmaj7": [
    {"trastes": [2, 4, 3, 2, 2, 2], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 9, 7, 6, 6, -1], "dedos": [0, 4, 2, 1, 1, 0], "cejilla": {"traste": 6, "desde": 3, "hasta": 4}}
  ],
  "F#sus2": [
    {"trastes": [2, -1, -1, 1, 2, 2], "dedos": [2, 0, 0, 1, 3, 4]},
    {"trastes": [14, 11, 11, 13, 14, -1], "dedos": [3, 1, 1, 2, 4, 0], "cejilla": {"traste": 11, "desde": 1, "hasta": 2}}
  ],
  "F#sus4": [
    {"trastes": [2, 4, 4, 4, 2, 2], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}}
  ],
  "G/A": [
    {"trastes": [-1, 0, 0, 0, 0, 3], "dedos": [0, 0, 0, 0, 0, 1]},
    {"trastes": [-1, 0, 0, 4, 0, 3], "dedos": [0, 0, 0, 2, 0, 1]},
    {"trastes": [-1, 0, 0, 4, 3, 3], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 0, 5, 4, 3, 3], "dedos": [0, 0, 3, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}}
  ],
  "G/A#": [
    {"trastes": [-1, 1, 0, 0, 0, 3], "dedos": [0, 1, 0, 0, 0, 3]},
    {"trastes": [-1, 1, 0, 4, 0, 3], "dedos": [0, 1, 0, 4, 0, 3]},
    {"trastes": [-1, 1, 0, 0, 0, -1], "dedos": [0, 1, 0, 0, 0, 0]},
    {"trastes": [-1, -1, 8, 7, 8, 7], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "G/B": [
    {"trastes": [-1, 2, 0, 0, 0, 3], "dedos": [0, 1, 0, 0, 0, 2]},
    {"trastes": [-1, 2, 0, 0, 3, 3], "dedos": [0, 1, 0, 0, 2, 2], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 2, 0, 4, 0, 3], "dedos": [0, 1, 0, 3, 0, 2]},
    {"trastes": [-1, 2, 0, 4, 3, 3], "dedos": [0, 1, 0, 4, 2, 3]}
  ],
  "G/C": [
    {"trastes": [-1, 3, 0, 0, 0, 3], "dedos": [0, 1, 0, 0, 0, 2]},
    {"trastes": [-1, 3, 0, 4, 0, 3], "dedos": [0, 1, 0, 3, 0, 2]},
    {"trastes": [-1, 3, 5, 4, 3, 3], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 10, 7, 8, 7], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "G/C#": [
    {"trastes": [-1, 4, 0, 0, 0, 3], "dedos": [0, 2, 0, 0, 0, 1]},
    {"trastes": [-1, 4, 0, 4, 0, 3], "dedos": [0, 2, 0, 3, 0, 1]},
    {"trastes": [-1, 4, 0, 4, 3, 3], "dedos": [0, 2, 0, 3, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 4, 5, 4, 3, 3], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}}
  ],
  "G/D": [
    {"trastes": [-1, -1, 0, 0, 0, 3], "dedos": [0, 0, 0, 0, 0, 1]},
    {"trastes": [-1, -1, 0, 4, 0, 3], "dedos": [0, 0, 0, 2, 0, 1]},
    {"trastes": [-1, -1, 0, 4, 3, 3], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 5, 4, 3, 3], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}}
  ],
  "G/D#": [
    {"trastes": [-1, -1, 1, 4, 3, 3], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 6, 5, 4, 3, 3], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 6, 5, 4, 3, -1], "dedos": [0, 4, 3, 2, 1, 0]},
    {"trastes": [-1, -1, 13, 12, 12, 10], "dedos": [0, 0, 4, 2, 3, 1]}
  ],
  "G/E": [
    {"trastes": [0, 2, 0, 0, 0, 3], "dedos": [0, 1, 0, 0, 0, 2]},
    {"trastes": [0, 2, 0, 0, 3, 3], "dedos": [0, 1, 0, 0, 2, 2], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [0, 2, 0, 4, 0, 3], "dedos": [0, 1, 0, 3, 0, 2]},
    {"trastes": [0, 2, 0, 4, 3, 3], "dedos": [0, 1, 0, 4, 2, 3]}
  ],
  "G/F": [
    {"trastes": [1, 2, 0, 0, 0, 3], "dedos": [1, 2, 0, 0, 0, 3]},
    {"trastes": [1, 2, 0, 4, 0, 3], "dedos": [1, 2, 0, 4, 0, 3]},
    {"trastes": [-1, -1, 3, 4, 3, 3], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 8, 9, 7, 8, 7], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "G/F#": [
    {"trastes": [2, 2, 0, 0, 0, 3], "dedos": [1, 2, 0, 0, 0, 3]},
    {"trastes": [2, 2, 0, 0, 3, 3], "dedos": [1, 2, 0, 0, 3, 3], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [2, 2, 0, 4, 0, 3], "dedos": [1, 2, 0, 4, 0, 3]},
    {"trastes": [-1, -1, 4, 4, 3, 3], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}}
  ],
  "G/G#": [
    {"trastes": [4, 2, 0, 0, 0, 3], "dedos": [3, 1, 0, 0, 0, 2]},
    {"trastes": [4, 2, 0, 0, 3, 3], "dedos": [3, 1, 0, 0, 2, 2], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 6, 4, 3, 3], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 6, 7, 8, 7], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "G11": [
    {"trastes": [3, 2, 0, 0, 1, 1], "dedos": [3, 2, 0, 0, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 10, 9, 10, 8, 8], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 10, 10, 10, 12, 10], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "G13": [
    {"trastes": [3, 0, 2, 0, 0, 1], "dedos": [3, 0, 2, 0, 0, 1]},
    {"trastes": [3, -1, 3, 4, 5, 5], "dedos": [1, 0, 1, 2, 3, 4]},
    {"trastes": [3, 5, 3, 4, 5, 3], "dedos": [1, 3, 1, 2, 4, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 10, 9, 10, 10, 12], "dedos": [0, 2, 1, 3, 3, 4]}
  ],
  "G5": [
    {"trastes": [3, 5, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [3, 5, 5, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]},
    {"trastes": [-1, 10, 12, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]}
  ],
  "G6": [
    {"trastes": [3, 2, 0, 0, 0, 0], "dedos": [2, 1, 0, 0, 0, 0]},
    {"trastes": [3, -1, 2, 4, 3, -1], "dedos": [2, 0, 1, 4, 3, 0]},
    {"trastes": [-1, 10, 12, 12, 12, 12], "dedos": [0, 1, 3, 3, 3, 4], "cejilla": {"traste": 12, "desde": 2, "hasta": 5}}
  ],
  "G69": [
    {"trastes": [3, 0, 0, 0, 0, 0], "dedos": [1, 0, 0, 0, 0, 0]},
    {"trastes": [3, 2, 2, 2, 3, 3], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 10, 9, 9, 10, 10], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 3}}
  ],
  "G7#9": [
    {"trastes": [3, 2, 0, 3, 0, 1], "dedos": [3, 2, 0, 4, 0, 1]},
    {"trastes": [3, 5, 3, 4, 6, 6], "dedos": [1, 3, 1, 2, 4, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 2}},
    {"trastes": [-1, 10, 9, 10, 11, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "G7b5": [
    {"trastes": [-1, 10, 9, 10, 0, 9], "dedos": [0, 3, 1, 4, 0, 2]},
    {"trastes": [3, -1, 3, 4, 2, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 5, 6, 6, 7], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [-1, 10, 11, 10, 12, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 10, "desde": 1, "hasta": 3}}
  ],
  "G7b9": [
    {"trastes": [3, 2, 0, 1, 3, 1], "dedos": [3, 2, 0, 1, 4, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [3, -1, 3, 4, 3, 4], "dedos": [1, 0, 1, 2, 1, 3]},
    {"trastes": [-1, -1, 5, 4, 6, 4], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 9, 10, 9, 10], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}}
  ],
  "G7sus4": [
    {"trastes": [3, 3, 0, 0, 1, 1], "dedos": [2, 3, 0, 0, 1, 1], "cejilla": {"traste": 1, "desde": 4, "hasta": 5}},
    {"trastes": [3, 5, 3, 5, 3, 3], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 10, 10, 10, 8, 8], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}}
  ],
  "G9": [
    {"trastes": [3, 0, 0, 0, 0, 1], "dedos": [3, 0, 0, 0, 0, 1]},
    {"trastes": [3, 2, 3, 2, 3, -1], "dedos": [2, 1, 3, 1, 4, 0], "cejilla": {"traste": 2, "desde": 1, "hasta": 3}},
    {"trastes": [3, 5, 3, 4, 3, 5], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 4}}
  ],
  "Gadd11": [
    {"trastes": [3, 2, 0, 0, 1, 3], "dedos": [3, 2, 0, 0, 1, 4]},
    {"trastes": [3, 2, 0, 0, 1, -1], "dedos": [3, 2, 0, 0, 1, 0]},
    {"trastes": [3, 2, 0, 4, 1, -1], "dedos": [3, 2, 0, 4, 1, 0]},
    {"trastes": [-1, 10, 9, 7, 8, 8], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 8, "desde": 4, "hasta": 5}}
  ],
  "Gadd9": [
    {"trastes": [3, 0, 0, 2, 0, 3], "dedos": [2, 0, 0, 1, 0, 3]},
    {"trastes": [-1, 10, 9, 0, 10, 10], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [-1, 10, 9, 7, 10, 7], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Gaug": [
    {"trastes": [3, 2, 1, 0, 0, -1], "dedos": [3, 2, 1, 0, 0, 0]},
    {"trastes": [3, -1, 5, 4, 4, -1], "dedos": [1, 0, 4, 2, 3, 0]},
    {"trastes": [-1, -1, 5, 4, 4, -1], "dedos": [0, 0, 2, 1, 1, 0], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 10, 9, 8, 8, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 8, "desde": 3, "hasta": 4}}
  ],
  "Gaug7": [
    {"trastes": [3, 2, 1, 0, 0, 1], "dedos": [4, 3, 1, 0, 0, 2]},
    {"trastes": [3, -1, 3, 4, 4, -1], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 5, 8, 6, 7], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 10, 13, 10, 12, 11], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 10, "desde": 1, "hasta": 3}}
  ],
  "Gdim": [
    {"trastes": [3, 1, -1, 3, 2, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 5, 6, -1, 6], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 10, 11, 12, 11, -1], "dedos": [0, 1, 2, 4, 3, 0]}
  ],
  "Gdim7": [
    {"trastes": [3, 1, -1, 3, 2, 0], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [3, -1, 2, 3, 2, 0], "dedos": [3, 0, 1, 4, 2, 0]},
    {"trastes": [3, 4, 5, 3, 5, 3], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 5, 6, 5, 6], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "Gm/A": [
    {"trastes": [-1, 0, 0, 3, 3, 3], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 5, 3, 3, 3], "dedos": [0, 0, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 5, 3, 3, 6], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [5, 5, 5, 3, 3, 3], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}}
  ],
  "Gm/A#": [
    {"trastes": [-1, 1, 0, 0, 3, -1], "dedos": [0, 1, 0, 0, 3, 0]},
    {"trastes": [6, 5, 5, 3, 3, 3], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [6, 5, 5, 3, 3, -1], "dedos": [4, 2, 3, 1, 1, 0], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 8, 7, 8, 6], "dedos": [0, 0, 3, 2, 4, 1]}
  ],
  "Gm/B": [
    {"trastes": [-1, 2, 0, 3, 3, 3], "dedos": [0, 1, 0, 2, 2, 2], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 7, 8, 6], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [7, 10, 8, 7, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 7, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 9, 12, 11, 10], "dedos": [0, 0, 1, 4, 3, 2]}
  ],
  "Gm/C": [
    {"trastes": [-1, 3, 5, 3, 3, 3], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 3, 5, 3, 3, 6], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 3, 5, 3, 3, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 10, 12, 11, 10], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 10, "desde": 2, "hasta": 5}}
  ],
  "Gm/C#": [
    {"trastes": [-1, 4, 0, 3, 3, 3], "dedos": [0, 2, 0, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 5, 3, 3, 3], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 4, 5, 3, 3, 6], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 11, 12, 11, 10], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "Gm/D": [
    {"trastes": [-1, -1, 0, 3, 3, 3], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 5, 3, 3, 3], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 5, 3, 3, 6], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 5, 5, 7, 8, 6], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 5, "desde": 1, "hasta": 2}}
  ],
  "Gm/D#": [
    {"trastes": [-1, -1, 1, 3, 3, 3], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 5, 3, 3, 3], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 8, 7, 8, 6], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 13, 12, 11, 10], "dedos": [0, 0, 4, 3, 2, 1]}
  ],
  "Gm/E": [
    {"trastes": [0, 5, 5, 3, 3, 3], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [0, 5, 5, 3, 3, 6], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [0, 5, 5, 7, 8, 6], "dedos": [0, 1, 1, 3, 4, 2], "cejilla": {"traste": 5, "desde": 1, "hasta": 2}},
    {"trastes": [-1, -1, 2, 3, 3, 3], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}}
  ],
  "Gm/F": [
    {"trastes": [1, 1, 0, 0, 3, 3], "dedos": [1, 2, 0, 0, 4, 4], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [1, 1, 0, 3, 3, 3], "dedos": [1, 2, 0, 4, 4, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [1, 1, 0, 0, 3, -1], "dedos": [1, 2, 0, 0, 4, 0]},
    {"trastes": [-1, -1, 3, 3, 3, 3], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}}
  ],
  "Gm/F#": [
    {"trastes": [2, 1, 0, 0, 3, -1], "dedos": [2, 1, 0, 0, 3, 0]},
    {"trastes": [2, 1, 0, 0, -1, -1], "dedos": [2, 1, 0, 0, 0, 0]},
    {"trastes": [-1, -1, 4, 3, 3, 3], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 8, 7, 8, -1], "dedos": [0, 4, 2, 1, 3, 0]}
  ],
  "Gm/G#": [
    {"trastes": [4, 1, 0, 0, 3, -1], "dedos": [4, 1, 0, 0, 3, 0]},
    {"trastes": [4, 5, 5, 3, 3, 3], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 3, 3, 3], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 3, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 7, 8, 6], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}}
  ],
  "Gm11": [
    {"trastes": [3, -1, 3, 3, 1, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [3, 3, 3, 3, 3, 5], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 10, 8, 10, 10, 8], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "Gm6": [
    {"trastes": [3, -1, 2, 3, 3, 3], "dedos": [2, 0, 1, 3, 4, 4]},
    {"trastes": [3, 5, 5, 3, 5, 3], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 10, 8, 9, 8, 10], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 8, "desde": 2, "hasta": 4}}
  ],
  "Gm7b5": [
    {"trastes": [3, -1, -1, 3, 2, 1], "dedos": [3, 0, 0, 4, 2, 1]},
    {"trastes": [3, -1, 3, 3, 2, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 5, 6, 6, 6], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 11, 10, 11, -1], "dedos": [0, 1, 3, 2, 4, 0]}
  ],
  "Gm9": [
    {"trastes": [3, 0, 0, 3, 3, 1], "dedos": [2, 0, 0, 3, 4, 1]},
    {"trastes": [3, 5, 3, 3, 3, 5], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 10, 8, 10, 10, 10], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "Gmadd9": [
    {"trastes": [3, 1, 0, 2, 3, 3], "dedos": [3, 1, 0, 2, 4, 4]},
    {"trastes": [-1, -1, 5, 3, 3, 5], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 10, 8, 7, 10, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "Gmaj7": [
    {"trastes": [3, 2, 0, 0, 0, 2], "dedos": [3, 2, 0, 0, 0, 1]},
    {"trastes": [3, 5, 4, 4, 3, 3], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 10, 12, 11, 12, 10], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "Gmaj9": [
    {"trastes": [3, 0, 0, 0, 0, 2], "dedos": [2, 0, 0, 0, 0, 1]},
    {"trastes": [3, 2, 4, 2, 3, 2], "dedos": [2, 1, 4, 1, 3, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 10, 9, 11, 10, -1], "dedos": [0, 2, 1, 4, 3, 0]}
  ],
  "Gmmaj7": [
    {"trastes": [3, 1, 0, 0, 3, 2], "dedos": [3, 1, 0, 0, 4, 2]},
    {"trastes": [3, 5, 4, 3, 3, 3], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 10, 12, 11, 11, 10], "dedos": [0, 1, 4, 2, 3, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "Gsus2": [
    {"trastes": [3, 0, 0, 0, 3, 3], "dedos": [1, 0, 0, 0, 2, 3]},
    {"trastes": [-1, 10, 7, 7, 8, 10], "dedos": [0, 3, 1, 1, 2, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}}
  ],
  "Gsus4": [
    {"trastes": [3, 3, 0, 0, 1, 3], "dedos": [2, 3, 0, 0, 1, 4]},
    {"trastes": [3, 5, 5, 5, 3, 3], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 3, "desde": 0, "hasta": 5}}
  ],
  "G#/A": [
    {"trastes": [-1, 0, 1, 1, 1, 4], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 0, 6, 5, 4, 4], "dedos": [0, 0, 3, 2, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 0, 6, 8, 9, 8], "dedos": [0, 0, 1, 2, 4, 3]},
    {"trastes": [-1, -1, 7, 5, 4, 4], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}}
  ],
  "G#/A#": [
    {"trastes": [-1, 1, 1, 1, 1, 4], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 1, 1, 1, 1, -1], "dedos": [0, 1, 1, 1, 1, 0], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [6, 6, 6, 8, 9, 8], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 6, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 8, 8, 9, 8], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "G#/B": [
    {"trastes": [-1, 2, 1, 1, 1, 4], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 2, 1, 1, 1, -1], "dedos": [0, 2, 1, 1, 1, 0], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [7, 6, 6, 5, -1, -1], "dedos": [4, 2, 3, 1, 0, 0]},
    {"trastes": [-1, -1, 9, 8, 9, 8], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "G#/C": [
    {"trastes": [-1, 3, 1, 1, 1, 4], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 3, 1, 1, 4, 4], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [8, 11, 10, 8, 9, 8], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 8, "desde": 0, "hasta": 5}}
  ],
  "G#/C#": [
    {"trastes": [-1, 4, 1, 1, 1, -1], "dedos": [0, 4, 1, 1, 1, 0], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 4, 6, 5, 4, 4], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 11, 8, 9, 8], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 13, 13, 11], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "G#/D": [
    {"trastes": [-1, -1, 0, 5, 4, 4], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 0, 8, 9, 8], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 13, 13, 11], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, 5, 6, 5, 4, 4], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}}
  ],
  "G#/D#": [
    {"trastes": [-1, -1, 1, 1, 1, 4], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 6, 6, 5, 4, 4], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 6, 6, 8, 9, 8], "dedos": [0, 1, 1, 2, 4, 3], "cejilla": {"traste": 6, "desde": 1, "hasta": 2}},
    {"trastes": [11, 11, 13, 13, 13, 11], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "G#/E": [
    {"trastes": [0, 3, 1, 1, 1, 4], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [0, 3, 1, 1, 4, 4], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [0, 6, 6, 5, 4, 4], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 2, 5, 4, 4], "dedos": [0, 0, 1, 4, 2, 3]}
  ],
  "G#/F": [
    {"trastes": [1, 3, 1, 1, 1, 4], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 4}},
    {"trastes": [1, 3, 1, 1, 4, 4], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 3, 5, 4, 4], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 8, 10, 8, 9, 8], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}}
  ],
  "G#/F#": [
    {"trastes": [2, 3, 1, 1, 1, 4], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [2, 3, 1, 1, 4, 4], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 4, 5, 4, 4], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 9, 10, 8, 9, 8], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "G#/G": [
    {"trastes": [3, 3, 1, 1, 1, 4], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [3, 3, 1, 1, 4, 4], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 5, 5, 4, 4], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 10, 10, 8, 9, 8], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "G#11": [
    {"trastes": [4, 4, 4, 5, 4, 4], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 10, 11, 9, 9], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 11, 11, 11, 13, 11], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "G#13": [
    {"trastes": [4, 1, 3, 1, 1, 2], "dedos": [4, 1, 3, 1, 1, 2], "cejilla": {"traste": 1, "desde": 1, "hasta": 4}},
    {"trastes": [4, 6, 4, 5, 6, 4], "dedos": [1, 3, 1, 2, 4, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 10, 11, 13, 13], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 13, "desde": 4, "hasta": 5}}
  ],
  "G#5": [
    {"trastes": [4, 6, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [4, 6, 6, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]},
    {"trastes": [-1, 11, 13, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]}
  ],
  "G#6": [
    {"trastes": [4, -1, 3, 5, 4, -1], "dedos": [2, 0, 1, 4, 3, 0]},
    {"trastes": [-1, 11, 10, 10, 9, -1], "dedos": [0, 4, 2, 3, 1, 0]}
  ],
  "G#69": [
    {"trastes": [4, 3, 3, 3, 4, 4], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 6, 5, 6, 6], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 11, 10, 10, 11, 11], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "G#7#9": [
    {"trastes": [4, 3, 4, 4, 4, 4], "dedos": [2, 1, 3, 3, 3, 4]},
    {"trastes": [4, 6, 4, 5, 7, 7], "dedos": [1, 3, 1, 2, 4, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 6, 5, 7, 7], "dedos": [0, 0, 3, 1, 4, 4], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 11, 10, 11, 12, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "G#7b5": [
    {"trastes": [4, -1, 4, 5, 3, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 6, 7, 7, 8], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [-1, 11, 12, 11, 13, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 11, "desde": 1, "hasta": 3}}
  ],
  "G#7b9": [
    {"trastes": [-1, -1, 6, 5, 7, 5], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 10, 11, 10, 11], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 4}}
  ],
  "G#7sus4": [
    {"trastes": [4, 6, 4, 6, 4, 4], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 11, 11, 9, 9], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}}
  ],
  "G#9": [
    {"trastes": [4, 3, 4, 3, 4, -1], "dedos": [2, 1, 3, 1, 4, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 3}},
    {"trastes": [4, 6, 4, 5, 4, 6], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 6, 5, 7, 6], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "G#add11": [
    {"trastes": [4, 3, 1, 1, 2, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [4, 3, 6, 6, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 11, 10, 8, 9, 9], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 9, "desde": 4, "hasta": 5}}
  ],
  "G#add9": [
    {"trastes": [4, 3, -1, 3, 4, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 6, 5, 4, 6], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, 11, 10, 8, 11, 8], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 10, -1, 11, 11], "dedos": [0, 2, 1, 0, 3, 4]}
  ],
  "G#aug": [
    {"trastes": [4, 3, 2, 1, 1, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 1, "desde": 3, "hasta": 4}},
    {"trastes": [4, -1, 6, 5, 5, -1], "dedos": [1, 0, 4, 2, 3, 0]},
    {"trastes": [-1, -1, 6, 5, 5, -1], "dedos": [0, 0, 2, 1, 1, 0], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 11, 10, 9, 9, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}}
  ],
  "G#aug7": [
    {"trastes": [4, -1, 4, 5, 5, 0], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, 11, 10, 11, 9, 0], "dedos": [0, 3, 2, 4, 1, 0]},
    {"trastes": [-1, -1, 6, 9, 7, 8], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 11, 14, 11, 13, 12], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 11, "desde": 1, "hasta": 3}}
  ],
  "G#dim": [
    {"trastes": [4, 2, -1, 4, 3, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 6, 7, -1, 7], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 11, 9, -1, 9, 10], "dedos": [0, 4, 1, 0, 2, 3]},
    {"trastes": [-1, 11, 12, 13, 12, -1], "dedos": [0, 1, 2, 4, 3, 0]}
  ],
  "G#dim7": [
    {"trastes": [4, -1, 3, 4, 3, 4], "dedos": [2, 0, 1, 3, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 6, 7, 6, 7], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "G#m/A": [
    {"trastes": [-1, 0, 1, 1, 0, 4], "dedos": [0, 0, 1, 2, 0, 4]},
    {"trastes": [-1, 0, 1, 4, 4, 4], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 6, 4, 4, 4], "dedos": [0, 0, 3, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 0, 6, 4, 4, 7], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}}
  ],
  "G#m/A#": [
    {"trastes": [-1, 1, 1, 4, 4, 4], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 1, "desde": 1, "hasta": 2}},
    {"trastes": [6, 6, 6, 4, 4, 4], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [6, 6, 6, 8, 9, 7], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 6, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 8, 8, 9, 7], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "G#m/B": [
    {"trastes": [-1, 2, 1, 1, 4, 4], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 2, 1, 4, 4, 4], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [7, 6, 6, 4, 4, 4], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 8, 9, 7], "dedos": [0, 0, 3, 2, 4, 1]}
  ],
  "G#m/C": [
    {"trastes": [-1, 3, 1, 1, 0, -1], "dedos": [0, 4, 1, 2, 0, 0]},
    {"trastes": [-1, 3, 1, 4, 4, 4], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 10, 8, 9, 7], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 10, 13, 12, 11], "dedos": [0, 0, 1, 4, 3, 2]}
  ],
  "G#m/C#": [
    {"trastes": [-1, 4, 1, 1, 0, -1], "dedos": [0, 4, 1, 2, 0, 0]},
    {"trastes": [-1, 4, 6, 4, 4, 4], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 4, 6, 4, 4, 7], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 1, "hasta": 4}},
    {"trastes": [-1, -1, 11, 13, 12, 11], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "G#m/D": [
    {"trastes": [-1, -1, 0, 4, 4, 4], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 8, 9, 7], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, 5, 6, 4, 4, 4], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 6, 4, 4, 7], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}}
  ],
  "G#m/D#": [
    {"trastes": [-1, -1, 1, 1, 0, 4], "dedos": [0, 0, 1, 2, 0, 4]},
    {"trastes": [-1, -1, 1, 4, 4, 4], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 6, 4, 4, 4], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 6, 4, 4, 7], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}}
  ],
  "G#m/E": [
    {"trastes": [0, 2, 1, 1, 4, 4], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [0, 2, 1, 4, 4, 4], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [0, 6, 6, 4, 4, 4], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 2, 4, 4, 4], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}}
  ],
  "G#m/F": [
    {"trastes": [1, 2, 1, 1, 0, -1], "dedos": [1, 4, 2, 3, 0, 0]},
    {"trastes": [1, 2, 1, 1, 4, 4], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 3}},
    {"trastes": [1, 2, 1, 4, 4, 4], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 1, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 3, 4, 4, 4], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}}
  ],
  "G#m/F#": [
    {"trastes": [2, 2, 1, 1, 0, -1], "dedos": [3, 4, 1, 2, 0, 0]},
    {"trastes": [2, 2, 1, 1, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 4, 4, 4, 4], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 9, 9, 8, 9, -1], "dedos": [0, 2, 3, 1, 4, 0]}
  ],
  "G#m/G": [
    {"trastes": [3, 2, 1, 1, 0, -1], "dedos": [4, 3, 1, 2, 0, 0]},
    {"trastes": [3, 2, 1, 1, 4, 4], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [3, 2, 1, 4, 4, 4], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 5, 4, 4, 4], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 4, "desde": 3, "hasta": 5}}
  ],
  "G#m11": [
    {"trastes": [4, 2, 4, 3, 2, 2], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [4, 4, 4, 4, 4, 6], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 6, 6, 7, 7], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 6, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 11, 9, 11, 11, 9], "dedos": [0, 3, 1, 3, 4, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "G#m6": [
    {"trastes": [4, -1, 3, 4, 4, -1], "dedos": [2, 0, 1, 3, 4, 0]},
    {"trastes": [4, 6, 6, 4, 6, 4], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 9, 10, 9, 11], "dedos": [0, 3, 1, 2, 1, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}}
  ],
  "G#m7b5": [
    {"trastes": [4, -1, 4, 4, 3, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 6, 7, 7, 7], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 11, 12, 11, 12, -1], "dedos": [0, 1, 3, 2, 4, 0]}
  ],
  "G#m9": [
    {"trastes": [4, 1, 1, 1, 0, 2], "dedos": [4, 1, 1, 2, 0, 3], "cejilla": {"traste": 1, "desde": 1, "hasta": 3}},
    {"trastes": [4, 6, 4, 4, 4, 6], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 11, 9, 11, 11, 11], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "G#madd9": [
    {"trastes": [4, 2, -1, 3, 4, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 6, 4, 4, 6], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 3, "hasta": 4}},
    {"trastes": [4, 6, 6, 4, 4, 6], "dedos": [1, 2, 3, 1, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 11, 9, 8, 11, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "G#maj7": [
    {"trastes": [4, 6, 5, 5, 4, 4], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 10, 12, 9, -1], "dedos": [0, 3, 2, 4, 1, 0]}
  ],
  "G#maj9": [
    {"trastes": [4, 3, 5, 3, 4, 3], "dedos": [2, 1, 4, 1, 3, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [4, 6, 5, 5, 4, 6], "dedos": [1, 3, 2, 2, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}}
  ],
  "G#mmaj7": [
    {"trastes": [4, 6, 5, 4, 4, 4], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 11, 13, 12, 12, 11], "dedos": [0, 1, 4, 2, 3, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "G#sus2": [
    {"trastes": [4, -1, -1, 3, 4, 4], "dedos": [2, 0, 0, 1, 3, 4]},
    {"trastes": [4, 6, 6, -1, 4, 6], "dedos": [1, 2, 3, 0, 1, 4]}
  ],
  "G#sus4": [
    {"trastes": [4, 6, 6, 6, 4, 4], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 4, "desde": 0, "hasta": 5}}
  ],
  "A/A#": [
    {"trastes": [-1, 1, 2, 2, 2, 0], "dedos": [0, 1, 2, 3, 4, 0]},
    {"trastes": [-1, 1, 2, 2, 2, -1], "dedos": [0, 1, 2, 2, 2, 0], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 8, 6, 5, 5], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 8, 9, 10, 9], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "A/B": [
    {"trastes": [-1, 2, 2, 2, 2, 0], "dedos": [0, 1, 2, 3, 4, 0]},
    {"trastes": [-1, 2, 2, 2, 2, 5], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [7, 7, 7, 9, 10, 9], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 7, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 9, 9, 10, 9], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "A/C": [
    {"trastes": [-1, 3, 2, 2, 2, 0], "dedos": [0, 4, 1, 2, 3, 0]},
    {"trastes": [-1, 3, 2, 2, 2, 5], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 3, 2, 2, 2, -1], "dedos": [0, 2, 1, 1, 1, 0], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 10, 9, 10, 9], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "A/C#": [
    {"trastes": [-1, 4, 2, 2, 2, 5], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 4, 2, 2, 5, 5], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [9, 12, 11, 9, 10, 9], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 9, "desde": 0, "hasta": 5}}
  ],
  "A/D": [
    {"trastes": [-1, -1, 0, 2, 2, 0], "dedos": [0, 0, 0, 1, 2, 0]},
    {"trastes": [-1, -1, 0, 6, 5, 5], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 0, 9, 10, 9], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 7, 6, 5, 5], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}}
  ],
  "A/D#": [
    {"trastes": [-1, -1, 1, 2, 2, 0], "dedos": [0, 0, 1, 2, 3, 0]},
    {"trastes": [-1, 6, 7, 6, 5, 5], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 6, 7, 6, 5, -1], "dedos": [0, 2, 4, 3, 1, 0]},
    {"trastes": [11, 12, 14, 14, 14, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 14, "desde": 2, "hasta": 4}}
  ],
  "A/E": [
    {"trastes": [0, 0, 2, 2, 2, 0], "dedos": [0, 0, 1, 2, 3, 0]},
    {"trastes": [0, 4, 2, 2, 2, 5], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [0, 4, 2, 2, 5, 5], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 2, 2, 2, 0], "dedos": [0, 0, 1, 2, 3, 0]}
  ],
  "A/F": [
    {"trastes": [1, 0, 2, 2, 2, 0], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 3, 2, 2, 0], "dedos": [0, 0, 3, 1, 2, 0]},
    {"trastes": [-1, -1, 3, 6, 5, 5], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 8, 7, 6, 5, 5], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}}
  ],
  "A/F#": [
    {"trastes": [2, 0, 2, 2, 2, 0], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 4, 2, 2, 0], "dedos": [0, 0, 4, 1, 2, 0]},
    {"trastes": [2, 4, 2, 2, 2, 5], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 4}},
    {"trastes": [2, 4, 2, 2, 5, 5], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 3}}
  ],
  "A/G": [
    {"trastes": [3, 0, 2, 2, 2, 0], "dedos": [4, 0, 1, 2, 3, 0]},
    {"trastes": [3, 4, 2, 2, 2, 5], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [3, 4, 2, 2, 5, 5], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 5, 6, 5, 5], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}}
  ],
  "A/G#": [
    {"trastes": [4, 4, 2, 2, 2, 5], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [4, 4, 2, 2, 5, 5], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 6, 6, 5, 5], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 5, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 11, 11, 9, 10, 9], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "A11": [
    {"trastes": [-1, 0, 0, 0, 2, 0], "dedos": [0, 0, 0, 0, 2, 0]},
    {"trastes": [5, 4, 0, 0, 0, 3], "dedos": [3, 2, 0, 0, 0, 1]},
    {"trastes": [5, 5, 5, 6, 5, 5], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "A13": [
    {"trastes": [-1, 0, 2, 0, 2, 2], "dedos": [0, 0, 1, 0, 2, 3]},
    {"trastes": [5, 7, 5, 6, 7, 5], "dedos": [1, 3, 1, 2, 4, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 12, 11, 12, 14, 14], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 14, "desde": 4, "hasta": 5}}
  ],
  "A5": [
    {"trastes": [-1, 0, 2, -1, -1, -1], "dedos": [0, 0, 1, 0, 0, 0]},
    {"trastes": [5, 7, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [5, 7, 7, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "A6": [
    {"trastes": [-1, 0, 2, 2, 2, 2], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}},
    {"trastes": [5, -1, 4, 6, 5, -1], "dedos": [2, 0, 1, 4, 3, 0]},
    {"trastes": [5, 7, -1, 6, 7, 5], "dedos": [1, 3, 0, 2, 4, 1]},
    {"trastes": [-1, 12, 11, 11, 10, -1], "dedos": [0, 4, 2, 3, 1, 0]}
  ],
  "A69": [
    {"trastes": [-1, 0, 4, 4, 2, 2], "dedos": [0, 0, 3, 4, 1, 1], "cejilla": {"traste": 2, "desde": 4, "hasta": 5}},
    {"trastes": [5, 4, 4, 4, 5, 5], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 4, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 12, 11, 11, 12, 12], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "A7#9": [
    {"trastes": [-1, 0, 10, 9, 8, 9], "dedos": [0, 0, 4, 2, 1, 3]},
    {"trastes": [5, 7, 5, 6, 8, 8], "dedos": [1, 3, 1, 2, 4, 4], "cejilla": {"traste": 5, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 7, 6, 8, 8], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 12, 11, 12, 13, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "A7b5": [
    {"trastes": [-1, 0, 1, 2, 2, 3], "dedos": [0, 0, 1, 2, 3, 4]},
    {"trastes": [-1, 0, 5, 6, 4, 5], "dedos": [0, 0, 2, 4, 1, 3]},
    {"trastes": [-1, -1, 7, 8, 8, 9], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "A7b9": [
    {"trastes": [-1, 0, 2, 3, 2, 3], "dedos": [0, 0, 1, 2, 1, 3], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [5, 7, 5, 6, 5, 6], "dedos": [1, 4, 1, 2, 1, 3], "cejilla": {"traste": 5, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 7, 6, 8, 6], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 12, 11, 12, 11, 12], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 4}}
  ],
  "A7sus4": [
    {"trastes": [-1, 0, 2, 0, 3, 0], "dedos": [0, 0, 2, 0, 3, 0]},
    {"trastes": [-1, 0, 7, 9, 8, 10], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [5, 7, 5, 7, 5, 5], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 12, 12, 12, 10, 10], "dedos": [0, 2, 3, 4, 1, 1], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}}
  ],
  "A9": [
    {"trastes": [5, 4, 2, 0, 0, 0], "dedos": [4, 3, 1, 0, 0, 0]},
    {"trastes": [-1, 0, 2, 4, 2, 3], "dedos": [0, 0, 1, 3, 1, 2], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [5, 7, 5, 6, 5, 7], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 5, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 12, 11, 12, 12, 12], "dedos": [0, 2, 1, 3, 3, 3]}
  ],
  "Aadd11": [
    {"trastes": [-1, 0, 7, 7, 10, 9], "dedos": [0, 0, 1, 1, 4, 3], "cejilla": {"traste": 7, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 0, 11, 9, 10, 10], "dedos": [0, 0, 3, 1, 2, 2], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 0, 12, 9, 10, 9], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 12, 11, 9, 10, 10], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 10, "desde": 4, "hasta": 5}}
  ],
  "Aadd9": [
    {"trastes": [-1, 0, 2, 4, 2, 0], "dedos": [0, 0, 1, 3, 2, 0]},
    {"trastes": [-1, -1, 7, 6, 5, 7], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, 12, 11, 9, 12, 9], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 12, 11, -1, 12, 12], "dedos": [0, 2, 1, 0, 3, 4]}
  ],
  "Aaug": [
    {"trastes": [-1, 0, 3, 2, 2, 1], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [5, 4, 3, 2, 2, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [5, -1, 7, 6, 6, 5], "dedos": [1, 0, 4, 2, 3, 1]},
    {"trastes": [-1, 12, 11, 10, 10, -1], "dedos": [0, 3, 2, 1, 1, 0], "cejilla": {"traste": 10, "desde": 3, "hasta": 4}}
  ],
  "Aaug7": [
    {"trastes": [-1, 0, 3, 0, 2, 1], "dedos": [0, 0, 3, 0, 2, 1]},
    {"trastes": [-1, 0, 3, 2, 2, 3], "dedos": [0, 0, 2, 1, 1, 3], "cejilla": {"traste": 2, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 0, 5, 6, 6, 5], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [-1, -1, 7, 10, 8, 9], "dedos": [0, 0, 1, 4, 2, 3]}
  ],
  "Adim": [
    {"trastes": [-1, 0, 1, 2, 1, -1], "dedos": [0, 0, 1, 3, 2, 0]},
    {"trastes": [-1, -1, 7, 8, -1, 8], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 12, 10, -1, 10, 11], "dedos": [0, 4, 1, 0, 2, 3]}
  ],
  "Adim7": [
    {"trastes": [-1, 0, 1, 2, 1, 2], "dedos": [0, 0, 1, 3, 2, 4]},
    {"trastes": [-1, 0, 7, 8, 7, 8], "dedos": [0, 0, 1, 3, 2, 4], "cejilla": {"traste": 7, "desde": 2, "hasta": 4}},
    {"trastes": [5, -1, 4, 5, 4, -1], "dedos": [2, 0, 1, 3, 1, 0], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [5, 6, 7, 5, 7, 5], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "Am/A#": [
    {"trastes": [-1, 1, 2, 2, 1, 0], "dedos": [0, 1, 3, 4, 2, 0]},
    {"trastes": [6, 7, 7, 5, 5, 5], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 5, 5, 5], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 9, 10, 8], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 8, "desde": 2, "hasta": 5}}
  ],
  "Am/B": [
    {"trastes": [-1, 2, 2, 2, 1, 0], "dedos": [0, 2, 3, 4, 1, 0]},
    {"trastes": [-1, 2, 2, 5, 5, 5], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 2, "desde": 1, "hasta": 2}},
    {"trastes": [7, 7, 7, 5, 5, 5], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [7, 7, 7, 9, 10, 8], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 7, "desde": 0, "hasta": 2}}
  ],
  "Am/C": [
    {"trastes": [-1, 3, 2, 2, 1, 0], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [-1, 3, 2, 2, 5, 5], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 3, 2, 5, 5, 5], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [8, 7, 7, 5, 5, 5], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}}
  ],
  "Am/C#": [
    {"trastes": [-1, 4, 2, 5, 5, 5], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 9, 10, 8], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [9, 12, 10, 9, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 9, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 11, 14, 13, 12], "dedos": [0, 0, 1, 4, 3, 2]}
  ],
  "Am/D": [
    {"trastes": [-1, -1, 0, 2, 1, 0], "dedos": [0, 0, 0, 2, 1, 0]},
    {"trastes": [-1, -1, 0, 5, 5, 5], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 7, 5, 5, 5], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 5, 7, 5, 5, 8], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 5, "desde": 1, "hasta": 4}}
  ],
  "Am/D#": [
    {"trastes": [-1, -1, 1, 2, 1, 0], "dedos": [0, 0, 1, 3, 2, 0]},
    {"trastes": [-1, 6, 7, 5, 5, 5], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 6, 7, 5, 5, 8], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 6, 7, 5, 5, -1], "dedos": [0, 2, 3, 1, 1, 0], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}}
  ],
  "Am/E": [
    {"trastes": [0, 0, 2, 2, 1, 0], "dedos": [0, 0, 2, 3, 1, 0]},
    {"trastes": [0, 3, 2, 2, 1, 0], "dedos": [0, 4, 2, 3, 1, 0]},
    {"trastes": [0, 3, 2, 2, 5, 5], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [0, 3, 2, 5, 5, 5], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}}
  ],
  "Am/F": [
    {"trastes": [-1, -1, 3, 2, 1, 0], "dedos": [0, 0, 3, 2, 1, 0]},
    {"trastes": [-1, -1, 3, 5, 5, 5], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 7, 5, 5, 5], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 10, 9, 10, 8], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 8, "desde": 1, "hasta": 5}}
  ],
  "Am/F#": [
    {"trastes": [2, 0, 2, 2, 1, 0], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 4, 2, 1, 0], "dedos": [0, 0, 4, 2, 1, 0]},
    {"trastes": [2, 3, 2, 2, 5, 5], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 3}},
    {"trastes": [2, 3, 2, 5, 5, 5], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 2, "desde": 0, "hasta": 2}}
  ],
  "Am/G": [
    {"trastes": [3, 0, 2, 2, 1, 0], "dedos": [4, 0, 2, 3, 1, 0]},
    {"trastes": [3, 0, 2, 2, 1, -1], "dedos": [4, 0, 2, 3, 1, 0]},
    {"trastes": [-1, -1, 5, 5, 5, 5], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 5, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 10, 10, 9, 10, -1], "dedos": [0, 2, 3, 1, 4, 0]}
  ],
  "Am/G#": [
    {"trastes": [4, 3, 2, 2, 5, 5], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [4, 3, 2, 5, 5, 5], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}},
    {"trastes": [4, 3, 2, 2, 5, -1], "dedos": [3, 2, 1, 1, 4, 0], "cejilla": {"traste": 2, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 6, 5, 5, 5], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 5, "desde": 3, "hasta": 5}}
  ],
  "Am11": [
    {"trastes": [-1, 0, 0, 0, 1, 0], "dedos": [0, 0, 0, 0, 1, 0]},
    {"trastes": [5, 3, 5, 4, 3, 3], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 3, "desde": 1, "hasta": 5}},
    {"trastes": [5, 5, 5, 5, 5, 7], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 12, 10, 12, 12, 10], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 10, "desde": 2, "hasta": 5}}
  ],
  "Am6": [
    {"trastes": [-1, 0, 2, 2, 1, 2], "dedos": [0, 0, 2, 3, 1, 4]},
    {"trastes": [5, -1, 4, 5, 5, 5], "dedos": [2, 0, 1, 3, 3, 4]},
    {"trastes": [5, 7, 7, 5, 7, 5], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "Am7b5": [
    {"trastes": [-1, 0, 1, 0, 1, -1], "dedos": [0, 0, 2, 0, 3, 0]},
    {"trastes": [5, -1, 5, 5, 4, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [5, 6, 7, 5, 8, 5], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 7, 8, 8, 8], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "Am9": [
    {"trastes": [-1, 0, 2, 4, 1, 3], "dedos": [0, 0, 2, 4, 1, 3]},
    {"trastes": [5, 7, 5, 5, 5, 7], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 5, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 12, 10, 12, 12, 12], "dedos": [0, 2, 1, 3, 4, 4]}
  ],
  "Amadd9": [
    {"trastes": [-1, 0, 2, 4, 1, 0], "dedos": [0, 0, 2, 4, 1, 0]},
    {"trastes": [-1, -1, 7, 9, 0, 8], "dedos": [0, 0, 1, 3, 0, 2]},
    {"trastes": [-1, -1, 7, 5, 5, 7], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 5, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 12, 10, 9, 12, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "Amaj7": [
    {"trastes": [-1, 0, 2, 1, 2, 0], "dedos": [0, 0, 2, 1, 3, 0]},
    {"trastes": [-1, 0, 2, 2, 2, 4], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 0, 7, 9, 9, 9], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}},
    {"trastes": [5, 7, 6, 6, 5, 5], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "Amaj9": [
    {"trastes": [-1, 0, 2, 4, 2, 4], "dedos": [0, 0, 1, 3, 1, 4], "cejilla": {"traste": 2, "desde": 2, "hasta": 4}},
    {"trastes": [5, 4, 6, 4, 5, 0], "dedos": [2, 1, 4, 1, 3, 0], "cejilla": {"traste": 4, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 0, 6, 6, 5, 7], "dedos": [0, 0, 2, 3, 1, 4]}
  ],
  "Ammaj7": [
    {"trastes": [-1, 0, 2, 1, 1, 0], "dedos": [0, 0, 3, 1, 2, 0]},
    {"trastes": [5, 7, 6, 5, 5, 5], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 12, 10, 9, 9, -1], "dedos": [0, 4, 2, 1, 1, 0], "cejilla": {"traste": 9, "desde": 3, "hasta": 4}}
  ],
  "Asus2": [
    {"trastes": [-1, 0, 2, 2, 0, 0], "dedos": [0, 0, 2, 3, 0, 0]},
    {"trastes": [-1, 0, 2, 4, 0, 0], "dedos": [0, 0, 1, 4, 0, 0]},
    {"trastes": [-1, 0, 9, 9, 0, 0], "dedos": [0, 0, 1, 2, 0, 0]}
  ],
  "Asus4": [
    {"trastes": [-1, 0, 2, 2, 3, 0], "dedos": [0, 0, 1, 2, 3, 0]},
    {"trastes": [-1, 0, 0, -1, 3, 0], "dedos": [0, 0, 0, 0, 1, 0]},
    {"trastes": [5, 7, 7, 7, 5, 5], "dedos": [1, 3, 3, 4, 1, 1], "cejilla": {"traste": 5, "desde": 0, "hasta": 5}}
  ],
  "A#/A": [
    {"trastes": [-1, 0, 0, 3, 3, 1], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, 0, 3, 3, 3, 1], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 0, 3, 3, 3, 6], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [5, 5, 3, 3, 3, 6], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}}
  ],
  "A#/B": [
    {"trastes": [-1, 2, 0, 3, 3, 1], "dedos": [0, 2, 0, 3, 4, 1]},
    {"trastes": [-1, 2, 3, 3, 3, -1], "dedos": [0, 1, 2, 2, 2, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 9, 7, 6, 6], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 9, 10, 11, 10], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "A#/C": [
    {"trastes": [-1, 3, 0, 3, 3, 1], "dedos": [0, 2, 0, 3, 4, 1]},
    {"trastes": [-1, 3, 3, 3, 3, 6], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 1, "hasta": 4}},
    {"trastes": [8, 8, 8, 10, 11, 10], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 8, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 10, 10, 11, 10], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 10, "desde": 2, "hasta": 5}}
  ],
  "A#/C#": [
    {"trastes": [-1, 4, 0, 3, 3, 1], "dedos": [0, 4, 0, 2, 3, 1]},
    {"trastes": [-1, 4, 3, 3, 3, 6], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 4, 3, 3, 3, -1], "dedos": [0, 2, 1, 1, 1, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 11, 10, 11, 10], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "A#/D": [
    {"trastes": [-1, -1, 0, 3, 3, 1], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, -1, 0, 3, 6, 6], "dedos": [0, 0, 0, 1, 4, 4], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 3, 3, 3, 6], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 5, 3, 3, 6, 6], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}}
  ],
  "A#/D#": [
    {"trastes": [-1, -1, 1, 3, 3, 1], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 3, 3, 3, -1], "dedos": [0, 4, 1, 1, 1, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 6, 8, 7, 6, 6], "dedos": [0, 1, 3, 2, 1, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [-1, -1, 13, 10, 11, 10], "dedos": [0, 0, 4, 1, 2, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "A#/E": [
    {"trastes": [0, 1, 3, 3, 3, 1], "dedos": [0, 1, 2, 3, 4, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [0, 5, 3, 3, 3, 6], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [0, 5, 3, 3, 6, 6], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 2, 3, 3, 1], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "A#/F": [
    {"trastes": [1, 1, 3, 3, 3, 1], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 3, 3, 3, 1], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 3, 3, 3, 6], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 8, 8, 7, 6, 6], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}}
  ],
  "A#/F#": [
    {"trastes": [-1, -1, 4, 3, 3, 1], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [2, 1, 3, 3, 3, -1], "dedos": [2, 1, 3, 3, 3, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 4, 7, 6, 6], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 9, 8, 7, 6, 6], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 6, "desde": 4, "hasta": 5}}
  ],
  "A#/G": [
    {"trastes": [3, 5, 3, 3, 3, 6], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 4}},
    {"trastes": [3, 5, 3, 3, 6, 6], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 5, 7, 6, 6], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 10, 12, 10, 11, 10], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "A#/G#": [
    {"trastes": [4, 5, 3, 3, 3, 6], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 4}},
    {"trastes": [4, 5, 3, 3, 6, 6], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 6, 7, 6, 6], "dedos": [0, 0, 1, 2, 1, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 11, 12, 10, 11, 10], "dedos": [0, 2, 4, 1, 3, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "A#11": [
    {"trastes": [6, 5, 0, 5, 4, 4], "dedos": [4, 2, 0, 3, 1, 1], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 1, 1, 1, 3, 1], "dedos": [0, 1, 1, 1, 3, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 13, 12, 13, 11, 11], "dedos": [0, 3, 2, 4, 1, 1], "cejilla": {"traste": 11, "desde": 4, "hasta": 5}}
  ],
  "A#13": [
    {"trastes": [-1, 1, 0, 1, 3, 3], "dedos": [0, 1, 0, 2, 4, 4], "cejilla": {"traste": 3, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 13, 12, 13, 15, 15], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 15, "desde": 4, "hasta": 5}}
  ],
  "A#5": [
    {"trastes": [-1, 1, 3, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [6, 8, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [6, 8, 8, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "A#6": [
    {"trastes": [6, 5, 0, 0, 6, 6], "dedos": [2, 1, 0, 0, 3, 4]},
    {"trastes": [-1, 1, 3, 3, 3, 3], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 3, "desde": 2, "hasta": 5}}
  ],
  "A#69": [
    {"trastes": [-1, 1, 0, 0, 1, 1], "dedos": [0, 1, 0, 0, 2, 3]},
    {"trastes": [6, 5, 5, 5, 6, 6], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 13, 12, 12, 13, 13], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 12, "desde": 2, "hasta": 3}}
  ],
  "A#7#9": [
    {"trastes": [-1, 1, 0, 1, 2, -1], "dedos": [0, 1, 0, 2, 3, 0]},
    {"trastes": [6, 8, 6, 7, 9, 9], "dedos": [1, 3, 1, 2, 4, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 8, 7, 9, 9], "dedos": [0, 0, 2, 1, 3, 4]},
    {"trastes": [-1, 13, 12, 13, 14, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "A#7b5": [
    {"trastes": [6, -1, 6, 7, 5, 0], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, 13, 12, 13, 11, 0], "dedos": [0, 3, 2, 4, 1, 0]},
    {"trastes": [-1, 1, 2, 1, 3, -1], "dedos": [0, 1, 2, 1, 3, 0], "cejilla": {"traste": 1, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 8, 9, 9, 10], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "A#7b9": [
    {"trastes": [-1, 1, 0, 1, 0, 1], "dedos": [0, 1, 0, 2, 0, 3]},
    {"trastes": [6, 5, 6, 4, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]},
    {"trastes": [6, -1, 6, 7, 6, 7], "dedos": [1, 0, 1, 2, 1, 3]},
    {"trastes": [-1, 13, 12, 13, 12, 13], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 12, "desde": 2, "hasta": 4}}
  ],
  "A#7sus4": [
    {"trastes": [-1, 1, 3, 1, 4, 1], "dedos": [0, 1, 3, 1, 4, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [6, 8, 6, 8, 6, 6], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 8, 10, 9, 11], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "A#9": [
    {"trastes": [-1, 1, 0, 1, 1, 1], "dedos": [0, 1, 0, 2, 3, 4]},
    {"trastes": [6, 5, 6, 5, 6, -1], "dedos": [2, 1, 3, 1, 4, 0], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}},
    {"trastes": [6, 8, 6, 7, 6, 8], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 13, 12, 13, 13, 13], "dedos": [0, 2, 1, 3, 3, 3]}
  ],
  "A#add11": [
    {"trastes": [-1, 1, 0, 3, 4, -1], "dedos": [0, 1, 0, 3, 4, 0]},
    {"trastes": [6, 5, 3, 3, 4, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [6, 5, 8, 8, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 13, 12, 10, 11, 11], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 11, "desde": 4, "hasta": 5}}
  ],
  "A#add9": [
    {"trastes": [-1, 1, 0, 3, 1, 1], "dedos": [0, 1, 0, 4, 2, 3]},
    {"trastes": [-1, -1, 8, 7, 6, 8], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, -1, 8, 7, -1, 8], "dedos": [0, 0, 2, 1, 0, 3]},
    {"trastes": [-1, 13, 12, 10, 13, 10], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "A#aug": [
    {"trastes": [-1, 1, 4, 3, 3, -1], "dedos": [0, 1, 4, 2, 3, 0]},
    {"trastes": [6, 5, 4, 3, 3, -1], "dedos": [4, 3, 2, 1, 1, 0], "cejilla": {"traste": 3, "desde": 3, "hasta": 4}},
    {"trastes": [-1, -1, 8, 7, 7, 6], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [-1, -1, 8, 7, 7, -1], "dedos": [0, 0, 2, 1, 1, 0], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}}
  ],
  "A#aug7": [
    {"trastes": [-1, 1, 4, 1, 3, 2], "dedos": [0, 1, 4, 1, 3, 2], "cejilla": {"traste": 1, "desde": 1, "hasta": 3}},
    {"trastes": [6, -1, 6, 7, 7, -1], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 8, 11, 9, 10], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 13, 12, 13, -1, 14], "dedos": [0, 2, 1, 3, 0, 4]}
  ],
  "A#dim": [
    {"trastes": [-1, 1, 2, 3, 2, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [6, 4, -1, 6, 5, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 8, 9, -1, 9], "dedos": [0, 0, 1, 2, 0, 3]},
    {"trastes": [-1, 13, 11, -1, 11, 12], "dedos": [0, 4, 1, 0, 2, 3]}
  ],
  "A#dim7": [
    {"trastes": [-1, 1, 2, 0, 2, 0], "dedos": [0, 1, 2, 0, 3, 0]},
    {"trastes": [6, 7, 8, 6, 8, 6], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 8, 9, 8, 9], "dedos": [0, 0, 1, 3, 2, 4]}
  ],
  "A#m/A": [
    {"trastes": [-1, 0, 3, 3, 2, 1], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, 0, 3, 6, 6, 6], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [5, 4, 3, 3, 6, 6], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [5, 4, 3, 6, 6, 6], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}}
  ],
  "A#m/B": [
    {"trastes": [-1, 2, 3, 3, 2, -1], "dedos": [0, 1, 2, 3, 1, 0], "cejilla": {"traste": 2, "desde": 1, "hasta": 4}},
    {"trastes": [7, 8, 8, 6, 6, 6], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 6, 6, 6], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 9, 10, 11, 9], "dedos": [0, 0, 1, 2, 3, 1], "cejilla": {"traste": 9, "desde": 2, "hasta": 5}}
  ],
  "A#m/C": [
    {"trastes": [-1, 3, 3, 6, 6, 6], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [8, 8, 8, 6, 6, 6], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [8, 8, 8, 10, 11, 9], "dedos": [1, 1, 1, 3, 4, 2], "cejilla": {"traste": 8, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 10, 10, 11, 9], "dedos": [0, 0, 2, 3, 4, 1]}
  ],
  "A#m/C#": [
    {"trastes": [-1, 4, 3, 3, 6, 6], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 4, 3, 6, 6, 6], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [9, 8, 8, 6, 6, 6], "dedos": [4, 2, 3, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 11, 10, 11, 9], "dedos": [0, 0, 3, 2, 4, 1]}
  ],
  "A#m/D": [
    {"trastes": [-1, -1, 0, 3, 2, 1], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, -1, 0, 6, 6, 6], "dedos": [0, 0, 0, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 0, 10, 11, 9], "dedos": [0, 0, 0, 2, 3, 1]},
    {"trastes": [-1, 5, 3, 6, 6, 6], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}}
  ],
  "A#m/D#": [
    {"trastes": [-1, -1, 1, 3, 2, 1], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 1, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 6, 8, 6, 6, 6], "dedos": [0, 1, 3, 1, 1, 1], "cejilla": {"traste": 6, "desde": 1, "hasta": 5}},
    {"trastes": [-1, 6, 8, 6, 6, 9], "dedos": [0, 1, 3, 1, 1, 4], "cejilla": {"traste": 6, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 6, 8, 6, 6, -1], "dedos": [0, 1, 3, 1, 1, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 4}}
  ],
  "A#m/E": [
    {"trastes": [0, 1, 3, 3, 2, 1], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [0, 4, 3, 3, 6, 6], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [0, 4, 3, 6, 6, 6], "dedos": [0, 2, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 2, 3, 2, 1], "dedos": [0, 0, 2, 4, 3, 1]}
  ],
  "A#m/F": [
    {"trastes": [1, 1, 3, 3, 2, 1], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 1, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 3, 3, 2, 1], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 3, 6, 6, 6], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 8, 6, 6, 6], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}}
  ],
  "A#m/F#": [
    {"trastes": [-1, -1, 4, 3, 2, 1], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 4, 6, 6, 6], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 8, 6, 6, 6], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 11, 10, 11, 9], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 9, "desde": 1, "hasta": 5}}
  ],
  "A#m/G": [
    {"trastes": [3, 4, 3, 3, 6, 6], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 3}},
    {"trastes": [3, 4, 3, 6, 6, 6], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 3, "desde": 0, "hasta": 2}},
    {"trastes": [3, 4, 3, 3, 6, -1], "dedos": [1, 2, 1, 1, 4, 0], "cejilla": {"traste": 3, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 5, 6, 6, 6], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}}
  ],
  "A#m/G#": [
    {"trastes": [4, 4, 3, 3, -1, -1], "dedos": [2, 3, 1, 1, 0, 0], "cejilla": {"traste": 3, "desde": 2, "hasta": 3}},
    {"trastes": [4, -1, 3, 6, 6, 6], "dedos": [2, 0, 1, 4, 4, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 6, 6, 6, 6], "dedos": [0, 0, 1, 1, 1, 1], "cejilla": {"traste": 6, "desde": 2, "hasta": 5}},
    {"trastes": [-1, 11, 11, 10, 11, -1], "dedos": [0, 2, 3, 1, 4, 0]}
  ],
  "A#m11": [
    {"trastes": [6, 4, 6, 5, 4, 4], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 4, "desde": 1, "hasta": 5}},
    {"trastes": [6, 6, 6, 6, 6, 8], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 8, 8, 9, 9], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 8, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 13, 11, 13, 13, 11], "dedos": [0, 2, 1, 3, 4, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "A#m6": [
    {"trastes": [-1, 1, 3, -1, 2, 3], "dedos": [0, 1, 3, 0, 2, 4]},
    {"trastes": [6, -1, 5, 6, 6, 6], "dedos": [2, 0, 1, 3, 3, 4]},
    {"trastes": [6, 8, 8, 6, 8, 6], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}}
  ],
  "A#m7b5": [
    {"trastes": [-1, 1, 2, 1, 2, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [6, -1, 6, 6, 5, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 8, 9, 9, 9], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 9, "desde": 3, "hasta": 5}}
  ],
  "A#m9": [
    {"trastes": [6, 4, -1, 5, 6, 4], "dedos": [3, 1, 0, 2, 4, 1]},
    {"trastes": [6, 8, 6, 6, 6, 8], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 4}},
    {"trastes": [-1, 13, 11, 13, 13, -1], "dedos": [0, 2, 1, 3, 4, 0]}
  ],
  "A#madd9": [
    {"trastes": [6, 4, -1, 5, 6, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 8, 6, 6, 8], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 6, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 13, 11, 10, 13, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "A#maj7": [
    {"trastes": [-1, 1, 3, 2, 3, 1], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [6, 8, 7, 7, 6, 6], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}}
  ],
  "A#maj9": [
    {"trastes": [6, 3, 3, 3, 3, 5], "dedos": [4, 1, 1, 1, 1, 3], "cejilla": {"traste": 3, "desde": 1, "hasta": 4}},
    {"trastes": [6, 5, 7, 5, 6, -1], "dedos": [2, 1, 4, 1, 3, 0], "cejilla": {"traste": 5, "desde": 1, "hasta": 3}},
    {"trastes": [6, 8, 7, 7, 6, 8], "dedos": [1, 3, 2, 2, 1, 4], "cejilla": {"traste": 6, "desde": 0, "hasta": 4}}
  ],
  "A#mmaj7": [
    {"trastes": [-1, 1, 3, 2, 2, 1], "dedos": [0, 1, 4, 2, 3, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [6, 8, 7, 6, 6, 6], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}},
    {"trastes": [-1, 13, 11, 10, 10, -1], "dedos": [0, 4, 2, 1, 1, 0], "cejilla": {"traste": 10, "desde": 3, "hasta": 4}}
  ],
  "A#sus2": [
    {"trastes": [6, 3, 3, 5, 6, -1], "dedos": [3, 1, 1, 2, 4, 0], "cejilla": {"traste": 3, "desde": 1, "hasta": 2}},
    {"trastes": [-1, 13, 10, 10, 11, 13], "dedos": [0, 3, 1, 1, 2, 4], "cejilla": {"traste": 10, "desde": 2, "hasta": 3}}
  ],
  "A#sus4": [
    {"trastes": [-1, 1, 3, 3, 4, 1], "dedos": [0, 1, 2, 3, 4, 1], "cejilla": {"traste": 1, "desde": 1, "hasta": 5}},
    {"trastes": [6, 8, 8, 8, 6, 6], "dedos": [1, 3, 3, 3, 1, 1], "cejilla": {"traste": 6, "desde": 0, "hasta": 5}}
  ],
  "B/A": [
    {"trastes": [-1, 0, 1, 4, 0, 2], "dedos": [0, 0, 1, 4, 0, 2]},
    {"trastes": [-1, 0, 4, 4, 4, 2], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 0, 4, 4, 4, 7], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [5, 6, 4, 4, 4, 7], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}}
  ],
  "B/A#": [
    {"trastes": [6, 6, 4, 4, 4, 7], "dedos": [2, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [6, 6, 4, 4, 7, 7], "dedos": [2, 3, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 8, 8, 7, 7], "dedos": [0, 0, 2, 3, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 13, 13, 11, 12, 11], "dedos": [0, 3, 4, 1, 2, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "B/C": [
    {"trastes": [-1, 3, 1, 4, 0, 2], "dedos": [0, 3, 1, 4, 0, 2]},
    {"trastes": [-1, 3, 4, 4, 4, -1], "dedos": [0, 1, 2, 2, 2, 0], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 10, 8, 7, 7], "dedos": [0, 0, 4, 2, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 10, 11, 12, 11], "dedos": [0, 0, 1, 2, 4, 3]}
  ],
  "B/C#": [
    {"trastes": [-1, 4, 4, 4, 4, 7], "dedos": [0, 1, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 1, "hasta": 4}},
    {"trastes": [-1, 4, 4, 4, 4, -1], "dedos": [0, 1, 1, 1, 1, 0], "cejilla": {"traste": 4, "desde": 1, "hasta": 4}},
    {"trastes": [9, 9, 9, 11, 12, 11], "dedos": [1, 1, 1, 2, 4, 3], "cejilla": {"traste": 9, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 11, 11, 12, 11], "dedos": [0, 0, 1, 1, 2, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "B/D": [
    {"trastes": [-1, -1, 0, 4, 4, 2], "dedos": [0, 0, 0, 3, 4, 1]},
    {"trastes": [-1, -1, 0, 8, 7, 7], "dedos": [0, 0, 0, 2, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, -1, 0, 11, 12, 11], "dedos": [0, 0, 0, 1, 2, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 5, 4, 4, 4, 7], "dedos": [0, 2, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}}
  ],
  "B/D#": [
    {"trastes": [-1, -1, 1, 4, 0, 2], "dedos": [0, 0, 1, 4, 0, 2]},
    {"trastes": [-1, 6, 4, 4, 4, 7], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 6, 4, 4, 7, 7], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [11, 14, 13, 11, 12, 11], "dedos": [1, 4, 3, 1, 2, 1], "cejilla": {"traste": 11, "desde": 0, "hasta": 5}}
  ],
  "B/E": [
    {"trastes": [0, 2, 4, 4, 4, 2], "dedos": [0, 1, 2, 3, 4, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [0, 6, 4, 4, 4, 7], "dedos": [0, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [0, 6, 4, 4, 7, 7], "dedos": [0, 3, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 2, 4, 4, 2], "dedos": [0, 0, 1, 3, 4, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "B/F": [
    {"trastes": [1, 2, 4, 4, 4, -1], "dedos": [1, 2, 4, 4, 4, 0], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 3, 4, 4, 2], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, 8, 9, 8, 7, 7], "dedos": [0, 2, 4, 3, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 8, 9, 8, 7, -1], "dedos": [0, 2, 4, 3, 1, 0]}
  ],
  "B/F#": [
    {"trastes": [2, 2, 4, 4, 4, 2], "dedos": [1, 1, 2, 3, 4, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 4, 4, 4, 2], "dedos": [0, 0, 2, 3, 4, 1]},
    {"trastes": [-1, -1, 4, 4, 4, 7], "dedos": [0, 0, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [-1, 9, 9, 8, 7, 7], "dedos": [0, 3, 4, 2, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}}
  ],
  "B/G": [
    {"trastes": [-1, -1, 5, 4, 4, 2], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [3, 2, 4, 4, 4, -1], "dedos": [2, 1, 3, 3, 3, 0], "cejilla": {"traste": 4, "desde": 2, "hasta": 4}},
    {"trastes": [-1, -1, 5, 8, 7, 7], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 10, 9, 8, 7, 7], "dedos": [0, 4, 3, 2, 1, 1], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}}
  ],
  "B/G#": [
    {"trastes": [4, 6, 4, 4, 4, 7], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 4}},
    {"trastes": [4, 6, 4, 4, 7, 7], "dedos": [1, 3, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 3}},
    {"trastes": [-1, -1, 6, 8, 7, 7], "dedos": [0, 0, 1, 4, 2, 3]},
    {"trastes": [-1, 11, 13, 11, 12, 11], "dedos": [0, 1, 3, 1, 2, 1], "cejilla": {"traste": 11, "desde": 1, "hasta": 5}}
  ],
  "B11": [
    {"trastes": [-1, 2, 1, 2, 0, 0], "dedos": [0, 2, 1, 3, 0, 0]},
    {"trastes": [7, 7, 7, 8, 7, 7], "dedos": [1, 1, 1, 2, 1, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "B13": [
    {"trastes": [-1, 2, 1, 2, 4, 4], "dedos": [0, 2, 1, 3, 4, 4], "cejilla": {"traste": 4, "desde": 4, "hasta": 5}},
    {"trastes": [7, 4, 6, 4, 4, 5], "dedos": [4, 1, 3, 1, 1, 2], "cejilla": {"traste": 4, "desde": 1, "hasta": 4}}
  ],
  "B5": [
    {"trastes": [-1, 2, 4, -1, -1, -1], "dedos": [0, 1, 3, 0, 0, 0]},
    {"trastes": [7, 9, -1, -1, -1, -1], "dedos": [1, 3, 0, 0, 0, 0]},
    {"trastes": [7, 9, 9, -1, -1, -1], "dedos": [1, 3, 4, 0, 0, 0]}
  ],
  "B6": [
    {"trastes": [-1, 2, 1, 1, 0, -1], "dedos": [0, 3, 1, 2, 0, 0]},
    {"trastes": [-1, 2, 4, 4, 4, 4], "dedos": [0, 1, 3, 3, 3, 3], "cejilla": {"traste": 4, "desde": 2, "hasta": 5}},
    {"trastes": [7, -1, 9, 8, 9, -1], "dedos": [1, 0, 3, 2, 4, 0]},
    {"trastes": [-1, -1, 9, 11, 9, 11], "dedos": [0, 0, 1, 3, 1, 4], "cejilla": {"traste": 9, "desde": 2, "hasta": 4}}
  ],
  "B69": [
    {"trastes": [-1, 2, 1, 1, 2, 2], "dedos": [0, 2, 1, 1, 3, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 3}},
    {"trastes": [7, 6, 6, 6, 7, 7], "dedos": [2, 1, 1, 1, 3, 4], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [-1, 14, 11, 13, 12, 11], "dedos": [0, 4, 1, 3, 2, 1], "cejilla": {"traste": 11, "desde": 2, "hasta": 5}}
  ],
  "B7#9": [
    {"trastes": [7, 6, 0, 7, 0, 5], "dedos": [3, 2, 0, 4, 0, 1]},
    {"trastes": [-1, 2, 1, 2, 3, -1], "dedos": [0, 2, 1, 3, 4, 0]},
    {"trastes": [7, 9, 7, 8, 10, 10], "dedos": [1, 3, 1, 2, 4, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 9, 8, 10, 10], "dedos": [0, 0, 2, 1, 3, 4]}
  ],
  "B7b5": [
    {"trastes": [-1, 2, 1, 2, 0, 1], "dedos": [0, 3, 1, 4, 0, 2]},
    {"trastes": [-1, 2, 3, 2, 4, -1], "dedos": [0, 1, 2, 1, 3, 0]},
    {"trastes": [7, -1, 7, 8, 6, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [-1, -1, 9, 10, 10, 11], "dedos": [0, 0, 1, 2, 3, 4]}
  ],
  "B7b9": [
    {"trastes": [-1, 2, 1, 2, 1, 2], "dedos": [0, 2, 1, 3, 1, 4], "cejilla": {"traste": 1, "desde": 2, "hasta": 4}},
    {"trastes": [7, 6, 7, 5, -1, -1], "dedos": [3, 2, 4, 1, 0, 0]},
    {"trastes": [7, -1, 7, 8, 7, 8], "dedos": [1, 0, 1, 2, 1, 3]},
    {"trastes": [-1, -1, 9, 8, 10, 8], "dedos": [0, 0, 2, 1, 3, 1], "cejilla": {"traste": 8, "desde": 3, "hasta": 5}}
  ],
  "B7sus4": [
    {"trastes": [-1, 2, 2, 2, 0, 0], "dedos": [0, 1, 2, 3, 0, 0]},
    {"trastes": [7, 9, 7, 9, 7, 7], "dedos": [1, 3, 1, 4, 1, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "B9": [
    {"trastes": [-1, 2, 1, 2, 2, 2], "dedos": [0, 2, 1, 3, 3, 4]},
    {"trastes": [7, 4, 4, 6, 4, 5], "dedos": [4, 1, 1, 3, 1, 2], "cejilla": {"traste": 4, "desde": 1, "hasta": 4}},
    {"trastes": [7, 9, 7, 8, 7, 9], "dedos": [1, 3, 1, 2, 1, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 9, 8, 10, 9], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "Badd11": [
    {"trastes": [-1, 2, 1, 4, 0, 0], "dedos": [0, 2, 1, 4, 0, 0]},
    {"trastes": [7, 6, 4, 4, 5, -1], "dedos": [4, 3, 1, 1, 2, 0], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [7, 6, 9, 9, -1, -1], "dedos": [2, 1, 4, 4, 0, 0], "cejilla": {"traste": 9, "desde": 2, "hasta": 3}},
    {"trastes": [-1, 14, 13, 11, 12, 12], "dedos": [0, 4, 3, 1, 2, 2], "cejilla": {"traste": 12, "desde": 4, "hasta": 5}}
  ],
  "Badd9": [
    {"trastes": [-1, 2, 1, -1, 2, 2], "dedos": [0, 2, 1, 0, 3, 4]},
    {"trastes": [7, 6, -1, 6, 7, 7], "dedos": [3, 1, 0, 2, 4, 4]},
    {"trastes": [-1, -1, 9, 8, 7, 9], "dedos": [0, 0, 3, 2, 1, 4]},
    {"trastes": [-1, 14, 13, 11, 14, 11], "dedos": [0, 3, 2, 1, 4, 1], "cejilla": {"traste": 11, "desde": 3, "hasta": 5}}
  ],
  "Baug": [
    {"trastes": [-1, 2, 1, 0, 0, -1], "dedos": [0, 2, 1, 0, 0, 0]},
    {"trastes": [7, -1, 9, 8, 8, -1], "dedos": [1, 0, 4, 2, 3, 0]}
  ],
  "Baug7": [
    {"trastes": [-1, 2, 1, 2, 0, 3], "dedos": [0, 2, 1, 3, 0, 4]},
    {"trastes": [7, -1, 7, 8, 8, -1], "dedos": [1, 0, 2, 3, 4, 0]},
    {"trastes": [-1, -1, 9, 12, 10, 11], "dedos": [0, 0, 1, 4, 2, 3]}
  ],
  "Bdim": [
    {"trastes": [-1, 2, 0, -1, 0, 1], "dedos": [0, 3, 0, 0, 0, 2]},
    {"trastes": [-1, 2, 3, 4, 3, -1], "dedos": [0, 1, 2, 4, 3, 0]},
    {"trastes": [7, 5, -1, 7, 6, -1], "dedos": [3, 1, 0, 4, 2, 0]},
    {"trastes": [-1, -1, 9, 10, -1, 10], "dedos": [0, 0, 1, 2, 0, 3]}
  ],
  "Bdim7": [
    {"trastes": [-1, 2, 3, 1, 3, 1], "dedos": [0, 2, 3, 1, 4, 1], "cejilla": {"traste": 1, "desde": 3, "hasta": 5}},
    {"trastes": [7, -1, 6, 7, 6, -1], "dedos": [3, 0, 1, 4, 2, 0]},
    {"trastes": [7, 8, 9, 7, 9, 7], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "Bm/A": [
    {"trastes": [-1, 0, 4, 4, 3, 2], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, 0, 0, 4, 0, 2], "dedos": [0, 0, 0, 3, 0, 1]},
    {"trastes": [-1, 0, 0, 4, 3, 2], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, 0, 4, 7, 7, 7], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm/A#": [
    {"trastes": [-1, 1, 0, 4, 0, 2], "dedos": [0, 1, 0, 4, 0, 2]},
    {"trastes": [6, 5, 4, 4, 7, 7], "dedos": [3, 2, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [6, 5, 4, 7, 7, 7], "dedos": [3, 2, 1, 4, 4, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 8, 7, 7, 7], "dedos": [0, 0, 2, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm/C": [
    {"trastes": [-1, 3, 0, 4, 0, 2], "dedos": [0, 2, 0, 3, 0, 1]},
    {"trastes": [-1, 3, 0, 4, 3, 2], "dedos": [0, 2, 0, 4, 3, 1]},
    {"trastes": [8, 9, 9, 7, 7, 7], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 10, 7, 7, 7], "dedos": [0, 0, 4, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm/C#": [
    {"trastes": [-1, 4, 0, 4, 0, 2], "dedos": [0, 3, 0, 4, 0, 1]},
    {"trastes": [-1, 4, 0, 4, 3, 2], "dedos": [0, 3, 0, 4, 2, 1]},
    {"trastes": [-1, 4, 4, 7, 7, 7], "dedos": [0, 1, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 1, "hasta": 2}},
    {"trastes": [9, 9, 9, 7, 7, 7], "dedos": [2, 3, 4, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm/D": [
    {"trastes": [-1, -1, 0, 4, 0, 2], "dedos": [0, 0, 0, 3, 0, 1]},
    {"trastes": [-1, -1, 0, 4, 3, 2], "dedos": [0, 0, 0, 3, 2, 1]},
    {"trastes": [-1, -1, 0, 4, 7, 7], "dedos": [0, 0, 0, 1, 4, 4], "cejilla": {"traste": 7, "desde": 4, "hasta": 5}},
    {"trastes": [-1, 5, 4, 4, 7, 7], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}}
  ],
  "Bm/D#": [
    {"trastes": [-1, -1, 1, 4, 3, 2], "dedos": [0, 0, 1, 4, 3, 2]},
    {"trastes": [-1, 6, 4, 7, 7, 7], "dedos": [0, 3, 1, 4, 4, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, -1, 13, 11, 12, 10], "dedos": [0, 0, 4, 2, 3, 1]},
    {"trastes": [11, 14, 12, 11, -1, -1], "dedos": [1, 4, 2, 1, 0, 0], "cejilla": {"traste": 11, "desde": 0, "hasta": 3}}
  ],
  "Bm/E": [
    {"trastes": [0, 2, 0, 4, 0, 2], "dedos": [0, 1, 0, 4, 0, 2]},
    {"trastes": [0, 2, 4, 4, 3, 2], "dedos": [0, 1, 3, 4, 2, 1], "cejilla": {"traste": 2, "desde": 1, "hasta": 5}},
    {"trastes": [0, 5, 4, 4, 7, 7], "dedos": [0, 2, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 2, "hasta": 3}},
    {"trastes": [-1, -1, 2, 4, 3, 2], "dedos": [0, 0, 1, 3, 2, 1], "cejilla": {"traste": 2, "desde": 2, "hasta": 5}}
  ],
  "Bm/F": [
    {"trastes": [-1, -1, 3, 4, 3, 2], "dedos": [0, 0, 2, 4, 3, 1]},
    {"trastes": [-1, 8, 9, 7, 7, 7], "dedos": [0, 2, 3, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 8, 9, 7, 7, 10], "dedos": [0, 2, 3, 1, 1, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 8, 9, 7, 7, -1], "dedos": [0, 2, 3, 1, 1, 0], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}}
  ],
  "Bm/F#": [
    {"trastes": [2, 2, 4, 4, 3, 2], "dedos": [1, 1, 3, 4, 2, 1], "cejilla": {"traste": 2, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 4, 4, 3, 2], "dedos": [0, 0, 3, 4, 2, 1]},
    {"trastes": [-1, -1, 4, 7, 7, 7], "dedos": [0, 0, 1, 4, 4, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 9, 9, 7, 7, 7], "dedos": [0, 3, 4, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm/G": [
    {"trastes": [-1, -1, 5, 4, 3, 2], "dedos": [0, 0, 4, 3, 2, 1]},
    {"trastes": [-1, -1, 5, 7, 7, 7], "dedos": [0, 0, 1, 3, 3, 3], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 9, 7, 7, 7], "dedos": [0, 4, 3, 1, 1, 1], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}},
    {"trastes": [-1, 10, 12, 11, 12, 10], "dedos": [0, 1, 3, 2, 4, 1], "cejilla": {"traste": 10, "desde": 1, "hasta": 5}}
  ],
  "Bm/G#": [
    {"trastes": [4, -1, 4, 4, 3, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [4, 5, 4, 4, 7, 7], "dedos": [1, 2, 1, 1, 4, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 3}},
    {"trastes": [4, 5, 4, 7, 7, 7], "dedos": [1, 2, 1, 4, 4, 4], "cejilla": {"traste": 4, "desde": 0, "hasta": 2}},
    {"trastes": [-1, -1, 6, 7, 7, 7], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 7, "desde": 3, "hasta": 5}}
  ],
  "Bm11": [
    {"trastes": [-1, 2, 0, 2, 2, 0], "dedos": [0, 1, 0, 2, 3, 0]},
    {"trastes": [7, 5, 7, 6, 5, 5], "dedos": [3, 1, 4, 2, 1, 1], "cejilla": {"traste": 5, "desde": 1, "hasta": 5}},
    {"trastes": [7, 7, 7, 7, 7, 9], "dedos": [1, 1, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 4}},
    {"trastes": [-1, -1, 9, 9, 10, 10], "dedos": [0, 0, 1, 1, 2, 3], "cejilla": {"traste": 9, "desde": 2, "hasta": 3}}
  ],
  "Bm6": [
    {"trastes": [7, -1, 6, 7, 7, -1], "dedos": [2, 0, 1, 3, 4, 0]},
    {"trastes": [7, 9, 9, 7, 9, 7], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "Bm7b5": [
    {"trastes": [-1, 2, 3, 2, 3, -1], "dedos": [0, 1, 3, 2, 4, 0]},
    {"trastes": [7, -1, 7, 7, 6, -1], "dedos": [2, 0, 3, 4, 1, 0]},
    {"trastes": [7, 8, 9, 7, 10, 7], "dedos": [1, 2, 3, 1, 4, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}},
    {"trastes": [-1, -1, 9, 10, 10, 10], "dedos": [0, 0, 1, 2, 2, 2], "cejilla": {"traste": 10, "desde": 3, "hasta": 5}}
  ],
  "Bm9": [
    {"trastes": [-1, 2, 0, 2, 2, 2], "dedos": [0, 1, 0, 2, 3, 4]},
    {"trastes": [7, 9, 7, 7, 7, 9], "dedos": [1, 3, 1, 1, 1, 4], "cejilla": {"traste": 7, "desde": 0, "hasta": 4}}
  ],
  "Bmadd9": [
    {"trastes": [7, 5, 0, 6, 7, -1], "dedos": [3, 1, 0, 2, 4, 0]},
    {"trastes": [-1, -1, 9, 7, 7, 9], "dedos": [0, 0, 3, 1, 1, 4], "cejilla": {"traste": 7, "desde": 3, "hasta": 4}},
    {"trastes": [-1, 14, 12, 11, 14, -1], "dedos": [0, 3, 2, 1, 4, 0]}
  ],
  "Bmaj7": [
    {"trastes": [7, 9, 8, 8, 7, 7], "dedos": [1, 4, 2, 3, 1, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "Bmaj9": [
    {"trastes": [7, 6, 8, 6, 7, -1], "dedos": [2, 1, 4, 1, 3, 0], "cejilla": {"traste": 6, "desde": 1, "hasta": 3}},
    {"trastes": [-1, -1, 9, 8, 11, 9], "dedos": [0, 0, 2, 1, 4, 3]}
  ],
  "Bmmaj7": [
    {"trastes": [-1, 2, 0, 3, 0, 2], "dedos": [0, 1, 0, 3, 0, 2]},
    {"trastes": [7, 9, 8, 7, 7, 7], "dedos": [1, 3, 2, 1, 1, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ],
  "Bsus2": [
    {"trastes": [7, -1, -1, 6, 7, 7], "dedos": [2, 0, 0, 1, 3, 4]},
    {"trastes": [-1, 14, 11, 11, 12, 14], "dedos": [0, 3, 1, 1, 2, 4], "cejilla": {"traste": 11, "desde": 2, "hasta": 3}}
  ],
  "Bsus4": [
    {"trastes": [7, 9, 9, 9, 7, 7], "dedos": [1, 2, 3, 4, 1, 1], "cejilla": {"traste": 7, "desde": 0, "hasta": 5}}
  ]
};
