/**
 * Composition data model for Phase 5.
 *
 * A Composition is a graph of atoms connected by parameter routes.
 * Stored in IndexedDB as a single JSON document per composition.
 *
 * Design decisions (from 05-RESEARCH.md):
 * - UUIDs for all IDs (collision-free for Phase 6 sync)
 * - paramOverrides at composition level (don't mutate atom config.json)
 * - synced flag for Phase 6 cloud backup
 * - viewport state persisted for resume-where-you-left-off
 * - Max 5 atoms per composition in Phase 5 (performance limit)
 */

export const MAX_ATOMS_PER_COMPOSITION = 5;

export interface Composition {
  id: string;                    // UUID
  name: string;                  // User-visible name (e.g., "My First Composition")
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  atoms: CompositionAtom[];      // Atoms on the canvas (max 5 in Phase 5)
  routes: ParameterRoute[];      // Parameter connections between atoms
  viewport: {                    // React Flow viewport state
    x: number;
    y: number;
    zoom: number;
  };
  synced: boolean;               // Phase 6 sync flag
}

export interface CompositionAtom {
  nodeId: string;                // Unique within composition (UUID)
  atomSlug: string;              // Reference to atoms IndexedDB store
  position: { x: number; y: number };  // Canvas position
  paramOverrides?: Record<string, number | string | boolean>;  // Local tweaks
}

export interface ParameterRoute {
  id: string;                    // UUID
  sourceNodeId: string;          // CompositionAtom.nodeId
  sourceParam: string;           // config.json controller key
  targetNodeId: string;          // CompositionAtom.nodeId
  targetParam: string;           // config.json controller key
}

/**
 * Data passed to the custom AtomNode React component.
 * This is the `data` field of a React Flow Node.
 */
export interface AtomNodeData {
  atomSlug: string;
  atomTitle: string;
  atomType: string;              // "visual" | "audio" | "audio-visual"
  parameters: AtomParameter[];   // Parsed from config.json controllers
  paramOverrides?: Record<string, number | string | boolean>;
  missing?: boolean;             // True if atom not found in IndexedDB
}

/**
 * Single parameter definition for display in atom nodes.
 * Derived from config.json controllers object.
 */
export interface AtomParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'object';
  value: number | string | boolean | object;
}

/**
 * Infer parameter type from a config.json controller value.
 * Phase 5: strict type matching only (number->number, etc.)
 */
export function inferParamType(value: unknown): AtomParameter['type'] {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'boolean';
  return 'object';
}

/**
 * Check if two parameters are compatible for routing.
 * Phase 5: same-type routing only. Phase 6 adds transforms.
 */
export function canRoute(sourceValue: unknown, targetValue: unknown): boolean {
  const sourceType = inferParamType(sourceValue);
  const targetType = inferParamType(targetValue);
  // Phase 5: Only allow same-type routing
  // Object types are not routable in Phase 5
  if (sourceType === 'object' || targetType === 'object') return false;
  return sourceType === targetType;
}

/**
 * Parse config.json controllers into AtomParameter array.
 */
export function parseAtomParameters(configJson: string): AtomParameter[] {
  try {
    const config = JSON.parse(configJson);
    const controllers = config.controllers || {};
    return Object.entries(controllers).map(([name, value]) => ({
      name,
      type: inferParamType(value),
      value: value as number | string | boolean | object,
    }));
  } catch {
    return [];
  }
}

/**
 * Generate a UUID v4. Uses crypto.randomUUID when available,
 * falls back to manual generation for older browsers.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create an empty composition with default values.
 */
export function createEmptyComposition(name: string): Composition {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    atoms: [],
    routes: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    synced: false,
  };
}
