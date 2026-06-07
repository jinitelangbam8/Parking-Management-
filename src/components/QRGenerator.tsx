import React, { useMemo } from 'react';

interface QRGeneratorProps {
  value: string;
  size?: number;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ value, size = 120 }) => {
  // Generate a deterministic 15x15 pixel matrix based on the string value
  const qrGrid = useMemo(() => {
    const size = 15;
    const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

    // Simple hashing algorithm to create reproducible matrix
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Add standard finder patterns at top-left, top-right, bottom-left
    const addFinderPattern = (r: number, c: number) => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          // Outer border (Solid)
          const isBorder = i === 0 || i === 4 || j === 0 || j === 4;
          // Inner dot
          const isCenter = i >= 2 && i <= 2 && j >= 2 && j <= 2;
          if (isBorder || isCenter) {
            if (r + i < size && c + j < size) {
              grid[r + i][c + j] = true;
            }
          }
        }
      }
    };

    // Embed finder patterns
    addFinderPattern(0, 0); // Top left
    addFinderPattern(0, size - 5); // Top right
    addFinderPattern(size - 5, 0); // Bottom left

    // Populate remaining cells with deterministic noise from hash
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip positions with existing finder patterns
        const isTL = r < 5 && c < 5;
        const isTR = r < 5 && c >= size - 5;
        const isBL = r >= size - 5 && c < 5;
        const isReserve = isTL || isTR || isBL;

        if (!isReserve) {
          const val = Math.abs(Math.sin((r * 12.9898 + c * 78.233) * hash)) * 1000 % 1;
          grid[r][c] = val > 0.45;
        }
      }
    }

    return grid;
  }, [value]);

  return (
    <div
      className="bg-white p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner inline-block"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        viewBox="0 0 15 15"
        width={size}
        height={size}
        className="text-slate-900 dark:text-slate-900"
        id="qr-svg"
      >
        {qrGrid.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                className="fill-current text-slate-900"
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
