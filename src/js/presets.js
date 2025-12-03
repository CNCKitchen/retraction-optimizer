import manifest from '../presets/manifest.json'

const PRESETS = {}
const PRESET_MANIFEST = {}

// Dynamically import presets based on manifest
async function loadPresetsFromManifest() {
  for (const entry of manifest) {
    try {
      const preset = await import(`../presets/${entry.file}`)
      PRESETS[entry.id] = preset.default
      PRESET_MANIFEST[entry.id] = entry
    } catch (err) {
      console.error(`Failed to load preset ${entry.id}:`, err)
    }
  }
}

export async function ensurePresetsLoaded() {
  if (Object.keys(PRESETS).length === 0) {
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
  return PRESET_MANIFEST[presetKey]?.name || presetKey
}
