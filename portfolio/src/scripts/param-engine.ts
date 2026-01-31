/**
 * Parameter engine for config.json controller values.
 *
 * Responsibilities:
 * - Parse config.json "controllers" object into slider definitions
 * - Load overrides from IndexedDB (previously tweaked values)
 * - Save overrides to IndexedDB on change
 * - Compute effective values (original + override merge)
 * - Determine slider ranges from original values (heuristic)
 *
 * Config.json format (from existing atoms):
 * {
 *   "controllers": {
 *     "bgHue": 200,
 *     "shapeHue": 30,
 *     "size": 100,
 *     "speed": 1,
 *     "noiseScale": 0.01
 *   }
 * }
 */
import { saveConfigOverride, getConfigOverride, type ConfigOverride } from './db';

export interface ParamDef {
  name: string;
  originalValue: number;
  currentValue: number;
  min: number;
  max: number;
  step: number;
}

/**
 * Parse controllers object from config.json into parameter definitions.
 * Heuristic for ranges:
 * - Hue values (name contains "hue"): 0-360, step 1
 * - Scale values (name contains "scale"): 0 to 10x original, step = original/100
 * - Speed values (name contains "speed"): 0 to 10x original, step = original/100
 * - Size values (name contains "size"): 0 to 5x original, step 1
 * - General numeric: 0 to 2x original (minimum max: 10), step varies by magnitude
 */
export function parseControllers(configJson: string): ParamDef[] {
  try {
    const config = JSON.parse(configJson);
    const controllers = config.controllers || {};
    const params: ParamDef[] = [];

    for (const [name, value] of Object.entries(controllers)) {
      if (typeof value !== 'number') continue;

      const v = value as number;
      const { min, max, step } = inferRange(name, v);

      params.push({
        name,
        originalValue: v,
        currentValue: v,
        min,
        max,
        step
      });
    }

    return params;
  } catch (e) {
    console.error('[param-engine] Failed to parse config:', e);
    return [];
  }
}

function inferRange(name: string, value: number): { min: number; max: number; step: number } {
  const nameLower = name.toLowerCase();

  // Hue values: 0-360
  if (nameLower.includes('hue') || nameLower.includes('color')) {
    return { min: 0, max: 360, step: 1 };
  }

  // Boolean-like values (0 or 1)
  if (value === 0 || value === 1) {
    if (nameLower.includes('enable') || nameLower.includes('toggle') || nameLower.includes('show')) {
      return { min: 0, max: 1, step: 1 };
    }
  }

  // Very small values (noise scale, etc.)
  if (Math.abs(value) < 0.1 && value !== 0) {
    return {
      min: 0,
      max: Math.max(value * 10, 1),
      step: value / 100
    };
  }

  // Small values (speed, etc.)
  if (Math.abs(value) < 10) {
    return {
      min: 0,
      max: Math.max(value * 5, 10),
      step: 0.1
    };
  }

  // Medium values (size, etc.)
  if (Math.abs(value) < 1000) {
    return {
      min: 0,
      max: Math.max(value * 3, 100),
      step: 1
    };
  }

  // Large values
  return {
    min: 0,
    max: value * 2,
    step: Math.floor(value / 100) || 1
  };
}

/**
 * Apply saved overrides from IndexedDB to parameter definitions.
 */
export async function applyOverrides(atomSlug: string, params: ParamDef[]): Promise<ParamDef[]> {
  const override = await getConfigOverride(atomSlug);
  if (!override || !override.overrides) return params;

  return params.map(p => ({
    ...p,
    currentValue: typeof override.overrides[p.name] === 'number'
      ? override.overrides[p.name] as number
      : p.currentValue
  }));
}

/**
 * Save a single parameter change to IndexedDB.
 * Merges with existing overrides (only changed params stored).
 */
export async function saveParamChange(
  atomSlug: string,
  paramName: string,
  value: number
): Promise<void> {
  const existing = await getConfigOverride(atomSlug);
  const overrides = existing?.overrides || {};

  overrides[paramName] = value;

  await saveConfigOverride({
    atomSlug,
    overrides,
    updatedAt: new Date().toISOString(),
    synced: false
  });
}

/**
 * Reset all overrides for an atom (restore original config.json values).
 */
export async function resetOverrides(atomSlug: string): Promise<void> {
  await saveConfigOverride({
    atomSlug,
    overrides: {},
    updatedAt: new Date().toISOString(),
    synced: false
  });
}

/**
 * Get a merged config.json string with overrides applied.
 * Used to generate the effective config for desktop sync (Phase 6).
 */
export async function getEffectiveConfig(atomSlug: string, originalConfigJson: string): Promise<string> {
  try {
    const config = JSON.parse(originalConfigJson);
    const override = await getConfigOverride(atomSlug);

    if (override && override.overrides && config.controllers) {
      for (const [key, val] of Object.entries(override.overrides)) {
        if (key in config.controllers) {
          config.controllers[key] = val;
        }
      }
    }

    return JSON.stringify(config, null, 2);
  } catch (e) {
    return originalConfigJson;
  }
}
