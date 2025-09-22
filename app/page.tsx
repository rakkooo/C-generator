"use client"

import { useRef, useState, useEffect } from "react"

export default function PFPGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const assetCategories = {
    backgrounds: { count: 28, emoji: "🎨", name: "Backgrounds" },
    backs: { count: 31, emoji: "🔄", name: "Backs" },
    beards: { count: 31, emoji: "🧔", name: "Beards" },
    clothes: { count: 31, emoji: "👕", name: "Clothes" },
    eyebrows: { count: 31, emoji: "🤨", name: "Eyebrows" },
    eyes: { count: 31, emoji: "👀", name: "Eyes" },
    faces: { count: 1, emoji: "😊", name: "Faces" },
    hats: { count: 33, emoji: "🎩", name: "Hats" },
    mouths: { count: 32, emoji: "👄", name: "Mouths" },
  }

  // State management
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>({
    backgrounds: "none",
    backs: "none",
    beards: "none",
    clothes: "none",
    eyebrows: "none",
    eyes: "none",
    faces: "none",
    hats: "none",
    mouths: "none",
  })
  const [currentSelectedTrait, setCurrentSelectedTrait] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("faces")

  const [traitTransforms, setTraitTransforms] = useState<Record<string, { x: number; y: number; scale: number }>>({
    backgrounds: { x: 175, y: 175, scale: 1 },
    backs: { x: 175, y: 175, scale: 1 },
    beards: { x: 175, y: 175, scale: 1 },
    clothes: { x: 175, y: 175, scale: 1 },
    eyebrows: { x: 175, y: 175, scale: 1 },
    eyes: { x: 175, y: 175, scale: 1 },
    faces: { x: 175, y: 175, scale: 1 },
    hats: { x: 175, y: 175, scale: 1 },
    mouths: { x: 175, y: 175, scale: 1 },
  })

  const [currentTraitControls, setCurrentTraitControls] = useState({
    size: 1.0,
    x: 175,
    y: 175,
    isVisible: false,
    name: "No trait selected",
    category: "Click on any trait to customize",
    previewSrc: null as string | null,
  })

  const [showExternalLinkConfirm, setShowExternalLinkConfirm] = useState(false)

  const generateAssetPath = (category: string, index: number) => {
    // Special handling for clothes - it should stay as "clothes" not "clothe"
    if (category === "clothes") {
      return `/assets/${category}/clothes_${index}.png`
    }
    return `/assets/${category}/${category.slice(0, -1)}_${index}.png`
  }

  const selectTrait = (category: string, traitName: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [category]: traitName,
    }))
    setCurrentSelectedTrait(`${category}-${traitName}`)

    const categoryConfig = assetCategories[category as keyof typeof assetCategories]
    const transform = traitTransforms[category]

    setCurrentTraitControls({
      size: transform.scale,
      x: transform.x,
      y: transform.y,
      isVisible: true,
      name: traitName === "none" ? "None" : `${categoryConfig.name} ${traitName}`,
      category: categoryConfig.name,
      previewSrc: traitName === "none" ? null : generateAssetPath(category, Number.parseInt(traitName)),
    })
  }

  const drawCanvas = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw traits in order
    const drawOrder = ["backgrounds", "backs", "faces", "clothes", "beards", "eyebrows", "eyes", "mouths", "hats"]

    for (const category of drawOrder) {
      const traitValue = selectedTraits[category]
      console.log(`Processing ${category}: ${traitValue}`)
      if (traitValue && traitValue !== "none") {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          const imagePath = generateAssetPath(category, Number.parseInt(traitValue))
          console.log(`Loading image: ${imagePath}`)

          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log(`Successfully loaded ${category} image`)
              resolve(null)
            }
            img.onerror = (e) => {
              console.error(`Failed to load ${category} image:`, e)
              reject(e)
            }
            img.src = imagePath
          })

          const transform = traitTransforms[category]

          // Calculate appropriate size based on canvas dimensions and image size
          const canvasSize = 350
          const maxDimension = Math.max(img.width, img.height)
          const baseScale = (canvasSize * transform.scale) / maxDimension

          const scaledWidth = img.width * baseScale
          const scaledHeight = img.height * baseScale

          console.log(`Drawing ${category} at position (${transform.x}, ${transform.y}) with size ${scaledWidth}x${scaledHeight}`)
          // Draw image centered at the transform position
          ctx.drawImage(img, transform.x - scaledWidth / 2, transform.y - scaledHeight / 2, scaledWidth, scaledHeight)
        } catch (error) {
          console.log(`[v0] Failed to load image for ${category}: ${traitValue}`, error)
        }
      }
    }
  }

  useEffect(() => {
    drawCanvas()
  }, [selectedTraits, traitTransforms])

  const updateTraitTransform = (property: "x" | "y" | "scale", value: number) => {
    if (!currentSelectedTrait) return

    const [category] = currentSelectedTrait.split("-")
    setTraitTransforms((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value,
      },
    }))

    setCurrentTraitControls((prev) => ({
      ...prev,
      [property === "scale" ? "size" : property]: value,
    }))
  }

  const resetTraitPosition = () => {
    if (!currentSelectedTrait) return

    const [category] = currentSelectedTrait.split("-")
    const defaultTransform = {
      backgrounds: { x: 175, y: 175, scale: 1 },
      backs: { x: 175, y: 175, scale: 1 },
      beards: { x: 175, y: 175, scale: 1 },
      clothes: { x: 175, y: 175, scale: 1 },
      eyebrows: { x: 175, y: 175, scale: 1 },
      eyes: { x: 175, y: 175, scale: 1 },
      faces: { x: 175, y: 175, scale: 1 },
      hats: { x: 175, y: 175, scale: 1 },
      mouths: { x: 175, y: 175, scale: 1 },
    }[category] || { x: 175, y: 175, scale: 1 }

    setTraitTransforms((prev) => ({
      ...prev,
      [category]: defaultTransform,
    }))

    setCurrentTraitControls((prev) => ({
      ...prev,
      size: defaultTransform.scale,
      x: defaultTransform.x,
      y: defaultTransform.y,
    }))
  }

  const removeTrait = () => {
    if (!currentSelectedTrait) return

    const [category] = currentSelectedTrait.split("-")
    setSelectedTraits((prev) => ({
      ...prev,
      [category]: "none",
    }))

    setCurrentTraitControls((prev) => ({
      ...prev,
      name: "None",
      previewSrc: null,
    }))
  }

  const downloadPFP = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement("a")
      link.download = "c-generator-pfp.png"
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const randomizeAll = () => {
    const newTraits: Record<string, string> = {}
    Object.entries(assetCategories).forEach(([category, config]) => {
      if (category === "faces") {
        newTraits[category] = "0"
      } else {
        const randomIndex = Math.floor(Math.random() * (config.count + 1))
        newTraits[category] = randomIndex === 0 ? "none" : (randomIndex - 1).toString()
      }
    })
    setSelectedTraits(newTraits)
  }

  const handleSubmitClick = () => {
    setShowExternalLinkConfirm(true)
  }

  const handleExternalLinkConfirm = () => {
    setShowExternalLinkConfirm(false)
    window.open("https://forms.gle/LVNj3wHZ34qJXYVKA", "_blank")
  }

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        .animate-rainbow {
          background-size: 400% 400%;
          animation: rainbow 3s ease infinite;
        }
        .animate-rainbow:hover {
          animation: rainbow 1s ease infinite;
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700, 0 0 15px #ffd700, 0 0 20px #ffd700;
            border-color: #ffd700;
          }
          50% { 
            box-shadow: 0 0 10px #ffed4a, 0 0 20px #ffed4a, 0 0 30px #ffed4a, 0 0 40px #ffed4a;
            border-color: #ffed4a;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hats-glow {
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.3) !important;
        }
        .back-30-glow {
          animation: glow 2s ease-in-out infinite, spin 3s linear infinite;
          border: 3px solid #ffd700 !important;
          position: relative;
        }
        .back-30-glow::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: inherit;
          background: linear-gradient(45deg, #ffd700, #ffed4a, #ffd700);
          z-index: -1;
          animation: spin 2s linear infinite reverse;
        }
        .hat-32-rare {
          position: relative;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.4) !important;
        }
        .hat-32-rare::before {
          content: '✨';
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 10px;
          z-index: 10;
          animation: sparkle 3s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-[#ccc4fc] to-[#e0d9ff]">
      {/* Navigation Menu */}
      <nav className="w-full bg-white/20 backdrop-blur-sm border-b border-white/30 px-8 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-bold text-xl text-[#4c1d95] no-underline flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/C_logo-5mhxDq9n4PD990VYBS2AcepZNWFu5l.png"
              alt="C-generator Logo"
              className="w-8 h-8"
            />
            C-generator
          </a>
          <div className="text-[#4c1d95] font-medium text-sm">The Ultimate PFP Generator</div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Trait Display */}
        <div
          className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 transition-opacity ${
            currentTraitControls.isVisible ? "opacity-100" : "opacity-50"
          }`}
        >
          <h3 className="text-lg font-semibold text-[#4c1d95] mb-4">Current Selection</h3>
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <div className="font-medium text-[#6d28d9]">{currentTraitControls.name}</div>
                <div className="text-sm text-gray-600">{currentTraitControls.category}</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-12">Size:</label>
                  <input
                    type="range"
                    className="flex-1"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={currentTraitControls.size}
                    disabled={!currentTraitControls.isVisible}
                    onChange={(e) => updateTraitTransform("scale", Number.parseFloat(e.target.value))}
                  />
                  <span className="text-sm text-gray-600 w-8">{currentTraitControls.size.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-12">X:</label>
                  <input
                    type="range"
                    className="flex-1"
                    min="0"
                    max="350"
                    step="1"
                    value={currentTraitControls.x}
                    disabled={!currentTraitControls.isVisible}
                    onChange={(e) => updateTraitTransform("x", Number.parseInt(e.target.value))}
                  />
                  <span className="text-sm text-gray-600 w-8">{currentTraitControls.x}</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-12">Y:</label>
                  <input
                    type="range"
                    className="flex-1"
                    min="0"
                    max="350"
                    step="1"
                    value={currentTraitControls.y}
                    disabled={!currentTraitControls.isVisible}
                    onChange={(e) => updateTraitTransform("y", Number.parseInt(e.target.value))}
                  />
                  <span className="text-sm text-gray-600 w-8">{currentTraitControls.y}</span>
                </div>
              </div>
            </div>
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              {currentTraitControls.previewSrc ? (
                <img
                  src={currentTraitControls.previewSrc || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.parentElement!.innerHTML = '<div class="text-xs text-gray-500">No Preview</div>'
                  }}
                />
              ) : (
                <div className="text-xs text-gray-500">No Preview</div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-[#ccc4fc] text-[#4c1d95] rounded-lg font-medium hover:bg-[#b8aef7] transition-colors disabled:opacity-50"
              disabled={!currentTraitControls.isVisible}
              onClick={resetTraitPosition}
            >
              Reset Position
            </button>
            <button
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
              disabled={!currentTraitControls.isVisible}
              onClick={removeTrait}
            >
              Remove Trait
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white rounded-lg font-medium hover:from-[#6d28d9] hover:to-[#8b5cf6] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 !bg-gradient-to-r !from-[#7c3aed] !to-[#9333ea]"
              onClick={randomizeAll}
            >
              🎲 Randomize All
            </button>
          </div>
        </div>

        {/* Generator Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Canvas Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4c1d95] mb-4">Your Character</h3>
            <div className="text-center">
              <canvas
                ref={canvasRef}
                width="350"
                height="350"
                className="border-2 border-[#ccc4fc]/30 rounded-lg mx-auto mb-4 cursor-crosshair bg-white"
              />
              <p className="text-sm text-gray-600 mb-4">Character is ready for customization!</p>
              <div className="text-xs text-gray-500 bg-[#ccc4fc]/10 p-3 rounded-lg">
                Click on any trait icon to select and customize it. Use the controls above to adjust size and position.
              </div>
            </div>

            {/* Download Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[#4c1d95] mb-3 flex items-center gap-2">
                <span>💾</span>Download
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-medium hover:bg-[#6d28d9] transition-colors"
                  onClick={downloadPFP}
                >
                  Download PNG PFP
                </button>
                <button 
                  onClick={handleSubmitClick}
                  className="w-full px-8 py-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse hover:scale-110 hover:-translate-y-1 cursor-pointer border-4 border-white animate-rainbow relative overflow-hidden">
                  <span className="relative z-10 drop-shadow-lg">🎉 Submit 🎉</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50 transform -skew-x-12"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Traits Panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-[#4c1d95] mb-6">Customize Traits</h3>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
              {Object.entries(assetCategories).map(([category, config]) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeCategory === category
                      ? "bg-[#7c3aed] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${category === 'backs' ? 'hats-glow' : ''} ${category === 'hats' ? 'hats-glow' : ''}`}
                >
                  <span>{config.emoji}</span>
                  <span>{config.name}</span>
                  <span className="text-xs opacity-70">({config.count})</span>
                </button>
              ))}
            </div>

            {/* Active Category Content */}
            <div className="min-h-[300px]">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-[#4c1d95] flex items-center gap-2">
                  <span>{assetCategories[activeCategory as keyof typeof assetCategories].emoji}</span>
                  {assetCategories[activeCategory as keyof typeof assetCategories].name}
                </h4>
                <p className="text-sm text-gray-600">
                  Choose from {assetCategories[activeCategory as keyof typeof assetCategories].count} options
                </p>
              </div>

              <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto" id={`${activeCategory}Icons`}>
                <div
                  className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-[#ccc4fc] hover:border-[#7c3aed]"
                  onClick={() => selectTrait(activeCategory, "none")}
                  title="None"
                >
                  <span className="text-gray-500 text-lg">✕</span>
                </div>
                {Array.from(
                  { length: assetCategories[activeCategory as keyof typeof assetCategories].count },
                  (_, i) => (
                    <div
                      key={i}
                      className={`w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors border-2 ${
                        selectedTraits[activeCategory] === `${i}`
                          ? "border-[#7c3aed] bg-[#7c3aed]/10"
                          : "border-gray-200 hover:border-[#ccc4fc]"
                      } ${activeCategory === 'backs' && i === 30 ? 'back-30-glow' : ''} ${activeCategory === 'hats' && i === 32 ? 'hat-32-rare' : ''}`}
                      onClick={() => selectTrait(activeCategory, `${i}`)}
                      title={`${assetCategories[activeCategory as keyof typeof assetCategories].name} ${i}`}
                    >
                      <img
                        src={generateAssetPath(activeCategory, i) || "/placeholder.svg"}
                        alt={`${assetCategories[activeCategory as keyof typeof assetCategories].name} ${i}`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.parentElement!.innerHTML = `<span class="text-xs font-medium text-gray-600">${i}</span>`
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* External Link Confirmation Modal */}
      {showExternalLinkConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExternalLinkConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">External Link</h3>
                <p className="text-gray-600 text-sm">
                  You will be redirected to a Google Form.<br/>
                  Do you want to continue?
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExternalLinkConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExternalLinkConfirm}
                  className="flex-1 px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-medium hover:bg-[#6d28d9] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
