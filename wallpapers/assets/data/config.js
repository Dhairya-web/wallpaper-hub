const APP_CONFIG = {
  "build": {
    "mode": "development",
    "platform": "browser",
    "edition": "development"
  },
  "settings": {
    "defaultThemeId": "luffy-gear5",
    "showThemeSwitcher": true,
    "showSettingsPanel": true,
    "persistSettings": true,
    "maxRenderPixels": 3686400
  },
  "controls": {
    "headSize": { "min": 55, "max": 160, "step": 5 },
    "trailPersistence": { "min": 55, "max": 150, "step": 5 },
    "effectIntensity": { "min": 40, "max": 140, "step": 5 },
    "glowStrength": { "min": 0, "max": 150, "step": 5 },
    "backgroundDimming": { "min": 10, "max": 70, "step": 2 },
    "performanceMode": { "options": ["quality", "balanced", "low-power"] },
    "textFields": {
      "logoText": { "propertyName": "logoText", "label": "Logo", "maxLength": 40, "multiline": false, "required": true },
      "logoSubText": { "propertyName": "logoSubText", "label": "Subtitle", "maxLength": 80, "multiline": false, "required": false },
      "leftEyebrow": { "propertyName": "leftEyebrow", "label": "Left eyebrow", "maxLength": 50, "multiline": false, "required": false },
      "leftTitle": { "propertyName": "leftTitle", "label": "Left title", "maxLength": 80, "multiline": true, "maxLines": 3, "required": true },
      "leftDesc": { "propertyName": "leftDesc", "label": "Left description", "maxLength": 280, "multiline": true, "maxLines": 5, "required": false },
      "buttonText": { "propertyName": "buttonText", "label": "Button label", "maxLength": 24, "multiline": false, "required": false },
      "rightEyebrow": { "propertyName": "rightEyebrow", "label": "Right eyebrow", "maxLength": 50, "multiline": false, "required": false },
      "rightTitle": { "propertyName": "rightTitle", "label": "Right title", "maxLength": 80, "multiline": true, "maxLines": 3, "required": true },
      "rightDesc": { "propertyName": "rightDesc", "label": "Right description", "maxLength": 280, "multiline": true, "maxLines": 5, "required": false },
      "hintText": { "propertyName": "hintText", "label": "Interaction hint", "maxLength": 80, "multiline": false, "required": false }
    }
  },
  "themes": [
    {
      "id": "luffy-gear5",
      "themeName": "One Piece - Gear 5",
      "type": "Anime",
      "release": {
        "status": "ready",
        "assetStatus": "final",
        "livelyAssets": {
          "imageAtRest": "assets/images/luffy/base_lively.webp",
          "imageInTrail": "assets/images/luffy/reveal_lively.webp"
        }
      },
      "interaction": {
        "baseTrailDurationMs": 850,
        "followRate": 16,
        "maxTrailPoints": 68,
        "headRadius": { "minimum": 130, "viewportScale": 0.24 },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": { "alphaExponent": 1.08, "tailWidthScale": 0.58, "lifeWidthScale": 0.42 },
        "reentryDistanceScale": 1.8,
        "sampling": { "minimumSpacing": 9, "maximumSpacing": 14, "headRadiusFactor": 0.09, "maxSamplesPerFrame": 32 }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": { "ribbonWidthScale": 1.52, "ribbonColor": "rgba(0,0,0,1)", "ribbonOpacity": 0.96, "headScale": 1, "headColor": "rgba(0,0,0,1)" },
            "glow": {
              "radiusScale": 1.45,
              "stops": [
                { "offset": 0, "color": "rgba(255,245,215,0.30)" },
                { "offset": 0.45, "color": "rgba(244,196,48,0.14)" },
                { "offset": 1, "color": "rgba(0,0,0,0)" }
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
                ["M", -1.08, 0.26],
                ["C", -1.14, -0.08, -0.92, -0.38, -0.62, -0.38],
                ["C", -0.58, -0.78, -0.22, -0.94, 0.08, -0.74],
                ["C", 0.34, -1, 0.76, -0.78, 0.72, -0.46],
                ["C", 1.04, -0.46, 1.22, -0.12, 1.02, 0.16],
                ["C", 1.10, 0.48, 0.70, 0.72, 0.38, 0.54],
                ["C", 0.10, 0.82, -0.30, 0.74, -0.46, 0.52],
                ["C", -0.76, 0.68, -1.12, 0.56, -1.08, 0.26],
                ["Z"]
              ]
            },
            "overlay": {
              "blendMode": "screen",
              "ribbonLayers": [
                { "widthScale": 1.56, "color": "rgba(190,176,235,0.78)", "opacity": 0.08 },
                { "widthScale": 1.44, "color": "rgba(255,255,255,0.92)", "opacity": 0.11 }
              ],
              "cloudLayers": [
                { "scale": 0.88, "color": "rgba(190,176,235,0.78)", "opacity": 0.07 },
                { "scale": 0.85, "color": "rgba(255,255,255,0.92)", "opacity": 0.10 }
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
        "capabilities": ["trailSelection", "headSize", "trailPersistence", "effectIntensity", "glowStrength", "backgroundDimming", "performanceMode", "uiVisibility", "settingsButtonVisibility", "textCustomization"],
        "textFields": ["logoText", "logoSubText", "leftEyebrow", "leftTitle", "leftDesc", "buttonText", "rightEyebrow", "rightTitle", "rightDesc", "hintText"]
      },
      "assets": {
        "imageAtRest": "assets/images/luffy/base_optimized.webp",
        "imageInTrail": "assets/images/luffy/reveal_optimized.webp"
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
        "logoSubText": "GEAR\u00a0\u00a05\u00a0·\u00a0AWAKENING",
        "leftEyebrow": "STRAW HAT PIRATES",
        "leftTitle": "MONKEY D.\nLUFFY",
        "leftDesc": "The boy who would be King of the Pirates. Rubber fists, an iron will, and a grin that never quits — chasing the world's greatest treasure.",
        "buttonText": "SET SAIL",
        "rightEyebrow": "JOY BOY AWAKENED",
        "rightTitle": "GEAR\nFIVE",
        "rightDesc": "The Warrior of Liberation. Laughter becomes power, the world bends to imagination — the truest form of the Nika Devil Fruit.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      }
    },
    {
      "id": "cyberpunk-neon",
      "themeName": "Cyberpunk - Neon Night",
      "type": "Cyberpunk",
      "release": {
        "status": "ready",
        "assetStatus": "final",
        "livelyAssets": {
          "imageAtRest": "assets/images/cyberpunk/base_lively.webp",
          "imageInTrail": "assets/images/cyberpunk/reveal_lively.webp"
        }
      },
      "interaction": {
        "baseTrailDurationMs": 850,
        "followRate": 16,
        "maxTrailPoints": 68,
        "headRadius": { "minimum": 130, "viewportScale": 0.24 },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": { "alphaExponent": 1.08, "tailWidthScale": 0.58, "lifeWidthScale": 0.42 },
        "reentryDistanceScale": 1.8,
        "sampling": { "minimumSpacing": 9, "maximumSpacing": 14, "headRadiusFactor": 0.09, "maxSamplesPerFrame": 32 }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": { "ribbonWidthScale": 1.52, "ribbonColor": "rgba(0,0,0,1)", "ribbonOpacity": 0.96, "headScale": 1, "headColor": "rgba(0,0,0,1)" },
            "glow": {
              "radiusScale": 1.45,
              "stops": [
                { "offset": 0, "color": "rgba(0,240,255,0.40)" },
                { "offset": 0.45, "color": "rgba(255,0,60,0.25)" },
                { "offset": 1, "color": "rgba(0,0,0,0)" }
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
        "capabilities": ["headSize", "trailPersistence", "effectIntensity", "glowStrength", "backgroundDimming", "performanceMode", "uiVisibility", "settingsButtonVisibility", "textCustomization"],
        "textFields": ["logoText", "logoSubText", "leftEyebrow", "leftTitle", "leftDesc", "buttonText", "rightEyebrow", "rightTitle", "rightDesc", "hintText"]
      },
      "assets": {
        "imageAtRest": "assets/images/cyberpunk/base_optimized.webp",
        "imageInTrail": "assets/images/cyberpunk/reveal_optimized.webp"
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
        "logoSubText": "NEON\u00a0·\u00a0CHROME\u00a0·\u00a0BLOOD",
        "leftEyebrow": "WELCOME TO 2077",
        "leftTitle": "NEON\nSTREETS",
        "leftDesc": "In Night City, you can be anybody, do anything, as long as you're willing to pay the price. Chrome up and dive into the shadows.",
        "buttonText": "JACK IN",
        "rightEyebrow": "CHROME AWAKENED",
        "rightTitle": "CYBER\nPUNK",
        "rightDesc": "A violent, vibrant metropolis where the neon never sleeps. High tech meets low life in a desperate struggle for survival.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      }
    },
    {
      "id": "spider-venom",
      "themeName": "Marvel - Symbiote",
      "type": "Comics",
      "release": {
        "status": "ready",
        "assetStatus": "final",
        "livelyAssets": {
          "imageAtRest": "assets/images/spidey/base_lively.webp",
          "imageInTrail": "assets/images/spidey/reveal_lively.webp"
        }
      },
      "interaction": {
        "baseTrailDurationMs": 850,
        "followRate": 16,
        "maxTrailPoints": 68,
        "headRadius": { "minimum": 130, "viewportScale": 0.24 },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": { "alphaExponent": 1.08, "tailWidthScale": 0.58, "lifeWidthScale": 0.42 },
        "reentryDistanceScale": 1.8,
        "sampling": { "minimumSpacing": 9, "maximumSpacing": 14, "headRadiusFactor": 0.09, "maxSamplesPerFrame": 32 }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": { "ribbonWidthScale": 1.52, "ribbonColor": "rgba(0,0,0,1)", "ribbonOpacity": 0.96, "headScale": 1, "headColor": "rgba(0,0,0,1)" },
            "glow": {
              "radiusScale": 1.45,
              "stops": [
                { "offset": 0, "color": "rgba(0,0,0,0.85)" },
                { "offset": 0.45, "color": "rgba(100,0,0,0.4)" },
                { "offset": 1, "color": "rgba(0,0,0,0)" }
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
            "mask": { "ribbonWidthScale": 1.22, "ribbonColor": "rgba(0,0,0,0.99)", "ribbonOpacity": 1, "clearScale": 1.04, "headScale": 0.90, "headColor": "rgba(0,0,0,0.99)", "boundarySpokes": 10, "boundarySagScale": 0.76, "boundaryRotationRadians": -1.5707963267948966 },
            "body": { "blendMode": "screen", "color": "rgba(232,240,255,0.96)", "opacity": 0.72, "spreadScale": 0.36, "strandOffsets": [-1, 0, 1], "bucketCount": 6, "lineWidthMinimum": 1.2, "lineWidthScale": 0.008, "spreadBase": 0.72, "spreadLifeScale": 0.28, "crossbarEvery": 4, "crossbarBendScale": 0.12, "alphaBase": 0.06, "alphaLifeScale": 0.28 },
            "head": {
              "radiusScale": 0.90,
              "spokes": 10,
              "rings": 4,
              "rotationRadians": -1.5707963267948966,
              "ringSagScale": 0.78,
              "darkLayer": { "opacity": 0.42, "color": "rgba(3,4,8,0.96)", "lineWidthMinimum": 3.5, "lineWidthScale": 0.032 },
              "lightLayer": { "opacity": 0.62, "color": "rgba(215,224,240,0.88)", "lineWidthMinimum": 1.3, "lineWidthScale": 0.012 },
              "eyeCommands": [
                ["M", -0.10, -0.08],
                ["C", -0.34, -0.42, -0.66, -0.57, -0.82, -0.48],
                ["C", -0.76, -0.12, -0.55, 0.20, -0.24, 0.29],
                ["C", -0.18, 0.12, -0.13, 0.01, -0.10, -0.08],
                ["Z"]
              ],
              "eyes": {
                "fill": { "opacity": 0.88, "color": "rgba(238,245,255,0.28)" },
                "darkStroke": { "opacity": 0.88, "color": "rgba(2,3,7,0.98)", "lineWidthMinimum": 9, "lineWidthScale": 0.105 },
                "accentStroke": { "opacity": 0.96, "color": "rgba(255,30,43,0.98)", "lineWidthMinimum": 3.2, "lineWidthScale": 0.040, "shadowColor": "rgba(255,0,24,0.55)", "shadowBlurScale": 0.035 },
                "highlightStroke": { "scale": 0.94, "opacity": 0.52, "color": "rgba(245,250,255,0.98)", "lineWidthMinimum": 1.2, "lineWidthScale": 0.012 }
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
            "mask": { "ribbonWidthScale": 1.22, "ribbonColor": "rgba(0,0,0,0.99)", "ribbonOpacity": 1, "clearScale": 1.04, "headScale": 0.90, "headColor": "rgba(0,0,0,0.99)", "boundarySpokes": 12, "boundarySagScale": 0.76, "boundaryRotationRadians": -1.5707963267948966 },
            "body": { "blendMode": "screen", "color": "rgba(250,252,255,0.99)", "opacity": 0.84, "spreadScale": 0.36, "strandOffsets": [-1, 0, 1], "bucketCount": 6, "lineWidthMinimum": 1.2, "lineWidthScale": 0.008, "spreadBase": 0.72, "spreadLifeScale": 0.28, "crossbarEvery": 4, "crossbarBendScale": 0.12, "alphaBase": 0.06, "alphaLifeScale": 0.28 },
            "head": {
              "radiusScale": 0.90,
              "spokes": 12,
              "rings": 5,
              "rotationRadians": -1.5707963267948966,
              "ringSagScale": 0.78,
              "darkLayer": { "opacity": 0.50, "color": "rgba(3,4,8,0.96)", "lineWidthMinimum": 3.5, "lineWidthScale": 0.032 },
              "lightLayer": { "opacity": 0.86, "color": "rgba(250,252,255,0.99)", "lineWidthMinimum": 1.3, "lineWidthScale": 0.012 }
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
        "capabilities": ["trailSelection", "headSize", "trailPersistence", "effectIntensity", "glowStrength", "backgroundDimming", "performanceMode", "uiVisibility", "settingsButtonVisibility", "textCustomization"],
        "textFields": ["logoText", "logoSubText", "leftEyebrow", "leftTitle", "leftDesc", "buttonText", "rightEyebrow", "rightTitle", "rightDesc", "hintText"]
      },
      "assets": {
        "imageAtRest": "assets/images/spidey/base_optimized.webp",
        "imageInTrail": "assets/images/spidey/reveal_optimized.webp"
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
        "logoSubText": "WE ARE\u00a0·\u00a0VENOM",
        "leftEyebrow": "FRIENDLY NEIGHBORHOOD",
        "leftTitle": "SPIDER\nMAN",
        "leftDesc": "With great power comes great responsibility. Swinging through the concrete jungle of New York, protecting the innocent.",
        "buttonText": "THWIP",
        "rightEyebrow": "LETHAL PROTECTOR",
        "rightTitle": "VENOM",
        "rightDesc": "A twisted reflection born of alien sludge. We are hungry, we are angry, and we will protect our own.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      }
    },
    {
      "id": "brand-new-day",
      "themeName": "Brand New Day - Two Worlds",
      "type": "Cinematic Demo",
      "enabled": false,
      "developmentPreview": true,
      "release": { 
        "status": "staging", 
        "assetStatus": "placeholder",
        "livelyAssets": {
          "imageAtRest": "assets/images/brand-new-day/base_lively.webp",
          "imageInTrail": "assets/images/brand-new-day/reveal_lively.webp"
        } 
      },
      "interaction": {
        "baseTrailDurationMs": 850,
        "followRate": 16,
        "maxTrailPoints": 68,
        "headRadius": { "minimum": 130, "viewportScale": 0.24 },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": { "alphaExponent": 1.08, "tailWidthScale": 0.58, "lifeWidthScale": 0.42 },
        "reentryDistanceScale": 1.8,
        "sampling": { "minimumSpacing": 9, "maximumSpacing": 14, "headRadiusFactor": 0.09, "maxSamplesPerFrame": 32 }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": { "ribbonWidthScale": 1.52, "ribbonColor": "rgba(0,0,0,1)", "ribbonOpacity": 0.96, "headScale": 1, "headColor": "rgba(0,0,0,1)" },
            "glow": {
              "radiusScale": 1.45,
              "stops": [
                { "offset": 0, "color": "rgba(238,248,255,0.28)" },
                { "offset": 0.45, "color": "rgba(126,180,255,0.13)" },
                { "offset": 1, "color": "rgba(0,0,0,0)" }
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
            "mask": { "ribbonWidthScale": 1.22, "ribbonColor": "rgba(0,0,0,0.99)", "ribbonOpacity": 1, "clearScale": 1.04, "headScale": 0.90, "headColor": "rgba(0,0,0,0.99)", "boundarySpokes": 10, "boundarySagScale": 0.76, "boundaryRotationRadians": -1.5707963267948966 },
            "body": { "blendMode": "screen", "color": "rgba(232,240,255,0.96)", "opacity": 0.72, "spreadScale": 0.36, "strandOffsets": [-1, 0, 1], "bucketCount": 6, "lineWidthMinimum": 1.2, "lineWidthScale": 0.008, "spreadBase": 0.72, "spreadLifeScale": 0.28, "crossbarEvery": 4, "crossbarBendScale": 0.12, "alphaBase": 0.06, "alphaLifeScale": 0.28 },
            "head": {
              "radiusScale": 0.90,
              "spokes": 10,
              "rings": 4,
              "rotationRadians": -1.5707963267948966,
              "ringSagScale": 0.78,
              "darkLayer": { "opacity": 0.42, "color": "rgba(3,4,8,0.96)", "lineWidthMinimum": 3.5, "lineWidthScale": 0.032 },
              "lightLayer": { "opacity": 0.62, "color": "rgba(215,224,240,0.88)", "lineWidthMinimum": 1.3, "lineWidthScale": 0.012 },
              "eyeCommands": [
                ["M", -0.10, -0.08],
                ["C", -0.34, -0.42, -0.66, -0.57, -0.82, -0.48],
                ["C", -0.76, -0.12, -0.55, 0.20, -0.24, 0.29],
                ["C", -0.18, 0.12, -0.13, 0.01, -0.10, -0.08],
                ["Z"]
              ],
              "eyes": {
                "fill": { "opacity": 0.88, "color": "rgba(238,245,255,0.28)" },
                "darkStroke": { "opacity": 0.88, "color": "rgba(2,3,7,0.98)", "lineWidthMinimum": 9, "lineWidthScale": 0.105 },
                "accentStroke": { "opacity": 0.96, "color": "rgba(255,30,43,0.98)", "lineWidthMinimum": 3.2, "lineWidthScale": 0.040, "shadowColor": "rgba(255,0,24,0.55)", "shadowBlurScale": 0.035 },
                "highlightStroke": { "scale": 0.94, "opacity": 0.52, "color": "rgba(245,250,255,0.98)", "lineWidthMinimum": 1.2, "lineWidthScale": 0.012 }
              }
            }
          }
        }
      ],
      "settings": {
        "defaults": {
          "trailId": "masked-web",
          "headSize": 100,
          "trailPersistence": 72,
          "effectIntensity": 80,
          "glowStrength": 72,
          "backgroundDimming": 28,
          "performanceMode": "balanced",
          "showUi": true,
          "showSettingsButton": true
        },
        "capabilities": ["trailSelection", "headSize", "trailPersistence", "effectIntensity", "glowStrength", "backgroundDimming", "performanceMode", "uiVisibility", "settingsButtonVisibility", "textCustomization"],
        "textFields": ["logoText", "logoSubText", "leftEyebrow", "leftTitle", "leftDesc", "buttonText", "rightEyebrow", "rightTitle", "rightDesc", "hintText"]
      },
      "assets": {
        "imageAtRest": "assets/images/brand-new-day/base_optimized.webp",
        "imageInTrail": "assets/images/brand-new-day/reveal_optimized.webp"
      },
      "fonts": {
        "logo": "Montserrat",
        "title": "Oswald",
        "eyebrow": "Inter",
        "desc": "Cormorant Garamond"
      },
      "colors": {
        "primary": "#82B8FF",
        "secondary": "#E34A57",
        "logoColor": "#F4F8FF",
        "logoStroke": "2px #101827",
        "titleShadow": "2px 3px 0 #17243a, 0 0 18px rgba(108,169,255,0.38), 0 0 42px rgba(59,105,182,0.22)",
        "rightTitleShadow": "2px 3px 0 #36151a, 0 0 18px rgba(227,74,87,0.34), 0 0 42px rgba(130,184,255,0.20)"
      },
      "content": {
        "logoText": "BRAND NEW DAY",
        "logoSubText": "TWO WORLDS\u00a0·\u00a0ONE CHOICE",
        "leftEyebrow": "THE MAN",
        "leftTitle": "PETER\nPARKER",
        "leftDesc": "A quiet life beneath a city that no longer remembers his name.",
        "buttonText": "MOVE TOWARD THE LIGHT",
        "rightEyebrow": "THE HERO",
        "rightTitle": "SPIDER\nMAN",
        "rightDesc": "Even when the world forgets the man, the hero still remembers the city.",
        "hintText": "▸ MOVE ACROSS THE SCREEN ◂"
      }
    },
    {
      "id": "aeren-sol",
      "themeName": "Rift Garden - Aeren Sol",
      "type": "Original Science Fantasy",
      "enabled": false,
      "developmentPreview": true,
      "release": {
        "status": "staging",
        "assetStatus": "placeholder"
      },
      "interaction": {
        "baseTrailDurationMs": 760,
        "followRate": 16,
        "maxTrailPoints": 64,
        "headRadius": { "minimum": 130, "viewportScale": 0.24 },
        "headSizeFollowRate": 18,
        "headScaleBlendRadius": 1.9,
        "ribbon": { "alphaExponent": 1.12, "tailWidthScale": 0.56, "lifeWidthScale": 0.40 },
        "reentryDistanceScale": 1.8,
        "sampling": { "minimumSpacing": 9, "maximumSpacing": 14, "headRadiusFactor": 0.09, "maxSamplesPerFrame": 28 }
      },
      "motion": {
        "enabled": true,
        "parallax": {
          "overscanScale": 1.015,
          "pointerStrengthX": 3,
          "pointerStrengthY": 2,
          "ambientStrengthX": 0.5,
          "ambientStrengthY": 0.3,
          "followRate": 2.2
        },
        "deformation": {
          "enabled": false,
          "sourceType": "flattened-pair",
          "meshDensity": { "quality": 8, "balanced": 6, "low-power": 4 },
          "pointerResponse": 0.14,
          "pointerFollowRate": 3.2,
          "pointerDecayRate": 2.0,
          "restingProtectedAreas": [
            [[0.638, 0.215], [0.672, 0.215], [0.675, 0.302], [0.637, 0.310]],
            [[0.602, 0.548], [0.657, 0.548], [0.657, 0.936], [0.592, 0.936]],
            [[0.656, 0.535], [0.724, 0.535], [0.720, 0.936], [0.654, 0.936]],
            [[0, 0.922], [1, 0.922], [1, 1], [0, 1]]
          ],
          "revealedProtectedAreas": [
            [[0.600, 0.545], [0.665, 0.545], [0.663, 0.936], [0.592, 0.936]],
            [[0.662, 0.535], [0.722, 0.535], [0.720, 0.936], [0.660, 0.936]],
            [[0, 0.922], [1, 0.922], [1, 1], [0, 1]]
          ],
          "restingRegions": [
            {
              "id": "resting-braid",
              "material": "hair",
              "axis": "y",
              "anchor": "start",
              "points": [[0.626, 0.145], [0.641, 0.135], [0.651, 0.172], [0.650, 0.224], [0.661, 0.280], [0.655, 0.360], [0.637, 0.350], [0.641, 0.290], [0.631, 0.235], [0.621, 0.180]],
              "crossAmplitude": 0.0065,
              "alongAmplitude": 0.0010,
              "frequency": 4.4,
              "speed": 0.17,
              "phase": 0.4,
              "falloff": 1.35,
              "pointerInfluence": 0.24,
              "opacity": 1
            },
            {
              "id": "resting-left-outer-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.592, 0.450], [0.626, 0.444], [0.630, 0.575], [0.617, 0.704], [0.599, 0.821], [0.573, 0.894], [0.545, 0.869], [0.568, 0.785], [0.582, 0.661]],
              "crossAmplitude": 0.0115,
              "alongAmplitude": 0.0018,
              "frequency": 4.5,
              "speed": 0.13,
              "phase": 1.1,
              "falloff": 1.15,
              "pointerInfluence": 0.18,
              "opacity": 1
            },
            {
              "id": "resting-center-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.626, 0.445], [0.667, 0.443], [0.669, 0.612], [0.658, 0.756], [0.646, 0.827], [0.628, 0.788], [0.634, 0.647]],
              "crossAmplitude": 0.0095,
              "alongAmplitude": 0.0016,
              "frequency": 4.1,
              "speed": 0.14,
              "phase": 2.3,
              "falloff": 1.2,
              "pointerInfluence": 0.16,
              "opacity": 1
            },
            {
              "id": "resting-right-outer-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.687, 0.432], [0.714, 0.423], [0.731, 0.583], [0.742, 0.760], [0.728, 0.875], [0.708, 0.842], [0.700, 0.676]],
              "crossAmplitude": 0.0105,
              "alongAmplitude": 0.0017,
              "frequency": 4.3,
              "speed": 0.12,
              "phase": 3.1,
              "falloff": 1.15,
              "pointerInfluence": 0.17,
              "opacity": 1
            },
            {
              "id": "resting-left-garden",
              "material": "grass",
              "axis": "y",
              "anchor": "end",
              "points": [[0.048, 0.560], [0.070, 0.525], [0.087, 0.560], [0.095, 0.660], [0.084, 0.800], [0.070, 0.880], [0.047, 0.860], [0.056, 0.750], [0.044, 0.650]],
              "crossAmplitude": 0.0026,
              "alongAmplitude": 0.0003,
              "frequency": 3.2,
              "speed": 0.10,
              "phase": 0.8,
              "falloff": 1.55,
              "pointerInfluence": 0.08,
              "opacity": 1
            },
            {
              "id": "resting-center-garden",
              "material": "grass",
              "axis": "y",
              "anchor": "end",
              "points": [[0.455, 0.650], [0.476, 0.590], [0.499, 0.620], [0.508, 0.715], [0.501, 0.820], [0.486, 0.885], [0.462, 0.870], [0.469, 0.775], [0.448, 0.705]],
              "crossAmplitude": 0.0022,
              "alongAmplitude": 0.0003,
              "frequency": 3.0,
              "speed": 0.09,
              "phase": 2.0,
              "falloff": 1.6,
              "pointerInfluence": 0.07,
              "opacity": 1
            },
            {
              "id": "resting-right-garden",
              "material": "grass",
              "axis": "y",
              "anchor": "end",
              "points": [[0.838, 0.665], [0.857, 0.610], [0.880, 0.635], [0.890, 0.725], [0.884, 0.825], [0.868, 0.892], [0.844, 0.870], [0.850, 0.780], [0.830, 0.715]],
              "crossAmplitude": 0.0024,
              "alongAmplitude": 0.0003,
              "frequency": 3.3,
              "speed": 0.11,
              "phase": 3.4,
              "falloff": 1.55,
              "pointerInfluence": 0.08,
              "opacity": 1
            }
          ],
          "revealedRegions": [
            {
              "id": "ascendant-upper-braid",
              "material": "hair",
              "axis": "x",
              "anchor": "end",
              "points": [[0.490, 0.120], [0.525, 0.098], [0.565, 0.078], [0.606, 0.064], [0.629, 0.073], [0.622, 0.083], [0.586, 0.089], [0.547, 0.108], [0.510, 0.132], [0.487, 0.132]],
              "crossAmplitude": 0.0085,
              "alongAmplitude": 0.0012,
              "frequency": 4.8,
              "speed": 0.18,
              "phase": 0.2,
              "falloff": 1.25,
              "pointerInfluence": 0.24,
              "opacity": 1
            },
            {
              "id": "ascendant-middle-braid",
              "material": "hair",
              "axis": "x",
              "anchor": "end",
              "points": [[0.445, 0.173], [0.485, 0.140], [0.532, 0.115], [0.580, 0.096], [0.627, 0.091], [0.624, 0.104], [0.579, 0.111], [0.536, 0.129], [0.494, 0.155], [0.455, 0.184]],
              "crossAmplitude": 0.0095,
              "alongAmplitude": 0.0014,
              "frequency": 5.0,
              "speed": 0.16,
              "phase": 1.7,
              "falloff": 1.2,
              "pointerInfluence": 0.25,
              "opacity": 1
            },
            {
              "id": "ascendant-lower-braid",
              "material": "hair",
              "axis": "x",
              "anchor": "end",
              "points": [[0.389, 0.240], [0.430, 0.207], [0.475, 0.177], [0.525, 0.148], [0.577, 0.124], [0.625, 0.112], [0.622, 0.127], [0.581, 0.140], [0.532, 0.164], [0.482, 0.193], [0.438, 0.224], [0.398, 0.253]],
              "crossAmplitude": 0.0105,
              "alongAmplitude": 0.0015,
              "frequency": 5.3,
              "speed": 0.15,
              "phase": 2.8,
              "falloff": 1.15,
              "pointerInfluence": 0.26,
              "opacity": 1
            },
            {
              "id": "ascendant-left-outer-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.573, 0.431], [0.615, 0.443], [0.610, 0.555], [0.574, 0.686], [0.529, 0.784], [0.481, 0.858], [0.458, 0.822], [0.504, 0.742], [0.546, 0.622]],
              "crossAmplitude": 0.0130,
              "alongAmplitude": 0.0020,
              "frequency": 4.7,
              "speed": 0.13,
              "phase": 0.9,
              "falloff": 1.1,
              "pointerInfluence": 0.18,
              "opacity": 1
            },
            {
              "id": "ascendant-left-inner-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.605, 0.438], [0.646, 0.445], [0.640, 0.574], [0.615, 0.705], [0.585, 0.837], [0.548, 0.914], [0.526, 0.880], [0.561, 0.786], [0.588, 0.655]],
              "crossAmplitude": 0.0115,
              "alongAmplitude": 0.0018,
              "frequency": 4.4,
              "speed": 0.12,
              "phase": 2.1,
              "falloff": 1.15,
              "pointerInfluence": 0.17,
              "opacity": 1
            },
            {
              "id": "ascendant-center-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.635, 0.440], [0.675, 0.443], [0.674, 0.591], [0.658, 0.742], [0.638, 0.860], [0.606, 0.922], [0.587, 0.883], [0.617, 0.780]],
              "crossAmplitude": 0.0105,
              "alongAmplitude": 0.0017,
              "frequency": 4.2,
              "speed": 0.14,
              "phase": 3.0,
              "falloff": 1.18,
              "pointerInfluence": 0.16,
              "opacity": 1
            },
            {
              "id": "ascendant-right-inner-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.677, 0.435], [0.712, 0.437], [0.719, 0.585], [0.716, 0.737], [0.704, 0.855], [0.683, 0.818], [0.687, 0.665]],
              "crossAmplitude": 0.0100,
              "alongAmplitude": 0.0016,
              "frequency": 4.0,
              "speed": 0.13,
              "phase": 3.7,
              "falloff": 1.18,
              "pointerInfluence": 0.16,
              "opacity": 1
            },
            {
              "id": "ascendant-right-outer-fabric",
              "material": "fabric",
              "axis": "y",
              "anchor": "start",
              "points": [[0.704, 0.432], [0.742, 0.448], [0.758, 0.602], [0.775, 0.758], [0.753, 0.865], [0.730, 0.815], [0.721, 0.651]],
              "crossAmplitude": 0.0115,
              "alongAmplitude": 0.0018,
              "frequency": 4.3,
              "speed": 0.12,
              "phase": 4.5,
              "falloff": 1.12,
              "pointerInfluence": 0.17,
              "opacity": 1
            },
            {
              "id": "ascendant-left-garden",
              "material": "grass",
              "axis": "y",
              "anchor": "end",
              "points": [[0.048, 0.560], [0.070, 0.525], [0.087, 0.560], [0.095, 0.660], [0.084, 0.800], [0.070, 0.880], [0.047, 0.860], [0.056, 0.750], [0.044, 0.650]],
              "crossAmplitude": 0.0026,
              "alongAmplitude": 0.0003,
              "frequency": 3.2,
              "speed": 0.10,
              "phase": 1.2,
              "falloff": 1.55,
              "pointerInfluence": 0.08,
              "opacity": 1
            },
            {
              "id": "ascendant-right-garden",
              "material": "grass",
              "axis": "y",
              "anchor": "end",
              "points": [[0.838, 0.665], [0.857, 0.610], [0.880, 0.635], [0.890, 0.725], [0.884, 0.825], [0.868, 0.892], [0.844, 0.870], [0.850, 0.780], [0.830, 0.715]],
              "crossAmplitude": 0.0024,
              "alongAmplitude": 0.0003,
              "frequency": 3.3,
              "speed": 0.11,
              "phase": 3.8,
              "falloff": 1.55,
              "pointerInfluence": 0.08,
              "opacity": 1
            }
          ]
        },
        "atmosphere": {
          "petalCount": { "quality": 26, "balanced": 16, "low-power": 6 },
          "moteCount": { "quality": 34, "balanced": 22, "low-power": 10 },
          "constellationLinkCount": { "quality": 9, "balanced": 6, "low-power": 2 },
          "mistCount": { "quality": 3, "balanced": 2, "low-power": 0 },
          "speedScale": 0.78,
          "restingOpacity": 0.38,
          "revealedOpacity": 0.60,
          "starseed": { "x": 0.650, "y": 0.270, "radiusScale": 0.055 }
        }
      },
      "trails": [
        {
          "id": "minimal-reveal",
          "name": "MINIMAL REVEAL",
          "renderer": "minimalReveal",
          "role": "minimal",
          "style": {
            "mask": { "ribbonWidthScale": 1.46, "ribbonColor": "rgba(0,0,0,1)", "ribbonOpacity": 0.94, "headScale": 1, "headColor": "rgba(0,0,0,1)" },
            "glow": {
              "radiusScale": 1.40,
              "stops": [
                { "offset": 0, "color": "rgba(220,255,250,0.34)" },
                { "offset": 0.48, "color": "rgba(91,220,222,0.20)" },
                { "offset": 0.76, "color": "rgba(230,188,102,0.10)" },
                { "offset": 1, "color": "rgba(0,0,0,0)" }
              ]
            }
          }
        },
        {
          "id": "starbloom-trail",
          "name": "STARBLOOM COMET",
          "renderer": "gearPi",
          "role": "signature",
          "style": {
            "mask": {
              "ribbonWidthScale": 1.35,
              "ribbonColor": "rgba(0,0,0,1)",
              "ribbonOpacity": 1,
              "cloudScale": 0.9,
              "cloudColor": "rgba(0,0,0,1)",
              "cloudCommands": [["M", 0, -1.4], ["C", 0.15, -0.4, 0.4, -0.15, 1.4, 0], ["C", 0.4, 0.15, 0.15, 0.4, 0, 1.4], ["C", -0.15, 0.4, -0.4, 0.15, -1.4, 0], ["C", -0.4, -0.15, -0.15, -0.4, 0, -1.4], ["Z"]]
            },
            "overlay": {
              "blendMode": "screen",
              "ribbonLayers": [{ "widthScale": 1.8, "color": "rgba(91,220,222,0.4)", "opacity": 0.25 }, { "widthScale": 0.8, "color": "rgba(255,255,255,1.0)", "opacity": 0.8 }],
              "cloudLayers": [{ "scale": 1.7, "color": "rgba(91,220,222,0.3)", "opacity": 0.2 }, { "scale": 0.9, "color": "rgba(230,188,102,0.7)", "opacity": 0.5 }, { "scale": 0.35, "color": "rgba(255,255,255,1.0)", "opacity": 1.0 }]
            },
            "glow": {
              "radiusScale": 2.2,
              "stops": [{ "offset": 0, "color": "rgba(255,255,255,0.7)" }, { "offset": 0.12, "color": "rgba(220,255,250,0.5)" }, { "offset": 0.25, "color": "rgba(230,188,102,0.25)" }, { "offset": 0.40, "color": "rgba(91,220,222,0.2)" }, { "offset": 0.75, "color": "rgba(50,150,200,0.08)" }, { "offset": 1, "color": "rgba(0,0,0,0)" }]
            }
          }
        }
      ],
      "settings": {
        "trailDefaultRevision": "starbloom-v1",
        "defaults": {
          "trailId": "starbloom-trail",
          "headSize": 100,
          "trailPersistence": 90,
          "effectIntensity": 100,
          "glowStrength": 95,
          "backgroundDimming": 25,
          "performanceMode": "balanced",
          "artworkMotion": true,
          "showUi": true,
          "showSettingsButton": true
        },
        "capabilities": ["trailSelection", "headSize", "trailPersistence", "effectIntensity", "glowStrength", "backgroundDimming", "performanceMode", "artworkMotion", "uiVisibility", "settingsButtonVisibility", "textCustomization"],
        "textFields": ["logoText", "logoSubText", "leftEyebrow", "leftTitle", "leftDesc", "buttonText", "rightEyebrow", "rightTitle", "rightDesc", "hintText"]
      },
      "assets": {
        "imageAtRest": "assets/images/aeren-sol/base_optimized.webp",
        "imageInTrail": "assets/images/aeren-sol/reveal_optimized.webp"
      },
      "fonts": {
        "logo": "Marcellus",
        "title": "Saira Condensed",
        "eyebrow": "Rajdhani",
        "desc": "Alegreya Sans"
      },
      "colors": {
        "primary": "#78E7E0",
        "secondary": "#E4BE72",
        "logoColor": "#EAF7F4",
        "logoStroke": "1px rgba(8,20,31,0.92)",
        "titleShadow": "2px 3px 0 #142338, 0 0 18px rgba(82,208,211,0.34), 0 0 42px rgba(82,208,211,0.18)",
        "rightTitleShadow": "2px 3px 0 #2e2519, 0 0 18px rgba(228,190,114,0.30), 0 0 42px rgba(117,231,224,0.16)"
      },
      "content": {
        "logoText": "RIFT GARDEN",
        "logoSubText": "THE ASH MERIDIAN · MERIDIAN CONVERGENCE",
        "leftEyebrow": "THE RIFT GARDENER",
        "leftTitle": "AEREN\nSOL",
        "leftDesc": "A world can be restored. The life it replaces may never know it was lost.",
        "buttonText": "OPEN THE MERIDIAN",
        "rightEyebrow": "THE STARSEED REMEMBERS",
        "rightTitle": "TWO\nHISTORIES",
        "rightDesc": "Every root carries a memory. Every bloom asks which world deserves to remain.",
        "hintText": "▸ GUIDE THE STARSEED BETWEEN HISTORIES ◂"
      }
    }
  ]
};
