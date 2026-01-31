/**
 * AtomNode: Custom React Flow node for atom representation.
 *
 * Displays:
 * - Atom name
 * - Type badge (visual/audio/audio-visual)
 * - Parameter handles (inputs on left, outputs on right)
 *
 * Mobile-optimized:
 * - Touch-friendly tap targets (44px min)
 * - Clear visual hierarchy
 * - Compact layout for small screens
 */
import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { AtomNodeData } from './composition-types';

const AtomNode = React.memo(({ data }: NodeProps<AtomNodeData>) => {
  const { atomTitle, atomType, parameters = [], missing = false } = data;

  // Type badge colors
  const typeColors: Record<string, string> = {
    visual: '#6bb5ff',
    audio: '#ff6b9d',
    'audio-visual': '#b56bff',
    composition: '#6bffb5',
  };

  const typeColor = typeColors[atomType] || '#888';

  // Filter parameters by type
  const inputs = parameters.filter(p => p.type === 'input');
  const outputs = parameters.filter(p => p.type === 'output');

  return (
    <div className={`atom-node ${missing ? 'atom-node-missing' : ''}`}>
      {/* Header with type badge */}
      <div className="atom-node-header">
        <span className="atom-node-title">{atomTitle}</span>
        <span
          className="atom-node-type-badge"
          style={{ backgroundColor: typeColor }}
        >
          {atomType === 'visual' ? 'V' : atomType === 'audio' ? 'A' : atomType === 'audio-visual' ? 'AV' : 'C'}
        </span>
      </div>

      {/* Missing atom warning */}
      {missing && (
        <div className="atom-node-missing-label">
          Atom not found
        </div>
      )}

      {/* Input parameter handles (left side) */}
      {inputs.map((param, idx) => (
        <Handle
          key={`in-${param.name}`}
          type="target"
          position={Position.Left}
          id={`${param.name}-in`}
          style={{
            top: 50 + idx * 24,
            width: 12,
            height: 12,
            background: '#4a9eff',
            border: '2px solid #0a0a0a',
          }}
          title={param.name}
        />
      ))}

      {/* Output parameter handles (right side) */}
      {outputs.map((param, idx) => (
        <Handle
          key={`out-${param.name}`}
          type="source"
          position={Position.Right}
          id={`${param.name}-out`}
          style={{
            top: 50 + idx * 24,
            width: 12,
            height: 12,
            background: '#ff9d4a',
            border: '2px solid #0a0a0a',
          }}
          title={param.name}
        />
      ))}

      {/* Parameter list (for reference) */}
      <div className="atom-node-params">
        {inputs.map(p => (
          <div key={`label-${p.name}`} className="atom-node-param-label">
            <span className="param-dot" style={{ background: '#4a9eff' }} />
            {p.name}
          </div>
        ))}
        {outputs.map(p => (
          <div key={`label-${p.name}`} className="atom-node-param-label atom-node-param-label-out">
            {p.name}
            <span className="param-dot" style={{ background: '#ff9d4a' }} />
          </div>
        ))}
      </div>
    </div>
  );
});

AtomNode.displayName = 'AtomNode';

export default AtomNode;
