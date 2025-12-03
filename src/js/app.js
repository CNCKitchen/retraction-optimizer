import { generateGcodeFromForm } from './generator.js'
import { loadPreset, getPresetNames, PRESETS } from './presets.js'
import { START_GCODE_RAW, END_GCODE_RAW } from './constants.js'
import { makeFilename } from './helpers.js'

function getFormState() {
  return {
    bedX: parseFloat(document.getElementById('bedX').value),
    bedY: parseFloat(document.getElementById('bedY').value),
    bedTemp: parseFloat(document.getElementById('bedTemp').value),
    minDist: parseFloat(document.getElementById('minDist').value),
    maxDist: parseFloat(document.getElementById('maxDist').value),
    hotendTemp: parseFloat(document.getElementById('hotendTemp').value),
    minSpeed: parseFloat(document.getElementById('minSpeed').value),
    maxSpeed: parseFloat(document.getElementById('maxSpeed').value),
    flowFactor: parseFloat(document.getElementById('flowFactor').value),
    firstLayerSpeed: parseFloat(document.getElementById('firstLayerSpeed').value),
    printSpeed: parseFloat(document.getElementById('printSpeed').value),
    travelSpeed: parseFloat(document.getElementById('travelSpeed').value),
    layerHeight: parseFloat(document.getElementById('layerHeight').value),
    pressureAdvance: parseFloat(document.getElementById('pressureAdvance').value),
    firstLayerZ: parseFloat(document.getElementById('firstLayerZ').value),
    textSpeed: parseFloat(document.getElementById('textSpeed').value),
    rowFontSize: parseFloat(document.getElementById('rowFontSize').value),
    speedFontSize: parseFloat(document.getElementById('speedFontSize').value),
    extrusionWidth: parseFloat(document.getElementById('extrusionWidth').value),
    filamentDia: parseFloat(document.getElementById('filamentDia').value),
    rowGap: parseFloat(document.getElementById('rowGap').value),
    margin: parseFloat(document.getElementById('margin').value),
    distLabelPad: parseFloat(document.getElementById('distLabelPad').value),
    linesPerParam: parseInt(document.getElementById('linesPerParam').value, 10),
    rows: parseInt(document.getElementById('rows').value, 10),
    cols: parseInt(document.getElementById('cols').value, 10),
    segLen: parseFloat(document.getElementById('segLen').value),
    travelLen: parseFloat(document.getElementById('travelLen').value),
    numLayers: parseInt(document.getElementById('numLayers').value, 10),
    startGcode: document.getElementById('startGcode').value,
    endGcode: document.getElementById('endGcode').value
  }
}

function setFormState(state) {
  if (state.bedX !== undefined) document.getElementById('bedX').value = state.bedX
  if (state.bedY !== undefined) document.getElementById('bedY').value = state.bedY
  if (state.bedTemp !== undefined) document.getElementById('bedTemp').value = state.bedTemp
  if (state.minDist !== undefined) document.getElementById('minDist').value = state.minDist
  if (state.maxDist !== undefined) document.getElementById('maxDist').value = state.maxDist
  if (state.hotendTemp !== undefined) document.getElementById('hotendTemp').value = state.hotendTemp
  if (state.minSpeed !== undefined) document.getElementById('minSpeed').value = state.minSpeed
  if (state.maxSpeed !== undefined) document.getElementById('maxSpeed').value = state.maxSpeed
  if (state.flowFactor !== undefined) document.getElementById('flowFactor').value = state.flowFactor
  if (state.firstLayerSpeed !== undefined) document.getElementById('firstLayerSpeed').value = state.firstLayerSpeed
  if (state.printSpeed !== undefined) document.getElementById('printSpeed').value = state.printSpeed
  if (state.travelSpeed !== undefined) document.getElementById('travelSpeed').value = state.travelSpeed
  if (state.layerHeight !== undefined) document.getElementById('layerHeight').value = state.layerHeight
  if (state.pressureAdvance !== undefined && state.pressureAdvance !== null) document.getElementById('pressureAdvance').value = state.pressureAdvance
  if (state.firstLayerZ !== undefined) document.getElementById('firstLayerZ').value = state.firstLayerZ
  if (state.textSpeed !== undefined) document.getElementById('textSpeed').value = state.textSpeed
  if (state.rowFontSize !== undefined) document.getElementById('rowFontSize').value = state.rowFontSize
  if (state.speedFontSize !== undefined) document.getElementById('speedFontSize').value = state.speedFontSize
  if (state.extrusionWidth !== undefined) document.getElementById('extrusionWidth').value = state.extrusionWidth
  if (state.filamentDia !== undefined) document.getElementById('filamentDia').value = state.filamentDia
  if (state.rowGap !== undefined) document.getElementById('rowGap').value = state.rowGap
  if (state.margin !== undefined) document.getElementById('margin').value = state.margin
  if (state.distLabelPad !== undefined) document.getElementById('distLabelPad').value = state.distLabelPad
  if (state.linesPerParam !== undefined) document.getElementById('linesPerParam').value = state.linesPerParam
  if (state.rows !== undefined) document.getElementById('rows').value = state.rows
  if (state.cols !== undefined) document.getElementById('cols').value = state.cols
  if (state.segLen !== undefined) document.getElementById('segLen').value = state.segLen
  if (state.travelLen !== undefined) document.getElementById('travelLen').value = state.travelLen
  if (state.numLayers !== undefined) document.getElementById('numLayers').value = state.numLayers
  if (state.startGcode !== undefined && state.startGcode !== '') document.getElementById('startGcode').value = state.startGcode
  if (state.endGcode !== undefined && state.endGcode !== '') document.getElementById('endGcode').value = state.endGcode
}

function setupPresetDropdown() {
  const presetSelect = document.getElementById('presetSelect')
  presetSelect.innerHTML = '<option value="">-- Select a printer --</option>'
  
  getPresetNames().forEach(presetKey => {
    const preset = PRESETS[presetKey]
    const option = document.createElement('option')
    option.value = presetKey
    option.textContent = preset.name || presetKey
    presetSelect.appendChild(option)
  })
}

function handleLoadPreset() {
  const presetSelect = document.getElementById('presetSelect')
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
  const outEl = document.getElementById('gcode-output')

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
  const gcode = document.getElementById('gcode-output').value
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

export function initializeApp() {
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
