// Live sea: "Cartoon Water" by andrewray (shaderfrog.com/editor/cm79hz5t30048paxiphl284rd),
// ported from Three.js to a raw WebGL1 quad covering the stage's water region.
// Textures are baked repo assets (tools/make_water_textures.py).

const FRAG = `
precision highp float;

uniform float time;
uniform vec2 resolution;

uniform sampler2D waterImage;
uniform vec2 waterScale;
uniform vec2 waterSpeed;
uniform vec3 waterColor;
uniform float waterAmt;

uniform sampler2D displacement;
uniform vec2 displacementSpeed;
uniform vec2 waterDisplacementScale;
uniform float displacementHeight;

uniform sampler2D specularMap;
uniform float specularScale;
uniform float specularBrightness;
uniform float specularPop;
uniform float specularMax;
uniform vec2 specularSpeed;

varying vec2 vUv;

void main() {
    // shore-sea look: the beach lies at the TOP of this region (vUv.y = 1),
    // waves roll toward it, foam breaks along the waterline.
    vec2 uv = vUv;
    float toViewer = 1.0 - uv.y;                 // 0 at the shoreline, 1 near the viewer
    float py = pow(toViewer, 0.8);               // soft perspective on the bands

    vec4 disp = texture2D(
        displacement,
        vec2(uv.x * 1.6, py * waterDisplacementScale.y) + time * displacementSpeed
    );
    float d = (length(disp.rgb) / 1.73 - 0.5) * displacementHeight * 7.0;

    // rolling swell bands moving toward the shore
    float band = sin(py * 24.0 - time * 1.05 + d * 5.0);
    float crest = smoothstep(0.72, 0.96, band);

    // sparkle (Cartoon Water's doubled specular), kept on the crests
    vec4 specularBase =
        texture2D(specularMap, uv * specularScale + time * specularSpeed) *
        texture2D(specularMap, uv * specularScale - time * specularSpeed);
    float sparkle = length(specularBase.rgb) * specularBrightness;

    vec3 col = waterColor;                                      // deep night sea
    col += vec3(0.014, 0.032, 0.045) * (0.5 + 0.5 * band);      // band shading
    col += vec3(0.07, 0.10, 0.12) * crest * (0.30 + sparkle);   // lit crests

    // breaking foam along the waterline + a trailing foam line
    float foamNoise = texture2D(specularMap, vec2(uv.x * 5.0, uv.y * 24.0 - time * 0.30)).r;
    float foamZone = smoothstep(0.88, 1.0, uv.y + d * 0.06);
    float foam = foamZone * smoothstep(0.38, 0.75, foamNoise + 0.25 * sin(uv.x * 42.0 + time * 1.6));
    float line2 = exp(-pow((uv.y - (0.82 + 0.025 * sin(uv.x * 8.0 + time * 0.7))) * 55.0, 2.0))
                  * smoothstep(0.35, 0.7, foamNoise);
    col = mix(col, vec3(0.72, 0.79, 0.86), clamp(foam + line2 * 0.6, 0.0, 0.8));

    // night grading: darker toward the viewer, pale band at the shoreline
    col *= mix(1.05, 0.42, pow(toViewer, 1.25));
    col += vec3(0.04, 0.06, 0.08) * exp(-toViewer * 10.0);

    // moonlight shaft under the moon
    float shaft = exp(-pow((uv.x - 0.787) * 7.0, 2.0));
    col += vec3(0.09, 0.12, 0.15) * shaft * (sparkle * 1.6 + 0.22) * (1.0 - toViewer * 0.55);

    gl_FragColor = vec4(col, 1.0);
}
`;

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const UNIFORMS = {
  waterScale: [4.5, 4.5],
  waterSpeed: [0.012, 0.006],
  waterColor: [0.035, 0.085, 0.135],
  waterAmt: 0.72,
  displacementSpeed: [0.012, 0.018],
  waterDisplacementScale: [2.0, 2.0],
  displacementHeight: 0.09,
  specularScale: 3.0,
  specularBrightness: 0.55,
  specularPop: 1.05,
  specularMax: 0.58,
  specularSpeed: [0.016, 0.024],
};

const WATERLINE = 0.35;

export function initWater(stage) {
  const canvas = document.createElement("canvas");
  canvas.className = "layer layer-water";
  canvas.width = 512;
  canvas.height = 640;
  Object.assign(canvas.style, {
    position: "absolute",
    left: "0",
    top: `${WATERLINE * 100}%`,
    width: "100%",
    height: `${(1 - WATERLINE) * 100}%`,
    zIndex: "2",
    pointerEvents: "none",
  });
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) { console.warn("WebGL unavailable — static sea stays"); return; }
  stage.appendChild(canvas);

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("water shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n) => gl.getUniformLocation(prog, n);
  for (const [name, v] of Object.entries(UNIFORMS)) {
    if (typeof v === "number") gl.uniform1f(u(name), v);
    else if (v.length === 2) gl.uniform2fv(u(name), v);
    else gl.uniform3fv(u(name), v);
  }

  const tex = (unit, src) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([18, 40, 60, 255])); // placeholder pixel until loaded
    const img = new Image();
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    img.src = src;
    return t;
  };
  tex(0, "assets/water/water.png");
  tex(1, "assets/water/displacement.png");
  tex(2, "assets/water/specular.png");
  gl.uniform1i(u("waterImage"), 0);
  gl.uniform1i(u("displacement"), 1);
  gl.uniform1i(u("specularMap"), 2);

  const timeLoc = u("time");
  gl.uniform2f(u("resolution"), canvas.width, canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);

  const t0 = performance.now();
  (function frame() {
    gl.uniform1f(timeLoc, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  })();
}
