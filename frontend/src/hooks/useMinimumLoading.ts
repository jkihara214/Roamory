import { useEffect, useRef, useState } from "react";

/**
 * loadingがtrueになった時、最低minDurationミリ秒はtrueを返すカスタムフック
 * @param loading 外部のローディング状態
 * @param minDuration 最低表示時間（ミリ秒）
 * @returns showLoading: 実際に表示すべきかどうか
 */
export function useMinimumLoading(
  loading: boolean,
  minDuration: number = 1000
): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const loadingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      setShowLoading(true);
      loadingStartRef.current = Date.now();
    } else if (showLoading) {
      const elapsed = Date.now() - (loadingStartRef.current ?? 0);
      if (elapsed < minDuration) {
        const timeout = setTimeout(
          () => setShowLoading(false),
          minDuration - elapsed
        );
        return () => clearTimeout(timeout);
      } else {
        setShowLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return showLoading;
}
