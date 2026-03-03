import { useState, useEffect, useCallback } from 'react';

/**
 * OpenStreetMapのOverpass APIレスポンス型定義
 */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:ja'?: string;
    'name:en'?: string;
    emergency?: string;
    amenity?: string;
    building?: string;
    capacity?: string;
    shelter_type?: string;
    addr?: string;
    'addr:full'?: string;
  };
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

/**
 * 避難所データ型定義
 */
export interface Shelter {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  type: string;
  category: 'official' | 'candidate'; // official: shelter系, candidate: school/community_centre
  capacity?: string;
  address?: string;
}

/**
 * 分類済み避難所リスト
 */
export interface ClassifiedShelters {
  official: Shelter[];
  candidate: Shelter[];
  all: Shelter[];
}

/**
 * ハバースイン距離計算（メートル）
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // 地球の半径（メートル）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Overpass APIクエリビルダー
 * 半径5000m以内の避難所候補を取得
 * official: emergency=shelter, amenity=shelter
 * candidate: amenity=school
 */
function buildOverpassQuery(lat: number, lon: number, radius: number = 5000): string {
  return `[out:json][timeout:25];
(
  node["emergency"="shelter"](around:${radius},${lat},${lon});
  way["emergency"="shelter"](around:${radius},${lat},${lon});
  node["amenity"="shelter"](around:${radius},${lat},${lon});
  way["amenity"="shelter"](around:${radius},${lat},${lon});
  node["amenity"="school"](around:${radius},${lat},${lon});
  way["amenity"="school"](around:${radius},${lat},${lon});
);
out center;`;
}

/**
 * Overpass APIからデータ取得
 */
async function fetchOverpassData(
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<OverpassElement[]> {
  const query = buildOverpassQuery(lat, lon, radius);
  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Overpass API fetch error:', error);
    throw error;
  }
}

/**
 * OSM要素を避難所データに変換
 */
function convertToShelter(
  element: OverpassElement,
  userLat: number,
  userLon: number
): Shelter | null {
  // 座標を取得（node直接 or wayのcenter）
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!lat || !lon) return null;

  const tags = element.tags || {};
  
  // 名称を取得（無いまたは"yes"の場合は"名称不明の避難所"）
  const rawName = tags['name:ja'] || tags.name || tags['name:en'];
  const hasValidName = rawName && rawName.toLowerCase() !== 'yes' && rawName.trim() !== '';
  const name = hasValidName ? rawName : '名称不明の避難所';

  // カテゴリーを判定（official: shelter系, candidate: school）
  const category = getCategoryFromTags(tags);
  const type = getType(tags);
  const distance = calculateDistance(userLat, userLon, lat, lon);

  return {
    id: element.id,
    name,
    lat,
    lng: lon,
    distance,
    type,
    category,
    capacity: tags.capacity,
    address: tags['addr:full'] || tags.addr,
  };
}

/**
 * タグからカテゴリーを判定
 * official: emergency=shelter, amenity=shelter
 * candidate: amenity=school
 */
function getCategoryFromTags(tags: OverpassElement['tags']): 'official' | 'candidate' {
  if (!tags) return 'candidate';

  // emergency=shelter または amenity=shelter は公式避難所
  if (tags.emergency === 'shelter' || tags.amenity === 'shelter') {
    return 'official';
  }

  // school は候補
  if (tags.amenity === 'school') {
    return 'candidate';
  }

  return 'candidate';
}

/**
 * タグから施設タイプを判定
 */
function getType(tags: OverpassElement['tags']): string {
  if (!tags) return '避難場所';

  if (tags.emergency === 'shelter') return '指定避難所';
  if (tags.amenity === 'shelter') return '避難所';
  if (tags.amenity === 'school') return '学校（避難可能）';
  if (tags.shelter_type) return `避難所（${tags.shelter_type}）`;

  return '避難場所';
}

/**
 * 避難所を検索して分類
 * official: 上位10件、candidate: 上位5件、合計最大15件
 */
async function searchAndClassifyShelters(
  lat: number,
  lon: number
): Promise<ClassifiedShelters> {
  try {
    console.log('Searching shelters within 5000m...');
    const elements = await fetchOverpassData(lat, lon, 5000);

    // データ変換と距離計算
    const shelters: Shelter[] = elements
      .map((el) => convertToShelter(el, lat, lon))
      .filter((shelter): shelter is Shelter => shelter !== null);

    // 距離でソート
    shelters.sort((a, b) => a.distance - b.distance);

    // カテゴリーで分類
    const allOfficial = shelters.filter((s) => s.category === 'official');
    const allCandidate = shelters.filter((s) => s.category === 'candidate');

    // official: 上位10件、candidate: 上位5件
    const official = allOfficial.slice(0, 10);
    const candidate = allCandidate.slice(0, 5);

    const all = [...official, ...candidate];

    console.log(`Found ${all.length} shelters (${official.length} official, ${candidate.length} candidate)`);

    return {
      official,
      candidate,
      all,
    };
  } catch (error) {
    console.error('Shelter search error:', error);
    throw error;
  }
}

/**
 * 避難所を取得するカスタムフック
 * 
 * ■ Input（入力）
 * - currentLat/currentLon: 現在地（navigator.geolocationから取得）
 * - enabled: 検索有効フラグ
 * 
 * ■ Process（処理）
 * 1. Overpass APIで半径5000m以内の避難所を検索
 * 2. name="yes"を除外し、適切なデフォルト名を生成
 * 3. ハバースイン距離を計算
 * 4. official/candidateに分類
 * 5. 距離でソート
 * 6. 上位15件に制限（official優先）
 * 
 * ■ Output（出力）
 * - shelters: 分類済み避難所リスト
 * - loading: 検索中状態
 * - error: エラーメッセージ
 * - refetch: 再検索関数
 */
export const useNearestShelter = (
  currentLat: number | null,
  currentLon: number | null,
  enabled: boolean = true
) => {
  const [shelters, setShelters] = useState<ClassifiedShelters>({
    official: [],
    candidate: [],
    all: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // 検索処理
  useEffect(() => {
    // 有効でない、座標がない、既に検索済みの場合はスキップ
    if (!enabled || !currentLat || !currentLon || hasSearched) {
      return;
    }

    let isMounted = true;

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await searchAndClassifyShelters(currentLat, currentLon);

        if (isMounted) {
          setShelters(result);
          setHasSearched(true); // 検索完了フラグを立てる（無限ループ防止）
          
          // 結果が0件でもエラーにしない
          if (result.all.length === 0) {
            console.log('No shelters found nearby, but not treating as error');
          }
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : '避難所の検索に失敗しました';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    search();

    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [enabled, currentLat, currentLon, hasSearched]);

  // 手動再検索
  const refetch = useCallback(() => {
    setHasSearched(false); // フラグをリセットして再検索を許可
  }, []);

  return {
    shelters,
    loading,
    error,
    refetch,
  };
};
