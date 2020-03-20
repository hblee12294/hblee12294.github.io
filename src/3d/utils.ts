import { WebGLRenderer } from 'three'

export const random = (base: any) => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0]
  return Math.random() * base
}

export const pickRandom = (arr: any) => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)]
  return arr
}

export const lerp = (current: number, target: number, speed = 0.1, limit = 0.001) => {
  let change = (target - current) * speed
  if (Math.abs(change) < limit) {
    change = target - current
  }
  return change
}

export const resizeRendererToDisplaySize = (renderer: WebGLRenderer, setSize: any) => {
  const canvas = renderer.domElement
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const needResize = canvas.width !== width || canvas.height !== height
  if (needResize) {
    setSize(width, height, false)
  }
  return needResize
}
