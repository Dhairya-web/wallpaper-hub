const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const sourceConfigPath = path.join(projectRoot, 'assets', 'data', 'config.js');
const sourceIndexPath = path.join(projectRoot, 'index.html');
const validatorPath = path.join(projectRoot, 'tools', 'validate_wallpaper.js');
const livelyReleaseRoot = path.join(projectRoot, 'release', 'lively');
const browserReleaseRoot = path.join(projectRoot, 'release', 'browser');
const livelyPackageRoot = path.join(livelyReleaseRoot, 'packages');
const PRESERVED_STATE_A_INDEX_SHA256 = '479C31A0752E58D249AE6872160E7D82C4770983FE28AE559079E178EDCF322C';

const LIVELY_PACKAGE_FILES = [
  'index.html',
  'LivelyInfo.json',
  'LivelyProperties.json',
  'assets/data/config.js',
  'assets/images/base.webp',
  'assets/images/reveal.webp',
].sort();
const BROWSER_PACKAGE_FILES = [
  'index.html',
  'assets/data/config.js',
  'assets/images/base.webp',
  'assets/images/reveal.webp',
].sort();

function assertNoAuthoringLayerReferences(configPath, label) {
  const source = fs.readFileSync(configPath, 'utf8');
  assert.doesNotMatch(
    source,
    /layerPack|motion-regions|cutouts-source|assets[\\/]characters[\\/]/i,
    `${label} config must not expose development-only layer-authoring paths or metadata`,
  );
}

function powershellLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function listZipFiles(zipPath) {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    'Add-Type -AssemblyName System.IO.Compression.FileSystem',
    `$archive = [System.IO.Compression.ZipFile]::OpenRead(${powershellLiteral(zipPath)})`,
    "try { $archive.Entries | Where-Object { $_.Name } | ForEach-Object { $_.FullName } } finally { $archive.Dispose() }",
  ].join('; ');
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    { encoding: 'utf8', windowsHide: true },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout
    .split(/\r?\n/)
    .map((entry) => entry.trim().replace(/\\/g, '/'))
    .filter(Boolean)
    .sort();
}

function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
}

function hashZipEntry(zipPath, entryName) {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    'Add-Type -AssemblyName System.IO.Compression.FileSystem',
    '$archive = [System.IO.Compression.ZipFile]::OpenRead(' + powershellLiteral(zipPath) + ')',
    '$entry = $archive.GetEntry(' + powershellLiteral(entryName) + ')',
    "if ($null -eq $entry) { throw 'ZIP entry is missing' }",
    '$stream = $entry.Open()',
    '$sha = [System.Security.Cryptography.SHA256]::Create()',
    "try { $hash = $sha.ComputeHash($stream); [System.BitConverter]::ToString($hash).Replace('-', '') } finally { $sha.Dispose(); $stream.Dispose(); $archive.Dispose() }",
  ].join('; ');
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', script],
    { encoding: 'utf8', windowsHide: true },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim().toUpperCase();
}

function listRelativeFiles(directoryPath) {
  const files = [];
  const pending = [directoryPath];
  while (pending.length) {
    const currentPath = pending.pop();
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      assert.equal(entry.isSymbolicLink(), false, `Package contains a symlink: ${entryPath}`);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile()) files.push(path.relative(directoryPath, entryPath).split(path.sep).join('/'));
      else assert.fail(`Unsupported package entry: ${entryPath}`);
    }
  }
  return files.sort();
}

const ACTIVE_THEME_IDS = ['luffy-gear5', 'cyberpunk-neon', 'spider-venom'];
const COMMON_DEFAULTS = {
  headSize: 100,
  trailPersistence: 100,
  effectIntensity: 100,
  glowStrength: 100,
  backgroundDimming: 42,
  performanceMode: 'balanced',
  showUi: true,
  showSettingsButton: true,
};
const COMMON_CAPABILITIES = [
  'headSize',
  'trailPersistence',
  'effectIntensity',
  'glowStrength',
  'backgroundDimming',
  'performanceMode',
  'uiVisibility',
  'settingsButtonVisibility',
  'textCustomization',
];
const COMMON_INTERACTION = {
  baseTrailDurationMs: 850,
  followRate: 16,
  maxTrailPoints: 68,
  headRadius: { minimum: 130, viewportScale: 0.24 },
  headSizeFollowRate: 18,
  headScaleBlendRadius: 1.9,
  ribbon: {
    alphaExponent: 1.08,
    tailWidthScale: 0.58,
    lifeWidthScale: 0.42,
  },
  reentryDistanceScale: 1.8,
  sampling: {
    minimumSpacing: 9,
    maximumSpacing: 14,
    headRadiusFactor: 0.09,
    maxSamplesPerFrame: 32,
  },
};
const NUMERIC_CONTROLS = [
  'headSize',
  'trailPersistence',
  'effectIntensity',
  'glowStrength',
  'backgroundDimming',
];
const TEXT_FIELD_CONTRACT = {
  logoText: { propertyName: 'logoText', label: 'Logo', maxLength: 40, multiline: false, required: true },
  logoSubText: { propertyName: 'logoSubText', label: 'Subtitle', maxLength: 80, multiline: false, required: false },
  leftEyebrow: { propertyName: 'leftEyebrow', label: 'Left eyebrow', maxLength: 50, multiline: false, required: false },
  leftTitle: { propertyName: 'leftTitle', label: 'Left title', maxLength: 80, multiline: true, maxLines: 3, required: true },
  leftDesc: { propertyName: 'leftDesc', label: 'Left description', maxLength: 280, multiline: true, maxLines: 5, required: false },
  buttonText: { propertyName: 'buttonText', label: 'Button label', maxLength: 24, multiline: false, required: false },
  rightEyebrow: { propertyName: 'rightEyebrow', label: 'Right eyebrow', maxLength: 50, multiline: false, required: false },
  rightTitle: { propertyName: 'rightTitle', label: 'Right title', maxLength: 80, multiline: true, maxLines: 3, required: true },
  rightDesc: { propertyName: 'rightDesc', label: 'Right description', maxLength: 280, multiline: true, maxLines: 5, required: false },
  hintText: { propertyName: 'hintText', label: 'Interaction hint', maxLength: 80, multiline: false, required: false },
};
const TEXT_FIELD_IDS = Object.keys(TEXT_FIELD_CONTRACT);
const STYLE_KEYS = {
  assets: ['imageAtRest', 'imageInTrail'],
  fonts: ['logo', 'title', 'eyebrow', 'desc'],
  colors: [
    'primary',
    'secondary',
    'logoColor',
    'logoStroke',
    'titleShadow',
    'rightTitleShadow',
  ],
  content: [
    'logoText',
    'logoSubText',
    'leftEyebrow',
    'leftTitle',
    'leftDesc',
    'buttonText',
    'rightEyebrow',
    'rightTitle',
    'rightDesc',
    'hintText',
  ],
};

const THEME_MATRIX = {
  'luffy-gear5': {
    defaultTrailId: 'gear-pi-trail',
    capabilities: ['trailSelection', ...COMMON_CAPABILITIES],
    trails: [
      ['minimal-reveal', 'minimalReveal', 'minimal'],
      ['gear-pi-trail', 'gearPi', 'signature'],
    ],
  },
  'cyberpunk-neon': {
    defaultTrailId: 'minimal-reveal',
    capabilities: COMMON_CAPABILITIES,
    trails: [
      ['minimal-reveal', 'minimalReveal', 'minimal'],
    ],
  },
  'spider-venom': {
    defaultTrailId: 'masked-web',
    capabilities: ['trailSelection', ...COMMON_CAPABILITIES],
    trails: [
      ['minimal-reveal', 'minimalReveal', 'minimal'],
      ['masked-web', 'maskedWeb', 'signature'],
      ['radial-web', 'radialWeb', 'material'],
    ],
  },
};

function loadConfig(configPath) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${fs.readFileSync(configPath, 'utf8')};globalThis.__APP_CONFIG=APP_CONFIG`,
    context,
    { filename: configPath },
  );
  return JSON.parse(JSON.stringify(context.__APP_CONFIG));
}

function writeConfig(configPath, config) {
  fs.writeFileSync(configPath, `const APP_CONFIG = ${JSON.stringify(config, null, 2)};\n`, 'utf8');
}

function runValidator(targetRoot) {
  return spawnSync(
    process.execPath,
    [validatorPath, targetRoot],
    { encoding: 'utf8', windowsHide: true },
  );
}

function validateBrowserMutation(mutator) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wallpaper-text-validation-'));
  try {
    fs.cpSync(path.join(browserReleaseRoot, 'luffy-gear5'), fixtureRoot, { recursive: true });
    const fixtureConfigPath = path.join(fixtureRoot, 'assets', 'data', 'config.js');
    const fixtureConfig = loadConfig(fixtureConfigPath);
    mutator(fixtureConfig);
    writeConfig(fixtureConfigPath, fixtureConfig);
    return runValidator(fixtureRoot);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function encodeLivelyTextboxValue(value, definition) {
  return definition.multiline ? value.replace(/\n/g, '\\n') : value;
}

function getLivelyTextHelp(definition) {
  const parts = [`Maximum ${definition.maxLength} characters.`];
  if (definition.multiline) {
    parts.push(`Type \\n for a new line (up to ${definition.maxLines} lines).`);
  }
  return parts.join(' ');
}

function getTheme(config, themeId) {
  const theme = config.themes.find((candidate) => candidate.id === themeId);
  assert.ok(theme, `Missing active theme: ${themeId}`);
  return theme;
}

function assertApprox(actual, expected, message, tolerance = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`,
  );
}

function clamp(definition, value) {
  return Math.min(definition.max, Math.max(definition.min, Number(value)));
}

function assertTrailStylePresence(theme, trail) {
  assert.ok(trail.style && typeof trail.style === 'object', `${theme.id}/${trail.id} is missing style`);
  const requiredSections = {
    minimalReveal: ['mask', 'glow'],
    gearPi: ['mask', 'overlay'],
    maskedWeb: ['mask', 'body', 'head'],
    radialWeb: ['mask', 'body', 'head'],
  }[trail.renderer];
  assert.ok(requiredSections, `${theme.id}/${trail.id} has no matrix style contract`);
  for (const sectionName of requiredSections) {
    const section = trail.style[sectionName];
    assert.ok(
      section && typeof section === 'object' && Object.keys(section).length > 0,
      `${theme.id}/${trail.id} is missing style.${sectionName}`,
    );
  }

  if (trail.renderer === 'minimalReveal') {
    assert.equal(trail.style.mask.ribbonWidthScale, 1.52);
    assert.equal(trail.style.mask.ribbonOpacity, 0.96);
    assert.equal(trail.style.mask.headScale, 1);
    assert.equal(trail.style.glow.radiusScale, 1.45);
    assert.deepEqual(trail.style.glow.stops.map((stop) => stop.offset), [0, 0.45, 1]);
  } else if (trail.renderer === 'gearPi') {
    assert.equal(trail.style.mask.ribbonWidthScale, 1.34);
    assert.equal(trail.style.mask.cloudScale, 0.82);
    assert.ok(trail.style.mask.cloudCommands.length > 0);
    assert.deepEqual(trail.style.overlay.ribbonLayers.map((layer) => layer.widthScale), [1.56, 1.44]);
    assert.deepEqual(trail.style.overlay.cloudLayers.map((layer) => layer.scale), [0.88, 0.85]);
  } else {
    const isRadial = trail.renderer === 'radialWeb';
    assert.equal(trail.style.mask.ribbonWidthScale, 1.22);
    assert.equal(trail.style.mask.clearScale, 1.04);
    assert.equal(trail.style.mask.headScale, 0.90);
    assert.equal(trail.style.mask.boundarySpokes, isRadial ? 12 : 10);
    assert.equal(trail.style.body.opacity, isRadial ? 0.84 : 0.72);
    assert.equal(trail.style.body.spreadScale, 0.36);
    assert.equal(trail.style.head.radiusScale, 0.90);
    assert.equal(trail.style.head.spokes, isRadial ? 12 : 10);
    assert.equal(trail.style.head.rings, isRadial ? 5 : 4);
  }
}

function assertContentContract(theme) {
  assert.deepEqual(Object.keys(theme.content), TEXT_FIELD_IDS, `${theme.id} content field order drifted`);
  for (const fieldId of TEXT_FIELD_IDS) {
    const value = theme.content[fieldId];
    const definition = TEXT_FIELD_CONTRACT[fieldId];
    assert.equal(typeof value, 'string', `${theme.id}.${fieldId} must be a string`);
    assert.equal(value.includes('\r'), false, `${theme.id}.${fieldId} must use LF line breaks`);
    assert.doesNotMatch(
      value,
      /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/u,
      `${theme.id}.${fieldId} contains a control character`,
    );
    assert.doesNotMatch(value, /<\s*\/?\s*[a-z][^>]*>/iu, `${theme.id}.${fieldId} contains HTML`);
    assert.doesNotMatch(
      value,
      /&(?:#\d{1,7}|#x[\da-f]{1,6}|[a-z][a-z0-9]{1,31});/iu,
      `${theme.id}.${fieldId} contains an HTML entity`,
    );
    assert.ok(Array.from(value).length <= definition.maxLength, `${theme.id}.${fieldId} exceeds its limit`);
    if (definition.required) assert.ok(value.trim().length > 0, `${theme.id}.${fieldId} is required`);
    const lineCount = value.split('\n').length;
    if (definition.multiline) {
      assert.ok(lineCount <= definition.maxLines, `${theme.id}.${fieldId} has too many lines`);
    } else {
      assert.equal(lineCount, 1, `${theme.id}.${fieldId} must be single-line`);
    }
  }
}

function assertStylePresence(theme, assetRoot) {
  for (const [sectionName, keys] of Object.entries(STYLE_KEYS)) {
    const section = theme[sectionName];
    assert.ok(section && typeof section === 'object', `${theme.id} is missing ${sectionName}`);
    for (const key of keys) {
      assert.equal(
        typeof section[key],
        'string',
        `${theme.id}.${sectionName}.${key} must be a string`,
      );
      if (sectionName !== 'content') {
        assert.ok(
          section[key].trim().length > 0,
          `${theme.id}.${sectionName}.${key} must not be empty`,
        );
      }
    }
  }

  assertContentContract(theme);

  for (const trail of theme.trails) assertTrailStylePresence(theme, trail);

  for (const assetPath of Object.values(theme.assets)) {
    assert.ok(
      fs.existsSync(path.join(assetRoot, assetPath)),
      `${theme.id} style asset is missing: ${assetPath}`,
    );
  }
}

function assertThemeContract(theme, expected, assetRoot, options = {}) {
  const requireLivelyAssets = options.requireLivelyAssets !== false;
  assert.notEqual(theme.enabled, false, `${theme.id} must remain enabled`);
  assert.equal(theme.defaultTrailId, undefined, `${theme.id} still uses legacy defaultTrailId`);
  assert.equal(theme.settings.defaults.trailId, expected.defaultTrailId, `${theme.id} default trail drifted`);
  assert.deepEqual(
    theme.settings.defaults,
    { trailId: expected.defaultTrailId, ...COMMON_DEFAULTS },
    `${theme.id} defaults drifted`,
  );
  assert.deepEqual(theme.settings.capabilities, expected.capabilities, `${theme.id} capabilities drifted`);
  assert.deepEqual(theme.settings.textFields, TEXT_FIELD_IDS, `${theme.id} supported text fields drifted`);
  assert.deepEqual(theme.interaction, COMMON_INTERACTION, `${theme.id} interaction contract drifted`);
  assert.deepEqual(
    theme.trails.map(({ id, renderer, role }) => [id, renderer, role]),
    expected.trails,
    `${theme.id} trail/renderer mapping drifted`,
  );
  assert.equal(theme.release.status, 'ready', `${theme.id} must remain release-ready`);
  assert.equal(theme.release.assetStatus, 'final', `${theme.id} must use final artwork`);
  if (requireLivelyAssets) {
    assert.deepEqual(
      Object.keys(theme.release.livelyAssets || {}).sort(),
      ['imageAtRest', 'imageInTrail'],
      `${theme.id} must provide both Lively image slots`,
    );
    for (const livelyAssetPath of Object.values(theme.release.livelyAssets)) {
      assert.ok(
        fs.existsSync(path.join(assetRoot, livelyAssetPath)),
        `${theme.id} Lively asset is missing: ${livelyAssetPath}`,
      );
    }
  } else {
    assert.equal(
      theme.release.livelyAssets,
      undefined,
      `${theme.id} browser package must not expose Lively asset metadata`,
    );
  }
  assertStylePresence(theme, assetRoot);
}

function assertLivelyProperties(properties, sourceConfig, theme) {
  const capabilities = new Set(theme.settings.capabilities);
  const expectedKeys = [
    'showUi',
    ...(capabilities.has('trailSelection') && theme.trails.length > 1 ? ['trailId'] : []),
    ...NUMERIC_CONTROLS,
    'performanceMode',
    ...(capabilities.has('textCustomization')
      ? ['customTextSection', ...theme.settings.textFields.map((fieldId) => sourceConfig.controls.textFields[fieldId].propertyName)]
      : []),
  ];
  assert.deepEqual(Object.keys(properties), expectedKeys, `${theme.id} Lively property set or order drifted`);

  assert.equal(properties.showUi.type, 'checkbox');
  assert.equal(properties.showUi.value, COMMON_DEFAULTS.showUi);

  if (capabilities.has('trailSelection') && theme.trails.length > 1) {
    assert.equal(properties.trailId.type, 'dropdown');
    assert.equal(
      properties.trailId.value,
      theme.trails.findIndex((trail) => trail.id === theme.settings.defaults.trailId),
    );
    assert.deepEqual(properties.trailId.items, theme.trails.map((trail) => trail.name));
  } else {
    assert.equal(properties.trailId, undefined, `${theme.id} must not expose a trail dropdown`);
  }

  for (const controlName of NUMERIC_CONTROLS) {
    const definition = sourceConfig.controls[controlName];
    const property = properties[controlName];
    assert.equal(property.type, 'slider', `${theme.id}.${controlName} must be a slider`);
    assert.equal(property.value, theme.settings.defaults[controlName]);
    assert.equal(property.min, definition.min);
    assert.equal(property.max, definition.max);
    assert.equal(property.step, definition.step);
  }

  assert.equal(properties.performanceMode.type, 'dropdown');
  assert.equal(
    properties.performanceMode.value,
    sourceConfig.controls.performanceMode.options.indexOf(COMMON_DEFAULTS.performanceMode),
  );
  assert.deepEqual(
    properties.performanceMode.items,
    sourceConfig.controls.performanceMode.options.map((option) => option.replace('-', ' ')),
  );

  if (capabilities.has('textCustomization')) {
    assert.deepEqual(properties.customTextSection, {
      type: 'label',
      value: 'Custom text',
    });
    for (const fieldId of theme.settings.textFields) {
      const definition = sourceConfig.controls.textFields[fieldId];
      const property = properties[definition.propertyName];
      assert.deepEqual(Object.keys(property).sort(), ['help', 'text', 'type', 'value']);
      assert.equal(property.type, 'textbox', `${theme.id}.${fieldId} must be a Lively textbox`);
      assert.equal(property.value, encodeLivelyTextboxValue(theme.content[fieldId], definition));
      assert.equal(property.text, definition.label);
      assert.equal(property.help, getLivelyTextHelp(definition));
      assert.equal(property.maxLength, undefined, 'Lively textboxes must not contain unsupported maxLength metadata');
    }
  }
  assert.equal(properties.resetSettings, undefined, 'Lively native Restore Default is authoritative');
}

const sourceConfig = loadConfig(sourceConfigPath);
const sourceIndex = fs.readFileSync(sourceIndexPath, 'utf8');
const sourceIndexHash = sha256Bytes(fs.readFileSync(sourceIndexPath));

test('current root is the independent State B-derived development source', () => {
  assert.notEqual(
    sourceIndexHash,
    PRESERVED_STATE_A_INDEX_SHA256,
    'Current development source must not be silently replaced by preserved State A package bytes',
  );
  assert.match(
    sourceIndex,
    /ctx\.globalCompositeOperation\s*=\s*'destination-out';[\s\S]*ctx\.drawImage\(off,[\s\S]*ctx\.globalCompositeOperation\s*=\s*'lighter';[\s\S]*ctx\.drawImage\(off,[\s\S]*ctx\.globalCompositeOperation\s*=\s*'source-over';/,
    'Current source must preserve the State B replacement-compositing sequence',
  );
});

test('Stage 1 V2 Minimal Reveal stays development-only and isolated', () => {
  assert.match(
    sourceIndex,
    /const\s+trailGeometryMode\s*=\s*isDevelopmentBuild\s*&&\s*query\.get\('trailGeometry'\)\s*===\s*'v2'/,
    'The V2 selector must remain a development-browser query gate',
  );
  assert.match(
    sourceIndex,
    /return\s+trailGeometryMode\s*===\s*'v2'\s*&&\s*trailDefinition\?\.renderer\s*===\s*'minimalReveal'/,
    'Stage 1 V2 dispatch must remain limited to Minimal Reveal',
  );
  const v2Start = sourceIndex.indexOf('// V2_MINIMAL_GEOMETRY_BEGIN');
  const v2End = sourceIndex.indexOf('// V2_MINIMAL_GEOMETRY_END');
  assert.ok(v2Start >= 0 && v2End > v2Start, 'The bounded V2 Minimal geometry module is missing');
  const v2GeometrySource = sourceIndex.slice(v2Start, v2End);
  assert.doesNotMatch(
    v2GeometrySource,
    /addEventListener|requestAnimationFrame|setInterval|setTimeout|createElement\(['"]canvas/i,
    'V2 geometry must not own input, animation, timers, or a Canvas surface',
  );
  assert.equal(
    (sourceIndex.match(/<canvas\b/g) || []).length,
    1,
    'Stage 1 must reuse the existing visible and offscreen Canvas architecture',
  );
});

test('shared customizable text registry is exact and safe', () => {
  assert.deepEqual(sourceConfig.controls.textFields, TEXT_FIELD_CONTRACT);
  assert.deepEqual(Object.keys(sourceConfig.controls.textFields), TEXT_FIELD_IDS);
  assert.equal(new Set(TEXT_FIELD_IDS.map((fieldId) => TEXT_FIELD_CONTRACT[fieldId].propertyName)).size, TEXT_FIELD_IDS.length);
});

test('active theme configuration matrix is exact', async (t) => {
  for (const themeId of ACTIVE_THEME_IDS) {
    await t.test(themeId, () => {
      assertThemeContract(getTheme(sourceConfig, themeId), THEME_MATRIX[themeId], projectRoot);
    });
  }
});

test('head-size bounds, clamps, and reference radii remain stable', () => {
  const definition = sourceConfig.controls.headSize;
  assert.deepEqual(definition, { min: 55, max: 160, step: 5 });
  assert.equal(clamp(definition, 54), 55);
  assert.equal(clamp(definition, 55), 55);
  assert.equal(clamp(definition, 100), 100);
  assert.equal(clamp(definition, 160), 160);
  assert.equal(clamp(definition, 161), 160);

  const viewport = { width: 1920, height: 1080 };
  for (const themeId of ACTIVE_THEME_IDS) {
    const interaction = getTheme(sourceConfig, themeId).interaction;
    const baseRadius = Math.max(
      interaction.headRadius.minimum,
      Math.min(viewport.width, viewport.height) * interaction.headRadius.viewportScale,
    );
    assertApprox(baseRadius, 259.2, `${themeId} 1920x1080 base head radius`);
    for (const [headSize, expectedRadius] of [[55, 142.56], [100, 259.2], [160, 414.72]]) {
      assert.equal((headSize - definition.min) % definition.step, 0, `${headSize}% is off-step`);
      assertApprox(baseRadius * headSize / 100, expectedRadius, `${themeId} ${headSize}% reference radius`);
    }
  }

  assert.match(
    sourceIndex,
    /interaction\.headRadius\.minimum[\s\S]*Math\.min\(w, h\) \* interaction\.headRadius\.viewportScale/,
    'Runtime must consume the migrated head-radius interaction settings',
  );
  assert.match(
    sourceIndex,
    /return HEAD_RADIUS \* trailHeadScale;/,
    'Runtime head scale is no longer applied to the base radius',
  );
});

test('persistence bounds and reference durations remain stable', () => {
  const definition = sourceConfig.controls.trailPersistence;
  assert.deepEqual(definition, { min: 55, max: 150, step: 5 });
  assert.equal(clamp(definition, 54), 55);
  assert.equal(clamp(definition, 55), 55);
  assert.equal(clamp(definition, 100), 100);
  assert.equal(clamp(definition, 150), 150);
  assert.equal(clamp(definition, 151), 150);

  for (const themeId of ACTIVE_THEME_IDS) {
    const baseDuration = getTheme(sourceConfig, themeId).interaction.baseTrailDurationMs;
    for (const [persistence, expectedDuration] of [[55, 467.5], [100, 850], [150, 1275]]) {
      assertApprox(
        baseDuration * persistence / 100,
        expectedDuration,
        `${themeId} ${persistence}% persistence duration`,
      );
    }
  }
  assert.match(
    sourceIndex,
    /getThemeInteraction\(\)\.baseTrailDurationMs \* \(activeSettings\.trailPersistence \|\| 100\) \/ 100/,
    'Runtime must consume the migrated persistence interaction setting',
  );
});

test('zero glow remains a valid configured value', () => {
  const definition = sourceConfig.controls.glowStrength;
  assert.deepEqual(definition, { min: 0, max: 150, step: 5 });
  assert.equal(clamp(definition, -1), 0);
  assert.equal(clamp(definition, 0), 0);
  assert.equal(clamp(definition, 151), 150);
  assert.match(
    sourceIndex,
    /Number\.isFinite\(activeSettings\.glowStrength\)/,
    'Runtime glow getter must preserve 0 instead of replacing it with 100',
  );
});

test('customer settings button visibility and M hotkey remain wired', () => {
  assert.match(
    sourceIndex,
    /activeSettings\.showUi\s*&&\s*\n\s*activeSettings\.showSettingsButton/,
    'Customer settings button must hide with the theme UI or its own visibility option',
  );
  assert.match(
    sourceIndex,
    /event\.code === 'KeyM'/,
    'The settings panel must retain an M keyboard shortcut',
  );
  assert.match(
    sourceIndex,
    /capabilities\.has\('settingsButtonVisibility'\)/,
    'Settings button visibility must be capability-driven',
  );
});

test('customer text rendering and editor hotkeys remain safe', () => {
  assert.doesNotMatch(sourceIndex, /\.innerHTML\s*=/, 'Customer text must never be assigned through innerHTML');
  assert.match(sourceIndex, /node\.textContent\s*=\s*value/, 'Resolved theme content must render through textContent');
  assert.match(
    sourceIndex,
    /Object\.prototype\.hasOwnProperty\.call\(LIVELY_TEXT_PROPERTIES, name\)/,
    'Lively textbox properties must route through the text field registry',
  );
  assert.match(sourceIndex, /decodeEscapedNewlines:\s*true/, 'Lively multiline values must decode literal \\n sequences');
  assert.match(sourceIndex, /function\s+isEditableTarget\s*\(/, 'The runtime must identify text editors');
  assert.match(
    sourceIndex,
    /if\s*\(\s*isEditableTarget\(event\.target\)\s*\)\s*return/,
    'H and M must not fire while the customer is editing text',
  );
});

test('validator accepts safe Unicode, multiline, and empty optional text', {
  skip: !fs.existsSync(path.join(browserReleaseRoot, 'luffy-gear5')),
}, () => {
  const result = validateBrowserMutation((config) => {
    const theme = config.themes[0];
    theme.content.leftTitle = 'ヒーロー🕷️\n新しい日';
    theme.content.leftDesc = '';
    theme.content.hintText = 'حرّك المؤشر';
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('validator rejects unsafe or out-of-contract customer text defaults', {
  skip: !fs.existsSync(path.join(browserReleaseRoot, 'luffy-gear5')),
}, () => {
  const cases = [
    {
      name: 'HTML',
      mutate: (theme) => { theme.content.logoText = '<img src=x onerror=alert(1)>'; },
      expected: /must be plain text, not HTML/,
    },
    {
      name: 'HTML entity',
      mutate: (theme) => { theme.content.logoSubText = 'GEAR&nbsp;5'; },
      expected: /literal characters instead of HTML entities/,
    },
    {
      name: 'over limit',
      mutate: (theme) => { theme.content.logoText = 'x'.repeat(41); },
      expected: /exceeds 40 characters/,
    },
    {
      name: 'empty required field',
      mutate: (theme) => { theme.content.leftTitle = '   '; },
      expected: /is required/,
    },
    {
      name: 'too many lines',
      mutate: (theme) => { theme.content.rightTitle = 'one\ntwo\nthree\nfour'; },
      expected: /exceeds 3 lines/,
    },
    {
      name: 'newline in a single-line field',
      mutate: (theme) => { theme.content.buttonText = 'SET\nSAIL'; },
      expected: /does not support line breaks/,
    },
  ];

  for (const fixture of cases) {
    const result = validateBrowserMutation((config) => fixture.mutate(config.themes[0]));
    assert.notEqual(result.status, 0, `${fixture.name} unexpectedly passed validation`);
    assert.match(`${result.stderr}\n${result.stdout}`, fixture.expected, fixture.name);
  }

  const unknownField = validateBrowserMutation((config) => {
    config.themes[0].settings.textFields[0] = 'unknownTextField';
  });
  assert.notEqual(unknownField.status, 0);
  assert.match(`${unknownField.stderr}\n${unknownField.stdout}`, /unknown text field/);

  const duplicateField = validateBrowserMutation((config) => {
    config.themes[0].settings.textFields.push(config.themes[0].settings.textFields[0]);
  });
  assert.notEqual(duplicateField.status, 0);
  assert.match(`${duplicateField.stderr}\n${duplicateField.stdout}`, /text fields must be unique/);
});

test('configured renderers and theme style sections are present', () => {
  const registryStart = sourceIndex.indexOf('const TRAIL_RENDERERS = {');
  const registryEnd = sourceIndex.indexOf('\n      };', registryStart);
  assert.ok(registryStart >= 0 && registryEnd > registryStart, 'TRAIL_RENDERERS registry is missing');
  const registrySource = sourceIndex.slice(registryStart, registryEnd);
  const requiredRenderers = new Set(
    ACTIVE_THEME_IDS.flatMap((themeId) => getTheme(sourceConfig, themeId).trails.map((trail) => trail.renderer)),
  );
  for (const renderer of requiredRenderers) {
    assert.match(
      registrySource,
      new RegExp(`\\n\\s*${renderer}:\\s*\\{`),
      `Renderer ${renderer} is configured but absent from TRAIL_RENDERERS`,
    );
  }
});

test('Brand New Day stays excluded from the active and packaged matrix', () => {
  assert.ok(!ACTIVE_THEME_IDS.includes('brand-new-day'));
  assert.notEqual(sourceConfig.settings.defaultThemeId, 'brand-new-day');
  const stagingTheme = sourceConfig.themes.find((theme) => theme.id === 'brand-new-day');
  assert.ok(stagingTheme, 'Disabled Brand New Day staging theme is missing');
  assert.equal(stagingTheme.enabled, false);
  assert.equal(stagingTheme.developmentPreview, true);
  assert.equal(stagingTheme.release.status, 'staging');
  assert.equal(stagingTheme.release.assetStatus, 'placeholder');
  assert.match(stagingTheme.assets.imageAtRest, /^assets\/images\/brand-new-day\//);
  assert.match(stagingTheme.assets.imageInTrail, /^assets\/images\/brand-new-day\//);
  assert.equal(
    fs.existsSync(path.join(livelyReleaseRoot, 'brand-new-day')),
    false,
    'Brand New Day must not have a Lively customer package while disabled',
  );
  assert.equal(
    fs.existsSync(path.join(browserReleaseRoot, 'brand-new-day')),
    false,
    'Brand New Day must not have a browser customer package while disabled',
  );
});

test('Aeren Sol living-art prototype stays development-only and bounded', () => {
  assert.ok(!ACTIVE_THEME_IDS.includes('aeren-sol'));
  assert.notEqual(sourceConfig.settings.defaultThemeId, 'aeren-sol');
  const stagingTheme = sourceConfig.themes.find((theme) => theme.id === 'aeren-sol');
  assert.ok(stagingTheme, 'Disabled Aeren Sol staging theme is missing');
  assert.equal(stagingTheme.enabled, false);
  assert.equal(stagingTheme.developmentPreview, true);
  assert.equal(stagingTheme.release.status, 'staging');
  assert.equal(stagingTheme.release.assetStatus, 'placeholder');
  assert.match(stagingTheme.assets.imageAtRest, /^assets\/images\/aeren-sol\//);
  assert.match(stagingTheme.assets.imageInTrail, /^assets\/images\/aeren-sol\//);
  assert.equal(stagingTheme.motion.enabled, true);
  assert.deepEqual(
    Object.keys(stagingTheme.motion).sort(),
    ['atmosphere', 'deformation', 'enabled', 'parallax'],
  );
  assert.ok(stagingTheme.settings.capabilities.includes('artworkMotion'));
  assert.equal(stagingTheme.settings.defaults.artworkMotion, true);
  assert.ok(stagingTheme.motion.parallax.overscanScale <= 1.05);
  assert.ok(stagingTheme.motion.parallax.pointerStrengthX <= 3);
  assert.ok(stagingTheme.motion.parallax.pointerStrengthY <= 2);
  assert.ok(stagingTheme.motion.parallax.ambientStrengthX <= 0.5);
  assert.ok(stagingTheme.motion.parallax.ambientStrengthY <= 0.3);
  assert.equal(stagingTheme.motion.deformation.enabled, false);
  assert.equal(stagingTheme.motion.deformation.sourceType, 'flattened-pair');
  const approvedRegions = JSON.parse(fs.readFileSync(
    path.join(
      projectRoot,
      'assets/characters/aeren-sol/layers/normal-v3__ascendant-v5/v001/motion-regions.json',
    ),
    'utf8',
  ));
  const regionIds = (state, category) => approvedRegions.regions
    .filter(region => region.category === category && region.states[state].normalizedShapes.length > 0)
    .map(region => region.id)
    .sort();
  assert.deepEqual(regionIds('rest', 'hair'), []);
  assert.deepEqual(regionIds('rest', 'fabric'), ['fabric-01', 'fabric-02', 'fabric-03', 'fabric-04']);
  assert.deepEqual(regionIds('reveal', 'hair'), ['hair-01', 'hair-02']);
  assert.deepEqual(regionIds('reveal', 'fabric'), [
    'fabric-05',
    'fabric-06',
    'fabric-07',
    'fabric-08',
    'fabric-09',
    'fabric-10',
  ]);
  assert.ok(stagingTheme.motion.deformation.meshDensity.quality <= 10);
  assert.ok(stagingTheme.motion.deformation.meshDensity.balanced <= 8);
  assert.ok(stagingTheme.motion.deformation.meshDensity['low-power'] <= 5);
  assert.equal(stagingTheme.motion.deformation.restingRegions.length, 7);
  assert.equal(stagingTheme.motion.deformation.revealedRegions.length, 10);
  assert.ok(stagingTheme.motion.deformation.restingProtectedAreas.length >= 3);
  assert.ok(stagingTheme.motion.deformation.revealedProtectedAreas.length >= 3);
  assert.ok(stagingTheme.motion.deformation.restingRegions.some(region => region.id.includes('braid')));
  assert.ok(stagingTheme.motion.deformation.restingRegions.some(region => region.material === 'fabric'));
  assert.ok(stagingTheme.motion.deformation.restingRegions.some(region => region.material === 'grass'));
  assert.ok(stagingTheme.motion.deformation.revealedRegions.some(region => region.id.includes('braid')));
  assert.ok(stagingTheme.motion.deformation.revealedRegions.some(region => region.material === 'fabric'));
  assert.ok(stagingTheme.motion.deformation.revealedRegions.some(region => region.material === 'grass'));
  assert.ok(stagingTheme.motion.deformation.revealedRegions.some(region => region.crossAmplitude >= 0.012));
  assert.ok([
    ...stagingTheme.motion.deformation.restingRegions,
    ...stagingTheme.motion.deformation.revealedRegions,
  ].every(region => region.opacity === 1));
  assert.ok(stagingTheme.motion.atmosphere.petalCount.quality <= 32);
  assert.ok(stagingTheme.motion.atmosphere.moteCount.quality <= 40);
  assert.ok(stagingTheme.motion.atmosphere.constellationLinkCount.quality <= 12);
  assert.ok(stagingTheme.motion.atmosphere.mistCount.quality <= 3);
  assert.match(sourceIndex, /function\s+updateLivingMotion\s*\(/);
  assert.match(sourceIndex, /function\s+drawLivingRestingAtmosphere\s*\(/);
  assert.match(sourceIndex, /function\s+drawLivingRevealedAtmosphere\s*\(/);
  assert.match(sourceIndex, /function\s+drawLivingPuppetRegion\s*\(/);
  assert.match(sourceIndex, /function\s+drawLivingPuppetRegions\s*\(/);
  assert.match(sourceIndex, /function\s+drawLivingTexturedTriangle\s*\(/);
  assert.doesNotMatch(sourceIndex, /function\s+drawLivingMaterialLighting\s*\(/);
  assert.doesNotMatch(
    sourceIndex,
    /function\s+(?:syncLivingWindMaps|createLivingWindProgram|ensureLivingWindRenderer|drawLivingWindMotion)\s*\(/,
  );
  assert.match(sourceIndex, /targetContext\.clip\('evenodd'\)/);
  assert.match(sourceIndex, /deformation\.sourceType\s*!==\s*'layered-cutouts'/);
  assert.match(sourceIndex, /function\s+loadThemeImages\s*\(/);
  assert.match(sourceIndex, /const\s+generation\s*=\s*\+\+imageLoadGeneration/);
  assert.match(sourceIndex, /top\.complete\s*&&\s*top\.naturalWidth\s*>\s*0/);
  assert.match(sourceIndex, /bottom\.complete\s*&&\s*bottom\.naturalWidth\s*>\s*0/);
  assert.match(sourceIndex, /if\s*\(isPaused\s*\|\|\s*!imagesReady/);
  assert.doesNotMatch(sourceIndex, /let\s+loaded\s*=\s*0/);
  assert.match(sourceIndex, /activeSettings\.artworkMotion\s*!==\s*false/);
  assert.match(sourceIndex, /query\.get\('motion'\)\s*===\s*'on'/);
  const drawFunctionStart = sourceIndex.indexOf('function draw(now)');
  const drawFunctionEnd = sourceIndex.indexOf("document.addEventListener('dblclick'", drawFunctionStart);
  const drawFunctionSource = sourceIndex.slice(drawFunctionStart, drawFunctionEnd);
  const trailPathDeclaration = drawFunctionSource.indexOf('const trailPath = drawActiveTrailMask');
  const trailDependentMotion = drawFunctionSource.indexOf(
    "livingMotion.deformation.sourceType === 'layered-cutouts'",
    trailPathDeclaration,
  );
  assert.ok(trailPathDeclaration >= 0, 'Frame trail path declaration is missing');
  assert.ok(
    trailDependentMotion > trailPathDeclaration,
    'Living reveal motion must not read the frame trail path before it is created',
  );
  assert.match(sourceIndex, /Living artwork/);
  assert.equal((sourceIndex.match(/<canvas\b/g) || []).length, 1, 'Living art must reuse the existing canvas');
  assert.equal(
    fs.existsSync(path.join(livelyReleaseRoot, 'aeren-sol')),
    false,
    'Aeren Sol must not have a Lively customer package while staging',
  );
  assert.equal(
    fs.existsSync(path.join(browserReleaseRoot, 'aeren-sol')),
    false,
    'Aeren Sol must not have a browser customer package while staging',
  );
});

for (const themeId of ACTIVE_THEME_IDS) {
  const packageRoot = path.join(livelyReleaseRoot, themeId);
  test(`Lively package matrix: ${themeId}`, { skip: !fs.existsSync(packageRoot) }, () => {
    const packageConfigPath = path.join(packageRoot, 'assets', 'data', 'config.js');
    const packageIndexPath = path.join(packageRoot, 'index.html');
    const infoPath = path.join(packageRoot, 'LivelyInfo.json');
    const propertiesPath = path.join(packageRoot, 'LivelyProperties.json');
    assert.ok(fs.existsSync(packageConfigPath), `${themeId} package config is missing`);
    assert.ok(fs.existsSync(packageIndexPath), `${themeId} package HTML is missing`);
    assert.ok(fs.existsSync(infoPath), `${themeId} LivelyInfo.json is missing`);
    assert.ok(fs.existsSync(propertiesPath), `${themeId} LivelyProperties.json is missing`);
    assert.deepEqual(listRelativeFiles(packageRoot), LIVELY_PACKAGE_FILES, `${themeId} unpacked package contents are unsafe`);
    assertNoAuthoringLayerReferences(packageConfigPath, `${themeId} Lively package`);
    const customerArchivePath = path.join(livelyPackageRoot, `${themeId}.zip`);
    assert.ok(fs.existsSync(customerArchivePath), `${themeId} customer archive is missing`);
    const archiveFiles = listZipFiles(customerArchivePath);
    assert.deepEqual(archiveFiles, LIVELY_PACKAGE_FILES, `${themeId} customer archive contents are unsafe`);
    assert.equal(
      hashZipEntry(customerArchivePath, 'index.html'),
      PRESERVED_STATE_A_INDEX_SHA256,
      `${themeId} customer archive no longer preserves the approved State A package baseline`,
    );
    assert.ok(
      archiveFiles.every((entry) => !entry.split('/').includes('.git') && !entry.includes('..')),
      `${themeId} customer archive contains an unsafe path`,
    );

    const packageConfig = loadConfig(packageConfigPath);
    assert.deepEqual(packageConfig.build, {
      mode: 'customer',
      platform: 'lively',
      edition: 'premium',
    });
    assert.equal(packageConfig.settings.defaultThemeId, themeId);
    assert.equal(packageConfig.settings.showThemeSwitcher, false);
    assert.equal(packageConfig.settings.showSettingsPanel, false);
    assert.equal(packageConfig.settings.persistSettings, false);
    assert.equal(packageConfig.settings.maxRenderPixels, 2560 * 1440);
    assert.deepEqual(packageConfig.controls, sourceConfig.controls);
    assert.equal(packageConfig.themes.length, 1);

    const packageTheme = packageConfig.themes[0];
    const sourceTheme = getTheme(sourceConfig, themeId);
    const livelyInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    assert.deepEqual(livelyInfo, {
      AppVersion: '1.0.0.0',
      Title: packageTheme.themeName,
      Thumbnail: 'assets/images/base.webp',
      Preview: null,
      Desc: `Interactive ${packageTheme.type} wallpaper with themed cursor trails.`,
      Author: 'Dhairya Lukha',
      License: null,
      Contact: '',
      Type: 1,
      FileName: 'index.html',
      Arguments: null,
      IsAbsolutePath: false,
      Id: packageTheme.id,
      Tags: [packageTheme.type, 'Interactive', 'Cursor Trail'],
      Version: 1,
    });
    assert.equal(packageTheme.id, themeId);
    assertThemeContract(packageTheme, THEME_MATRIX[themeId], packageRoot);
    assert.deepEqual(packageTheme.assets, {
      imageAtRest: 'assets/images/base.webp',
      imageInTrail: 'assets/images/reveal.webp',
    });
    assert.deepEqual(packageTheme.release.livelyAssets, packageTheme.assets);
    assert.ok(fs.existsSync(path.join(packageRoot, packageTheme.assets.imageAtRest)));
    assert.ok(fs.existsSync(path.join(packageRoot, packageTheme.assets.imageInTrail)));
    for (const [slotName, packagedAssetPath] of Object.entries(packageTheme.assets)) {
      assert.deepEqual(
        fs.readFileSync(path.join(packageRoot, packagedAssetPath)),
        fs.readFileSync(path.join(projectRoot, sourceTheme.release.livelyAssets[slotName])),
        `${themeId} packaged ${slotName} does not match its explicit Lively source asset`,
      );
    }
    assert.equal(
      sha256Bytes(fs.readFileSync(packageIndexPath)),
      PRESERVED_STATE_A_INDEX_SHA256,
      `${themeId} unpacked Lively package no longer preserves the approved State A baseline`,
    );

    assert.deepEqual(
      packageTheme.trails,
      sourceTheme.trails,
      `${themeId} packaged trails drifted from the migrated source config`,
    );
    assert.deepEqual(packageTheme.content, sourceTheme.content, `${themeId} packaged text defaults drifted from source`);
    assert.deepEqual(
      packageTheme.settings.textFields,
      sourceTheme.settings.textFields,
      `${themeId} packaged text capabilities drifted from source`,
    );
    assertLivelyProperties(
      JSON.parse(fs.readFileSync(propertiesPath, 'utf8')),
      sourceConfig,
      packageTheme,
    );
    assert.ok(
      packageConfig.themes.every((theme) => theme.id !== 'brand-new-day'),
      `${themeId} package unexpectedly contains Brand New Day`,
    );
  });
}

for (const themeId of ACTIVE_THEME_IDS) {
  const packageRoot = path.join(browserReleaseRoot, themeId);
  test(`Browser package matrix: ${themeId}`, () => {
    const packageConfigPath = path.join(packageRoot, 'assets', 'data', 'config.js');
    const packageIndexPath = path.join(packageRoot, 'index.html');
    assert.deepEqual(
      listRelativeFiles(packageRoot),
      BROWSER_PACKAGE_FILES,
      `${themeId} browser package contains unexpected or missing files`,
    );
    assert.ok(fs.existsSync(packageConfigPath), `${themeId} browser package config is missing`);
    assert.ok(fs.existsSync(packageIndexPath), `${themeId} browser package HTML is missing`);
    assertNoAuthoringLayerReferences(packageConfigPath, `${themeId} browser package`);
    assert.equal(
      fs.existsSync(path.join(packageRoot, 'LivelyProperties.json')),
      false,
      `${themeId} browser package must not contain LivelyProperties.json`,
    );

    const packageConfig = loadConfig(packageConfigPath);
    assert.deepEqual(packageConfig.build, {
      mode: 'customer',
      platform: 'browser',
      edition: 'premium',
    });
    assert.equal(packageConfig.settings.defaultThemeId, themeId);
    assert.equal(packageConfig.settings.showThemeSwitcher, false);
    assert.equal(packageConfig.settings.showSettingsPanel, true);
    assert.equal(packageConfig.settings.persistSettings, true);
    assert.equal(packageConfig.settings.maxRenderPixels, 2560 * 1440);
    assert.deepEqual(packageConfig.controls, sourceConfig.controls);
    assert.equal(packageConfig.themes.length, 1);

    const packageTheme = packageConfig.themes[0];
    const sourceTheme = getTheme(sourceConfig, themeId);
    assert.equal(packageTheme.id, themeId);
    assertThemeContract(packageTheme, THEME_MATRIX[themeId], packageRoot, {
      requireLivelyAssets: false,
    });
    assert.deepEqual(packageTheme.assets, {
      imageAtRest: 'assets/images/base.webp',
      imageInTrail: 'assets/images/reveal.webp',
    });
    for (const [slotName, packagedAssetPath] of Object.entries(packageTheme.assets)) {
      assert.deepEqual(
        fs.readFileSync(path.join(packageRoot, packagedAssetPath)),
        fs.readFileSync(path.join(projectRoot, sourceTheme.assets[slotName])),
        `${themeId} packaged ${slotName} does not match its browser-optimized source asset`,
      );
    }
    assert.equal(
      sha256Bytes(fs.readFileSync(packageIndexPath)),
      PRESERVED_STATE_A_INDEX_SHA256,
      `${themeId} browser package no longer preserves the approved State A baseline`,
    );
    assert.deepEqual(
      packageTheme.trails,
      sourceTheme.trails,
      `${themeId} browser trails drifted from the migrated source config`,
    );
    assert.deepEqual(packageTheme.content, sourceTheme.content, `${themeId} browser text defaults drifted from source`);
    assert.deepEqual(
      packageTheme.settings.textFields,
      sourceTheme.settings.textFields,
      `${themeId} browser text capabilities drifted from source`,
    );
  });
}
