const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const themeId = process.argv[2] || 'luffy-gear5';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(themeId)) {
  throw new Error(`Unsafe theme id: ${themeId}`);
}

const root = path.resolve(__dirname, '..');
const validatorPath = path.join(root, 'tools', 'validate_wallpaper.js');
const context = {};

function validateProject(projectPath) {
  const result = spawnSync(
    process.execPath,
    [validatorPath, projectPath],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Wallpaper validation failed for ${projectPath}.`);
  }
}

function resolveWorkspaceWebp(relativePath, label) {
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

validateProject(root);

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync(path.join(root, 'assets/data/config.js'), 'utf8')};` +
    'globalThis.__config=APP_CONFIG',
  context,
);

const sourceConfig = context.__config;
const sourceTheme = sourceConfig.themes.find((theme) => theme.id === themeId);
if (!sourceTheme) {
  throw new Error(`Unknown theme: ${themeId}`);
}
if (sourceTheme.enabled === false) {
  throw new Error(`Theme ${themeId} is disabled and cannot be packaged.`);
}
if (sourceTheme.release?.status !== 'ready' || sourceTheme.release?.assetStatus !== 'final') {
  throw new Error(
    `Theme ${themeId} is not release ready. Replace placeholder artwork and mark it ready/final before packaging.`,
  );
}

const defaultTrailId = sourceTheme.settings?.defaults?.trailId;
if (!defaultTrailId || !sourceTheme.trails?.some((trail) => trail.id === defaultTrailId)) {
  throw new Error(`Theme ${themeId} has an invalid settings.defaults.trailId.`);
}

const livelyAssets = sourceTheme.release?.livelyAssets;
if (!livelyAssets?.imageAtRest || !livelyAssets?.imageInTrail) {
  throw new Error(`Theme ${themeId} is missing explicit Lively image slots.`);
}
const sourceBase = resolveWorkspaceWebp(livelyAssets.imageAtRest, 'Lively imageAtRest');
const sourceReveal = resolveWorkspaceWebp(livelyAssets.imageInTrail, 'Lively imageInTrail');

const releaseRoot = path.join(root, 'release', 'lively');
const outputRoot = path.join(releaseRoot, themeId);
const stagingRoot = path.join(releaseRoot, `.${themeId}.staging`);
const backupRoot = path.join(releaseRoot, `.${themeId}.backup`);
const archiveRoot = path.join(releaseRoot, 'packages');
const archivePath = path.join(archiveRoot, `${themeId}.zip`);
const archiveStagingPath = path.join(archiveRoot, `.${themeId}.zip.staging`);

const packageRelativeFiles = [
  'index.html',
  'LivelyInfo.json',
  'LivelyProperties.json',
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
  if (actual.some((filePath) => filePath.split('/').includes('.git'))) {
    throw new Error(`${label} must never contain repository data.`);
  }
}

function powershellLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runPowerShell(script, label) {
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed: ${(result.stderr || result.stdout || '').trim()}`);
  }
  return result.stdout;
}

function createLivelyArchive(sourceDirectory, destinationPath) {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    'Add-Type -AssemblyName System.IO.Compression.FileSystem',
    `[System.IO.Compression.ZipFile]::CreateFromDirectory(${powershellLiteral(sourceDirectory)}, ${powershellLiteral(destinationPath)}, [System.IO.Compression.CompressionLevel]::Optimal, $false)`,
  ].join('; ');
  runPowerShell(script, 'Lively archive creation');
}

function listArchiveFiles(archiveFilePath) {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    'Add-Type -AssemblyName System.IO.Compression.FileSystem',
    `$archive = [System.IO.Compression.ZipFile]::OpenRead(${powershellLiteral(archiveFilePath)})`,
    "try { $archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName } } finally { $archive.Dispose() }",
  ].join('; ');
  return runPowerShell(script, 'Lively archive inspection')
    .split(/\r?\n/)
    .map((entry) => entry.trim().replace(/\\/g, '/'))
    .filter(Boolean)
    .sort();
}

function assertReleaseChild(targetPath) {
  const relativePath = path.relative(releaseRoot, path.resolve(targetPath));
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe Lively release path: ${targetPath}`);
  }
}

for (const targetPath of [outputRoot, stagingRoot, backupRoot, archiveRoot, archivePath, archiveStagingPath]) {
  assertReleaseChild(targetPath);
}

const stagingImageDirectory = path.join(stagingRoot, 'assets', 'images');
const stagingDataDirectory = path.join(stagingRoot, 'assets', 'data');

const releaseTheme = JSON.parse(JSON.stringify(sourceTheme));
releaseTheme.enabled = true;
releaseTheme.assets = {
  imageAtRest: 'assets/images/base.webp',
  imageInTrail: 'assets/images/reveal.webp',
};
releaseTheme.release.livelyAssets = {
  imageAtRest: 'assets/images/base.webp',
  imageInTrail: 'assets/images/reveal.webp',
};

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
    platform: 'lively',
    edition: 'premium',
  },
  settings: {
    ...sourceConfig.settings,
    defaultThemeId: themeId,
    showThemeSwitcher: false,
    showSettingsPanel: false,
    persistSettings: false,
    maxRenderPixels: safePixelBudget,
  },
  controls: JSON.parse(JSON.stringify(sourceConfig.controls)),
  themes: [releaseTheme],
};

function encodeLivelyTextboxValue(value, definition) {
  if (typeof value !== 'string') {
    throw new Error(`Lively text default ${definition.propertyName} must be a string.`);
  }
  const normalized = value.replace(/\r\n?/g, '\n');
  return definition.multiline ? normalized.replace(/\n/g, '\\n') : normalized;
}

function getLivelyTextHelp(definition) {
  const parts = [`Maximum ${definition.maxLength} characters.`];
  if (definition.multiline) {
    parts.push(`Type \\n for a new line (up to ${definition.maxLines} lines).`);
  }
  return parts.join(' ');
}

const capabilities = new Set(releaseTheme.settings?.capabilities || []);
const defaults = releaseTheme.settings?.defaults || {};
const livelyProperties = {};
if (capabilities.has('uiVisibility')) {
  livelyProperties.showUi = {
    type: 'checkbox',
    value: defaults.showUi !== false,
    text: 'Show interface',
    help: 'Show or hide the title, descriptions, and interaction hint.',
  };
}
if (capabilities.has('artworkMotion')) {
  livelyProperties.artworkMotion = {
    type: 'checkbox',
    value: defaults.artworkMotion !== false,
    text: 'Living artwork',
    help: 'Animate the artwork with parallax and atmospheric motion. Turn off for static artwork.',
  };
}
if (capabilities.has('trailSelection') && releaseTheme.trails.length > 1) {
  livelyProperties.trailId = {
    type: 'dropdown',
    value: releaseTheme.trails.findIndex((trail) => trail.id === defaults.trailId),
    text: 'Trail',
    items: releaseTheme.trails.map((trail) => trail.name),
  };
}
const sliderLabels = {
  headSize: 'Trail head size',
  trailPersistence: 'Trail persistence',
  effectIntensity: 'Effect intensity',
  glowStrength: 'Glow strength',
  backgroundDimming: 'Background dimming',
};
for (const [controlName, text] of Object.entries(sliderLabels)) {
  if (!capabilities.has(controlName)) continue;
  const definition = releaseConfig.controls[controlName];
  livelyProperties[controlName] = {
    type: 'slider',
    value: defaults[controlName],
    min: definition.min,
    max: definition.max,
    step: definition.step,
    text,
  };
}
if (capabilities.has('performanceMode')) {
  const options = releaseConfig.controls.performanceMode.options;
  livelyProperties.performanceMode = {
    type: 'dropdown',
    value: options.indexOf(defaults.performanceMode),
    text: 'Performance',
    items: options.map((option) => option.replace(/-/g, ' ')),
  };
}
if (capabilities.has('textCustomization')) {
  const textFieldDefinitions = releaseConfig.controls?.textFields;
  const supportedTextFields = releaseTheme.settings?.textFields;
  if (!textFieldDefinitions || typeof textFieldDefinitions !== 'object' || Array.isArray(textFieldDefinitions)) {
    throw new Error(`Theme ${themeId} cannot expose text customization without controls.textFields.`);
  }
  if (!Array.isArray(supportedTextFields) || supportedTextFields.length === 0) {
    throw new Error(`Theme ${themeId} cannot expose text customization without settings.textFields.`);
  }

  livelyProperties.customTextSection = {
    type: 'label',
    value: 'Custom text',
  };
  for (const fieldId of supportedTextFields) {
    const definition = textFieldDefinitions[fieldId];
    if (!definition) {
      throw new Error(`Theme ${themeId} references unknown text field ${fieldId}.`);
    }
    const propertyName = definition.propertyName;
    if (Object.hasOwn(livelyProperties, propertyName)) {
      throw new Error(`Duplicate Lively property name: ${propertyName}`);
    }
    livelyProperties[propertyName] = {
      type: 'textbox',
      value: encodeLivelyTextboxValue(releaseTheme.content[fieldId], definition),
      text: definition.label,
      help: getLivelyTextHelp(definition),
    };
  }
}

const livelyInfo = {
  AppVersion: '1.0.0.0',
  Title: releaseTheme.themeName,
  Thumbnail: 'assets/images/base.webp',
  Preview: null,
  Desc: `Interactive ${releaseTheme.type} wallpaper with themed cursor trails.`,
  Author: 'Dhairya Lukha',
  License: null,
  Contact: '',
  Type: 1,
  FileName: 'index.html',
  Arguments: null,
  IsAbsolutePath: false,
  Id: releaseTheme.id,
  Tags: [releaseTheme.type, 'Interactive', 'Cursor Trail'],
  Version: 1,
};

fs.mkdirSync(releaseRoot, { recursive: true });
fs.mkdirSync(archiveRoot, { recursive: true });
const realReleaseRoot = fs.realpathSync(releaseRoot);
const realReleaseRelativePath = path.relative(fs.realpathSync(root), realReleaseRoot);
if (!realReleaseRelativePath || realReleaseRelativePath.startsWith('..') || path.isAbsolute(realReleaseRelativePath)) {
  throw new Error(`Unsafe Lively release root: ${releaseRoot}`);
}
if (!fs.existsSync(outputRoot) && fs.existsSync(backupRoot)) {
  fs.renameSync(backupRoot, outputRoot);
}
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
  fs.writeFileSync(
    path.join(stagingRoot, 'LivelyProperties.json'),
    `${JSON.stringify(livelyProperties, null, 2)}\n`,
    'utf8',
  );
  fs.writeFileSync(
    path.join(stagingRoot, 'LivelyInfo.json'),
    `${JSON.stringify(livelyInfo, null, 2)}\n`,
    'utf8',
  );

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

assertExactFiles(listRelativeFiles(outputRoot), 'Lively package directory');
fs.rmSync(archiveStagingPath, { force: true });
try {
  createLivelyArchive(outputRoot, archiveStagingPath);
  assertExactFiles(listArchiveFiles(archiveStagingPath), 'Lively customer archive');
  fs.rmSync(archivePath, { force: true });
  fs.renameSync(archiveStagingPath, archivePath);
} finally {
  fs.rmSync(archiveStagingPath, { force: true });
}

const packageFiles = packageRelativeFiles.map((relativePath) =>
  path.join(outputRoot, ...relativePath.split('/')));
const totalBytes = packageFiles.reduce(
  (total, filePath) => total + fs.statSync(filePath).size,
  0,
);

console.log(`Built ${outputRoot}`);
console.log(`Built customer archive ${archivePath}`);
console.log(`Core package size: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
