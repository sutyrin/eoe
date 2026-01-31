/**
 * AtomNode: Custom React Flow node for composition canvas.
 *
 * Renders:
 * - Atom title and type badge in header
 * - Parameter list with type-colored dots (handles)
 * - "Missing atom" placeholder when atomSlug not found
 *
 * Performance: React.memo prevents re-renders unless data changes.
 * Touch: All interactive areas >= 48px for mobile touch targets.
 *
 * Handles:
 * - Left side: Input handles (target) for each parameter
 * - Right side: Output handles (source) for each parameter
 */
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { AtomNodeData } from './composition-types';

const TYPE_COLORS: Record<string, string> = {
  visual: '#6bb5ff',
  audio: '#ff6b9d',
  'audio-visual': '#b56bff',
  composition: '#6bffb5',
};

const PARAM_TYPE_COLORS: Record<string, string> = {
  number: '#6bb5ff',
  string: '#6bff6b',
  boolean: '#ffb56b',
  object: '#888',
};

function AtomNodeComponent({ data }: NodeProps<AtomNodeData>) {
  const badgeColor = TYPE_COLORS[data.atomType] || '#888';

  if (data.missing) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '2px dashed #ff4444',
        borderRadius: 8,
        padding: 12,
        minWidth: 160,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{ color: '#ff4444', fontSize: 13, fontWeight: 600 }}>
          Atom not found
        </div>
        <div style={{ color: '#888', fontSize: 11, marginTop: 4 }}>
          {data.atomSlug}
        </div>
      </div>
    );
  }

  // Routable parameters only (exclude 'object' type in Phase 5)
  const routableParams = data.parameters.filter(p => p.type !== 'object');

  return (
    <div style={{
      background: '#1a1a1a',
      border: `2px solid ${badgeColor}40`,
      borderRadius: 8,
      minWidth: 180,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {data.atomTitle}
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: badgeColor,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {data.atomType}
        </span>
      </div>

      {/* Parameters */}
      <div style={{ padding: '6px 0' }}>
        {routableParams.length === 0 && (
          <div style={{ padding: '4px 12px', color: '#555', fontSize: 11 }}>
            No parameters
          </div>
        )}
        {routableParams.map((param, index) => {
          const handleId = param.name;
          const color = PARAM_TYPE_COLORS[param.type] || '#888';
          const displayValue = typeof param.value === 'number'
            ? Math.round(param.value * 100) / 100
            : String(param.value);

          return (
            <div
              key={param.name}
              style={{
                position: 'relative',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 28,
                fontSize: 12,
              }}
            >
              {/* Input handle (left) - 48px touch target via CSS */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${handleId}-in`}
                style={{
                  width: 12,
                  height: 12,
                  background: color,
                  border: '2px solid #0a0a0a',
                  left: -6,
                }}
              />

              <span style={{ color: '#ccc' }}>{param.name}</span>
              <span style={{ color: '#666', fontSize: 11, marginLeft: 8 }}>
                {displayValue}
              </span>

              {/* Output handle (right) - 48px touch target via CSS */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${handleId}-out`}
                style={{
                  width: 12,
                  height: 12,
                  background: color,
                  border: '2px solid #0a0a0a',
                  right: -6,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// React.memo with custom comparator for performance
// Only re-render if atom data actually changed
export const AtomNode = memo(AtomNodeComponent, (prev, next) => {
  return (
    prev.data.atomSlug === next.data.atomSlug &&
    prev.data.atomTitle === next.data.atomTitle &&
    prev.data.parameters === next.data.parameters &&
    prev.data.paramOverrides === next.data.paramOverrides &&
    prev.data.missing === next.data.missing
  );
});

// Node type registration object for React Flow
export const nodeTypes = {
  atomNode: AtomNode,
};
