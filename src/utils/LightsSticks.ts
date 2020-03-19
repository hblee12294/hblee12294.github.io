import {
  ShaderChunk,
  PlaneBufferGeometry,
  InstancedBufferGeometry,
  Color,
  InstancedBufferAttribute,
  ShaderMaterial,
  DoubleSide,
  Uniform,
  Mesh,
} from 'three'
import { random, pickRandom } from './funcs'

const sideSticksVertex = `
#define USE_FOG;
${ShaderChunk['fog_pars_vertex']}
attribute float aOffset;
attribute vec3 aColor;

attribute vec2 aMetrics;

uniform float uTravelLength;
uniform float uTime;

varying vec3 vColor;
mat4 rotationY( in float angle ) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}



  #include <getDistortion_vertex>
  void main(){
    vec3 transformed = position.xyz;
    float width = aMetrics.x;
    float height = aMetrics.y;

    transformed.xy *= vec2(width,height);
    float time = mod(uTime  * 60. *2. + aOffset , uTravelLength);

    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;

    transformed.z +=  - uTravelLength + time;


    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

    transformed.y += height /2.;
    transformed.x += -width/2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    ${ShaderChunk['fog_vertex']}
  }
`
const sideSticksFragment = `
#define USE_FOG;
${ShaderChunk['fog_pars_fragment']}
varying vec3 vColor;
  void main(){
    vec3 color = vec3(vColor);
    gl_FragColor = vec4(color,1.);
    ${ShaderChunk['fog_fragment']}
  }
`

class LightsSticks {
  private webgl: any
  private options: any
  mesh: any

  constructor(webgl: any, options: any) {
    this.webgl = webgl
    this.options = options
  }
  init() {
    const options = this.options
    const geometry = new PlaneBufferGeometry(1, 1)
    const instanced = new InstancedBufferGeometry().copy(geometry)
    const totalSticks = options.totalSideLightSticks
    instanced.maxInstancedCount = totalSticks

    const stickoffset = options.length / (totalSticks - 1)
    const aOffset = []
    const aColor = []
    const aMetrics = []

    let colors = options.colors.sticks
    if (Array.isArray(colors)) {
      colors = colors.map(c => new Color(c))
    } else {
      colors = new Color(colors)
    }

    for (let i = 0; i < totalSticks; i++) {
      const width = random(options.lightStickWidth)
      const height = random(options.lightStickHeight)
      aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random())

      const color = pickRandom(colors)
      aColor.push(color.r)
      aColor.push(color.g)
      aColor.push(color.b)

      aMetrics.push(width)
      aMetrics.push(height)
    }
    instanced.addAttribute('aOffset', new InstancedBufferAttribute(new Float32Array(aOffset), 1, false))
    instanced.addAttribute('aColor', new InstancedBufferAttribute(new Float32Array(aColor), 3, false))
    instanced.addAttribute('aMetrics', new InstancedBufferAttribute(new Float32Array(aMetrics), 2, false))
    const material = new ShaderMaterial({
      fragmentShader: sideSticksFragment,
      vertexShader: sideSticksVertex,
      // This ones actually need double side
      side: DoubleSide,
      uniforms: Object.assign(
        {
          uTravelLength: new Uniform(options.length),
          uTime: new Uniform(0),
        },
        this.webgl.fogUniforms,
        options.distortion.uniforms,
      ),
    })

    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <getDistortion_vertex>',
        options.distortion.getDistortion,
      )
    }

    const mesh = new Mesh(instanced, material)
    // The object is behind the camera before the vertex shader
    mesh.frustumCulled = false
    // mesh.position.y = options.lightStickHeight / 2;
    this.webgl.scene.add(mesh)
    this.mesh = mesh
  }
  update(time: any) {
    this.mesh.material.uniforms.uTime.value = time
  }
}

export default LightsSticks
