const els = {
  header: document.querySelector('#header'),
  scmWord: document.querySelector('#scramble-word')
}

// Page Setting
new fullpage('#fullpage', {
  licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE',
  autoScrolling: true,
  scrollingSpeed: 600,

  onLeave: function(origin, destination, direction) {
    // header
    if ((origin.index === 1 && destination.index === 2) || origin.isLast) {
      els.header.classList.add('reverse')
    }

    if ((origin.index === 2 && destination.index === 1) || destination.isLast) {
      els.header.classList.remove('reverse')
    }

    // scrambler
    if (destination.isLast) {
      scm.start()
    } else {
      scm.freeze()
    }
  }
})

function backToTop() {
  els.header.classList.remove('reverse')
  fullpage_api.moveTo(1)
}

// Scatter effect
class ScrambleText {
  constructor(el) {
    this.el = el
    this.chars = 'abcdefghijklmnopqrstuvwxyz'
    this.update = this.update.bind(this)
  }

  setText(newText) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise((resolve) => this.resolve = resolve)

    this.queue = []

    for (let i = 0; i < length; ++i) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }

    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()

    return promise
  }

  update() {
    let output = ''
    let complete = 0

    for (let i = 0, n = this.queue.length; i < n; ++i) {
      let { from, to, start, end, char } = this.queue[i]

      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar()
          this.queue[i].char = char
        }

        output += `<span class="dud">${ char }</span>`
      } else {
        output += from
      }
    }

    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)]
  }
}

function InfiniteScrambler(words, el) {
  const scrambler = new ScrambleText(el)
  let counter = 0
  let lock = false

  const next = () => {
    scrambler.setText(words[counter]).then(() => {
      if (!lock) { setTimeout(next, 800) }
    })
    counter = (counter + 1) % words.length
  }

  this.start = () => {
    lock = false
    next()
  }
  this.freeze = () => lock = true
}

const words = [
  'better',
  'subtle',
  'touchable',
  'elegant'
]

const scm = new InfiniteScrambler(words, els.scmWord)