const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(process.argv[2] || '.');
const configPath = path.join(projectRoot, 'assets', 'data', 'config.js');
const htmlPath = path.join(projectRoot, 'index.html');
const livelyInfoPath = path.join(projectRoot, 'LivelyInfo.json');
const livelyPropertiesPath = path.join(projectRoot, 'LivelyProperties.json');
const context = {};

vm.createContext(context);
vm.runInContext(
  `${fs.readFileSync(configPath, 'utf8')};globalThis.__config=APP_CONFIG`,
  context,
);

const html = fs.readFileSync(htmlPath, 'utf8');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter(Boolean);

assert(inlineScripts.length > 0, 'index.html must contain an inline application script.');
new Function(inlineScripts.at(-1));
assert(!/\.innerHTML\s*=/.test(html), 'Theme and customer text must never be assigned through innerHTML.');
assert(/node\.textContent\s*=\s*value/.test(html), 'Theme content must be rendered through textContent.');
assert(/function\s+isEditableTarget\s*\(/.test(html), 'index.html must identify editable settings controls.');
assert(
  /if\s*\(\s*isEditableTarget\(event\.target\)\s*\)\s*return/.test(html),
  'H and M hotkeys must be ignored while editing customer text.',
);
const rendererRegistryStart = html.indexOf('const TRAIL_RENDERERS = {');
const rendererLookupStart = html.indexOf('function getActiveTrailRenderer', rendererRegistryStart);
const rendererLookupEnd = html.indexOf('function drawActiveTrailMask', rendererLookupStart);
assert(rendererRegistryStart >= 0 && rendererLookupStart > rendererRegistryStart, 'index.html must define TRAIL_RENDERERS.');
assert(rendererLookupEnd > rendererLookupStart, 'index.html must define an active renderer lookup.');
const rendererRegistrySource = html.slice(rendererRegistryStart, rendererLookupStart);
const rendererLookupSource = html.slice(rendererLookupStart, rendererLookupEnd);
assert(
  !/(?:\|\||\?\?)/.test(rendererLookupSource),
  'Renderer lookup must fail explicitly instead of silently falling back.',
);
assert(
  /if\s*\(\s*!renderer\s*\)[\s\S]*throw\s+new\s+Error\s*\(/.test(rendererLookupSource),
  'Renderer lookup must throw when a renderer is unknown.',
);

const config = context.__config;
const numericControls = [
  'headSize',
  'trailPersistence',
  'effectIntensity',
  'glowStrength',
  'backgroundDimming',
];
const performanceModes = new Set(['quality', 'balanced', 'low-power']);
const knownCapabilities = new Set([
  'trailSelection',
  ...numericControls,
  'performanceMode',
  'artworkMotion',
  'uiVisibility',
  'settingsButtonVisibility',
  'textCustomization',
]);
const allowedBlendModes = new Set([
  'source-over',
  'screen',
  'lighter',
  'multiply',
  'overlay',
]);
const requiredFontKeys = ['logo', 'title', 'eyebrow', 'desc'];
const requiredColorKeys = [
  'primary',
  'secondary',
  'logoColor',
  'logoStroke',
  'titleShadow',
  'rightTitleShadow',
];
const textFieldContract = {
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
const requiredContentKeys = Object.keys(textFieldContract);
const reservedLivelyPropertyNames = new Set([
  'showUi',
  'artworkMotion',
  'trailId',
  ...numericControls,
  'performanceMode',
  'customTextSection',
  'resetSettings',
]);
const livelyPackageFiles = [
  'index.html',
  'LivelyInfo.json',
  'LivelyProperties.json',
  'assets/data/config.js',
  'assets/images/base.webp',
  'assets/images/reveal.webp',
].sort();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertObject(value, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
  return value;
}

function assertString(value, label) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label} must be a non-empty string.`);
}

function assertBoundedString(value, maximumLength, label) {
  assertString(value, label);
  assert(value.length <= maximumLength, `${label} exceeds ${maximumLength} characters.`);
}

function assertExactObjectKeys(value, expectedKeys, label) {
  const actualKeys = Object.keys(assertObject(value, label)).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  assert(
    actualKeys.length === sortedExpectedKeys.length &&
      actualKeys.every((key, index) => key === sortedExpectedKeys[index]),
    `${label} contains missing or unsupported fields.`,
  );
}

function countCodePoints(value) {
  return Array.from(value).length;
}

function assertPlainTextDefault(value, definition, label) {
  assert(typeof value === 'string', `${label} must be a string.`);
  assert(!value.includes('\r'), `${label} must use LF line breaks.`);
  assert(
    !/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/u.test(value),
    `${label} contains unsupported control characters.`,
  );
  assert(!/<\s*\/?\s*[a-z][^>]*>/iu.test(value), `${label} must be plain text, not HTML.`);
  assert(
    !/&(?:#\d{1,7}|#x[\da-f]{1,6}|[a-z][a-z0-9]{1,31});/iu.test(value),
    `${label} must use literal characters instead of HTML entities.`,
  );
  assert(countCodePoints(value) <= definition.maxLength, `${label} exceeds ${definition.maxLength} characters.`);
  if (definition.required) {
    assert(value.trim().length > 0, `${label} is required.`);
  }
  const lineCount = value.split('\n').length;
  if (definition.multiline) {
    assert(lineCount <= definition.maxLines, `${label} exceeds ${definition.maxLines} lines.`);
  } else {
    assert(lineCount === 1, `${label} does not support line breaks.`);
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

function assertSafeId(value, label) {
  assertString(value, label);
  assert(value.length <= 64 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), `${label} must be a safe lowercase slug.`);
}

function assertNumber(value, minimum, maximum, label, options = {}) {
  assert(Number.isFinite(value), `${label} must be finite.`);
  assert(value >= minimum && value <= maximum, `${label} must be between ${minimum} and ${maximum}.`);
  if (options.integer) assert(Number.isInteger(value), `${label} must be an integer.`);
}

function forEachDense(array, label, callback) {
  for (let index = 0; index < array.length; index += 1) {
    assert(Object.hasOwn(array, index), `${label}[${index}] must not be empty.`);
    callback(array[index], index);
  }
}

function assertScale(value, label, maximum = 8) {
  assertNumber(value, 0.001, maximum, label);
}

function assertOpacity(value, label) {
  assertNumber(value, 0, 1, label);
}

function assertSafePath(assetPath, label) {
  assertString(assetPath, label);
  assert(assetPath.length <= 512 && !assetPath.includes('\0'), `${label} is not a safe filesystem path.`);
  assert(
    !path.isAbsolute(assetPath) && !assetPath.split(/[\\/]+/).includes('..'),
    `Unsafe ${label}: ${assetPath}`,
  );
  assert(path.extname(assetPath).toLowerCase() === '.webp', `${label} must reference a WebP file.`);
}

function assertSafeProjectFile(filePath, allowedExtensions, label) {
  assertString(filePath, label);
  assert(filePath.length <= 512 && !filePath.includes('\0'), `${label} is not a safe filesystem path.`);
  assert(
    !path.isAbsolute(filePath) && !filePath.split(/[\\/]+/).includes('..'),
    `Unsafe ${label}: ${filePath}`,
  );
  assert(allowedExtensions.includes(path.extname(filePath).toLowerCase()),
    `${label} must use one of: ${allowedExtensions.join(', ')}.`);
  const resolvedPath = path.resolve(projectRoot, filePath);
  const relativePath = path.relative(projectRoot, resolvedPath);
  assert(relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath),
    `Unsafe ${label}: ${filePath}`);
  assert(fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile(),
    `Missing ${label}: ${filePath}`);
}

function listRelativeFiles(directoryPath) {
  const files = [];
  const pending = [directoryPath];
  while (pending.length) {
    const currentPath = pending.pop();
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      assert(!entry.isSymbolicLink(), `Lively package must not contain a symlink: ${entryPath}`);
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

function assertColor(value, label) {
  assertString(value, label);
  assert(value.length <= 128, `${label} is too long.`);

  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return;

  const match = /^(rgba?)\(([^)]+)\)$/i.exec(value);
  assert(match, `${label} must use a hexadecimal, rgb(), or rgba() color.`);
  const channels = match[2].split(',').map((part) => part.trim());
  const expectedLength = match[1].toLowerCase() === 'rgba' ? 4 : 3;
  assert(channels.length === expectedLength, `${label} has an invalid channel count.`);

  for (const channel of channels.slice(0, 3)) {
    assert(/^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(channel), `${label} has an invalid color channel.`);
    const percent = channel.endsWith('%');
    const number = Number(percent ? channel.slice(0, -1) : channel);
    assertNumber(number, 0, percent ? 100 : 255, `${label} color channel`);
  }
  if (expectedLength === 4) {
    const alpha = channels[3];
    assert(/^(?:\d+(?:\.\d+)?|\.\d+)%?$/.test(alpha), `${label} has an invalid alpha channel.`);
    const percent = alpha.endsWith('%');
    const number = Number(percent ? alpha.slice(0, -1) : alpha);
    assertNumber(number, 0, percent ? 100 : 1, `${label} alpha channel`);
  }
}

function validateBlendMode(value, label) {
  assert(allowedBlendModes.has(value), `${label} has unsupported blend mode ${value}.`);
}

function validateGradientStops(stops, label) {
  assert(Array.isArray(stops), `${label} must be an array.`);
  assert(stops.length >= 2 && stops.length <= 12, `${label} must contain between 2 and 12 stops.`);
  let previousOffset = -1;
  forEachDense(stops, label, (stop, index) => {
    assertObject(stop, `${label}[${index}]`);
    assertNumber(stop.offset, 0, 1, `${label}[${index}].offset`);
    assert(stop.offset >= previousOffset, `${label} offsets must not decrease.`);
    assertColor(stop.color, `${label}[${index}].color`);
    previousOffset = stop.offset;
  });
  assert(Math.abs(stops[0].offset) < 1e-9, `${label} must begin at offset 0.`);
  assert(Math.abs(stops.at(-1).offset - 1) < 1e-9, `${label} must end at offset 1.`);
}

function validateNormalizedPathCommands(commands, label) {
  const commandArities = { M: 2, L: 2, Q: 4, C: 6, Z: 0 };
  assert(Array.isArray(commands), `${label} must be an array.`);
  assert(commands.length >= 3 && commands.length <= 64, `${label} must contain between 3 and 64 commands.`);
  assert(commands[0]?.[0] === 'M', `${label} must begin with M.`);
  assert(commands.at(-1)?.[0] === 'Z', `${label} must end with Z.`);

  forEachDense(commands, label, (command, index) => {
    assert(Array.isArray(command) && typeof command[0] === 'string', `${label}[${index}] is invalid.`);
    const opcode = command[0];
    assert(Object.hasOwn(commandArities, opcode), `${label}[${index}] uses unsupported command ${opcode}.`);
    assert(command.length === commandArities[opcode] + 1, `${label}[${index}] has the wrong number of values.`);
    if (index > 0) assert(opcode !== 'M', `${label} may contain only one subpath.`);
    if (index < commands.length - 1) assert(opcode !== 'Z', `${label} may close only at the end.`);
    for (let valueIndex = 1; valueIndex < command.length; valueIndex += 1) {
      assert(Object.hasOwn(command, valueIndex), `${label}[${index}][${valueIndex}] must not be empty.`);
      assertNumber(command[valueIndex], -4, 4, `${label}[${index}][${valueIndex}]`);
    }
  });
}

function validateRibbonLayer(layer, label) {
  assertObject(layer, label);
  assertScale(layer.widthScale, `${label}.widthScale`);
  assertColor(layer.color, `${label}.color`);
  assertOpacity(layer.opacity, `${label}.opacity`);
  if ('skipInLowPower' in layer) {
    assert(typeof layer.skipInLowPower === 'boolean', `${label}.skipInLowPower must be boolean.`);
  }
}

function validateCloudLayer(layer, label) {
  assertObject(layer, label);
  assertScale(layer.scale, `${label}.scale`);
  assertColor(layer.color, `${label}.color`);
  assertOpacity(layer.opacity, `${label}.opacity`);
}

function validateStrokeLayer(layer, label) {
  assertObject(layer, label);
  assertOpacity(layer.opacity, `${label}.opacity`);
  assertColor(layer.color, `${label}.color`);
  assertNumber(layer.lineWidthMinimum, 0.1, 64, `${label}.lineWidthMinimum`);
  assertNumber(layer.lineWidthScale, 0.0001, 1, `${label}.lineWidthScale`);
}

function validateMinimalRevealStyle(style, label) {
  assertObject(style, label);
  const mask = assertObject(style.mask, `${label}.mask`);
  assertScale(mask.ribbonWidthScale, `${label}.mask.ribbonWidthScale`);
  assertColor(mask.ribbonColor, `${label}.mask.ribbonColor`);
  assertOpacity(mask.ribbonOpacity, `${label}.mask.ribbonOpacity`);
  assertScale(mask.headScale, `${label}.mask.headScale`);
  assertColor(mask.headColor, `${label}.mask.headColor`);

  const glow = assertObject(style.glow, `${label}.glow`);
  assertScale(glow.radiusScale, `${label}.glow.radiusScale`);
  validateGradientStops(glow.stops, `${label}.glow.stops`);
}

function validateHeroLightStyle(style, label) {
  assertObject(style, label);
  const mask = assertObject(style.mask, `${label}.mask`);
  assertScale(mask.ribbonWidthScale, `${label}.mask.ribbonWidthScale`);
  assertColor(mask.ribbonColor, `${label}.mask.ribbonColor`);
  assertOpacity(mask.ribbonOpacity, `${label}.mask.ribbonOpacity`);
  assertScale(mask.headScale, `${label}.mask.headScale`);
  assertNumber(mask.innerRadiusScale, 0, mask.headScale, `${label}.mask.innerRadiusScale`);
  validateGradientStops(mask.featherStops, `${label}.mask.featherStops`);

  const overlay = assertObject(style.overlay, `${label}.overlay`);
  validateBlendMode(overlay.blendMode, `${label}.overlay.blendMode`);
  assert(Array.isArray(overlay.ribbonLayers) && overlay.ribbonLayers.length >= 1 && overlay.ribbonLayers.length <= 8, `${label}.overlay.ribbonLayers must contain between 1 and 8 layers.`);
  forEachDense(overlay.ribbonLayers, `${label}.overlay.ribbonLayers`, (layer, index) => validateRibbonLayer(layer, `${label}.overlay.ribbonLayers[${index}]`));
  assertScale(overlay.haloRadiusScale, `${label}.overlay.haloRadiusScale`);
  validateGradientStops(overlay.haloStops, `${label}.overlay.haloStops`);
}

function validateGearPiStyle(style, label) {
  assertObject(style, label);
  const mask = assertObject(style.mask, `${label}.mask`);
  assertScale(mask.ribbonWidthScale, `${label}.mask.ribbonWidthScale`);
  assertColor(mask.ribbonColor, `${label}.mask.ribbonColor`);
  assertOpacity(mask.ribbonOpacity, `${label}.mask.ribbonOpacity`);
  assertScale(mask.cloudScale, `${label}.mask.cloudScale`);
  assertColor(mask.cloudColor, `${label}.mask.cloudColor`);
  validateNormalizedPathCommands(mask.cloudCommands, `${label}.mask.cloudCommands`);

  const overlay = assertObject(style.overlay, `${label}.overlay`);
  validateBlendMode(overlay.blendMode, `${label}.overlay.blendMode`);
  assert(Array.isArray(overlay.ribbonLayers) && overlay.ribbonLayers.length >= 1 && overlay.ribbonLayers.length <= 8, `${label}.overlay.ribbonLayers must contain between 1 and 8 layers.`);
  forEachDense(overlay.ribbonLayers, `${label}.overlay.ribbonLayers`, (layer, index) => validateRibbonLayer(layer, `${label}.overlay.ribbonLayers[${index}]`));
  assert(Array.isArray(overlay.cloudLayers) && overlay.cloudLayers.length >= 1 && overlay.cloudLayers.length <= 8, `${label}.overlay.cloudLayers must contain between 1 and 8 layers.`);
  forEachDense(overlay.cloudLayers, `${label}.overlay.cloudLayers`, (layer, index) => validateCloudLayer(layer, `${label}.overlay.cloudLayers[${index}]`));
}

function validateStrandOffsets(offsets, label) {
  assert(Array.isArray(offsets), `${label} must be an array.`);
  assert(offsets.length >= 1 && offsets.length <= 9, `${label} must contain between 1 and 9 offsets.`);
  const seenOffsets = new Set();
  forEachDense(offsets, label, (offset, index) => {
    assertNumber(offset, -4, 4, `${label}[${index}]`);
    assert(!seenOffsets.has(offset), `${label} must not contain duplicate offsets.`);
    seenOffsets.add(offset);
  });
  assert(offsets.some((offset) => Math.abs(offset) < 1e-9), `${label} must contain the center strand (0).`);
}

function validateWebStyle(style, label, masked) {
  assertObject(style, label);
  const mask = assertObject(style.mask, `${label}.mask`);
  assertScale(mask.ribbonWidthScale, `${label}.mask.ribbonWidthScale`);
  assertColor(mask.ribbonColor, `${label}.mask.ribbonColor`);
  assertOpacity(mask.ribbonOpacity, `${label}.mask.ribbonOpacity`);
  assertScale(mask.clearScale, `${label}.mask.clearScale`);
  assertScale(mask.headScale, `${label}.mask.headScale`);
  assert(mask.clearScale >= mask.headScale, `${label}.mask.clearScale must cover the shaped head.`);
  assertColor(mask.headColor, `${label}.mask.headColor`);
  assertNumber(mask.boundarySpokes, 3, 64, `${label}.mask.boundarySpokes`, { integer: true });
  assertNumber(mask.boundarySagScale, 0.05, 2, `${label}.mask.boundarySagScale`);
  assertNumber(mask.boundaryRotationRadians, -Math.PI * 2, Math.PI * 2, `${label}.mask.boundaryRotationRadians`);

  const body = assertObject(style.body, `${label}.body`);
  validateBlendMode(body.blendMode, `${label}.body.blendMode`);
  assertColor(body.color, `${label}.body.color`);
  assertOpacity(body.opacity, `${label}.body.opacity`);
  assertScale(body.spreadScale, `${label}.body.spreadScale`, 4);
  validateStrandOffsets(body.strandOffsets, `${label}.body.strandOffsets`);
  assertNumber(body.bucketCount, 1, 32, `${label}.body.bucketCount`, { integer: true });
  assertNumber(body.lineWidthMinimum, 0.1, 64, `${label}.body.lineWidthMinimum`);
  assertNumber(body.lineWidthScale, 0.0001, 1, `${label}.body.lineWidthScale`);
  assertNumber(body.spreadBase, 0, 4, `${label}.body.spreadBase`);
  assertNumber(body.spreadLifeScale, 0, 4, `${label}.body.spreadLifeScale`);
  assert(body.spreadBase + body.spreadLifeScale <= 4, `${label}.body spread scales are too large.`);
  assertNumber(body.crossbarEvery, 1, 64, `${label}.body.crossbarEvery`, { integer: true });
  assertNumber(body.crossbarBendScale, 0, 2, `${label}.body.crossbarBendScale`);
  assertOpacity(body.alphaBase, `${label}.body.alphaBase`);
  assertOpacity(body.alphaLifeScale, `${label}.body.alphaLifeScale`);
  assert(body.alphaBase + body.alphaLifeScale <= 1, `${label}.body alpha scales must not exceed 1 together.`);

  const head = assertObject(style.head, `${label}.head`);
  assertScale(head.radiusScale, `${label}.head.radiusScale`);
  assertNumber(head.spokes, 3, 64, `${label}.head.spokes`, { integer: true });
  assertNumber(head.rings, 1, 16, `${label}.head.rings`, { integer: true });
  assertNumber(head.rotationRadians, -Math.PI * 2, Math.PI * 2, `${label}.head.rotationRadians`);
  assertNumber(head.ringSagScale, 0.05, 2, `${label}.head.ringSagScale`);
  assert(head.spokes === mask.boundarySpokes, `${label} boundary and head spoke counts must match.`);
  assert(Math.abs(head.rotationRadians - mask.boundaryRotationRadians) < 1e-9, `${label} boundary and head rotations must match.`);
  assert(Math.abs(head.radiusScale - mask.headScale) < 1e-9, `${label} mask and visible head scales must match.`);
  validateStrokeLayer(head.darkLayer, `${label}.head.darkLayer`);
  validateStrokeLayer(head.lightLayer, `${label}.head.lightLayer`);

  if (masked) {
    validateNormalizedPathCommands(head.eyeCommands, `${label}.head.eyeCommands`);
    const eyes = assertObject(head.eyes, `${label}.head.eyes`);
    const fill = assertObject(eyes.fill, `${label}.head.eyes.fill`);
    assertOpacity(fill.opacity, `${label}.head.eyes.fill.opacity`);
    assertColor(fill.color, `${label}.head.eyes.fill.color`);
    validateStrokeLayer(eyes.darkStroke, `${label}.head.eyes.darkStroke`);
    validateStrokeLayer(eyes.accentStroke, `${label}.head.eyes.accentStroke`);
    assertColor(eyes.accentStroke.shadowColor, `${label}.head.eyes.accentStroke.shadowColor`);
    assertNumber(eyes.accentStroke.shadowBlurScale, 0, 2, `${label}.head.eyes.accentStroke.shadowBlurScale`);
    validateStrokeLayer(eyes.highlightStroke, `${label}.head.eyes.highlightStroke`);
    assertScale(eyes.highlightStroke.scale, `${label}.head.eyes.highlightStroke.scale`, 4);
  } else {
    assert(!('eyeCommands' in head) && !('eyes' in head), `${label} radial web style must not define mask eyes.`);
  }
}

const rendererValidators = {
  minimalReveal: validateMinimalRevealStyle,
  heroLight: validateHeroLightStyle,
  gearPi: validateGearPiStyle,
  maskedWeb: (style, label) => validateWebStyle(style, label, true),
  radialWeb: (style, label) => validateWebStyle(style, label, false),
};

function isRendererRegistered(renderer) {
  const escapedRenderer = renderer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[,{}\\s])(?:["']${escapedRenderer}["']|${escapedRenderer})\\s*:`)
    .test(rendererRegistrySource);
}

function validateInteraction(interaction, label) {
  assertObject(interaction, label);
  assertNumber(interaction.baseTrailDurationMs, 100, 10000, `${label}.baseTrailDurationMs`);
  assertNumber(interaction.followRate, 0.1, 60, `${label}.followRate`);
  assertNumber(interaction.maxTrailPoints, 8, 512, `${label}.maxTrailPoints`, { integer: true });
  const headRadius = assertObject(interaction.headRadius, `${label}.headRadius`);
  assertNumber(headRadius.minimum, 8, 1024, `${label}.headRadius.minimum`);
  assertNumber(headRadius.viewportScale, 0.001, 2, `${label}.headRadius.viewportScale`);
  assertNumber(interaction.headSizeFollowRate, 0.1, 60, `${label}.headSizeFollowRate`);
  assertNumber(interaction.headScaleBlendRadius, 0.05, 8, `${label}.headScaleBlendRadius`);
  assertNumber(interaction.reentryDistanceScale, 0.05, 10, `${label}.reentryDistanceScale`);

  const ribbon = assertObject(interaction.ribbon, `${label}.ribbon`);
  assertNumber(ribbon.alphaExponent, 0.05, 8, `${label}.ribbon.alphaExponent`);
  assertNumber(ribbon.tailWidthScale, 0.001, 2, `${label}.ribbon.tailWidthScale`);
  assertNumber(ribbon.lifeWidthScale, 0.001, 2, `${label}.ribbon.lifeWidthScale`);
  assert(ribbon.tailWidthScale + ribbon.lifeWidthScale <= 2, `${label}.ribbon width scales are too large together.`);

  const sampling = assertObject(interaction.sampling, `${label}.sampling`);
  assertNumber(sampling.minimumSpacing, 0.5, 256, `${label}.sampling.minimumSpacing`);
  assertNumber(sampling.maximumSpacing, sampling.minimumSpacing, 512, `${label}.sampling.maximumSpacing`);
  assertNumber(sampling.headRadiusFactor, 0.001, 2, `${label}.sampling.headRadiusFactor`);
  assertNumber(sampling.maxSamplesPerFrame, 1, 128, `${label}.sampling.maxSamplesPerFrame`, { integer: true });
  assert(interaction.maxTrailPoints >= sampling.maxSamplesPerFrame, `${label}.maxTrailPoints must accommodate one frame of samples.`);
}

function validatePerformanceCounts(counts, maximum, label) {
  assertExactObjectKeys(counts, ['quality', 'balanced', 'low-power'], label);
  for (const mode of ['quality', 'balanced', 'low-power']) {
    assertNumber(counts[mode], 0, maximum, `${label}.${mode}`, { integer: true });
  }
  assert(counts.quality >= counts.balanced, `${label}.quality must be at least balanced.`);
  assert(counts.balanced >= counts['low-power'], `${label}.balanced must be at least low-power.`);
}

function validateLivingPolygon(points, label, maximumPoints = 16) {
  assert(Array.isArray(points) && points.length >= 3 && points.length <= maximumPoints,
    `${label} must contain 3 to ${maximumPoints} normalized points.`);
  points.forEach((point, index) => {
    assert(Array.isArray(point) && point.length === 2, `${label}[${index}] must be [x, y].`);
    assertNumber(point[0], 0, 1, `${label}[${index}][0]`);
    assertNumber(point[1], 0, 1, `${label}[${index}][1]`);
  });
}

function validateLivingPuppetRegion(region, label) {
  assertExactObjectKeys(region, [
    'id',
    'material',
    'axis',
    'anchor',
    'points',
    'crossAmplitude',
    'alongAmplitude',
    'frequency',
    'speed',
    'phase',
    'falloff',
    'pointerInfluence',
    'opacity',
  ], label);
  assert(typeof region.id === 'string' && /^[a-z0-9-]+$/.test(region.id), `${label}.id is invalid.`);
  assert(['hair', 'fabric', 'grass'].includes(region.material),
    `${label}.material must be hair, fabric, or grass.`);
  assert(['x', 'y'].includes(region.axis), `${label}.axis must be x or y.`);
  assert(['start', 'end'].includes(region.anchor), `${label}.anchor must be start or end.`);
  validateLivingPolygon(region.points, `${label}.points`, 12);
  assertNumber(region.crossAmplitude, 0, 0.025, `${label}.crossAmplitude`);
  assertNumber(region.alongAmplitude, 0, 0.01, `${label}.alongAmplitude`);
  assertNumber(region.frequency, 0.1, 16, `${label}.frequency`);
  assertNumber(region.speed, 0.02, 2, `${label}.speed`);
  assertNumber(region.phase, 0, Math.PI * 2, `${label}.phase`);
  assertNumber(region.falloff, 0.5, 4, `${label}.falloff`);
  assertNumber(region.pointerInfluence, 0, 1, `${label}.pointerInfluence`);
  assertNumber(region.opacity, 0.5, 1, `${label}.opacity`);
}

function validateLivingMotion(motion, label, theme) {
  assertExactObjectKeys(motion, ['enabled', 'parallax', 'deformation', 'atmosphere'], label);
  assert(motion.enabled === true, `${label}.enabled must be true when motion is configured.`);

  const parallax = assertObject(motion.parallax, `${label}.parallax`);
  assertExactObjectKeys(parallax, [
    'overscanScale',
    'pointerStrengthX',
    'pointerStrengthY',
    'ambientStrengthX',
    'ambientStrengthY',
    'followRate',
  ], `${label}.parallax`);
  assertNumber(parallax.overscanScale, 1, 1.2, `${label}.parallax.overscanScale`);
  assertNumber(parallax.pointerStrengthX, 0, 40, `${label}.parallax.pointerStrengthX`);
  assertNumber(parallax.pointerStrengthY, 0, 40, `${label}.parallax.pointerStrengthY`);
  assertNumber(parallax.ambientStrengthX, 0, 20, `${label}.parallax.ambientStrengthX`);
  assertNumber(parallax.ambientStrengthY, 0, 20, `${label}.parallax.ambientStrengthY`);
  assertNumber(parallax.followRate, 0.1, 20, `${label}.parallax.followRate`);

  const deformation = assertObject(motion.deformation, `${label}.deformation`);
  assertExactObjectKeys(deformation, [
    'enabled',
    'sourceType',
    'meshDensity',
    'pointerResponse',
    'pointerFollowRate',
    'pointerDecayRate',
    'restingProtectedAreas',
    'revealedProtectedAreas',
    'restingRegions',
    'revealedRegions',
  ], `${label}.deformation`);
  assert(typeof deformation.enabled === 'boolean', `${label}.deformation.enabled must be boolean.`);
  assert(deformation.sourceType === 'flattened-pair',
    `${label}.deformation.sourceType must remain flattened-pair until a layered-asset contract is approved.`);
  assert(deformation.enabled === false,
    `${label}.deformation must remain disabled until a layered-asset contract is approved.`);
  validatePerformanceCounts(deformation.meshDensity, 12, `${label}.deformation.meshDensity`);
  assertNumber(deformation.pointerResponse, 0, 1, `${label}.deformation.pointerResponse`);
  assertNumber(deformation.pointerFollowRate, 0.1, 20, `${label}.deformation.pointerFollowRate`);
  assertNumber(deformation.pointerDecayRate, 0.1, 20, `${label}.deformation.pointerDecayRate`);
  for (const [areaName, areas] of [
    ['restingProtectedAreas', deformation.restingProtectedAreas],
    ['revealedProtectedAreas', deformation.revealedProtectedAreas],
  ]) {
    assert(Array.isArray(areas) && areas.length <= 8,
      `${label}.deformation.${areaName} must contain at most 8 polygons.`);
    areas.forEach((points, index) =>
      validateLivingPolygon(points, `${label}.deformation.${areaName}[${index}]`));
  }
  assert(Array.isArray(deformation.restingRegions) && deformation.restingRegions.length <= 8,
    `${label}.deformation.restingRegions must contain at most 8 regions.`);
  assert(Array.isArray(deformation.revealedRegions) && deformation.revealedRegions.length <= 10,
    `${label}.deformation.revealedRegions must contain at most 10 regions.`);
  const regionIds = new Set();
  [...deformation.restingRegions, ...deformation.revealedRegions].forEach((region, index) => {
    validateLivingPuppetRegion(region, `${label}.deformation.regions[${index}]`);
    assert(!regionIds.has(region.id), `${label}.deformation region id ${region.id} is duplicated.`);
    regionIds.add(region.id);
  });

  const atmosphere = assertObject(motion.atmosphere, `${label}.atmosphere`);
  assertExactObjectKeys(atmosphere, [
    'petalCount',
    'moteCount',
    'constellationLinkCount',
    'mistCount',
    'speedScale',
    'restingOpacity',
    'revealedOpacity',
    'starseed',
  ], `${label}.atmosphere`);
  validatePerformanceCounts(atmosphere.petalCount, 64, `${label}.atmosphere.petalCount`);
  validatePerformanceCounts(atmosphere.moteCount, 96, `${label}.atmosphere.moteCount`);
  validatePerformanceCounts(atmosphere.constellationLinkCount, 24, `${label}.atmosphere.constellationLinkCount`);
  validatePerformanceCounts(atmosphere.mistCount, 8, `${label}.atmosphere.mistCount`);
  assertNumber(atmosphere.speedScale, 0.05, 4, `${label}.atmosphere.speedScale`);
  assertOpacity(atmosphere.restingOpacity, `${label}.atmosphere.restingOpacity`);
  assertOpacity(atmosphere.revealedOpacity, `${label}.atmosphere.revealedOpacity`);
  const starseed = assertObject(atmosphere.starseed, `${label}.atmosphere.starseed`);
  assertExactObjectKeys(starseed, ['x', 'y', 'radiusScale'], `${label}.atmosphere.starseed`);
  assertNumber(starseed.x, 0, 1, `${label}.atmosphere.starseed.x`);
  assertNumber(starseed.y, 0, 1, `${label}.atmosphere.starseed.y`);
  assertNumber(starseed.radiusScale, 0.005, 0.25, `${label}.atmosphere.starseed.radiusScale`);
}

assertObject(config, 'APP_CONFIG');
assert(['development', 'customer'].includes(config.build?.mode), 'APP_CONFIG.build.mode is invalid.');
assert(['browser', 'lively', 'wallpaper-engine'].includes(config.build?.platform), 'APP_CONFIG.build.platform is invalid.');
assert(Array.isArray(config.themes) && config.themes.length > 0, 'APP_CONFIG.themes must be a non-empty array.');
assertObject(config.settings, 'APP_CONFIG.settings');
assertObject(config.controls, 'APP_CONFIG.controls');
assert(typeof config.settings.showThemeSwitcher === 'boolean', 'settings.showThemeSwitcher must be boolean.');
assert(typeof config.settings.showSettingsPanel === 'boolean', 'settings.showSettingsPanel must be boolean.');
assert(typeof config.settings.persistSettings === 'boolean', 'settings.persistSettings must be boolean.');
assertNumber(config.settings.maxRenderPixels, 1, 7680 * 4320, 'settings.maxRenderPixels', { integer: true });

if (config.build.mode === 'development' && config.build.platform === 'browser') {
  assert(config.settings.showThemeSwitcher === true, 'Development browser builds must expose the theme switcher.');
  assert(config.settings.showSettingsPanel === true, 'Development browser builds must expose the settings panel.');
}
if (config.build.mode === 'customer' && config.build.platform === 'browser') {
  assert(config.build.edition === 'premium', 'Customer browser builds must use the premium edition.');
  assert(config.settings.showThemeSwitcher === false, 'Customer browser builds must hide development theme controls.');
  assert(config.settings.showSettingsPanel === true, 'Customer browser builds must provide the customer settings menu.');
  assert(config.settings.persistSettings === true, 'Customer browser builds must persist customer settings.');
  assert(!fs.existsSync(livelyPropertiesPath), 'Customer browser builds must not include LivelyProperties.json.');
}

for (const controlName of numericControls) {
  const control = assertObject(config.controls[controlName], `${controlName} control`);
  assertNumber(control.min, 0, 1000, `${controlName}.min`);
  assertNumber(control.max, control.min, 1000, `${controlName}.max`);
  assertNumber(control.step, 0.001, Math.max(0.001, control.max - control.min), `${controlName}.step`);
}
const performanceOptions = config.controls.performanceMode?.options;
assert(Array.isArray(performanceOptions) && performanceOptions.length > 0, 'performanceMode requires options.');
forEachDense(performanceOptions, 'performanceMode.options', (option) => {
  assert(performanceModes.has(option), 'performanceMode contains an unsupported option.');
});
assert(new Set(performanceOptions).size === performanceOptions.length, 'performanceMode options must be unique.');

const textFieldDefinitions = assertObject(config.controls.textFields, 'controls.textFields');
const configuredTextFieldIds = Object.keys(textFieldDefinitions);
assert(
  configuredTextFieldIds.length === requiredContentKeys.length &&
    configuredTextFieldIds.every((fieldId, index) => fieldId === requiredContentKeys[index]),
  'controls.textFields must contain the ten supported fields in display order.',
);
const textPropertyNames = [];
for (const fieldId of requiredContentKeys) {
  const definition = textFieldDefinitions[fieldId];
  const expectedDefinition = textFieldContract[fieldId];
  assertExactObjectKeys(definition, Object.keys(expectedDefinition), `controls.textFields.${fieldId}`);
  assert(definition.propertyName === expectedDefinition.propertyName, `${fieldId}.propertyName is invalid.`);
  assert(definition.label === expectedDefinition.label, `${fieldId}.label is invalid.`);
  assert(definition.maxLength === expectedDefinition.maxLength, `${fieldId}.maxLength is invalid.`);
  assert(definition.multiline === expectedDefinition.multiline, `${fieldId}.multiline is invalid.`);
  assert(definition.required === expectedDefinition.required, `${fieldId}.required is invalid.`);
  if (expectedDefinition.multiline) {
    assert(definition.maxLines === expectedDefinition.maxLines, `${fieldId}.maxLines is invalid.`);
  }
  assert(
    /^[a-z][A-Za-z0-9]*$/.test(definition.propertyName),
    `${fieldId}.propertyName must be a lower-camel Lively property name.`,
  );
  assert(!reservedLivelyPropertyNames.has(definition.propertyName), `${fieldId}.propertyName is reserved.`);
  textPropertyNames.push(definition.propertyName);
}
assert(new Set(textPropertyNames).size === textPropertyNames.length, 'Text property names must be unique.');

const themeIds = config.themes.map((theme) => theme.id);
assert(new Set(themeIds).size === themeIds.length, 'Theme ids must be unique.');

const enabledThemes = [];
const enabledAssetPaths = [];
const enabledReleaseAssetPaths = [];
for (const theme of config.themes) {
  assertObject(theme, 'Theme');
  assertSafeId(theme.id, 'Every theme id');
  assertBoundedString(theme.themeName, 200, `${theme.id}.themeName`);
  assertBoundedString(theme.type, 100, `${theme.id}.type`);
  assert(!Object.hasOwn(theme, 'defaultTrailId'), `${theme.id}.defaultTrailId is obsolete; use settings.defaults.trailId.`);
  if ('enabled' in theme) assert(typeof theme.enabled === 'boolean', `${theme.id}.enabled must be boolean.`);
  if ('developmentPreview' in theme) {
    assert(typeof theme.developmentPreview === 'boolean', `${theme.id}.developmentPreview must be boolean.`);
    assert(theme.enabled === false, `${theme.id}.developmentPreview is only valid for disabled themes.`);
    assert(theme.release?.status === 'staging', `${theme.id}.developmentPreview requires staging release status.`);
  }
  const enabled = theme.enabled !== false;
  const previewedInDevelopment = !enabled
    && theme.developmentPreview === true
    && config.build.mode === 'development'
    && config.build.platform === 'browser';
  if (enabled) enabledThemes.push(theme);

  assert(['ready', 'staging'].includes(theme.release?.status), `${theme.id} has an invalid release status.`);
  assert(['final', 'placeholder'].includes(theme.release?.assetStatus), `${theme.id} has an invalid asset status.`);
  assert(theme.release.status !== 'ready' || theme.release.assetStatus === 'final', `${theme.id} cannot be ready with placeholder assets.`);

  const requiresLivelySlots = theme.release.status === 'ready'
    && !(config.build.mode === 'customer' && config.build.platform === 'browser');
  const livelyAssets = theme.release?.livelyAssets;
  if (config.build.mode === 'customer' && config.build.platform === 'browser') {
    assert(livelyAssets === undefined, `${theme.id} must not expose Lively asset metadata in a customer browser package.`);
  }
  if (requiresLivelySlots) {
    assertObject(livelyAssets, `${theme.id}.release.livelyAssets`);
    assertString(livelyAssets.imageAtRest, `${theme.id}.release.livelyAssets.imageAtRest`);
    assertString(livelyAssets.imageInTrail, `${theme.id}.release.livelyAssets.imageInTrail`);
  }
  if (livelyAssets !== undefined) {
    assertObject(livelyAssets, `${theme.id}.release.livelyAssets`);
    for (const [slot, assetPath] of Object.entries(livelyAssets)) {
      assertSafePath(assetPath, `${theme.id}.release.livelyAssets.${slot}`);
      if (enabled) enabledReleaseAssetPaths.push(assetPath);
    }
  }

  validateInteraction(theme.interaction, `${theme.id}.interaction`);
  if ('motion' in theme) validateLivingMotion(theme.motion, `${theme.id}.motion`, theme);
  assert(Array.isArray(theme.trails) && theme.trails.length > 0, `${theme.id} requires at least one trail.`);
  const trailIds = theme.trails.map((trail) => trail.id);
  assert(new Set(trailIds).size === trailIds.length, `${theme.id} trail ids must be unique.`);
  for (const trail of theme.trails) {
    assertObject(trail, `${theme.id} trail`);
    assertSafeId(trail.id, `${theme.id} trail id`);
    assertString(trail.name, `${theme.id}/${trail.id}.name`);
    assertString(trail.renderer, `${theme.id}/${trail.id}.renderer`);
    const validateStyle = rendererValidators[trail.renderer];
    assert(validateStyle, `${theme.id}/${trail.id} uses unsupported renderer ${trail.renderer}.`);
    assert(isRendererRegistered(trail.renderer), `${theme.id}/${trail.id} renderer ${trail.renderer} is not registered in index.html.`);
    validateStyle(trail.style, `${theme.id}/${trail.id}.style`);
  }

  const defaults = assertObject(theme.settings?.defaults, `${theme.id}.settings.defaults`);
  const capabilities = theme.settings?.capabilities;
  assert(Array.isArray(capabilities), `${theme.id} requires settings.capabilities.`);
  forEachDense(capabilities, `${theme.id}.settings.capabilities`, (capability) => {
    assert(knownCapabilities.has(capability), `${theme.id} has an unknown capability.`);
  });
  assert(new Set(capabilities).size === capabilities.length, `${theme.id} capabilities must be unique.`);
  assertString(defaults.trailId, `${theme.id}.settings.defaults.trailId`);
  assert(trailIds.includes(defaults.trailId), `${theme.id}.settings.defaults.trailId must reference one of its trails.`);
  assert(typeof defaults.showUi === 'boolean', `${theme.id}.settings.defaults.showUi must be boolean.`);
  assert(typeof defaults.showSettingsButton === 'boolean', `${theme.id}.settings.defaults.showSettingsButton must be boolean.`);
  if (capabilities.includes('artworkMotion')) {
    assert(theme.motion?.enabled === true, `${theme.id} enables artworkMotion without an enabled motion configuration.`);
    assert(typeof defaults.artworkMotion === 'boolean', `${theme.id}.settings.defaults.artworkMotion must be boolean.`);
  }
  for (const controlName of numericControls) {
    const control = config.controls[controlName];
    const value = defaults[controlName];
    assert(Number.isFinite(value) && value >= control.min && value <= control.max, `${theme.id} has invalid ${controlName} default.`);
  }
  assert(performanceOptions.includes(defaults.performanceMode), `${theme.id} has invalid performanceMode default.`);
  if (capabilities.includes('trailSelection')) {
    assert(theme.trails.length > 1, `${theme.id} enables trailSelection but has only one trail.`);
  }
  const supportedTextFields = theme.settings?.textFields;
  assert(Array.isArray(supportedTextFields), `${theme.id} requires settings.textFields.`);
  forEachDense(supportedTextFields, `${theme.id}.settings.textFields`, (fieldId) => {
    assert(typeof fieldId === 'string' && Object.hasOwn(textFieldDefinitions, fieldId), `${theme.id} references an unknown text field.`);
  });
  assert(new Set(supportedTextFields).size === supportedTextFields.length, `${theme.id} text fields must be unique.`);
  if (capabilities.includes('textCustomization')) {
    assert(supportedTextFields.length > 0, `${theme.id} enables textCustomization without supported fields.`);
  } else {
    assert(supportedTextFields.length === 0, `${theme.id} exposes text fields without textCustomization.`);
  }

  const assets = assertObject(theme.assets, `${theme.id}.assets`);
  assertString(assets.imageAtRest, `${theme.id}.assets.imageAtRest`);
  assertString(assets.imageInTrail, `${theme.id}.assets.imageInTrail`);
  for (const [slot, assetPath] of Object.entries(assets)) {
    assertSafePath(assetPath, `${theme.id}.assets.${slot}`);
    if (enabled || previewedInDevelopment) enabledAssetPaths.push(assetPath);
  }

  const fonts = assertObject(theme.fonts, `${theme.id}.fonts`);
  for (const key of requiredFontKeys) {
    assertBoundedString(fonts[key], 100, `${theme.id}.fonts.${key}`);
  }
  const colors = assertObject(theme.colors, `${theme.id}.colors`);
  for (const key of requiredColorKeys) {
    assertBoundedString(colors[key], 512, `${theme.id}.colors.${key}`);
  }
  const content = assertObject(theme.content, `${theme.id}.content`);
  assertExactObjectKeys(content, requiredContentKeys, `${theme.id}.content`);
  for (const fieldId of requiredContentKeys) {
    assertPlainTextDefault(content[fieldId], textFieldDefinitions[fieldId], `${theme.id}.content.${fieldId}`);
  }
}

assert(enabledThemes.length > 0, 'At least one theme must be enabled.');
const defaultTheme = config.themes.find((theme) => theme.id === config.settings.defaultThemeId);
assert(defaultTheme, 'settings.defaultThemeId must reference a configured theme.');
assert(defaultTheme.enabled !== false, 'settings.defaultThemeId must reference an enabled theme.');

if (config.build.mode === 'customer' && config.build.platform === 'browser') {
  assert(config.themes.length === 1 && enabledThemes.length === 1, 'A customer browser package must contain exactly one enabled theme.');
  assert(enabledThemes[0].release.status === 'ready' && enabledThemes[0].release.assetStatus === 'final', 'A customer browser package must contain release-ready final artwork.');
}

const missingAssets = [...new Set([...enabledAssetPaths, ...enabledReleaseAssetPaths])]
  .filter((assetPath) => {
    const resolvedPath = path.join(projectRoot, assetPath);
    return !fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile();
  });
if (missingAssets.length) {
  throw new Error(`Missing assets: ${missingAssets.join(', ')}`);
}

const hasLivelyProperties = fs.existsSync(livelyPropertiesPath);
if (config.build.platform === 'lively') {
  assert(hasLivelyProperties, 'A Lively release must include LivelyProperties.json.');
  assert(fs.existsSync(livelyInfoPath), 'A Lively release must include LivelyInfo.json.');
}
if (hasLivelyProperties) {
  assert(config.themes.length === 1 && enabledThemes.length === 1, 'A Lively release must contain exactly one enabled theme.');
  assert(config.build.mode === 'customer' && config.build.platform === 'lively', 'Lively build metadata is invalid.');
  assert(config.build.edition === 'premium', 'Lively builds must use the premium edition.');
  assert(config.settings.showThemeSwitcher === false, 'A Lively release must hide the theme switcher.');
  assert(config.settings.showSettingsPanel === false, 'A Lively release must use native settings instead of the browser panel.');
  assert(config.settings.persistSettings === false, 'A Lively release must leave persistence to the host.');
  const theme = enabledThemes[0];
  const info = JSON.parse(fs.readFileSync(livelyInfoPath, 'utf8'));
  assertObject(info, 'LivelyInfo.json');
  assert(info.AppVersion === '1.0.0.0', 'LivelyInfo.json AppVersion is invalid.');
  assert(info.Title === theme.themeName, 'LivelyInfo.json title is out of sync.');
  assert(info.Type === 1, 'LivelyInfo.json must describe a web wallpaper.');
  assert(info.FileName === 'index.html', 'LivelyInfo.json entry file is invalid.');
  assert(info.IsAbsolutePath === false, 'LivelyInfo.json must use package-relative paths.');
  assert(info.Id === theme.id, 'LivelyInfo.json id is out of sync.');
  assert(info.Version === 1, 'LivelyInfo.json version is invalid.');
  assert(info.Thumbnail === 'assets/images/base.webp', 'LivelyInfo.json thumbnail is invalid.');
  assert(fs.existsSync(path.join(projectRoot, info.Thumbnail)), 'LivelyInfo.json thumbnail is missing.');
  assert(theme.release?.status === 'ready' && theme.release?.assetStatus === 'final', 'A Lively release must contain release-ready final artwork.');
  assert(theme.release.livelyAssets.imageAtRest === theme.assets.imageAtRest, 'Lively imageAtRest slots are out of sync.');
  assert(theme.release.livelyAssets.imageInTrail === theme.assets.imageInTrail, 'Lively imageInTrail slots are out of sync.');
  const capabilities = new Set(theme.settings.capabilities);
  const defaults = theme.settings.defaults;
  const properties = JSON.parse(fs.readFileSync(livelyPropertiesPath, 'utf8'));
  assertObject(properties, 'LivelyProperties.json');
  const expectedPropertyKeys = [];

  if (capabilities.has('uiVisibility')) {
    expectedPropertyKeys.push('showUi');
    assert(properties.showUi?.type === 'checkbox', 'Lively showUi property is invalid.');
    assert(properties.showUi.value === defaults.showUi, 'Lively showUi default is out of sync.');
  }
  if (capabilities.has('artworkMotion')) {
    expectedPropertyKeys.push('artworkMotion');
    assertExactObjectKeys(properties.artworkMotion, ['type', 'value', 'text', 'help'], 'Lively artworkMotion property');
    assert(properties.artworkMotion.type === 'checkbox', 'Lively artworkMotion property is invalid.');
    assert(properties.artworkMotion.value === defaults.artworkMotion, 'Lively artworkMotion default is out of sync.');
    assert(properties.artworkMotion.text === 'Living artwork', 'Lively artworkMotion label is out of sync.');
  }
  if (capabilities.has('trailSelection') && theme.trails.length > 1) {
    expectedPropertyKeys.push('trailId');
    const trailProperty = properties.trailId;
    assert(trailProperty?.type === 'dropdown', 'Lively trailId property is invalid.');
    assert(Array.isArray(trailProperty.items) && trailProperty.items.length === theme.trails.length, 'Lively trail options are out of sync.');
    assert(trailProperty.items.every((item, index) => item === theme.trails[index].name), 'Lively trail labels are out of sync.');
    assert(trailProperty.value === theme.trails.findIndex((trail) => trail.id === defaults.trailId), 'Lively default trail is out of sync.');
  }
  for (const controlName of numericControls) {
    if (!capabilities.has(controlName)) continue;
    expectedPropertyKeys.push(controlName);
    const property = properties[controlName];
    const definition = config.controls[controlName];
    assert(property?.type === 'slider', `Lively ${controlName} property is invalid.`);
    assert(property.value === defaults[controlName], `Lively ${controlName} default is out of sync.`);
    assert(property.min === definition.min && property.max === definition.max && property.step === definition.step, `Lively ${controlName} bounds are out of sync.`);
  }
  if (capabilities.has('performanceMode')) {
    expectedPropertyKeys.push('performanceMode');
    const performanceProperty = properties.performanceMode;
    assert(performanceProperty?.type === 'dropdown', 'Lively performanceMode property is invalid.');
    assert(performanceProperty.value === performanceOptions.indexOf(defaults.performanceMode), 'Lively performanceMode default is out of sync.');
    assert(Array.isArray(performanceProperty.items) && performanceProperty.items.length === performanceOptions.length, 'Lively performanceMode options are out of sync.');
    assert(performanceProperty.items.every((item, index) => item === performanceOptions[index].replace(/-/g, ' ')), 'Lively performanceMode labels are out of sync.');
  }
  if (capabilities.has('textCustomization')) {
    expectedPropertyKeys.push('customTextSection');
    assertExactObjectKeys(properties.customTextSection, ['type', 'value'], 'Lively customTextSection property');
    assert(properties.customTextSection.type === 'label', 'Lively customTextSection property is invalid.');
    assert(properties.customTextSection.value === 'Custom text', 'Lively customTextSection label is invalid.');

    for (const fieldId of theme.settings.textFields) {
      const definition = textFieldDefinitions[fieldId];
      const propertyName = definition.propertyName;
      expectedPropertyKeys.push(propertyName);
      const property = properties[propertyName];
      assertExactObjectKeys(property, ['type', 'value', 'text', 'help'], `Lively ${propertyName} property`);
      assert(property.type === 'textbox', `Lively ${propertyName} property must be a textbox.`);
      assert(property.value === encodeLivelyTextboxValue(theme.content[fieldId], definition), `Lively ${propertyName} default is out of sync.`);
      assert(property.text === definition.label, `Lively ${propertyName} label is out of sync.`);
      assert(property.help === getLivelyTextHelp(definition), `Lively ${propertyName} help is out of sync.`);
    }
  }
  assert(!Object.hasOwn(properties, 'resetSettings'), 'Lively must use native Restore Default instead of resetSettings.');
  const actualPropertyKeys = Object.keys(properties);
  assert(
    actualPropertyKeys.length === expectedPropertyKeys.length &&
      actualPropertyKeys.every((key, index) => key === expectedPropertyKeys[index]),
    'LivelyProperties.json contains missing, unsupported, or incorrectly ordered properties.',
  );

  const actualPackageFiles = listRelativeFiles(projectRoot);
  assert(
    actualPackageFiles.length === livelyPackageFiles.length &&
      actualPackageFiles.every((filePath, index) => filePath === livelyPackageFiles[index]),
    'A Lively release must contain exactly the approved six files.',
  );
}

console.log(
  `Validated ${enabledThemes.length} enabled of ${config.themes.length} configured themes, ` +
  `${config.themes.reduce((total, theme) => total + theme.trails.length, 0)} trails, and ` +
  `${enabledAssetPaths.length} enabled-theme assets.`,
);
