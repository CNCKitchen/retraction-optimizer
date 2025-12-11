// Math and utility helpers
export function linspace(n, vmin, vmax) {
  if (n <= 1) return [vmin]
  const step = (vmax - vmin) / (n - 1)
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push(vmin + i * step)
  }
  return arr
}

export function filamentArea(d) {
  const r = d / 2.0
  return Math.PI * r * r
}

export function ePerMmLine(lineWidth, layerHeight, filamentArea) {
  const volPerMm = lineWidth * layerHeight * 0.95  // Magic factor 0.9 to account for not filling all the voids
  return volPerMm / filamentArea
}

export function checkInBed(x, y, bedX, bedY) {
  if (x !== null && x !== undefined) {
    if (x < 0 || x > bedX) {
      throw new Error(`G-code X move ${x.toFixed(3)} is outside bed [0, ${bedX}]`)
    }
  }
  if (y !== null && y !== undefined) {
    if (y < 0 || y > bedY) {
      throw new Error(`G-code Y move ${y.toFixed(3)} is outside bed [0, ${bedY}]`)
    }
  }
}

export function g1Move({ x = null, y = null, z = null, e = null, f = null, bedX, bedY }) {
  checkInBed(x, y, bedX, bedY)
  const parts = ["G1"]
  if (x !== null && x !== undefined) parts.push(`X${x.toFixed(3)}`)
  if (y !== null && y !== undefined) parts.push(`Y${y.toFixed(3)}`)
  if (z !== null && z !== undefined) parts.push(`Z${z.toFixed(3)}`)
  if (e !== null && e !== undefined) parts.push(`E${e.toFixed(5)}`)
  if (f !== null && f !== undefined) parts.push(`F${f.toFixed(0)}`)
  return parts.join(" ")
}

export function applyPlaceholders(s, bedTemp, hotendTemp) {
  return s
    .replace(/\[bed_temperature\]/g, String(bedTemp))
    .replace(/\[hotend_temperature\]/g, String(hotendTemp))
}

export function retractLinesDoe(dist, speed, zHop = 0, currentZ = 0) {
  const f = speed * 60.0
  const retractLines = [`G1 E${(-dist).toFixed(5)} F${f.toFixed(0)}`]
  if (zHop > 0) {
    const zHopped = currentZ + zHop
    retractLines.push(`G1 Z${zHopped.toFixed(3)} F300 ; z-hop up`)
  }
  const deretractLines = []
  if (zHop > 0) {
    deretractLines.push(`G1 Z${currentZ.toFixed(3)} F300 ; z-hop down`)
  }
  deretractLines.push(`G1 E${dist.toFixed(5)} F${f.toFixed(0)}`)
  return {
    retract: retractLines.join('\n'),
    deretract: deretractLines.join('\n')
  }
}

export function retractLinesAvg(avgDist, avgSpeed, zHop = 0, currentZ = 0) {
  const f = avgSpeed * 60.0
  const d = avgDist
  const retractLines = [`G1 E${(-d).toFixed(5)} F${f.toFixed(0)}`]
  if (zHop > 0) {
    const zHopped = currentZ + zHop
    retractLines.push(`G1 Z${zHopped.toFixed(3)} F300 ; z-hop up`)
  }
  const deretractLines = []
  if (zHop > 0) {
    deretractLines.push(`G1 Z${currentZ.toFixed(3)} F300 ; z-hop down`)
  }
  deretractLines.push(`G1 E${d.toFixed(5)} F${f.toFixed(0)}`)
  return {
    retract: retractLines.join('\n'),
    deretract: deretractLines.join('\n')
  }
}

export function makeFilename() {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, "0")
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`
  return `retraction_doe_test_${ts}.gcode`
}
