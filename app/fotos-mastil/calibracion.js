// Calibración de las fotos del mástil "Foto" (se hace una sola vez, con calibrar-fotos.html).
// Por cada foto: los bordes del diapasón (del lado de la 6ª y del lado de la 1ª) en la cejuela,
// en el traste 12 y en el último traste visible, en fracción del ancho y del alto de la foto.
// "ancho" y "alto" son los de la imagen grande (la de toda la resolución).
window.CALIBRACION_FOTOS = {
  "diagonal": {
    "ancho": 4054,
    "alto": 2878,
    "puntos": {
      "cejuela": [
        {
          "x": 0.872,
          "y": 0.1081
        },
        {
          "x": 0.8939,
          "y": 0.1577
        }
      ],
      "traste12": [
        {
          "x": 0.6443,
          "y": 0.263
        },
        {
          "x": 0.6744,
          "y": 0.3346
        }
      ],
      "ultimo": {
        "traste": 22,
        "puntos": [
          {
            "x": 0.5175,
            "y": 0.3492
          },
          {
            "x": 0.5518,
            "y": 0.4336
          }
        ]
      }
    }
  },
  "perspectiva": {
    "ancho": 2080,
    "alto": 3264,
    "puntos": {
      "cejuela": [
        {
          "x": 0.4333,
          "y": 0.1136
        },
        {
          "x": 0.5392,
          "y": 0.1136
        }
      ],
      "traste12": [
        {
          "x": 0.4243,
          "y": 0.5493
        },
        {
          "x": 0.5925,
          "y": 0.5493
        }
      ],
      "ultimo": {
        "traste": 22,
        "puntos": [
          {
            "x": 0.4159,
            "y": 0.8511
          },
          {
            "x": 0.6244,
            "y": 0.8511
          }
        ]
      }
    }
  },
  "frente": {
    "ancho": 1388,
    "alto": 3264,
    "puntos": {
      "cejuela": [
        {
          "x": 0.5021,
          "y": 0.2311
        },
        {
          "x": 0.644,
          "y": 0.2307
        }
      ],
      "traste12": [
        {
          "x": 0.445,
          "y": 0.6636
        },
        {
          "x": 0.6196,
          "y": 0.6639
        }
      ],
      "ultimo": {
        "traste": 22,
        "puntos": [
          {
            "x": 0.4123,
            "y": 0.86
          },
          {
            "x": 0.6029,
            "y": 0.8596
          }
        ]
      }
    }
  },
  "entera": {
    "ancho": 1531,
    "alto": 3264,
    "puntos": {
      "cejuela": [
        {
          "x": 0.4581,
          "y": 0.1229
        },
        {
          "x": 0.5525,
          "y": 0.1229
        }
      ],
      "traste12": [
        {
          "x": 0.4414,
          "y": 0.43
        },
        {
          "x": 0.5632,
          "y": 0.43
        }
      ],
      "ultimo": {
        "traste": 22,
        "puntos": [
          {
            "x": 0.4338,
            "y": 0.5771
          },
          {
            "x": 0.5677,
            "y": 0.5771
          }
        ]
      }
    }
  }
};
