const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const themeId = process.argv[2];
if (!themeId) {
  throw new Error('Usage: node tools/build_browser_release.js <theme-id>');
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(themeId)) {
  throw new Error(`Unsafe theme id: ${themeId}`);
}

const root = path.resolve(__dirname, '..');
const sourceConfigPath = path.join(root, 'assets', 'data', 'config.js');
const validatorPath = path.join(root, 'tools', 'validate_wallpaper.js');
const context = {};

function validateProject(projectPath) {
  childProcess.execFileSync(
    process.execPath,
    [validatorPath, projectPath],
    { stdio: 'inherit' },
  );
}

validateProject(root);

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync(sourceConfigPath, 'utf8')};` +
    'globalThis.__config=APP_CONFIG',
  context,
);

const sourceConfig = context.__config;
const sourceTheme = sourceConfig.themes.find((theme) => theme.id === themeId);
if (!sourceTheme) {
  throw new Error(`Unknown theme: ${themeId}`);
}
if (sourceTheme.release?.status !== 'ready' || sourceTheme.release?.assetStatus !== 'final') {
  throw new Error(
    `Theme ${themeId} is not release ready. Replace placeholder artwork and mark it ready/final before packaging.`,
  );
}

function resolveWorkspaceFile(relativePath, label) {
  if (typeof relativePath !== 'string' || !relativePath) {
    throw new Error(`${label} is missing.`);
  }
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes('..')) {
    throw new Error(`Unsafe ${label}: ${relativePath}`);
  }
  const resolvedPath = path.resolve(root, relativePath);
  const workspaceRelativePath = path.relative(root, resolvedPath);
  if (!workspaceRelativePath || workspaceRelativePath.startsWith('..') || path.isAbsolute(workspaceRelativePath)) {
    throw new Error(`Unsafe ${label}: ${relativePath}`);
  }
  if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    throw new Error(`Missing ${label}: ${resolvedPath}`);
  }
  if (path.extname(resolvedPath).toLowerCase() !== '.webp') {
    throw new Error(`${label} must be a WebP file: ${relativePath}`);
  }

  const realWorkspacePath = fs.realpathSync(root);
  const realAssetPath = fs.realpathSync(resolvedPath);
  const realRelativePath = path.relative(realWorkspacePath, realAssetPath);
  if (!realRelativePath || realRelativePath.startsWith('..') || path.isAbsolute(realRelativePath)) {
    throw new Error(`Unsafe ${label}: ${relativePath}`);
  }
  return resolvedPath;
}

const sourceBase = resolveWorkspaceFile(
  sourceTheme.assets?.imageAtRest,
  'browser imageAtRest',
);
const sourceReveal = resolveWorkspaceFile(
  sourceTheme.assets?.imageInTrail,
  'browser imageInTrail',
);

const releaseRoot = path.join(root, 'release', 'browser');
const outputRoot = path.join(releaseRoot, themeId);
const stagingRoot = path.join(releaseRoot, `.${themeId}.staging`);
const backupRoot = path.join(releaseRoot, `.${themeId}.backup`);

function assertReleaseChild(targetPath) {
  const relativePath = path.relative(releaseRoot, path.resolve(targetPath));
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe browser release path: ${targetPath}`);
  }
}

for (const targetPath of [outputRoot, stagingRoot, backupRoot]) {
  assertReleaseChild(targetPath);
}

const stagingImageDirectory = path.join(stagingRoot, 'assets', 'images');
const stagingDataDirectory = path.join(stagingRoot, 'assets', 'data');

const packageRelativeFiles = [
  'index.html',
  'assets/data/config.js',
  'assets/images/base.webp',
  'assets/images/reveal.webp',
].sort();

function listRelativeFiles(directoryPath) {
  const files = [];
  const pending = [directoryPath];
  while (pending.length) {
    const currentPath = pending.pop();
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Browser package must not contain a symlink: ${entryPath}`);
      }
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (entry.isFile()) {
        files.push(path.relative(directoryPath, entryPath).split(path.sep).join('/'));
      } else {
        throw new Error(`Unsupported package entry: ${entryPath}`);
      }
    }
  }
  return files.sort();
}

function assertExactFiles(actualFiles, label) {
  const actual = [...actualFiles].sort();
  if (actual.length !== packageRelativeFiles.length ||
      !actual.every((filePath, index) => filePath === packageRelativeFiles[index])) {
    throw new Error(
      `${label} contains unexpected or missing files.\n` +
      `Expected: ${packageRelativeFiles.join(', ')}\n` +
      `Actual: ${actual.join(', ')}`,
    );
  }
}

const releaseTheme = JSON.parse(JSON.stringify(sourceTheme));
releaseTheme.assets = {
  imageAtRest: 'assets/images/base.webp',
  imageInTrail: 'assets/images/reveal.webp',
};
if (releaseTheme.release) {
  delete releaseTheme.release.livelyAssets;
}

const configuredPixelBudget = Number(sourceConfig.settings?.maxRenderPixels);
const safePixelBudget = Math.min(
  Number.isFinite(configuredPixelBudget) && configuredPixelBudget > 0
    ? configuredPixelBudget
    : 2560 * 1440,
  2560 * 1440,
);
const releaseConfig = {
  build: {
    mode: 'customer',
    platform: 'browser',
    edition: 'premium',
  },
  settings: {
    ...sourceConfig.settings,
    defaultThemeId: themeId,
    showThemeSwitcher: false,
    showSettingsPanel: true,
    persistSettings: true,
    maxRenderPixels: safePixelBudget,
  },
  controls: JSON.parse(JSON.stringify(sourceConfig.controls)),
  themes: [releaseTheme],
};

fs.mkdirSync(releaseRoot, { recursive: true });
fs.rmSync(stagingRoot, { recursive: true, force: true });
fs.mkdirSync(stagingImageDirectory, { recursive: true });
fs.mkdirSync(stagingDataDirectory, { recursive: true });

let promoted = false;
try {
  fs.copyFileSync(path.join(root, 'index.html'), path.join(stagingRoot, 'index.html'));
  fs.copyFileSync(sourceBase, path.join(stagingImageDirectory, 'base.webp'));
  fs.copyFileSync(sourceReveal, path.join(stagingImageDirectory, 'reveal.webp'));
  fs.writeFileSync(
    path.join(stagingDataDirectory, 'config.js'),
    `const APP_CONFIG = ${JSON.stringify(releaseConfig, null, 2)};\n`,
    'utf8',
  );

  const livelyPropertiesPath = path.join(stagingRoot, 'LivelyProperties.json');
  if (fs.existsSync(livelyPropertiesPath)) {
    throw new Error('A customer browser package must not contain LivelyProperties.json.');
  }

  validateProject(stagingRoot);

  fs.rmSync(backupRoot, { recursive: true, force: true });
  const hadPreviousRelease = fs.existsSync(outputRoot);
  if (hadPreviousRelease) {
    fs.renameSync(outputRoot, backupRoot);
  }
  try {
    fs.renameSync(stagingRoot, outputRoot);
  } catch (error) {
    if (!fs.existsSync(outputRoot) && fs.existsSync(backupRoot)) {
      fs.renameSync(backupRoot, outputRoot);
    }
    throw error;
  }
  promoted = true;
  try {
    fs.rmSync(backupRoot, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Built the new package, but could not remove ${backupRoot}: ${error.message}`);
  }
} finally {
  if (!promoted) {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

assertExactFiles(listRelativeFiles(outputRoot), 'Browser package directory');
const packageFiles = packageRelativeFiles.map((relativePath) =>
  path.join(outputRoot, ...relativePath.split('/')));
const totalBytes = packageFiles.reduce(
  (total, filePath) => total + fs.statSync(filePath).size,
  0,
);

console.log(`Built ${outputRoot}`);
console.log(`Core package size: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
