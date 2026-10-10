const APP_CONFIG = {
  "build": {
    "mode": "customer",
    "platform": "lively",
    "edition": "premium"
  },
  "settings": {
    "defaultThemeId": "cyberpunk-neon",
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
      "id": "cyberpunk-neon",
      "themeName": "Cyberpunk - Neon Night",
      "type": "Cyberpunk",
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
                  "color": "rgba(0,240,255,0.40)"
                },
                {
                  "offset": 0.45,
                  "color": "rgba(255,0,60,0.25)"
                },
                {
                  "offset": 1,
                  "color": "rgba(0,0,0,0)"
                }
              ]
            }
          }
        }
      ],
      "settings": {
        "defaults": {
          "trailId": "minimal-reveal",
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
        "logo": "Orbitron",
        "title": "Teko",
        "eyebrow": "Rajdhani",
        "desc": "Chakra Petch"
      },
      "colors": {
        "primary": "#00f0ff",
        "secondary": "#ff003c",
        "logoColor": "#fcee0a",
        "logoStroke": "3px #000000",
        "titleShadow": "3px 3px 0 #005a70, 0 0 14px rgba(0,240,255,0.5), 0 0 36px rgba(0,240,255,0.3)",
        "rightTitleShadow": "3px 3px 0 #800018, 0 0 16px rgba(255,0,60,0.5), 0 0 40px rgba(255,0,60,0.3)"
      },
      "content": {
        "logoText": "NIGHT CITY",
        "logoSubText": "NEON · CHROME · BLOOD",
        "leftEyebrow": "WELCOME TO 2077",
        "leftTitle": "NEON\nSTREETS",
        "leftDesc": "In Night City, you can be anybody, do anything, as long as you're willing to pay the price. Chrome up and dive into the shadows.",
        "buttonText": "JACK IN",
        "rightEyebrow": "CHROME AWAKENED",
        "rightTitle": "CYBER\nPUNK",
        "rightDesc": "A violent, vibrant metropolis where the neon never sleeps. High tech meets low life in a desperate struggle for survival.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      },
      "enabled": true
    }
  ]
};
