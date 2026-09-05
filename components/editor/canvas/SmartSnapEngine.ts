export interface SnapBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapTarget {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
}

export interface SnapGuide {
  id: string;
  type: "vertical" | "horizontal";
  position: number;
  label?: string;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

export interface SnapOptions {
  threshold?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  safeArea?: { top: number; bottom: number; left: number; right: number };
}

export function calculateSnap(
  bounds: SnapBounds,
  otherElements: SnapTarget[],
  options: SnapOptions = {}
): SnapResult {
  const threshold = options.threshold ?? 7;
  const canvasW = options.canvasWidth ?? 1080;
  const canvasH = options.canvasHeight ?? 1350;
  const safeArea = options.safeArea ?? { top: 60, bottom: 70, left: 72, right: 72 };

  let snappedX = bounds.x;
  let snappedY = bounds.y;
  const guides: SnapGuide[] = [];

  const elemCenterX = bounds.x + bounds.width / 2;
  const elemRight = bounds.x + bounds.width;

  const elemCenterY = bounds.y + bounds.height / 2;
  const elemBottom = bounds.y + bounds.height;

  // 1. VERTICAL GUIDES (X-Axis Snapping)
  const canvasCenterX = canvasW / 2;
  if (Math.abs(elemCenterX - canvasCenterX) <= threshold) {
    snappedX = canvasCenterX - bounds.width / 2;
    guides.push({
      id: "center-x",
      type: "vertical",
      position: canvasCenterX,
      label: "Center",
    });
  } else if (Math.abs(bounds.x - safeArea.left) <= threshold) {
    snappedX = safeArea.left;
    guides.push({
      id: "safe-left",
      type: "vertical",
      position: safeArea.left,
      label: "Left Margin",
    });
  } else if (Math.abs(elemRight - (canvasW - safeArea.right)) <= threshold) {
    snappedX = canvasW - safeArea.right - bounds.width;
    guides.push({
      id: "safe-right",
      type: "vertical",
      position: canvasW - safeArea.right,
      label: "Right Margin",
    });
  } else {
    for (const target of otherElements) {
      if (target.visible === false) continue;
      const targetCenterX = target.x + target.width / 2;
      const targetRight = target.x + target.width;

      if (Math.abs(bounds.x - target.x) <= threshold) {
        snappedX = target.x;
        guides.push({ id: `target-left-${target.key}`, type: "vertical", position: target.x });
        break;
      }
      if (Math.abs(elemCenterX - targetCenterX) <= threshold) {
        snappedX = targetCenterX - bounds.width / 2;
        guides.push({ id: `target-center-${target.key}`, type: "vertical", position: targetCenterX });
        break;
      }
      if (Math.abs(elemRight - targetRight) <= threshold) {
        snappedX = targetRight - bounds.width;
        guides.push({ id: `target-right-${target.key}`, type: "vertical", position: targetRight });
        break;
      }
    }
  }

  // 2. HORIZONTAL GUIDES (Y-Axis Snapping)
  const canvasCenterY = canvasH / 2;
  if (Math.abs(elemCenterY - canvasCenterY) <= threshold) {
    snappedY = canvasCenterY - bounds.height / 2;
    guides.push({
      id: "center-y",
      type: "horizontal",
      position: canvasCenterY,
      label: "Middle",
    });
  } else if (Math.abs(bounds.y - safeArea.top) <= threshold) {
    snappedY = safeArea.top;
    guides.push({
      id: "safe-top",
      type: "horizontal",
      position: safeArea.top,
      label: "Top Margin",
    });
  } else if (Math.abs(elemBottom - (canvasH - safeArea.bottom)) <= threshold) {
    snappedY = canvasH - safeArea.bottom - bounds.height;
    guides.push({
      id: "safe-bottom",
      type: "horizontal",
      position: canvasH - safeArea.bottom,
      label: "Bottom Margin",
    });
  } else {
    for (const target of otherElements) {
      if (target.visible === false) continue;
      const targetCenterY = target.y + target.height / 2;
      const targetBottom = target.y + target.height;

      if (Math.abs(bounds.y - target.y) <= threshold) {
        snappedY = target.y;
        guides.push({ id: `target-top-${target.key}`, type: "horizontal", position: target.y });
        break;
      }
      if (Math.abs(elemCenterY - targetCenterY) <= threshold) {
        snappedY = targetCenterY - bounds.height / 2;
        guides.push({ id: `target-center-y-${target.key}`, type: "horizontal", position: targetCenterY });
        break;
      }
      if (Math.abs(elemBottom - targetBottom) <= threshold) {
        snappedY = targetBottom - bounds.height;
        guides.push({ id: `target-bottom-${target.key}`, type: "horizontal", position: targetBottom });
        break;
      }
    }
  }

  return {
    x: Math.round(snappedX),
    y: Math.round(snappedY),
    guides,
  };
}
