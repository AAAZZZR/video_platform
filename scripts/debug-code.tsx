// DURATION: 450
// NARRATION: 機器學習模型訓練是一個迭代優化的過程。我們從隨機初始化的參數開始，透過不斷調整權重來最小化損失函數。隨著訓練週期的進行，模型準確率逐步提升，損失值持續下降，最終達到收斂狀態。

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio } from 'remotion';
import { whoosh } from '@remotion/sfx';

export default function MLTrainingVisualization() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene timing
  const titleDuration = 90;
  const networkDuration = 120;
  const chartsDuration = 150;
  const convergenceDuration = 90;

  return (
    <AbsoluteFill style={{
      backgroundColor: 'linear-gradient(135deg, #0f0c29 0%, #24243e 100%)',
      background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Title Scene */}
      <Sequence from={0} durationInFrames={titleDuration}>
        <TitleScene frame={frame} fps={fps} width={width} height={height} />
      </Sequence>

      {/* Neural Network Visualization */}
      <Sequence from={titleDuration} durationInFrames={networkDuration}>
        <NetworkScene frame={frame} fps={fps} width={width} height={height} />
        <Audio src={whoosh} volume={0.3} startFrom={0} />
      </Sequence>

      {/* Training Charts */}
      <Sequence from={titleDuration + networkDuration} durationInFrames={chartsDuration}>
        <ChartsScene frame={frame} fps={fps} width={width} height={height} />
        <Audio src={whoosh} volume={0.3} startFrom={0} />
      </Sequence>

      {/* Convergence Scene */}
      <Sequence from={titleDuration + networkDuration + chartsDuration} durationInFrames={convergenceDuration}>
        <ConvergenceScene frame={frame} fps={fps} width={width} height={height} />
        <Audio src={whoosh} volume={0.3} startFrom={0} />
      </Sequence>
    </AbsoluteFill>
  );
}

function TitleScene({ frame, fps, width, height }) {
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 200 }
  });

  const subtitleOpacity = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 }
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: 72,
        fontWeight: 'bold',
        margin: 0,
        marginBottom: 20,
        opacity: titleOpacity,
        background: 'linear-gradient(45deg, #00f5ff, #00d4aa)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        機器學習模型訓練
      </h1>
      <p style={{
        fontSize: 32,
        opacity: subtitleOpacity * 0.8,
        margin: 0,
        color: '#a0a0a0'
      }}>
        深度學習優化過程可視化
      </p>
    </div>
  );
}

function NetworkScene({ frame, fps, width, height }) {
  const networkScale = spring({
    frame,
    fps,
    config: { damping: 100 }
  });

  const layers = [
    { nodes: 4, x: 300, label: '輸入層' },
    { nodes: 6, x: 600, label: '隱藏層 1' },
    { nodes: 6, x: 900, label: '隱藏層 2' },
    { nodes: 3, x: 1200, label: '輸出層' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      transform: `scale(${networkScale})`
    }}>
      <h2 style={{
        fontSize: 48,
        marginBottom: 60,
        textAlign: 'center',
        color: '#00f5ff'
      }}>
        神經網絡架構
      </h2>

      <svg width={width} height={400} style={{ overflow: 'visible' }}>
        {/* Draw connections */}
        {layers.slice(0, -1).map((layer, layerIdx) => (
          layers[layerIdx + 1].nodes && Array.from({ length: layer.nodes }).map((_, nodeIdx) => (
            Array.from({ length: layers[layerIdx + 1].nodes }).map((_, nextNodeIdx) => {
              const y1 = height / 2 - (layer.nodes - 1) * 25 + nodeIdx * 50;
              const y2 = height / 2 - (layers[layerIdx + 1].nodes - 1) * 25 + nextNodeIdx * 50;
              const opacity = interpolate(frame, [20 + layerIdx * 20, 60 + layerIdx * 20], [0, 0.3], { extrapolateRight: 'clamp' });

              return (
                <line
                  key={`${layerIdx}-${nodeIdx}-${nextNodeIdx}`}
                  x1={layer.x}
                  y1={y1}
                  x2={layers[layerIdx + 1].x}
                  y2={y2}
                  stroke="#00d4aa"
                  strokeWidth={1}
                  opacity={opacity}
                />
              );
            })
          ))
        ))}

        {/* Draw nodes */}
        {layers.map((layer, layerIdx) => (
          <g key={layerIdx}>
            <text
              x={layer.x}
              y={height / 2 + 120}
              textAnchor="middle"
              fontSize={20}
              fill="#a0a0a0"
              opacity={interpolate(frame, [40 + layerIdx * 15, 80 + layerIdx * 15], [0, 1], { extrapolateRight: 'clamp' })}
            >
              {layer.label}
            </text>
            {Array.from({ length: layer.nodes }).map((_, nodeIdx) => {
              const y = height / 2 - (layer.nodes - 1) * 25 + nodeIdx * 50;
              const nodeOpacity = interpolate(frame, [layerIdx * 15, 40 + layerIdx * 15], [0, 1], { extrapolateRight: 'clamp' });
              const pulseScale = 1 + 0.1 * Math.sin(frame * 0.2 + layerIdx + nodeIdx);

              return (
                <circle
                  key={nodeIdx}
                  cx={layer.x}
                  cy={y}
                  r={15}
                  fill="#00f5ff"
                  opacity={nodeOpacity}
                  transform={`scale(${pulseScale})`}
                  transformOrigin={`${layer.x} ${y}`}
                />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ChartsScene({ frame, fps, width, height }) {
  const chartScale = spring({
    frame,
    fps,
    config: { damping: 150 }
  });

  // Training progress
  const epochs = 100;
  const currentEpoch = interpolate(frame, [30, 120], [0, epochs], { extrapolateRight: 'clamp' });

  // Loss curve - exponential decay
  const generateLossData = (epoch) => {
    return Math.max(0.1, 2.5 * Math.exp(-epoch / 25) + 0.1 * Math.sin(epoch * 0.5));
  };

  // Accuracy curve - sigmoid growth
  const generateAccuracyData = (epoch) => {
    return Math.min(0.95, 1 / (1 + Math.exp(-(epoch - 40) / 10)) * 0.9 + 0.1);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      transform: `scale(${chartScale})`
    }}>
      <h2 style={{
        fontSize: 48,
        marginBottom: 40,
        textAlign: 'center',
        color: '#00f5ff'
      }}>
        訓練過程監控
      </h2>

      <div style={{ display: 'flex', gap: 80, alignItems: 'center' }}>
        {/* Loss Chart */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, marginBottom: 20, color: '#ff6b6b' }}>損失函數</h3>
          <svg width={350} height={250}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`loss-grid-${i}`}
                x1={50}
                y1={50 + i * 40}
                x2={300}
                y2={50 + i * 40}
                stroke="#333"
                strokeWidth={1}
                opacity={0.3}
              />
            ))}

            {/* Loss curve */}
            <path
              d={Array.from({ length: Math.floor(currentEpoch) + 1 }).map((_, i) => {
                const x = 50 + (i / epochs) * 250;
                const loss = generateLossData(i);
                const y = 210 - loss * 80;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#ff6b6b"
              strokeWidth={3}
              fill="none"
            />

            {/* Axes labels */}
            <text x={175} y={240} textAnchor="middle" fontSize={16} fill="#a0a0a0">訓練週期</text>
            <text x={20} y={130} textAnchor="middle" fontSize={16} fill="#a0a0a0" transform="rotate(-90, 20, 130)">損失值</text>
          </svg>
          <p style={{ fontSize: 24, margin: 0, color: '#ff6b6b' }}>
            {generateLossData(currentEpoch).toFixed(3)}
          </p>
        </div>

        {/* Accuracy Chart */}
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, marginBottom: 20, color: '#4ecdc4' }}>準確率</h3>
          <svg width={350} height={250}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`acc-grid-${i}`}
                x1={50}
                y1={50 + i * 40}
                x2={300}
                y2={50 + i * 40}
                stroke="#333"
                strokeWidth={1}
                opacity={0.3}
              />
            ))}

            {/* Accuracy curve */}
            <path
              d={Array.from({ length: Math.floor(currentEpoch) + 1 }).map((_, i) => {
                const x = 50 + (i / epochs) * 250;
                const acc = generateAccuracyData(i);
                const y = 210 - acc * 160;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#4ecdc4"
              strokeWidth={3}
              fill="none"
            />

            {/* Axes labels */}
            <text x={175} y={240} textAnchor="middle" fontSize={16} fill="#a0a0a0">訓練週期</text>
            <text x={20} y={130} textAnchor="middle" fontSize={16} fill="#a0a0a0" transform="rotate(-90, 20, 130)">準確率</text>
          </svg>
          <p style={{ fontSize: 24, margin: 0, color: '#4ecdc4' }}>
            {(generateAccuracyData(currentEpoch) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Current epoch display */}
      <div style={{
        marginTop: 40,
        padding: '20px 40px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        fontSize: 28
      }}>
        訓練週期: {Math.floor(currentEpoch)}/{epochs}
      </div>
    </div>
  );
}

function ConvergenceScene({ frame, fps, width, height }) {
  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 200 }
  });

  const checkmarkScale = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100, stiffness: 200 }
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      opacity: fadeIn
    }}>
      <div style={{
        transform: `scale(${checkmarkScale})`,
        marginBottom: 40
      }}>
        <svg width={150} height={150}>
          <circle
            cx={75}
            cy={75}
            r={65}
            fill="none"
            stroke="#00f5ff"
            strokeWidth={6}
          />
          <path
            d="M 45 75 L 65 95 L 105 55"
            stroke="#00d4aa"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 style={{
        fontSize: 56,
        marginBottom: 30,
        textAlign: 'center',
        color: '#00f5ff',
        fontWeight: 'bold'
      }}>
        訓練完成
      </h2>

      <div style={{
        textAlign: 'center',
        fontSize: 24,
        color: '#a0a0a0',
        lineHeight: 1.6
      }}>
        <p style={{ margin: '10px 0' }}>✓ 模型收斂成功</p>
        <p style={{ margin: '10px 0' }}>✓ 損失函數最小化</p>
        <p style={{ margin: '10px 0' }}>✓ 準確率達到目標</p>
        <p style={{ margin: '10px 0' }}>✓ 準備進行推理</p>
      </div>

      <div style={{
        marginTop: 40,
        padding: '20px 60px',
        backgroundColor: 'rgba(0, 245, 255, 0.2)',
        borderRadius: 15,
        fontSize: 32,
        color: '#00f5ff',
        border: '2px solid #00f5ff'
      }}>
        模型已準備就緒
      </div>
    </div>
  );
}
