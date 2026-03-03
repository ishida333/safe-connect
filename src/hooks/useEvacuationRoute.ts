import { useState, useCallback, useMemo } from 'react';

export interface Shelter {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  capacity?: string;
  distance?: number;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  icon: 'straight' | 'right' | 'left' | 'arrive';
}

export interface EvacuationRoute {
  shelter: Shelter;
  totalDistance: number;
  estimatedTime: number;
  steps: RouteStep[];
  coordinates: [number, number][];
}

/**
 * 2点間の距離をメートルで計算
 */
export function getDistanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) ** 2 + 
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 距離を読みやすい形式にフォーマット
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 所要時間を計算（歩行速度を平均4km/hと仮定）
 */
function estimateWalkingTime(meters: number): number {
  const speedKmH = 4;
  return Math.ceil((meters / 1000 / speedKmH) * 60);
}

/**
 * 簡易的なルート生成
 * 実際のアプリでは外部のルーティングAPIを使用することを推奨
 */
function generateSimpleRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  shelterName: string
): RouteStep[] {
  const distance = getDistanceM(fromLat, fromLng, toLat, toLng);
  const latDiff = toLat - fromLat;
  const lngDiff = toLng - fromLng;

  const steps: RouteStep[] = [];

  // 簡易的な方向判定
  if (Math.abs(lngDiff) > Math.abs(latDiff)) {
    // 主に東西方向
    const direction = lngDiff > 0 ? '東' : '西';
    steps.push({
      instruction: `現在地から${direction}方向に進む`,
      distance: distance * 0.6,
      icon: 'straight'
    });
  } else {
    // 主に南北方向
    const direction = latDiff > 0 ? '北' : '南';
    steps.push({
      instruction: `現在地から${direction}方向に進む`,
      distance: distance * 0.6,
      icon: 'straight'
    });
  }

  // 中間ポイント
  if (distance > 500) {
    const turn = Math.random() > 0.5 ? 'right' : 'left';
    const turnText = turn === 'right' ? '右折' : '左折';
    steps.push({
      instruction: `次の交差点を${turnText}`,
      distance: distance * 0.3,
      icon: turn
    });
  }

  // 到着
  steps.push({
    instruction: `${shelterName}に到着`,
    distance: distance * 0.1,
    icon: 'arrive'
  });

  return steps;
}

/**
 * 経路の座標を生成（直線近似）
 */
function generateRouteCoordinates(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): [number, number][] {
  const points: [number, number][] = [];
  const numPoints = 10;

  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    const lat = fromLat + (toLat - fromLat) * ratio;
    const lng = fromLng + (toLng - fromLng) * ratio;
    points.push([lat, lng]);
  }

  return points;
}

export const useEvacuationRoute = () => {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  const calculateRoute = useCallback((
    currentLat: number,
    currentLng: number,
    shelter: Shelter
  ): EvacuationRoute => {
    const distance = getDistanceM(currentLat, currentLng, shelter.lat, shelter.lng);
    const steps = generateSimpleRoute(currentLat, currentLng, shelter.lat, shelter.lng, shelter.name);
    const coordinates = generateRouteCoordinates(currentLat, currentLng, shelter.lat, shelter.lng);

    return {
      shelter,
      totalDistance: distance,
      estimatedTime: estimateWalkingTime(distance),
      steps,
      coordinates
    };
  }, []);

  const selectShelter = useCallback((shelter: Shelter | null) => {
    setSelectedShelter(shelter);
  }, []);

  const clearRoute = useCallback(() => {
    setSelectedShelter(null);
  }, []);

  return {
    selectedShelter,
    calculateRoute,
    selectShelter,
    clearRoute
  };
};
