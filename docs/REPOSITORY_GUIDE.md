# Repository guide

## Website

`website/` contains the latest frontend copied from the project's `claude` folder. The original workspace folder name describes its development provenance; it is organised here by purpose. Its `js/` directory contains normal files, not a submodule.

Routes use URL hashes, so the site can run on GitHub Pages without server-side routing. Start at `website/index.html` through a local HTTP server or the published preview.

## Wallpaper engine

`wallpapers/index.html` and `wallpapers/assets/data/config.js` retain their existing relative structure. Optimised runtime images are included for the configured themes. A motion-region JSON fixture is retained only because an existing test reads it; this does not enable the unfinished layer-animation system.

## Historical packages

`wallpapers/release/browser/` contains standalone browser examples. `wallpapers/release/lively/packages/` contains the original Lively ZIP examples. The unpacked Lively folders are retained for inspection and tests, not as installation targets.

The current development source and these historical packages are deliberately different versions. Do not rebuild the old packages merely to make their source match the development engine.

## What is not included

The full local development archive remains separate. This public hub excludes private AI conversations, migration/checkpoint records, local machine configuration, repository histories, credentials, vendor executables, large editable artwork masters, rejected experiments and duplicate old website versions.

This is a curated snapshot for review, not a replacement backup of the entire local project.
