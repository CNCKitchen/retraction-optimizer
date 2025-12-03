import defaultPreset from '../presets/default.json'
import prusamk3sPreset from '../presets/prusa-mk3s.json'
import bambuX1cPreset from '../presets/bambu-x1c.json'

export const PRESETS = {
  'default': defaultPreset,
  'prusa-mk3s': prusamk3sPreset,
  'bambu-x1c': bambuX1cPreset
}

export function loadPreset(presetKey) {
  return PRESETS[presetKey] || null
}

export function getPresetNames() {
  return Object.keys(PRESETS)
}
