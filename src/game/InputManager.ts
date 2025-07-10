export class InputManager {
  private keys: { [key: string]: boolean } = {}

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false
    })

    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' '].includes(e.key)) {
        e.preventDefault()
      }
    })
  }

  getKeys(): { [key: string]: boolean } {
    return { ...this.keys }
  }

  isPressed(key: string): boolean {
    return !!this.keys[key]
  }
}