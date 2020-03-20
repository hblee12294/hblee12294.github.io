import { WebGLRenderer, Uniform, Vector2, PerspectiveCamera, Scene, Fog, Clock, LoadingManager, Vector3 } from 'three'
import { EffectComposer, BloomEffect, RenderPass, EffectPass, SMAAEffect, SMAAPreset } from 'postprocessing'
import Road from './Road'
import CarLights from './CarLights'
// import LightsSticks from './LightsSticks'
import { lerp, resizeRendererToDisplaySize } from './utils'

const distortion_uniforms = {
  uDistortionX: new Uniform(new Vector2(80, 3)),
  uDistortionY: new Uniform(new Vector2(-40, 2.5)),
}

const distortion_vertex = `
    #define PI 3.14159265358979
    uniform vec2 uDistortionX;
    uniform vec2 uDistortionY;

    float nsin(float val) {
        return sin(val) * 0.5+0.5;
    }
    vec3 getDistortion(float progress){
        progress = clamp(progress, 0.,1.);
        float xAmp = uDistortionX.r;
        float xFreq = uDistortionX.g;
        float yAmp = uDistortionY.r;
        float yFreq = uDistortionY.g;
        return vec3( 
            xAmp * nsin(progress* PI * xFreq   - PI / 2. ) ,
            yAmp * nsin(progress * PI *yFreq - PI / 2.  ) ,
            0.
        );
    }
`

class App {
  private options: any
  private container: HTMLDivElement
  private renderer: WebGLRenderer
  private composer: any
  private camera: PerspectiveCamera
  private scene: Scene
  private fogUniforms: any
  private clock: Clock
  private assets: any
  private disposed: boolean
  road: Road
  leftCarLights: CarLights
  rightCarLights: CarLights
  // leftSticks: LightsSticks
  fovTarget: any
  speedUpTarget: number
  speedUp: number
  timeOffset: number
  renderPass: any
  bloomPass: any

  constructor(container: HTMLDivElement, options = {} as any) {
    // Init ThreeJS Basics
    this.options = options

    if (this.options.distortion == null) {
      this.options.distortion = {
        uniforms: distortion_uniforms,
        getDistortion: distortion_vertex,
      }
    }
    this.container = container
    this.renderer = new WebGLRenderer({
      antialias: false,
    })
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.composer = new EffectComposer(this.renderer)
    container.append(this.renderer.domElement)

    this.camera = new PerspectiveCamera(options.fov, container.offsetWidth / container.offsetHeight, 0.1, 10000)
    this.camera.position.z = -5
    this.camera.position.y = 8
    this.camera.position.x = 0
    this.scene = new Scene()

    const fog = new Fog(options.colors.background, options.length * 0.2, options.length * 500)
    this.scene.fog = fog
    this.fogUniforms = {
      fogColor: { type: 'c', value: fog.color },
      fogNear: { type: 'f', value: fog.near },
      fogFar: { type: 'f', value: fog.far },
    }
    this.clock = new Clock()
    this.assets = {}
    this.disposed = false

    // Create Objects
    this.road = new Road(this, options)
    this.leftCarLights = new CarLights(
      this,
      options,
      options.colors.leftCars,
      options.movingAwaySpeed,
      new Vector2(0, 1 - options.carLightsFade),
    )
    this.rightCarLights = new CarLights(
      this,
      options,
      options.colors.rightCars,
      options.movingCloserSpeed,
      new Vector2(1, 0 + options.carLightsFade),
    )
    // this.leftSticks = new LightsSticks(this, options)

    this.fovTarget = options.fov

    this.speedUpTarget = 0
    this.speedUp = 0
    this.timeOffset = 0

    // Binds
    this.tick = this.tick.bind(this)
    this.init = this.init.bind(this)
    this.setSize = this.setSize.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  initPasses() {
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.bloomPass = new EffectPass(
      this.camera,
      new BloomEffect({
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0,
        resolutionScale: 1,
      }),
    )

    const smaaPass = new EffectPass(
      this.camera,
      new SMAAEffect(this.assets.smaa.search, this.assets.smaa.area, SMAAPreset.MEDIUM),
    )
    this.renderPass.renderToScreen = false
    this.bloomPass.renderToScreen = false
    smaaPass.renderToScreen = true
    this.composer.addPass(this.renderPass)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(smaaPass)
  }

  loadAssets() {
    const assets = this.assets

    return new Promise(resolve => {
      const manager = new LoadingManager(resolve)

      const searchImage = new Image()
      const areaImage = new Image()
      assets.smaa = {}
      searchImage.addEventListener('load', function() {
        assets.smaa.search = this
        manager.itemEnd('smaa-search')
      })

      areaImage.addEventListener('load', function() {
        assets.smaa.area = this
        manager.itemEnd('smaa-area')
      })
      manager.itemStart('smaa-search')
      manager.itemStart('smaa-area')

      searchImage.src = SMAAEffect.searchImageDataURL
      areaImage.src = SMAAEffect.areaImageDataURL
    })
  }

  init() {
    this.initPasses()
    const options = this.options
    this.road.init()
    this.leftCarLights.init()

    this.leftCarLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2)
    this.rightCarLights.init()
    this.rightCarLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2)
    // this.leftSticks.init()
    // this.leftSticks.mesh.position.setX(-(options.roadWidth + options.islandWidth / 2))

    this.container.addEventListener('mousedown', this.onMouseDown)
    this.container.addEventListener('mouseup', this.onMouseUp)
    this.container.addEventListener('mouseout', this.onMouseUp)

    this.tick()
  }

  onMouseDown(ev: any) {
    if (this.options.onSpeedUp) this.options.onSpeedUp(ev)
    this.fovTarget = this.options.fovSpeedUp
    this.speedUpTarget = this.options.speedUp
  }

  onMouseUp(ev: any) {
    if (this.options.onSlowDown) this.options.onSlowDown(ev)
    this.fovTarget = this.options.fov
    this.speedUpTarget = 0
    // this.speedupLerp = 0.1;
  }

  update(delta: number) {
    const lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta)
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001)
    this.timeOffset += this.speedUp * delta

    const time = this.clock.elapsedTime + this.timeOffset

    this.rightCarLights.update(time)
    this.leftCarLights.update(time)
    // this.leftSticks.update(time)
    this.road.update(time)

    let updateCamera = false
    const fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage)
    if (fovChange !== 0) {
      this.camera.fov += fovChange * delta * 6
      updateCamera = true
    }

    if (this.options.distortion.getJS) {
      const distortion = this.options.distortion.getJS(0.025, time)

      this.camera.lookAt(
        new Vector3(
          this.camera.position.x + distortion.x,
          this.camera.position.y + distortion.y,
          this.camera.position.z + distortion.z,
        ),
      )
      updateCamera = true
    }
    if (updateCamera) {
      this.camera.updateProjectionMatrix()
    }
  }

  render(delta: number) {
    this.composer.render(delta)
  }

  dispose() {
    this.disposed = true
  }

  setSize(width: number, height: number, updateStyles: any) {
    this.composer.setSize(width, height, updateStyles)
  }

  tick() {
    if (this.disposed || !this) return
    if (resizeRendererToDisplaySize(this.renderer, this.setSize)) {
      const canvas = this.renderer.domElement
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight
      this.camera.updateProjectionMatrix()
    }
    const delta = this.clock.getDelta()
    this.render(delta)
    this.update(delta)
    requestAnimationFrame(this.tick)
  }
}

export default App
