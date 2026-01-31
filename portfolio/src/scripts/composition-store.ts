/**
 * Composition storage and state management for Phase 5.
 *
 * Provides:
 * - IndexedDB CRUD for compositions
 * - Canvas state helpers (add atom, build React Flow nodes/edges)
 * - Composition lifecycle (create, load, save, delete)
 *
 * Design decisions:
 * - Save is explicit (called by autosave in 05-04, not on every mutation)
 * - Atom addition checks MAX_ATOMS limit
 * - Missing atoms handled gracefully (placeholder node)
 */
import { getDB } from './db';
import type { AtomMetadata } from './db';
import {
  type Composition,
  type CompositionAtom,
  type ParameterRoute,
  type AtomNodeData,
  generateId,
  createEmptyComposition,
  parseAtomParameters,
  MAX_ATOMS_PER_COMPOSITION,
} from './composition-types';
import type { Node, Edge } from 'reactflow';

// ---- IndexedDB CRUD ----

export async function saveComposition(composition: Composition): Promise<void> {
  const db = await getDB();
  const updated = {
    ...composition,
    updatedAt: new Date().toISOString(),
    synced: false,
  };
  await db.put('compositions', updated);
}

export async function getComposition(id: string): Promise<Composition | undefined> {
  const db = await getDB();
  return db.get('compositions', id);
}

export async function getAllCompositions(): Promise<Composition[]> {
  const db = await getDB();
  const compositions = await db.getAllFromIndex('compositions', 'updatedAt');
  return compositions.reverse(); // Most recent first
}

export async function deleteComposition(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('compositions', id);
}

export async function getUnsyncedCount(): Promise<number> {
  const db = await getDB();
  const unsynced = await db.getAllFromIndex('compositions', 'synced', false);
  return unsynced.length;
}

// ---- Canvas State Helpers ----

/**
 * Add an atom to a composition. Returns updated composition or null if limit reached.
 */
export function addAtomToComposition(
  composition: Composition,
  atomSlug: string,
  atomMetadata: AtomMetadata,
): Composition | null {
  if (composition.atoms.length >= MAX_ATOMS_PER_COMPOSITION) {
    return null; // Limit reached
  }

  const newAtom: CompositionAtom = {
    nodeId: generateId(),
    atomSlug,
    position: calculateNewNodePosition(composition.atoms.length),
    paramOverrides: undefined,
  };

  return {
    ...composition,
    atoms: [...composition.atoms, newAtom],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove an atom (and its routes) from a composition.
 */
export function removeAtomFromComposition(
  composition: Composition,
  nodeId: string,
): Composition {
  return {
    ...composition,
    atoms: composition.atoms.filter(a => a.nodeId !== nodeId),
    routes: composition.routes.filter(
      r => r.sourceNodeId !== nodeId && r.targetNodeId !== nodeId
    ),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate position for a new node based on existing node count.
 * Arranges in a staggered grid pattern for readability.
 */
function calculateNewNodePosition(existingCount: number): { x: number; y: number } {
  const col = existingCount % 2;
  const row = Math.floor(existingCount / 2);
  return {
    x: 50 + col * 250,   // 250px horizontal spacing
    y: 50 + row * 200,   // 200px vertical spacing
  };
}

/**
 * Build React Flow nodes from composition atoms.
 * Loads atom metadata from IndexedDB to populate node data.
 */
export async function buildNodes(
  composition: Composition,
  atomsMap: Map<string, AtomMetadata>,
): Promise<Node<AtomNodeData>[]> {
  return composition.atoms.map(compAtom => {
    const metadata = atomsMap.get(compAtom.atomSlug);

    if (!metadata) {
      // Atom not found in IndexedDB - show placeholder
      return {
        id: compAtom.nodeId,
        type: 'atomNode',
        position: compAtom.position,
        data: {
          atomSlug: compAtom.atomSlug,
          atomTitle: compAtom.atomSlug,
          atomType: 'visual',
          parameters: [],
          missing: true,
        },
      };
    }

    const parameters = parseAtomParameters(metadata.configJson);

    return {
      id: compAtom.nodeId,
      type: 'atomNode',
      position: compAtom.position,
      data: {
        atomSlug: compAtom.atomSlug,
        atomTitle: metadata.title,
        atomType: metadata.type,
        parameters,
        paramOverrides: compAtom.paramOverrides,
        missing: false,
      },
    };
  });
}

/**
 * Build React Flow edges from composition routes.
 */
export function buildEdges(composition: Composition): Edge[] {
  return composition.routes.map(route => ({
    id: route.id,
    source: route.sourceNodeId,
    target: route.targetNodeId,
    sourceHandle: `${route.sourceParam}-out`,
    targetHandle: `${route.targetParam}-in`,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6bb5ff', strokeWidth: 2 },
  }));
}

/**
 * Update node positions in composition from React Flow node changes.
 * Called after drag operations to persist positions.
 */
export function updateNodePositions(
  composition: Composition,
  nodes: Node[],
): Composition {
  const positionMap = new Map(nodes.map(n => [n.id, n.position]));

  return {
    ...composition,
    atoms: composition.atoms.map(atom => {
      const newPos = positionMap.get(atom.nodeId);
      return newPos ? { ...atom, position: newPos } : atom;
    }),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Load all atom metadata into a lookup map for quick node building.
 */
export async function loadAtomsMap(): Promise<Map<string, AtomMetadata>> {
  const { getAllAtomsSorted } = await import('./db');
  const atoms = await getAllAtomsSorted();
  return new Map(atoms.map(a => [a.slug, a]));
}
