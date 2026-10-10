# Wallpaper Hub

### Interactive wallpapers, built through an AI-assisted development workflow

**A personal project by Dhairya Lukha.** Move the pointer across a scene to reveal a second artwork state. The project combines a configurable wallpaper engine, packaged browser and Lively examples, and a studio-website frontend.

[**Open the live website →**](https://dhairya-web.github.io/wallpaper-hub/website/) · [Try the wallpaper engine](https://dhairya-web.github.io/wallpaper-hub/wallpapers/) · [Project status](docs/PROJECT_STATUS.md) · [My contribution](docs/AI_WORKFLOW.md)

![Aeren Sol development-preview artwork](website/assets/derived/aeren-sol-base-1280.webp)

*Aeren Sol is an original-world concept under development. Artwork and implementation were developed with AI assistance; this is not a finished commercial release.*

## Start here

| What to explore | What it demonstrates |
| --- | --- |
| [Interactive website](https://dhairya-web.github.io/wallpaper-hub/website/) | Live artwork reveals, responsive page layouts, a catalogue and a multi-step brief-form prototype. |
| [Wallpaper engine](https://dhairya-web.github.io/wallpaper-hub/wallpapers/) | Theme switching, configurable trails, appearance controls, saved preferences and custom text. |
| [Browser examples](wallpapers/release/browser/) | Three preserved, single-theme browser packages. |
| [Lively examples](wallpapers/release/lively/packages/) | Existing six-file wallpaper ZIP packages, separate from the source workspace. |
| [Development approach](docs/AI_WORKFLOW.md) | The distinction between my product direction and review, and AI-generated implementation and artwork. |

## Why I made it

This was my first substantial project. I wanted a wallpaper that reacts to the person using it, rather than a still image or a continuously playing video. It began with a One Piece-inspired reveal study and grew into a shared engine, multiple themes and a website frontend.

I use AI to help build and refine the work. My contribution is choosing the direction, evaluating the results and asking for corrections. This portfolio is evidence of that process, not a claim that I independently wrote all the code or manually illustrated the artwork.

## What is included

```text
wallpaper-hub/
├── website/             Latest website frontend from the Claude workspace
├── wallpapers/          Shared engine and runtime assets
│   ├── assets/          Theme configuration and optimised artwork
│   ├── release/         Preserved browser and Lively examples
│   └── tools/           Validators, tests and build utilities
├── docs/                Scope, status, attribution and verification notes
└── .github/workflows/   Automated verification
```

This is a curated project hub, not a dump of the working directory. Private conversations, local settings, credentials, backup histories, vendor binaries, rejected experiments and large artwork-editing masters are not included. The original working folder is preserved separately.

## Current limits

- The website is a **frontend prototype**, not a live business. The brief form sends nothing, and there is no payment system or order processing.
- Aeren Sol and Brand New Day remain development previews. Their presence is not a completed-product claim.
- The three packaged examples are preserved historical builds. They were not silently rebuilt from the newer development engine for this portfolio.
- Wallpaper Engine support is planned, not implemented or verified.
- Some artwork depicts existing franchise characters. Those examples are labelled fan/demo studies; no official affiliation or ownership of those characters is claimed.
- Automated tests do not establish current real-device performance, universal browser compatibility or commercial readiness.

See [project status](docs/PROJECT_STATUS.md), [verification](docs/VERIFICATION.md) and [attribution](docs/ATTRIBUTION.md) for the boundaries.

## Run locally

With Node.js installed, run this from the repository root:

```sh
node tools/serve.js
```

Open `http://127.0.0.1:8765/website/` for the website or `/wallpapers/` for the engine. No package installation is required for these static previews. Fonts are requested from Google Fonts and Fontshare; system-font fallbacks are provided.

The source/package test matrix uses PowerShell and currently runs on Windows:

```sh
node wallpapers/tools/validate_wallpaper.js wallpapers
node --test wallpapers/tools/test_config_package_matrix.js wallpapers/tools/test_trail_v2_production.js
```

For Lively, import only an individual ZIP from `wallpapers/release/lively/packages/`. **Do not import this repository, the website folder or an unpacked source folder into Lively.**
