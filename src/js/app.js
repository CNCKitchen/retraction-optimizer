import { generateGcodeFromForm } from './generator.js'
import { loadPreset, getPresetNames, ensurePresetsLoaded, getPresetDisplayName } from './presets.js'
import { START_GCODE_RAW, END_GCODE_RAW } from './constants.js'
import { makeFilename } from './helpers.js'

function getFormState() {
  const $ = id => document.getElementById(id)

  // helpers that tolerate alternate IDs and missing fields
  const numVal = (id, altId, fallback) => {
    const el = $(id) || (altId && $(altId))
    if (!el) return fallback
    const v = el.value
    return v === '' || v === undefined ? fallback : Number(v)
  }

  const intVal = (id, altId, fallback) => {
    const n = numVal(id, altId, fallback)
    return Number.isNaN(n) ? fallback : Math.trunc(n)
  }

  // Support older UI fields: 'retractDist' -> both min/max if min/max missing
  const retractSingle = numVal('retractDist', null, null)
  const retractMin = numVal('minDist', null, retractSingle)
  const retractMax = numVal('maxDist', null, retractSingle)

  const retractSpeedSingle = numVal('retractSpeed', null, null)
  const minSpeed = numVal('minSpeed', null, retractSpeedSingle)
  const maxSpeed = numVal('maxSpeed', null, retractSpeedSingle)

  return {
    bedX: numVal('bedX', null, 220),
    bedY: numVal('bedY', null, 220),
    bedTemp: numVal('bedTemp', null, 60),
    minDist: retractMin,
    maxDist: retractMax,
    hotendTemp: numVal('hotendTemp', null, 210),
    minSpeed: minSpeed,
    maxSpeed: maxSpeed,
    flowFactor: numVal('flowFactor', null, 1.0),
    firstLayerSpeed: numVal('firstLayerSpeed', null, 20),
    printSpeed: numVal('printSpeed', null, 50),
    travelSpeed: numVal('travelSpeed', null, 150),
    layerHeight: numVal('layerHeight', null, 0.2),
    pressureAdvance: (function() {
      const el = $('pressureAdvance')
      if (!el) return null
      return el.value === '' ? null : Number(el.value)
    })(),
    firstLayerZ: numVal('firstLayerZ', null, 0.2),
    textSpeed: numVal('textSpeed', null, 30),
    rowFontSize: numVal('rowFontSize', null, 2.4),
    speedFontSize: numVal('speedFontSize', null, 2.4),
    extrusionWidth: numVal('extrusionWidth', null, 0.45),
    filamentDia: numVal('filamentDia', null, 1.75),
    rowGap: numVal('rowGap', null, 1.0),
    margin: numVal('margin', null, 5.0),
    distLabelPad: numVal('distLabelPad', null, 1.0),
    linesPerParam: intVal('linesPerParam', 'doeLines', 10),
    rows: intVal('rows', 'doeRows', 5),
    cols: intVal('cols', 'doeColumns', 5),
    segLen: numVal('segLen', 'doeSegments', 10),
    travelLen: numVal('travelLen', null, 20),
    numLayers: intVal('numLayers', null, 5),
    startGcode: (document.getElementById('startGcode') || { value: '' }).value,
    endGcode: (document.getElementById('endGcode') || { value: '' }).value
  }
}

function setFormState(state) {
  const setIf = (id, altId, v) => {
    const el = document.getElementById(id) || (altId && document.getElementById(altId))
    if (!el) return
    el.value = v === null || v === undefined ? '' : String(v)
  }

  if (state.bedX !== undefined) setIf('bedX', null, state.bedX)
  if (state.bedY !== undefined) setIf('bedY', null, state.bedY)
  if (state.bedTemp !== undefined) setIf('bedTemp', null, state.bedTemp)
  if (state.minDist !== undefined) setIf('minDist', 'retractDist', state.minDist)
  if (state.maxDist !== undefined) setIf('maxDist', null, state.maxDist)
  if (state.hotendTemp !== undefined) setIf('hotendTemp', null, state.hotendTemp)
  if (state.minSpeed !== undefined) setIf('minSpeed', 'retractSpeed', state.minSpeed)
  if (state.maxSpeed !== undefined) setIf('maxSpeed', null, state.maxSpeed)
  if (state.flowFactor !== undefined) setIf('flowFactor', null, state.flowFactor)
  if (state.firstLayerSpeed !== undefined) setIf('firstLayerSpeed', null, state.firstLayerSpeed)
  if (state.printSpeed !== undefined) setIf('printSpeed', null, state.printSpeed)
  if (state.travelSpeed !== undefined) setIf('travelSpeed', null, state.travelSpeed)
  if (state.layerHeight !== undefined) setIf('layerHeight', null, state.layerHeight)
  if (state.pressureAdvance !== undefined) setIf('pressureAdvance', null, state.pressureAdvance)
  if (state.firstLayerZ !== undefined) setIf('firstLayerZ', null, state.firstLayerZ)
  if (state.textSpeed !== undefined) setIf('textSpeed', null, state.textSpeed)
  if (state.rowFontSize !== undefined) setIf('rowFontSize', null, state.rowFontSize)
  if (state.speedFontSize !== undefined) setIf('speedFontSize', null, state.speedFontSize)
  if (state.extrusionWidth !== undefined) setIf('extrusionWidth', null, state.extrusionWidth)
  if (state.filamentDia !== undefined) setIf('filamentDia', null, state.filamentDia)
  if (state.rowGap !== undefined) setIf('rowGap', null, state.rowGap)
  if (state.margin !== undefined) setIf('margin', null, state.margin)
  if (state.distLabelPad !== undefined) setIf('distLabelPad', null, state.distLabelPad)
  if (state.linesPerParam !== undefined) setIf('linesPerParam', 'doeLines', state.linesPerParam)
  if (state.rows !== undefined) setIf('rows', 'doeRows', state.rows)
  if (state.cols !== undefined) setIf('cols', 'doeColumns', state.cols)
  if (state.segLen !== undefined) setIf('segLen', 'doeSegments', state.segLen)
  if (state.travelLen !== undefined) setIf('travelLen', null, state.travelLen)
  if (state.numLayers !== undefined) setIf('numLayers', null, state.numLayers)
  if (state.startGcode !== undefined) setIf('startGcode', null, state.startGcode)
  if (state.endGcode !== undefined) setIf('endGcode', null, state.endGcode)
}

function setupPresetDropdown() {
  const presetSelect = document.getElementById('preset-select')
  presetSelect.innerHTML = '<option value="">-- Select a printer --</option>'
  
  getPresetNames().forEach(presetKey => {
    const displayName = getPresetDisplayName(presetKey)
    const option = document.createElement('option')
    option.value = presetKey
    option.textContent = displayName
    presetSelect.appendChild(option)
  })
}

function handleLoadPreset() {
  const presetSelect = document.getElementById('preset-select')
  const presetStatus = document.getElementById('preset-status')
  const selected = presetSelect.value
  
  if (!selected) {
    presetStatus.textContent = ''
    return
  }

  const preset = loadPreset(selected)
  if (!preset) {
    presetStatus.textContent = 'Preset not found'
    presetStatus.style.color = '#ef4444'
    return
  }

  setFormState(preset)
  presetStatus.textContent = `Loaded: ${preset.name}`
  presetStatus.style.color = '#059669'
}

function handleGenerateGcode() {
  const statusEl = document.getElementById('status')
  const outEl = document.getElementById('output')

  try {
    statusEl.textContent = 'Generating…'
    statusEl.classList.remove('error')

    const formState = getFormState()
    const gcode = generateGcodeFromForm(formState)
    
    outEl.value = gcode
    statusEl.textContent = 'G-code generated. You can download it now.'
    document.getElementById('download-btn').disabled = false
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message
    statusEl.classList.add('error')
    document.getElementById('download-btn').disabled = true
    console.error(err)
  }
}

function handleDownloadGcode() {
  const gcode = document.getElementById('output').value
  if (!gcode.trim()) return
  const blob = new Blob([gcode], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = makeFilename()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function initializeApp() {
  // Ensure presets are loaded first
  await ensurePresetsLoaded()

  // Initialize gcode textareas with defaults
  const startEl = document.getElementById('startGcode')
  const endEl = document.getElementById('endGcode')
  if (startEl && !startEl.value) startEl.value = START_GCODE_RAW
  if (endEl && !endEl.value) endEl.value = END_GCODE_RAW

  // Setup preset dropdown
  setupPresetDropdown()

  // Attach event listeners
  document.getElementById('load-preset-btn').addEventListener('click', handleLoadPreset)
  document.getElementById('generate-btn').addEventListener('click', handleGenerateGcode)
  document.getElementById('download-btn').addEventListener('click', handleDownloadGcode)
}
