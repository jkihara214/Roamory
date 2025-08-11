// 地図クリックイベントの型
export interface MapClickEvent {
  lat: number;
  lng: number;
}

// 基本的な日記データ型（まずは最小限）
export interface TravelDiary {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  title: string;
  content: string;
  visited_at: string;
  created_at: string;
  updated_at: string;
}

// 日記画像型（将来の拡張用）
export interface TravelDiaryImage {
  id: number;
  travel_diary_id: number;
  image_path: string;
  created_at: string;
  updated_at: string;
}
