/**
 * Routing engine for parameter connections between atoms.
 *
 * Phase 5 routing rules (from 05-RESEARCH.md):
 * - Strict type matching: number -> number, string -> string, boolean -> boolean
 * - Object types not routable (defer to Phase 6 nested routing)
 * - No range normalization (values pass through as-is)
 * - Circular routes allowed (trust user, warn in Phase 6 preview)
 * - Chaining allowed (A.x -> B.y -> C.z)
 *
 * Phase 6 additions (prepared but not implemented):
 * - Transform functions (normalize, invert)
 * - Range scaling (source range -> target range)
 * - Cycle detection and warnings
 */
import {
  type Composition,
  type ParameterRoute,
  type AtomParameter,
  type CompositionAtom,
  canRoute,
  parseAtomParameters,
  generateId,
} from './composition-types';
import type { AtomMetadata } from './db';

/**
 * Represents a target parameter that a source can route to.
 */
export interface RoutableTarget {
  nodeId: string;
  atomTitle: string;
  paramName: string;
  paramType: AtomParameter['type'];
  currentValue: number | string | boolean | object;
}

/**
 * Find all compatible target parameters for a given source parameter.
 *
 * Rules:
 * - Must be on a DIFFERENT node (no self-routing)
 * - Must be same type (number -> number, etc.)
 * - Object types excluded
 * - Already-routed targets still shown (allows multiple sources to one target)
 */
export function findCompatibleTargets(
  sourceNodeId: string,
  sourceParam: AtomParameter,
  composition: Composition,
  atomsMap: Map<string, AtomMetadata>,
): RoutableTarget[] {
  const targets: RoutableTarget[] = [];

  for (const atom of composition.atoms) {
    // Skip self
    if (atom.nodeId === sourceNodeId) continue;

    const metadata = atomsMap.get(atom.atomSlug);
    if (!metadata) continue;

    const params = parseAtomParameters(metadata.configJson);

    for (const param of params) {
      if (canRoute(sourceParam.value, param.value)) {
        targets.push({
          nodeId: atom.nodeId,
          atomTitle: metadata.title,
          paramName: param.name,
          paramType: param.type,
          currentValue: param.value,
        });
      }
    }
  }

  return targets;
}

/**
 * Create a parameter route and add it to the composition.
 * Returns updated composition.
 */
export function createRoute(
  composition: Composition,
  sourceNodeId: string,
  sourceParam: string,
  targetNodeId: string,
  targetParam: string,
): Composition {
  const route: ParameterRoute = {
    id: generateId(),
    sourceNodeId,
    sourceParam,
    targetNodeId,
    targetParam,
  };

  return {
    ...composition,
    routes: [...composition.routes, route],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a parameter route from the composition.
 * Returns updated composition.
 */
export function deleteRoute(
  composition: Composition,
  routeId: string,
): Composition {
  return {
    ...composition,
    routes: composition.routes.filter(r => r.id !== routeId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all routes originating from a specific node.
 */
export function getOutgoingRoutes(
  composition: Composition,
  nodeId: string,
): ParameterRoute[] {
  return composition.routes.filter(r => r.sourceNodeId === nodeId);
}

/**
 * Get all routes targeting a specific node.
 */
export function getIncomingRoutes(
  composition: Composition,
  nodeId: string,
): ParameterRoute[] {
  return composition.routes.filter(r => r.targetNodeId === nodeId);
}

/**
 * Get a human-readable description of a route.
 */
export function describeRoute(
  route: ParameterRoute,
  composition: Composition,
  atomsMap: Map<string, AtomMetadata>,
): string {
  const sourceAtom = composition.atoms.find(a => a.nodeId === route.sourceNodeId);
  const targetAtom = composition.atoms.find(a => a.nodeId === route.targetNodeId);

  const sourceName = sourceAtom
    ? atomsMap.get(sourceAtom.atomSlug)?.title || sourceAtom.atomSlug
    : '???';
  const targetName = targetAtom
    ? atomsMap.get(targetAtom.atomSlug)?.title || targetAtom.atomSlug
    : '???';

  return `${sourceName}.${route.sourceParam} -> ${targetName}.${route.targetParam}`;
}

/**
 * Color for parameter type (used in UI).
 */
export function getParamTypeColor(type: AtomParameter['type']): string {
  const colors: Record<string, string> = {
    number: '#6bb5ff',
    string: '#6bff6b',
    boolean: '#ffb56b',
    object: '#888',
  };
  return colors[type] || '#888';
}
