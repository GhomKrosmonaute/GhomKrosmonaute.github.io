let rainbowHue = 0
const rainbowThreshold = 3

function updateRainbow() {
  document.documentElement.style.setProperty(
    "--rainbow",
    `${rainbowHue} 100% 50%`,
  )

  rainbowHue = (rainbowHue + rainbowThreshold) % 360

  requestAnimationFrame(updateRainbow)
}

updateRainbow()
