const PRESETS = {}
const PRESET_MANIFEST = {}
let manifestLoaded = false

// Dynamically fetch presets based on manifest
async function loadPresetsFromManifest() {
  if (manifestLoaded) return
  
  try {
    // Fetch the manifest file
    const manifestResponse = await fetch('./presets/manifest.json')
    if (!manifestResponse.ok) {
      throw new Error(`Failed to load manifest: ${manifestResponse.status}`)
    }
    const manifest = await manifestResponse.json()
    
    // Load each preset
    for (const entry of manifest) {
      try {
        const response = await fetch(`./presets/${entry.file}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const preset = await response.json()
        PRESETS[entry.id] = preset
        PRESET_MANIFEST[entry.id] = entry
      } catch (err) {
        console.error(`Failed to load preset ${entry.id}:`, err)
      }
    }
    manifestLoaded = true
  } catch (err) {
    console.error(`Failed to load manifest:`, err)
  }
}

export async function ensurePresetsLoaded() {
  if (!manifestLoaded) {
    await loadPresetsFromManifest()
  }
}

export function loadPreset(presetKey) {
  return PRESETS[presetKey] || null
}

export function getPresetNames() {
  return Object.keys(PRESETS)
}

export function getPresetDisplayName(presetKey) {
  const manifest = PRESET_MANIFEST[presetKey]
  if (!manifest) return presetKey
  return manifest.material ? `${manifest.name} - ${manifest.material}` : manifest.name
}
