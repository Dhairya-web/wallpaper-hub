const APP_CONFIG = {
  "build": {
    "mode": "customer",
    "platform": "browser",
    "edition": "premium"
  },
  "settings": {
    "defaultThemeId": "luffy-gear5",
    "showThemeSwitcher": false,
    "showSettingsPanel": true,
    "persistSettings": true,
    "maxRenderPixels": 3686400
  },
  "controls": {
    "headSize": {
      "min": 55,
      "max": 160,
      "step": 5
    },
    "trailPersistence": {
      "min": 55,
      "max": 150,
      "step": 5
    },
    "effectIntensity": {
      "min": 40,
      "max": 140,
      "step": 5
    },
    "glowStrength": {
      "min": 0,
      "max": 150,
      "step": 5
    },
    "backgroundDimming": {
      "min": 10,
      "max": 70,
      "step": 2
    },
    "performanceMode": {
      "options": [
        "quality",
        "balanced",
        "low-power"
      ]
    },
    "textFields": {
      "logoText": {
        "propertyName": "logoText",
        "label": "Logo",
        "maxLength": 40,
        "multiline": false,
        "required": true
      },
      "logoSubText": {
        "propertyName": "logoSubText",
        "label": "Subtitle",
        "maxLength": 80,
        "multiline": false,
        "required": false
      },
      "leftEyebrow": {
        "propertyName": "leftEyebrow",
        "label": "Left eyebrow",
        "maxLength": 50,
        "multiline": false,
        "required": false
      },
      "leftTitle": {
        "propertyName": "leftTitle",
        "label": "Left title",
        "maxLength": 80,
        "multiline": true,
        "maxLines": 3,
        "required": true
      },
      "leftDesc": {
        "propertyName": "leftDesc",
        "label": "Left description",
        "maxLength": 280,
        "multiline": true,
        "maxLines": 5,
        "required": false
      },
      "buttonText": {
        "propertyName": "buttonText",
        "label": "Button label",
        "maxLength": 24,
        "multiline": false,
        "required": false
      },
      "rightEyebrow": {
        "propertyName": "rightEyebrow",
        "label": "Right eyebrow",
        "maxLength": 50,
        "multiline": false,
        "required": false
      },
      "rightTitle": {
        "propertyName": "rightTitle",
        "label": "Right title",
        "maxLength": 80,
        "multiline": true,
        "maxLines": 3,
        "required": true
      },
      "rightDesc": {
        "propertyName": "rightDesc",
        "label": "Right description",
        "maxLength": 280,
        "multiline": true,
        "maxLines": 5,
        "required": false
      },
      "hintText": {
        "propertyName": "hintText",
        "label": "Interaction hint",
        "maxLength": 80,
        "multiline": false,
        "required": false
      }
    }
  },
  "themes": [
    {
      "id": "luffy-gear5",
      "themeName": "One Piece - Gear 5",
      "type": "Anime",
      "release": {
        "status": "ready",
        "assetStatus": "final"
      },
      "interaction": {
        "baseTrailDurationMs": 850,
        "followRate": 16,
        "maxTrailPoints": 68,
        "headRadius": {
          "minimum": 130,
          "viewportScale": 0.24
        },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": {
          "alphaExponent": 1.08,
          "tailWidthScale": 0.58,
          "lifeWidthScale": 0.42
        },
        "reentryDistanceScale": 1.8,
        "sampling": {
          "minimumSpacing": 9,
          "maximumSpacing": 14,
          "headRadiusFactor": 0.09,
          "maxSamplesPerFrame": 32
        }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": {
              "ribbonWidthScale": 1.52,
              "ribbonColor": "rgba(0,0,0,1)",
              "ribbonOpacity": 0.96,
              "headScale": 1,
              "headColor": "rgba(0,0,0,1)"
            },
            "glow": {
              "radiusScale": 1.45,
              "stops": [
                {
                  "offset": 0,
                  "color": "rgba(255,245,215,0.30)"
                },
                {
                  "offset": 0.45,
                  "color": "rgba(244,196,48,0.14)"
                },
                {
                  "offset": 1,
                  "color": "rgba(0,0,0,0)"
                }
              ]
            }
          }
        },
        {
          "id": "gear-pi-trail",
          "name": "GEAR PI TRAIL",
          "renderer": "gearPi",
          "role": "signature",
          "style": {
            "mask": {
              "ribbonWidthScale": 1.34,
              "ribbonColor": "rgba(0,0,0,0.99)",
              "ribbonOpacity": 1,
              "cloudScale": 0.82,
              "cloudColor": "rgba(0,0,0,0.99)",
              "cloudCommands": [
                [
                  "M",
                  -1.08,
                  0.26
                ],
                [
                  "C",
                  -1.14,
                  -0.08,
                  -0.92,
                  -0.38,
                  -0.62,
                  -0.38
                ],
                [
                  "C",
                  -0.58,
                  -0.78,
                  -0.22,
                  -0.94,
                  0.08,
                  -0.74
                ],
                [
                  "C",
                  0.34,
                  -1,
                  0.76,
                  -0.78,
                  0.72,
                  -0.46
                ],
                [
                  "C",
                  1.04,
                  -0.46,
                  1.22,
                  -0.12,
                  1.02,
                  0.16
                ],
                [
                  "C",
                  1.1,
                  0.48,
                  0.7,
                  0.72,
                  0.38,
                  0.54
                ],
                [
                  "C",
                  0.1,
                  0.82,
                  -0.3,
                  0.74,
                  -0.46,
                  0.52
                ],
                [
                  "C",
                  -0.76,
                  0.68,
                  -1.12,
                  0.56,
                  -1.08,
                  0.26
                ],
                [
                  "Z"
                ]
              ]
            },
            "overlay": {
              "blendMode": "screen",
              "ribbonLayers": [
                {
                  "widthScale": 1.56,
                  "color": "rgba(190,176,235,0.78)",
                  "opacity": 0.08
                },
                {
                  "widthScale": 1.44,
                  "color": "rgba(255,255,255,0.92)",
                  "opacity": 0.11
                }
              ],
              "cloudLayers": [
                {
                  "scale": 0.88,
                  "color": "rgba(190,176,235,0.78)",
                  "opacity": 0.07
                },
                {
                  "scale": 0.85,
                  "color": "rgba(255,255,255,0.92)",
                  "opacity": 0.1
                }
              ]
            }
          }
        }
      ],
      "settings": {
        "defaults": {
          "trailId": "gear-pi-trail",
          "headSize": 100,
          "trailPersistence": 100,
          "effectIntensity": 100,
          "glowStrength": 100,
          "backgroundDimming": 42,
          "performanceMode": "balanced",
          "showUi": true,
          "showSettingsButton": true
        },
        "capabilities": [
          "trailSelection",
          "headSize",
          "trailPersistence",
          "effectIntensity",
          "glowStrength",
          "backgroundDimming",
          "performanceMode",
          "uiVisibility",
          "settingsButtonVisibility",
          "textCustomization"
        ],
        "textFields": [
          "logoText",
          "logoSubText",
          "leftEyebrow",
          "leftTitle",
          "leftDesc",
          "buttonText",
          "rightEyebrow",
          "rightTitle",
          "rightDesc",
          "hintText"
        ]
      },
      "assets": {
        "imageAtRest": "assets/images/base.webp",
        "imageInTrail": "assets/images/reveal.webp"
      },
      "fonts": {
        "logo": "Luckiest Guy",
        "title": "Bangers",
        "eyebrow": "Bebas Neue",
        "desc": "Cormorant Garamond"
      },
      "colors": {
        "primary": "#FFD700",
        "secondary": "#ff5a6e",
        "logoColor": "#F7D446",
        "logoStroke": "3px #0a1a3a",
        "titleShadow": "3px 3px 0 #b3001a, 0 0 14px rgba(192,0,26,0.5), 0 0 36px rgba(192,0,26,0.3)",
        "rightTitleShadow": "3px 3px 0 #6a3fb3, 0 0 16px rgba(180,120,255,0.5), 0 0 40px rgba(180,120,255,0.3)"
      },
      "content": {
        "logoText": "ONE PIECE",
        "logoSubText": "GEAR  5 · AWAKENING",
        "leftEyebrow": "STRAW HAT PIRATES",
        "leftTitle": "MONKEY D.\nLUFFY",
        "leftDesc": "The boy who would be King of the Pirates. Rubber fists, an iron will, and a grin that never quits — chasing the world's greatest treasure.",
        "buttonText": "SET SAIL",
        "rightEyebrow": "JOY BOY AWAKENED",
        "rightTitle": "GEAR\nFIVE",
        "rightDesc": "The Warrior of Liberation. Laughter becomes power, the world bends to imagination — the truest form of the Nika Devil Fruit.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      }
    }
  ]
};
