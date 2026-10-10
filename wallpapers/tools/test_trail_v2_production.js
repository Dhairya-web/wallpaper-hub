const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'index.html');
const matrixPath = path.join(projectRoot, 'tools', 'test_config_package_matrix.js');
const configPath = path.join(projectRoot, 'assets', 'data', 'config.js');
const productionTestPath = path.join(projectRoot, 'tools', 'test_trail_v2_production.js');

const AUTHORIZED_STAGE_1_FILES = Object.freeze([
  'index.html',
  'tools/test_config_package_matrix.js',
  'tools/test_trail_v2_production.js',
]);
const STATE_B_BASELINE_INDEX_SHA256 = '21A459C4E9778671AF08138D47995EE913E1B17DB60D2F745E3EA3F3BBAA94E2';
const PRESERVED_STATE_A_INDEX_SHA256 = '479C31A0752E58D249AE6872160E7D82C4770983FE28AE559079E178EDCF322C';
const CONFIG_SHA256 = '3D43FE5558AF5131F37532CDFFF572C2B2E238320D90FD1921D6A5564A712724';

const indexSource = fs.readFileSync(indexPath, 'utf8');
const matrixSource = fs.readFileSync(matrixPath, 'utf8');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
}

function extractIndentedFunction(source, name) {
  const pattern = new RegExp(
    '      function ' + name + '\\([^\\n]*\\) \\{[\\s\\S]*?\\n      \\}',
  );
  const match = source.match(pattern);
  assert.ok(match, 'Missing production function: ' + name);
  return match[0];
}

function extractBetween(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.ok(start >= 0, 'Missing source token: ' + startToken);
  assert.ok(end > start, 'Missing source token: ' + endToken);
  return source.slice(start, end);
}

function loadProductionGeometry() {
  const block = extractBetween(
    indexSource,
    '// V2_MINIMAL_GEOMETRY_BEGIN',
    '// V2_MINIMAL_GEOMETRY_END',
  );
  const assignmentStart = block.indexOf('const V2_MINIMAL_GEOMETRY =');
  assert.ok(assignmentStart >= 0, 'V2 Minimal geometry assignment is missing');
  const executable = block
    .slice(assignmentStart)
    .replace(
      'const V2_MINIMAL_GEOMETRY =',
      'globalThis.V2_MINIMAL_GEOMETRY =',
    );
  const sandbox = Object.create(null);
  vm.createContext(sandbox);
  vm.runInContext(executable, sandbox, {
    filename: 'index.html#V2_MINIMAL_GEOMETRY',
    timeout: 2000,
  });
  assert.ok(sandbox.V2_MINIMAL_GEOMETRY, 'Production geometry API did not initialize');
  return sandbox.V2_MINIMAL_GEOMETRY;
}

const Geometry = loadProductionGeometry();

function loadFrame(workspace, points, sourceBudgetHit = false) {
  assert.ok(points.length <= workspace.sourceCapacity, 'Test frame exceeds source capacity');
  workspace.sourceCount = points.length;
  workspace.frame.count = points.length;
  workspace.frame.sourceBudgetHit = sourceBudgetHit;
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    workspace.sourceX[index] = point[0];
    workspace.sourceY[index] = point[1];
    workspace.sourceRadius[index] = point[2];
  }
  return workspace.frame;
}

function makeRadius(index, count, maximum = 42) {
  if (index === 0) return 0;
  return maximum * (0.2 + 0.8 * index / Math.max(1, count - 1));
}

function assertFiniteGeometry(workspace, label) {
  for (let index = 0; index < workspace.geometryCount; index += 1) {
    assert.ok(Number.isFinite(workspace.geometryX[index]), label + ' x is non-finite');
    assert.ok(Number.isFinite(workspace.geometryY[index]), label + ' y is non-finite');
    assert.ok(Number.isFinite(workspace.geometryRadius[index]), label + ' radius is non-finite');
    assert.ok(workspace.geometryRadius[index] >= 0, label + ' radius is negative');
  }
}

class FakeCanvasContext {
  constructor() {
    this.fillRules = [];
    this.fillCount = 0;
    this.strokeCount = 0;
    this.arcCount = 0;
    this.beginPathCount = 0;
    this.globalAlpha = 1;
    this.globalCompositeOperation = 'source-over';
    this.fillStyle = '';
  }

  save() {}
  restore() {}
  beginPath() { this.beginPathCount += 1; }
  closePath() {}
  moveTo(x, y) {
    assert.ok(Number.isFinite(x) && Number.isFinite(y), 'moveTo received non-finite coordinates');
  }
  lineTo(x, y) {
    assert.ok(Number.isFinite(x) && Number.isFinite(y), 'lineTo received non-finite coordinates');
  }
  arc(x, y, radius) {
    assert.ok(
      Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(radius),
      'arc received non-finite geometry',
    );
    this.arcCount += 1;
  }
  fill(rule) {
    this.fillCount += 1;
    this.fillRules.push(rule);
  }
  stroke() {
    this.strokeCount += 1;
  }
}

function deterministicTraces() {
  const straight = [];
  const broadCurve = [];
  const sCurve = [];
  const micro = [];
  for (let index = 0; index < 48; index += 1) {
    const ratio = index / 47;
    straight.push([60 + ratio * 780, 220, makeRadius(index, 48)]);
    broadCurve.push([
      70 + ratio * 760,
      390 - Math.sin(ratio * Math.PI) * 250,
      makeRadius(index, 48),
    ]);
    sCurve.push([
      70 + ratio * 760,
      270 + Math.sin(ratio * Math.PI * 2) * 150,
      makeRadius(index, 48),
    ]);
    micro.push([
      420 + Math.cos(ratio * Math.PI * 2) * 0.04,
      260 + Math.sin(ratio * Math.PI * 2) * 0.04,
      makeRadius(index, 48, 12),
    ]);
  }
  return [
    { id: 'slow-straight', points: straight },
    { id: 'broad-curve', points: broadCurve },
    { id: 's-curve', points: sCurve },
    {
      id: 'right-angle',
      points: [[90, 390, 0], [410, 390, 30], [410, 90, 42]],
    },
    {
      id: 'acute-turn',
      points: [[80, 420, 0], [710, 120, 38], [650, 450, 42]],
    },
    {
      id: 'near-reversal',
      points: [[100, 270, 0], [820, 270, 42], [120, 270, 42]],
    },
    {
      id: 'self-crossing',
      points: [
        [90, 120, 0], [760, 430, 20], [760, 120, 28],
        [90, 430, 34], [90, 120, 38], [760, 430, 42],
      ],
    },
    {
      id: 'reverse-retrace',
      points: [
        [90, 270, 0], [760, 270, 24], [100, 270, 34], [750, 270, 42],
      ],
    },
    { id: 'micro-movement', points: micro },
    {
      id: 'screen-edge',
      points: [[0, 0, 0], [0, 530, 24], [950, 530, 34], [950, 0, 42]],
    },
  ];
}

test('authorized Stage 1 inventory and immutable baselines are explicit', () => {
  assert.deepEqual(AUTHORIZED_STAGE_1_FILES, [
    'index.html',
    'tools/test_config_package_matrix.js',
    'tools/test_trail_v2_production.js',
  ]);
  for (const relativePath of AUTHORIZED_STAGE_1_FILES) {
    assert.ok(fs.existsSync(path.join(projectRoot, relativePath)), relativePath + ' is missing');
  }
  assert.equal(sha256(fs.readFileSync(configPath)), CONFIG_SHA256, 'Production config changed');
  assert.notEqual(
    sha256(fs.readFileSync(indexPath)),
    STATE_B_BASELINE_INDEX_SHA256,
    'Stage 1 source must contain the authorized implementation delta from State B',
  );
  assert.notEqual(
    sha256(fs.readFileSync(indexPath)),
    PRESERVED_STATE_A_INDEX_SHA256,
    'Current source must not be silently restored to State A',
  );
  assert.equal(path.resolve(productionTestPath), productionTestPath);
});

test('the complete inline production script is syntactically valid', () => {
  const match = indexSource.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match, 'Inline production script is missing');
  assert.doesNotThrow(() => new Function(match[1]));
});

test('geometry options sanitize non-finite values and storage is fixed-capacity', () => {
  const settings = Geometry.normalizedOptions({
    sourceCapacity: Infinity,
    geometryCapacity: NaN,
    pointEpsilon: NaN,
    maximumRadius: Infinity,
    bodyWidthFloor: Infinity,
    terminalTaperFraction: NaN,
    terminalTaperSegments: Infinity,
  });
  assert.equal(settings.sourceCapacity, 129);
  assert.equal(settings.geometryCapacity, 512);
  assert.equal(settings.pointEpsilon, 0.05);
  assert.equal(settings.maximumRadius, 4096);
  assert.equal(settings.bodyWidthFloor, 0.72);
  assert.equal(settings.terminalTaperFraction, 0.18);
  assert.equal(settings.terminalTaperSegments, 4);

  const workspace = Geometry.createWorkspace();
  assert.equal(workspace.sourceCapacity, 129);
  assert.equal(workspace.geometryCapacity, 512);
  assert.equal(workspace.sourceX.length, 129);
  assert.equal(workspace.sourceY.length, 129);
  assert.equal(workspace.sourceBorn.length, 129);
  assert.equal(workspace.sourceDistanceFromHead.length, 129);
  assert.equal(workspace.sourceRadius.length, 129);
  assert.equal(workspace.knotX.length, 129);
  assert.equal(workspace.knotY.length, 129);
  assert.equal(workspace.knotRadius.length, 129);
  assert.equal(workspace.geometryX.length, 512);
  assert.equal(workspace.geometryY.length, 512);
  assert.equal(workspace.geometryRadius.length, 512);
});

test('deterministic trace matrix stays finite, bounded, tapered, and endpoint-exact', () => {
  for (const trace of deterministicTraces()) {
    const workspace = Geometry.createWorkspace();
    const frame = loadFrame(workspace, trace.points);
    const report = Geometry.buildGeometry(frame, workspace);
    assert.equal(report.invalidGeometry, false, trace.id + ' marked geometry invalid');
    assert.equal(report.geometryBudgetHit, false, trace.id + ' hit geometry capacity');
    assert.equal(report.sourceBudgetHit, false, trace.id + ' hit source capacity');
    assert.ok(workspace.geometryCount <= workspace.geometryCapacity);
    assertFiniteGeometry(workspace, trace.id);
    if (workspace.geometryCount) {
      const last = workspace.geometryCount - 1;
      const sourceLast = trace.points.length - 1;
      assert.equal(workspace.geometryX[last], trace.points[sourceLast][0], trace.id + ' x endpoint');
      assert.equal(workspace.geometryY[last], trace.points[sourceLast][1], trace.id + ' y endpoint');
      assert.equal(workspace.geometryRadius[last], trace.points[sourceLast][2], trace.id + ' radius endpoint');
      assert.equal(report.endpointError, 0, trace.id + ' endpoint error');
    }
    if (workspace.geometryCount > 1) {
      assert.equal(workspace.geometryRadius[0], 0, trace.id + ' tail is not zero-width');
    }
  }
});

test('terminal zero convergence is smooth and localized to the oldest 18 percent', () => {
  const workspace = Geometry.createWorkspace();
  const points = [[0, 200, 40], [1000, 200, 40]];
  const report = Geometry.buildGeometry(loadFrame(workspace, points), workspace);
  assert.equal(report.invalidGeometry, false);
  assert.equal(report.geometryBudgetHit, false);
  assert.equal(workspace.geometryRadius[0], 0);
  assert.equal(report.terminalTaperShoulderInserted, true);
  assert.ok(Math.abs(report.totalArcLength - 1000) < 1e-9);
  assert.ok(Math.abs(report.terminalTaperRequestedLength - 180) < 1e-9);
  assert.ok(Math.abs(report.terminalTaperLength - 180) < 1e-9);
  assert.ok(Math.abs(report.terminalTaperFraction - 0.18) < 1e-9);
  assert.equal(report.terminalTaperSamplesInserted, 3);
  assert.equal(report.terminalTaperVertices, 4);

  let shoulderIndex = -1;
  for (let index = 0; index < workspace.geometryCount; index += 1) {
    if (Math.abs(workspace.geometryX[index] - 180) < 1e-9) {
      shoulderIndex = index;
      break;
    }
  }
  assert.equal(shoulderIndex, 4, 'The bounded taper shoulder was not inserted at 18%');
  const expectedSamples = [
    [0, 0],
    [45, 40 * 0.15625],
    [90, 20],
    [135, 40 * 0.84375],
    [180, 40],
  ];
  for (let index = 0; index < expectedSamples.length; index += 1) {
    assert.ok(Math.abs(workspace.geometryX[index] - expectedSamples[index][0]) < 1e-9);
    assert.ok(Math.abs(workspace.geometryRadius[index] - expectedSamples[index][1]) < 1e-9);
  }
  for (let index = 1; index <= shoulderIndex; index += 1) {
    assert.ok(
      workspace.geometryRadius[index] + 1e-9 >= workspace.geometryRadius[index - 1],
      'Terminal taper radius stepped backward',
    );
  }
  assert.ok(Math.abs(workspace.geometryRadius[shoulderIndex] - 40) < 1e-9);
  for (let index = shoulderIndex; index < workspace.geometryCount; index += 1) {
    assert.ok(
      Math.abs(workspace.geometryRadius[index] - 40) < 1e-9,
      'The terminal taper escaped into the coherent body region',
    );
  }
});

test('the V2 Minimal body floor reduces long-wedge collapse without changing endpoint decay', () => {
  const tailScale = 0.56;
  const lifeScale = 0.40;
  const floorRatio = 0.72;
  const legacyMidLife = (tailScale + 0.5 * lifeScale) * 0.5;
  const remediatedMidLife = Geometry.resolveTemporalWidthFactor(
    0.5,
    1,
    tailScale,
    lifeScale,
    floorRatio,
  );
  assert.ok(Math.abs(legacyMidLife - 0.38) < 1e-12);
  assert.ok(Math.abs(remediatedMidLife - 0.6912) < 1e-12);
  assert.ok(remediatedMidLife > legacyMidLife * 1.8);

  for (const easedHeadLife of [1, 0.75, 0.5, 0.25, 0.1, 0]) {
    const legacyEndpointFactor =
      (tailScale + easedHeadLife * lifeScale) * easedHeadLife;
    const remediatedEndpointFactor = Geometry.resolveTemporalWidthFactor(
      easedHeadLife,
      easedHeadLife,
      tailScale,
      lifeScale,
      floorRatio,
    );
    assert.ok(
      Math.abs(remediatedEndpointFactor - legacyEndpointFactor) < 1e-12,
      'The endpoint/head decay relationship changed at ' + easedHeadLife,
    );
  }
  assert.equal(Geometry.resolveTemporalWidthFactor(0, 0, tailScale, lifeScale), 0);
});

test('geometry-local duplicate handling keeps the newest endpoint', () => {
  const workspace = Geometry.createWorkspace();
  const points = [
    [10, 10, 0],
    [10, 10, 8],
    [10.01, 10.01, 12],
    [80, 40, 20],
    [80, 40, 28],
    [140, 90, 42],
  ];
  const report = Geometry.buildGeometry(loadFrame(workspace, points), workspace);
  assert.equal(report.invalidGeometry, false);
  assert.ok(report.duplicateMerges >= 2);
  const last = workspace.geometryCount - 1;
  assert.equal(workspace.geometryX[last], 140);
  assert.equal(workspace.geometryY[last], 90);
  assert.equal(workspace.geometryRadius[last], 42);
  assert.equal(report.endpointError, 0);
  assertFiniteGeometry(workspace, 'duplicates');
});

test('non-finite source geometry fails closed', () => {
  const workspace = Geometry.createWorkspace();
  const report = Geometry.buildGeometry(
    loadFrame(workspace, [[10, 10, 0], [NaN, 20, 12], [30, 30, 20]]),
    workspace,
  );
  assert.equal(report.invalidGeometry, true);
  assert.equal(workspace.geometryCount, 0);
});

test('hard tessellation capacity is reported and the endpoint remains exact', () => {
  const workspace = Geometry.createWorkspace({
    sourceCapacity: 16,
    geometryCapacity: 8,
    flatnessTolerance: 0.0001,
    radiusTolerance: 0.0001,
    maxSubdivisionDepth: 8,
  });
  const points = [
    [10, 400, 0],
    [150, 30, 12],
    [300, 470, 18],
    [450, 20, 24],
    [600, 480, 32],
    [790, 80, 42],
  ];
  const report = Geometry.buildGeometry(loadFrame(workspace, points), workspace);
  assert.equal(report.geometryBudgetHit, true);
  assert.ok(workspace.geometryCount <= 8);
  const last = workspace.geometryCount - 1;
  assert.equal(workspace.geometryX[last], 790);
  assert.equal(workspace.geometryY[last], 80);
  assert.equal(workspace.geometryRadius[last], 42);
  assert.equal(report.endpointError, 0);
});

test('compound body uses one opaque nonzero fill with no strokes or terminal disk', () => {
  const workspace = Geometry.createWorkspace();
  const trace = deterministicTraces().find((entry) => entry.id === 'self-crossing');
  const context = new FakeCanvasContext();
  const report = Geometry.renderCompoundMask(
    context,
    loadFrame(workspace, trace.points),
    workspace,
    '#ffffff',
  );
  assert.equal(report.invalidGeometry, false);
  assert.equal(report.fillCalls, 1);
  assert.equal(report.strokeCalls, 0);
  assert.equal(report.internalCaps, 0);
  assert.equal(report.terminalBodyDisks, 0);
  assert.equal(report.fillRule, 'nonzero');
  assert.equal(report.sameWindingViolations, 0);
  assert.deepEqual(context.fillRules, ['nonzero']);
  assert.equal(context.fillCount, 1);
  assert.equal(context.strokeCount, 0);
  assert.equal(context.globalAlpha, 1);
});

test('turn classification, bounded joins, and reversal closure are active', () => {
  const ordinaryWorkspace = Geometry.createWorkspace();
  assert.equal(Geometry.classifyTurn(1, 0, 1, 0, ordinaryWorkspace.settings), 'straight');
  assert.equal(Geometry.classifyTurn(1, 0, 0, 1, ordinaryWorkspace.settings), 'ordinary');
  assert.equal(Geometry.classifyTurn(1, 0, -1, 0, ordinaryWorkspace.settings), 'reversal');

  const acute = deterministicTraces().find((entry) => entry.id === 'acute-turn');
  const acuteContext = new FakeCanvasContext();
  const acuteReport = Geometry.renderCompoundMask(
    acuteContext,
    loadFrame(ordinaryWorkspace, acute.points),
    ordinaryWorkspace,
    '#ffffff',
  );
  assert.ok(acuteReport.joinMiterCount + acuteReport.joinBevelCount > 0);
  assert.ok(acuteReport.maximumMiterRatio >= 0);
  assert.equal(acuteReport.invalidGeometry, false);

  const reversalWorkspace = Geometry.createWorkspace();
  const reversal = deterministicTraces().find((entry) => entry.id === 'near-reversal');
  const reversalContext = new FakeCanvasContext();
  const reversalReport = Geometry.renderCompoundMask(
    reversalContext,
    loadFrame(reversalWorkspace, reversal.points),
    reversalWorkspace,
    '#ffffff',
  );
  assert.ok(reversalReport.logicalReversalCount >= 1);
  assert.ok(reversalReport.reversalCount >= 1);
  assert.ok(reversalContext.arcCount >= 1, 'Reversal closure disk was not emitted');
  assert.equal(reversalReport.invalidGeometry, false);
});

test('V2 selector is development-only, Minimal-only, and mutually exclusive with legacy drawing', () => {
  assert.match(
    indexSource,
    /const\s+trailGeometryMode\s*=\s*isDevelopmentBuild\s*&&\s*query\.get\('trailGeometry'\)\s*===\s*'v2'\s*\?\s*'v2'\s*:\s*'legacy'/,
  );
  assert.match(
    indexSource,
    /return\s+trailGeometryMode\s*===\s*'v2'\s*&&\s*trailDefinition\?\.renderer\s*===\s*'minimalReveal'/,
  );
  const dispatch = extractIndentedFunction(indexSource, 'drawActiveTrailMask');
  assert.match(
    dispatch,
    /if\s*\(isV2MinimalTrail\(trailDefinition\)\)[\s\S]*return\s+drawV2MinimalRevealMask/,
  );
  assert.match(dispatch, /deactivateV2MinimalRuntime\(\);[\s\S]*const\s+path\s*=\s*buildTrailPath\(now\)/);
  assert.equal((dispatch.match(/renderer\.drawMask/g) || []).length, 1);
  assert.equal((dispatch.match(/drawV2MinimalRevealMask/g) || []).length, 1);
});

test('V2 local motion renewal stops after convergence and reaches complete disappearance', () => {
  const activitySource = [
    'const V2_MINIMAL_MOTION_EPSILON = 0.01;',
    'let mouse = { x: 0, y: 0 };',
    'let smooth = { x: 0, y: 0 };',
    'let pointerActive = true;',
    extractIndentedFunction(indexSource, 'saturatingIncrement'),
    extractIndentedFunction(indexSource, 'getV2MinimalHeadLife'),
    extractIndentedFunction(indexSource, 'updateV2MinimalActivity'),
    'globalThis.api = {',
    '  updateV2MinimalActivity,',
    '  getV2MinimalHeadLife,',
    '  setMouse: (x, y) => { mouse.x = x; mouse.y = y; },',
    '  setSmooth: (x, y) => { smooth.x = x; smooth.y = y; },',
    '  setPointerActive: value => { pointerActive = value; },',
    '};',
  ].join('\n');
  const sandbox = Object.create(null);
  vm.createContext(sandbox);
  vm.runInContext(activitySource, sandbox, {
    filename: 'index.html#V2_MINIMAL_ACTIVITY',
    timeout: 1000,
  });
  const activity = {
    ready: false,
    previousMouseX: 0,
    previousMouseY: 0,
    previousSmoothX: 0,
    previousSmoothY: 0,
    wasPointerActive: false,
    lastMotionTime: 0,
    renewalCount: 0,
  };
  const workspace = { activity };
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 100), 100);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 116), 100);
  sandbox.api.setMouse(10, 0);
  sandbox.api.setSmooth(3, 0);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 132), 132);
  sandbox.api.setSmooth(7, 0);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 148), 148);
  sandbox.api.setSmooth(10, 0);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 164), 164);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 180), 164);
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 500), 164);
  const renewalCountAfterStop = activity.renewalCount;
  assert.equal(sandbox.api.updateV2MinimalActivity(workspace, 600), 164);
  assert.equal(activity.renewalCount, renewalCountAfterStop);
  assert.equal(sandbox.api.getV2MinimalHeadLife(164, 164, 850), 1);
  assert.ok(sandbox.api.getV2MinimalHeadLife(589, 164, 850) > 0);
  assert.equal(sandbox.api.getV2MinimalHeadLife(1014, 164, 850), 0);
  assert.equal(sandbox.api.getV2MinimalHeadLife(1200, 164, 850), 0);
});

test('legacy temporal functions and non-Minimal renderers remain byte-identical to State B', () => {
  const expected = {
    updatePointer: 'E03B17E5F4C73F6567944348DD5E4F803B95063B6AAFD7FFF3D570C67FFE1398',
    resetTrail: 'F9EFC47BAAF87BE84B333F50A0A2F73FBCA7CF47B95BBD6589A39C684DF248DC',
    updateTrail: '25CD56D9B09E0A4CE006A6A9851679929B17BCD6817BCAC409C87BF51936946A',
    getHeadLife: '3CA7EE0D3CA12B4287125F8EE4815D7C02B4BE59D3FB46B72757ED074AA988CC',
    getTrailLife: '355F1FE451DF657823EDAD22A5DFBAD91879F6FD7C271F8DE43E60C2CD825BB2',
    buildTrailPath: 'AC46A75935D768FBD689A75A8D411DF648ACE2EBC9DFE9145F80DF62C60FC82B',
    drawFadingTrailSegments: '04E3EE7D757EBE0EBD304CA37D34C845D20915131ADED42A5892A4F73369A294',
    drawMinimalRevealMask: 'C5A804B38CA3A0CBC95EF97F48FECCD63003BECBDB6EFD350D63D20541F84940',
    drawMinimalRevealGlow: 'C9705CD2B2F18584B70DE17023E6D2951DF890CB9626BBF9C4AE1ACC94F7D36C',
    drawGearPiTrailMask: 'B088CDC016A917C685BFB493AF3589C8354B37F506BB88F6D5E6074E2108F05C',
    drawGearPiCloudBorder: '28CA7A20602E7AAB04ECF1E6EE9D27D02AE5EFE3D6BCA56B1EE6995A9AEF6E94',
    drawSpiderTrailMask: '4FC13B3BDAAC216058D07BB0C35BA075A6A5FD439A98D9E5D68C9A28DAA43DAD',
    drawSpiderTrailOverlay: '00AC0034F4A28D76D49AB9AA861FF33403B0E3CB7AA33C24B17351682027AA93',
    drawHeroLightMask: 'CC6C7CF0126DDC5974B84D78D084D9653EA54E4284D8DA031F623AB69B6C98AA',
    drawHeroLightOverlay: 'CA49D46A1B2538C543B64F39DC9BE0D41BAF817B03A0A4014734BC76FDE70B1F',
  };
  for (const [name, expectedHash] of Object.entries(expected)) {
    assert.equal(
      sha256(extractIndentedFunction(indexSource, name)),
      expectedHash,
      name + ' drifted from the State B baseline',
    );
  }
  assert.equal(
    (extractIndentedFunction(indexSource, 'updateTrail').match(/headLastActive\s*=\s*now/g) || []).length,
    1,
    'Shared State B head renewal changed',
  );
});

test('State B final compositing order remains exact', () => {
  const drawSource = extractIndentedFunction(indexSource, 'draw');
  const destinationOut = drawSource.indexOf("ctx.globalCompositeOperation = 'destination-out';");
  const firstBlit = drawSource.indexOf('ctx.drawImage(off, 0, 0, w, h);', destinationOut);
  const lighter = drawSource.indexOf("ctx.globalCompositeOperation = 'lighter';", firstBlit);
  const secondBlit = drawSource.indexOf('ctx.drawImage(off, 0, 0, w, h);', lighter);
  const sourceOver = drawSource.indexOf("ctx.globalCompositeOperation = 'source-over';", secondBlit);
  assert.ok(destinationOut >= 0);
  assert.ok(firstBlit > destinationOut);
  assert.ok(lighter > firstBlit);
  assert.ok(secondBlit > lighter);
  assert.ok(sourceOver > secondBlit);
});

test('V2 owns no input, animation clock, timer, or extra Canvas surface', () => {
  const v2RuntimeSource = extractBetween(
    indexSource,
    '// V2_MINIMAL_GEOMETRY_BEGIN',
    'function drawFadingTrailSegments',
  );
  assert.doesNotMatch(
    v2RuntimeSource,
    /addEventListener|requestAnimationFrame|cancelAnimationFrame|setInterval|setTimeout|createElement\(['"]canvas/i,
  );
  assert.equal((indexSource.match(/<canvas\b/g) || []).length, 1);
  assert.equal(
    (indexSource.match(/document\.createElement\(['"]canvas['"]\)/g) || []).length,
    1,
    'Stage 1 added a fullscreen surface',
  );
});

test('production V2 contains no prediction, spline, adaptive resampling, D, or E path', () => {
  const v2RuntimeSource = extractBetween(
    indexSource,
    '// V2_MINIMAL_GEOMETRY_BEGIN',
    'function drawFadingTrailSegments',
  );
  assert.doesNotMatch(
    v2RuntimeSource,
    /catmull|bezierCurveTo|prediction|predicted|adaptiveSpatial|resample|candidate-d|candidate-e|idleHold|wholeStructure/i,
  );
  assert.match(v2RuntimeSource, /flattenQuadratic/);
  assert.match(v2RuntimeSource, /midpoint/);
  assert.match(v2RuntimeSource, /segmentOverlap/);
  assert.match(v2RuntimeSource, /miterLimit/);
  assert.match(v2RuntimeSource, /reversalDotThreshold/);
});

test('config, artwork references, release package baseline, and package matrix contract remain contained', () => {
  assert.equal(sha256(fs.readFileSync(configPath)), CONFIG_SHA256);
  assert.doesNotMatch(fs.readFileSync(configPath, 'utf8'), /trailGeometry/);
  for (const platform of ['browser', 'lively']) {
    for (const themeId of ['luffy-gear5', 'cyberpunk-neon', 'spider-venom']) {
      const packageIndex = path.join(projectRoot, 'release', platform, themeId, 'index.html');
      assert.equal(
        sha256(fs.readFileSync(packageIndex)),
        PRESERVED_STATE_A_INDEX_SHA256,
        platform + '/' + themeId + ' package index drifted from State A',
      );
    }
  }
  assert.match(matrixSource, /PRESERVED_STATE_A_INDEX_SHA256/);
  assert.match(matrixSource, /hashZipEntry\(customerArchivePath,\s*'index\.html'\)/);
  assert.doesNotMatch(
    matrixSource,
    /assert\.equal\(fs\.readFileSync\(packageIndexPath,\s*'utf8'\),\s*sourceIndex/,
  );
  const geometryBlock = extractBetween(
    indexSource,
    '// V2_MINIMAL_GEOMETRY_BEGIN',
    '// V2_MINIMAL_GEOMETRY_END',
  );
  assert.doesNotMatch(geometryBlock, /assets[\\/]|release[\\/]|APP_CONFIG|imageAtRest|imageInTrail/);
});
