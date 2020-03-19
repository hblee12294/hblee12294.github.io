import {
  ShaderChunk,
  LineCurve3,
  Vector3,
  TubeBufferGeometry,
  InstancedBufferGeometry,
  Color,
  ShaderMaterial,
  InstancedBufferAttribute,
  Uniform,
  Mesh,
} from 'three'
import { random, pickRandom } from './funcs'

const carLightsFragment = `

  #define USE_FOG;
  ${ShaderChunk['fog_pars_fragment']}
  varying vec3 vColor;
  varying vec2 vUv; 
  uniform vec2 uFade;
  void main() {
  vec3 color = vec3(vColor);
  float fadeStart = 0.4;
  float maxFade = 0.;
  float alpha = 1.;
  
  alpha = smoothstep(uFade.x, uFade.y, vUv.x);
  gl_FragColor = vec4(color,alpha);
  if (gl_FragColor.a < 0.0001) discard;
  ${ShaderChunk['fog_fragment']}
  }
`

const carLightsVertex = `
  #define USE_FOG;
  ${ShaderChunk['fog_pars_vertex']}
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;

  

  uniform float uTravelLength;
  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vUv; 
  varying vec3 vColor; 
  #include <getDistortion_vertex>

  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;

    transformed.xy *= radius ;
    transformed.z *= myLength;
  
    // Add my length to make sure it loops after the lights hits the end
    transformed.z += myLength-mod( uTime *speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;


    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

    vec4 mvPosition = modelViewMatrix * vec4(transformed,1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
    ${ShaderChunk['fog_vertex']}
  }`

class CarLights {
  private webgl: any
  private options: any
  private colors: any
  private speed: any
  private fade: any
  mesh: any

  constructor(webgl: any, options: any, colors: any, speed: any, fade: any) {
    this.webgl = webgl
    this.options = options
    this.colors = colors
    this.speed = speed
    this.fade = fade
  }

  init() {
    const options = this.options
    // Curve with length 1
    const curve = new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, -1))
    // Tube with radius = 1
    const geometry = new TubeBufferGeometry(curve, 40, 1, 8, false)

    const instanced = new InstancedBufferGeometry().copy(geometry)
    instanced.maxInstancedCount = options.lightPairsPerRoadWay * 2

    const laneWidth = options.roadWidth / options.lanesPerRoad

    const aOffset = []
    const aMetrics = []
    const aColor = []

    let colors = this.colors
    if (Array.isArray(colors)) {
      colors = colors.map(c => new Color(c))
    } else {
      colors = new Color(colors)
    }

    for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
      const radius = random(options.carLightsRadius)
      const length = random(options.carLightsLength)
      const speed = random(this.speed)

      const carLane = i % 3
      let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2

      const carWidth = random(options.carWidthPercentage) * laneWidth
      // Drunk Driving
      const carShiftX = random(options.carShiftX) * laneWidth
      // Both lights share same shiftX and lane;
      laneX += carShiftX

      const offsetY = random(options.carFloorSeparation) + radius * 1.3

      const offsetZ = -random(options.length)

      aOffset.push(laneX - carWidth / 2)
      aOffset.push(offsetY)
      aOffset.push(offsetZ)

      aOffset.push(laneX + carWidth / 2)
      aOffset.push(offsetY)
      aOffset.push(offsetZ)

      aMetrics.push(radius)
      aMetrics.push(length)
      aMetrics.push(speed)

      aMetrics.push(radius)
      aMetrics.push(length)
      aMetrics.push(speed)

      const color = pickRandom(colors)
      aColor.push(color.r)
      aColor.push(color.g)
      aColor.push(color.b)

      aColor.push(color.r)
      aColor.push(color.g)
      aColor.push(color.b)
    }
    instanced.addAttribute('aOffset', new InstancedBufferAttribute(new Float32Array(aOffset), 3, false))
    instanced.addAttribute('aMetrics', new InstancedBufferAttribute(new Float32Array(aMetrics), 3, false))
    instanced.addAttribute('aColor', new InstancedBufferAttribute(new Float32Array(aColor), 3, false))
    const material = new ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      transparent: true,
      uniforms: Object.assign(
        {
          // uColor: new THREE.Uniform(new THREE.Color(this.color)),
          uTime: new Uniform(0),
          uTravelLength: new Uniform(options.length),
          uFade: new Uniform(this.fade),
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
      // console.log(shader.vertex)
    }
    const mesh = new Mesh(instanced, material)
    mesh.frustumCulled = false
    this.webgl.scene.add(mesh)
    this.mesh = mesh
  }
  update(time: any) {
    ;(this.mesh.material as any).uniforms.uTime.value = time
  }
}

export default CarLights
