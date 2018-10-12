(function () {
  let renderer, scene, camera, control
  let particles, uniforms
  const PARTICLE_SIZE = 30

  let raycaster, intersects
  let mouse, INTERSECTED

  init()
  animate()

  function init() {
    let container = document.getElementById('container')

    // scene
    scene = new THREE.Scene()

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.z = 250

    // control
    control = new THREE.OrbitControls(camera)
    control.enablePan = false
    control.enableZoom = false
    control.update()

    // renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x1b1b1b)
    container.appendChild(renderer.domElement)

    // template vertices
    let vertices = new THREE.BoxGeometry(105, 105, 110, 6, 6, 6).vertices
    let positions = new Float32Array(vertices.length * 3)
    let colors = new Float32Array(vertices.length * 3)
    let sizes = new Float32Array(vertices.length)

    let vertex
    let color = new THREE.Color()
    for (let i = 0, l = vertices.length; i < l; ++i) {
      vertex = vertices[i]
      vertex.toArray(positions, i * 3)

      color.setHSL(0.6, 1.0, 0.9)
      color.toArray(colors, i * 3)

      sizes[i] = PARTICLE_SIZE * 0.5
    }

    // build geometry from template vertices
    const geometry = new THREE.BufferGeometry()
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        texture: { value: new THREE.TextureLoader().load('texture/disc.png') }
      },
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      alphaTest: 0.9
    })

    // add particles to the scene
    particles = new THREE.Points(geometry, material)
    scene.add(particles)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    window.addEventListener('resize', onWindowResize, false)
    document.addEventListener('mousemove', onDocumentMouseMove, false)
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function onDocumentMouseMove(event) {
    event.preventDefault()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    particles.rotation.x += 0.0004
    particles.rotation.y += 0.0002

    let geometry = particles.geometry
    let attributes = geometry.attributes
    let color = new THREE.Color().setHSL(Math.random(), 1.0, 0.7)

    raycaster.setFromCamera(mouse, camera)

    intersects = raycaster.intersectObject(particles)
    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].index) {
        attributes.size.array[INTERSECTED] = PARTICLE_SIZE

        INTERSECTED = intersects[0].index

        attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25
        attributes.customColor.array[INTERSECTED * 3 + 0] = color.r
        attributes.customColor.array[INTERSECTED * 3 + 1] = color.g
        attributes.customColor.array[INTERSECTED * 3 + 2] = color.b
        attributes.size.needsUpdate = true
        attributes.customColor.needsUpdate = true
      }
    } else if (INTERSECTED !== null) {
      attributes.size.array[INTERSECTED] = PARTICLE_SIZE
      attributes.size.needsUpdate = true
      INTERSECTED = null
    }

    renderer.render(scene, camera)
  }
})()