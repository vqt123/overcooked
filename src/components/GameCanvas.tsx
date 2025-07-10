import React, { useRef, useEffect } from 'react'
import { GameEngine } from '../game/GameEngine'

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      gameEngineRef.current = new GameEngine(canvasRef.current)
      gameEngineRef.current.start()
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop()
      }
    }
  }, [])

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600}
        style={{ display: 'block' }}
      />
    </div>
  )
}

export default GameCanvas