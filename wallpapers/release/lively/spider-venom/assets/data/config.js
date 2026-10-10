const APP_CONFIG = {
  "build": {
    "mode": "customer",
    "platform": "lively",
    "edition": "premium"
  },
  "settings": {
    "defaultThemeId": "spider-venom",
    "showThemeSwitcher": false,
    "showSettingsPanel": false,
    "persistSettings": false,
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
      "id": "spider-venom",
      "themeName": "Marvel - Symbiote",
      "type": "Comics",
      "release": {
        "status": "ready",
        "assetStatus": "final",
        "livelyAssets": {
          "imageAtRest": "assets/images/base.webp",
          "imageInTrail": "assets/images/reveal.webp"
        }
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
                  "color": "rgba(0,0,0,0.85)"
                },
                {
                  "offset": 0.45,
                  "color": "rgba(100,0,0,0.4)"
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
          "id": "masked-web",
          "name": "MASKED WEB",
          "renderer": "maskedWeb",
          "role": "signature",
          "style": {
            "mask": {
              "ribbonWidthScale": 1.22,
              "ribbonColor": "rgba(0,0,0,0.99)",
              "ribbonOpacity": 1,
              "clearScale": 1.04,
              "headScale": 0.9,
              "headColor": "rgba(0,0,0,0.99)",
              "boundarySpokes": 10,
              "boundarySagScale": 0.76,
              "boundaryRotationRadians": -1.5707963267948966
            },
            "body": {
              "blendMode": "screen",
              "color": "rgba(232,240,255,0.96)",
              "opacity": 0.72,
              "spreadScale": 0.36,
              "strandOffsets": [
                -1,
                0,
                1
              ],
              "bucketCount": 6,
              "lineWidthMinimum": 1.2,
              "lineWidthScale": 0.008,
              "spreadBase": 0.72,
              "spreadLifeScale": 0.28,
              "crossbarEvery": 4,
              "crossbarBendScale": 0.12,
              "alphaBase": 0.06,
              "alphaLifeScale": 0.28
            },
            "head": {
              "radiusScale": 0.9,
              "spokes": 10,
              "rings": 4,
              "rotationRadians": -1.5707963267948966,
              "ringSagScale": 0.78,
              "darkLayer": {
                "opacity": 0.42,
                "color": "rgba(3,4,8,0.96)",
                "lineWidthMinimum": 3.5,
                "lineWidthScale": 0.032
              },
              "lightLayer": {
                "opacity": 0.62,
                "color": "rgba(215,224,240,0.88)",
                "lineWidthMinimum": 1.3,
                "lineWidthScale": 0.012
              },
              "eyeCommands": [
                [
                  "M",
                  -0.1,
                  -0.08
                ],
                [
                  "C",
                  -0.34,
                  -0.42,
                  -0.66,
                  -0.57,
                  -0.82,
                  -0.48
                ],
                [
                  "C",
                  -0.76,
                  -0.12,
                  -0.55,
                  0.2,
                  -0.24,
                  0.29
                ],
                [
                  "C",
                  -0.18,
                  0.12,
                  -0.13,
                  0.01,
                  -0.1,
                  -0.08
                ],
                [
                  "Z"
                ]
              ],
              "eyes": {
                "fill": {
                  "opacity": 0.88,
                  "color": "rgba(238,245,255,0.28)"
                },
                "darkStroke": {
                  "opacity": 0.88,
                  "color": "rgba(2,3,7,0.98)",
                  "lineWidthMinimum": 9,
                  "lineWidthScale": 0.105
                },
                "accentStroke": {
                  "opacity": 0.96,
                  "color": "rgba(255,30,43,0.98)",
                  "lineWidthMinimum": 3.2,
                  "lineWidthScale": 0.04,
                  "shadowColor": "rgba(255,0,24,0.55)",
                  "shadowBlurScale": 0.035
                },
                "highlightStroke": {
                  "scale": 0.94,
                  "opacity": 0.52,
                  "color": "rgba(245,250,255,0.98)",
                  "lineWidthMinimum": 1.2,
                  "lineWidthScale": 0.012
                }
              }
            }
          }
        },
        {
          "id": "radial-web",
          "name": "CLASSIC RADIAL WEB",
          "renderer": "radialWeb",
          "role": "material",
          "style": {
            "mask": {
              "ribbonWidthScale": 1.22,
              "ribbonColor": "rgba(0,0,0,0.99)",
              "ribbonOpacity": 1,
              "clearScale": 1.04,
              "headScale": 0.9,
              "headColor": "rgba(0,0,0,0.99)",
              "boundarySpokes": 12,
              "boundarySagScale": 0.76,
              "boundaryRotationRadians": -1.5707963267948966
            },
            "body": {
              "blendMode": "screen",
              "color": "rgba(250,252,255,0.99)",
              "opacity": 0.84,
              "spreadScale": 0.36,
              "strandOffsets": [
                -1,
                0,
                1
              ],
              "bucketCount": 6,
              "lineWidthMinimum": 1.2,
              "lineWidthScale": 0.008,
              "spreadBase": 0.72,
              "spreadLifeScale": 0.28,
              "crossbarEvery": 4,
              "crossbarBendScale": 0.12,
              "alphaBase": 0.06,
              "alphaLifeScale": 0.28
            },
            "head": {
              "radiusScale": 0.9,
              "spokes": 12,
              "rings": 5,
              "rotationRadians": -1.5707963267948966,
              "ringSagScale": 0.78,
              "darkLayer": {
                "opacity": 0.5,
                "color": "rgba(3,4,8,0.96)",
                "lineWidthMinimum": 3.5,
                "lineWidthScale": 0.032
              },
              "lightLayer": {
                "opacity": 0.86,
                "color": "rgba(250,252,255,0.99)",
                "lineWidthMinimum": 1.3,
                "lineWidthScale": 0.012
              }
            }
          }
        }
      ],
      "settings": {
        "defaults": {
          "trailId": "masked-web",
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
        "logo": "Bangers",
        "title": "Creepster",
        "eyebrow": "Bebas Neue",
        "desc": "PT Sans"
      },
      "colors": {
        "primary": "#E23636",
        "secondary": "#504DE4",
        "logoColor": "#ffffff",
        "logoStroke": "2px #000000",
        "titleShadow": "3px 3px 0 #2b2b2b, 0 0 14px rgba(255,255,255,0.5), 0 0 36px rgba(255,255,255,0.3)",
        "rightTitleShadow": "3px 3px 0 #000000, 0 0 16px rgba(226,54,54,0.5), 0 0 40px rgba(226,54,54,0.3)"
      },
      "content": {
        "logoText": "SYMBIOTE",
        "logoSubText": "WE ARE · VENOM",
        "leftEyebrow": "FRIENDLY NEIGHBORHOOD",
        "leftTitle": "SPIDER\nMAN",
        "leftDesc": "With great power comes great responsibility. Swinging through the concrete jungle of New York, protecting the innocent.",
        "buttonText": "THWIP",
        "rightEyebrow": "LETHAL PROTECTOR",
        "rightTitle": "VENOM",
        "rightDesc": "A twisted reflection born of alien sludge. We are hungry, we are angry, and we will protect our own.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      },
      "enabled": true
    }
  ]
};
