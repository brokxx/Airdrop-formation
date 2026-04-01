/* ═══════════════════════════════════════════
   FLOATING LINES — Ported from react-bits
   Three.js WebGL shader background
   ═══════════════════════════════════════════ */

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }
  vec3 gradientColor;
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);
    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    gradientColor = mix(c1, c2, f);
  }
  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi, baseUv, mouseUv, interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

function initFloatingLines(containerId, options) {
  if (window.innerWidth <= 768) return;
  const container = document.getElementById(containerId);
  if (!container) return;

  const opts = Object.assign({
    linesGradient: ['#efa905', '#92723a', '#6b5329'],
    enabledWaves: ['top', 'middle', 'bottom'],
    lineCount: [6],
    lineDistance: [5],
    topWavePosition: { x: 10, y: 0.5, rotate: -0.4 },
    middleWavePosition: { x: 5, y: 0, rotate: 0.2 },
    bottomWavePosition: { x: 2, y: -0.7, rotate: -1 },
    animationSpeed: 1,
    interactive: true,
    bendRadius: 2,
    bendStrength: -0.6,
    mouseDamping: 0.09,
    parallax: true,
    parallaxStrength: 0.3,
    mixBlendMode: 'screen'
  }, options);

  const getLineCount = function(waveType) {
    if (typeof opts.lineCount === 'number') return opts.lineCount;
    var index = opts.enabledWaves.indexOf(waveType);
    if (index === -1) return 0;
    return opts.lineCount[index] !== undefined ? opts.lineCount[index] : 6;
  };

  const getLineDistance = function(waveType) {
    if (typeof opts.lineDistance === 'number') return opts.lineDistance;
    var index = opts.enabledWaves.indexOf(waveType);
    if (index === -1) return 0.1;
    return opts.lineDistance[index] !== undefined ? opts.lineDistance[index] : 0.1;
  };

  const topLC = opts.enabledWaves.includes('top') ? getLineCount('top') : 0;
  const midLC = opts.enabledWaves.includes('middle') ? getLineCount('middle') : 0;
  const botLC = opts.enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

  const topLD = opts.enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
  const midLD = opts.enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
  const botLD = opts.enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

  function hexToVec3(hex) {
    var v = hex.replace('#', '');
    var r = parseInt(v.slice(0, 2), 16) / 255;
    var g = parseInt(v.slice(2, 4), 16) / 255;
    var b = parseInt(v.slice(4, 6), 16) / 255;
    return new THREE.Vector3(r, g, b);
  }

  var isMobile = window.innerWidth <= 768;

  // On mobile: reduce waves for performance
  if (isMobile) {
    opts.enabledWaves = ['middle', 'bottom'];
    opts.interactive = false;
    opts.parallax = false;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  camera.position.z = 1;

  var renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);
  container.style.mixBlendMode = opts.mixBlendMode;

  var gradientArr = [];
  for (var i = 0; i < 8; i++) gradientArr.push(new THREE.Vector3(1, 1, 1));

  var uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    animationSpeed: { value: opts.animationSpeed },
    enableTop: { value: opts.enabledWaves.includes('top') },
    enableMiddle: { value: opts.enabledWaves.includes('middle') },
    enableBottom: { value: opts.enabledWaves.includes('bottom') },
    topLineCount: { value: topLC },
    middleLineCount: { value: midLC },
    bottomLineCount: { value: botLC },
    topLineDistance: { value: topLD },
    middleLineDistance: { value: midLD },
    bottomLineDistance: { value: botLD },
    topWavePosition: {
      value: new THREE.Vector3(opts.topWavePosition.x, opts.topWavePosition.y, opts.topWavePosition.rotate)
    },
    middleWavePosition: {
      value: new THREE.Vector3(opts.middleWavePosition.x, opts.middleWavePosition.y, opts.middleWavePosition.rotate)
    },
    bottomWavePosition: {
      value: new THREE.Vector3(opts.bottomWavePosition.x, opts.bottomWavePosition.y, opts.bottomWavePosition.rotate)
    },
    iMouse: { value: new THREE.Vector2(-1000, -1000) },
    interactive: { value: opts.interactive },
    bendRadius: { value: opts.bendRadius },
    bendStrength: { value: opts.bendStrength },
    bendInfluence: { value: 0 },
    parallax: { value: opts.parallax },
    parallaxStrength: { value: opts.parallaxStrength },
    parallaxOffset: { value: new THREE.Vector2(0, 0) },
    lineGradient: { value: gradientArr },
    lineGradientCount: { value: 0 }
  };

  if (opts.linesGradient && opts.linesGradient.length > 0) {
    var stops = opts.linesGradient.slice(0, 8);
    uniforms.lineGradientCount.value = stops.length;
    stops.forEach(function(hex, i) {
      var c = hexToVec3(hex);
      uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
    });
  }

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });

  var geometry = new THREE.PlaneGeometry(2, 2);
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  var clock = new THREE.Clock();

  var targetMouse = new THREE.Vector2(-1000, -1000);
  var currentMouse = new THREE.Vector2(-1000, -1000);
  var targetInfluence = 0;
  var currentInfluence = 0;
  var targetParallax = new THREE.Vector2(0, 0);
  var currentParallax = new THREE.Vector2(0, 0);

  function setSize() {
    var w = container.clientWidth || 1;
    var h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
  }
  setSize();

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(setSize).observe(container);
  } else {
    window.addEventListener('resize', setSize);
  }

  renderer.domElement.addEventListener('pointermove', function(e) {
    if (!opts.interactive) return;
    var rect = renderer.domElement.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var dpr = renderer.getPixelRatio();
    targetMouse.set(x * dpr, (rect.height - y) * dpr);
    targetInfluence = 1.0;

    if (opts.parallax) {
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      targetParallax.set(
        ((x - cx) / rect.width) * opts.parallaxStrength,
        -((y - cy) / rect.height) * opts.parallaxStrength
      );
    }
  });

  renderer.domElement.addEventListener('pointerleave', function() {
    targetInfluence = 0.0;
  });

  var animId;

  function renderLoop() {
    uniforms.iTime.value = clock.getElapsedTime();

    currentMouse.lerp(targetMouse, opts.mouseDamping);
    uniforms.iMouse.value.copy(currentMouse);
    currentInfluence += (targetInfluence - currentInfluence) * opts.mouseDamping;
    uniforms.bendInfluence.value = currentInfluence;

    currentParallax.lerp(targetParallax, opts.mouseDamping);
    uniforms.parallaxOffset.value.copy(currentParallax);

    renderer.render(scene, camera);
    animId = requestAnimationFrame(renderLoop);
  }

  var io = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) {
      renderLoop();
    } else {
      cancelAnimationFrame(animId);
    }
  });
  io.observe(container);

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (container && container.getBoundingClientRect().top < window.innerHeight) {
      renderLoop();
    }
  });
}
