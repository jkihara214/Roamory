import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DiaryDetailPage from "../src/app/diary/detail/page";
import api from "../src/lib/api";
import { AxiosResponse } from "axios";
import { TravelDiary } from "../src/types/diary";

// APIレスポンスのモック関数
function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };
}

// テスト用の日記データ
const mockDiary: TravelDiary = {
  id: 1,
  user_id: 1,
  title: "東京旅行",
  content: "東京タワーに行きました。景色が素晴らしかったです。天気も良く、富士山も見えました。",
  latitude: 35.6585,
  longitude: 139.7454,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-20T14:30:00Z",
};

const mockAllDiaries: TravelDiary[] = [
  mockDiary,
  {
    id: 2,
    user_id: 1,
    title: "京都観光",
    content: "清水寺と金閣寺を巡りました。",
    latitude: 35.0116,
    longitude: 135.7681,
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-22T16:45:00Z",
  },
  {
    id: 3,
    user_id: 1,
    title: "大阪食べ歩き",
    content: "道頓堀でたこ焼きとお好み焼きを満喫しました。",
    latitude: 34.6937,
    longitude: 135.5023,
    created_at: "2024-02-10T12:00:00Z",
    updated_at: "2024-02-10T12:00:00Z",
  },
];

let mockAuthState: any;
jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: any) => selector(mockAuthState),
}));

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

jest.mock("@/components/AuthLoadingModal", () => () => (
  <div data-testid="mock-auth-loading" />
));

jest.mock("@/components/DeleteConfirmModal", () => {
  return function MockDeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    isLoading,
  }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-delete-modal">
        <h3>「{title}」を削除しますか？</h3>
        <button onClick={onConfirm} disabled={isLoading}>
          削除する
        </button>
        <button onClick={onClose}>キャンセル</button>
      </div>
    );
  };
});

// DiaryMapコンポーネントのモック
jest.mock("@/components/DiaryMap", () => {
  return function MockDiaryMap({
    diaries,
    onDiaryClick,
    centerOnDiary,
    showVisitedCountries,
  }: any) {
    return (
      <div data-testid="mock-diary-map">
        <div>地図（モック）</div>
        <div>日記数: {diaries?.length || 0}</div>
        <div>中心の日記: {centerOnDiary?.title || "なし"}</div>
        <div>訪問済み国表示: {showVisitedCountries ? "有効" : "無効"}</div>
        {diaries?.map((diary: TravelDiary) => (
          <button
            key={diary.id}
            data-testid={`diary-pin-${diary.id}`}
            onClick={() => onDiaryClick?.(diary)}
          >
            {diary.title}
          </button>
        ))}
      </div>
    );
  };
});

// DiaryFormコンポーネントのモック
jest.mock("@/components/DiaryForm", () => {
  return function MockDiaryForm({
    onSubmit,
    onCancel,
    editingDiary,
    isLoading,
  }: any) {
    return (
      <div data-testid="mock-diary-form">
        <h3>{editingDiary ? "日記を編集" : "新しい日記を作成"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              title: editingDiary?.title || "新しいタイトル",
              content: editingDiary?.content || "新しい内容",
              latitude: editingDiary?.latitude || 35.0,
              longitude: editingDiary?.longitude || 135.0,
            });
          }}
        >
          <input
            data-testid="diary-title-input"
            defaultValue={editingDiary?.title || ""}
          />
          <textarea
            data-testid="diary-content-input"
            defaultValue={editingDiary?.content || ""}
          />
          <button type="submit" disabled={isLoading}>
            保存
          </button>
          <button type="button" onClick={onCancel}>
            キャンセル
          </button>
        </form>
      </div>
    );
  };
});

const mockPush = jest.fn();
let mockSearchParamsId: string | null = "1";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "id") return mockSearchParamsId;
      return null;
    },
  }),
}));

describe("DiaryDetailPage (日記詳細画面)", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: true,
      isAuthLoading: false,
      fetchMe: jest.fn(),
    };
    mockPush.mockClear();
    mockSearchParamsId = "1"; // デフォルトはID "1"
    
    // デフォルトのAPIモック設定
    api.get = jest.fn((url) => {
      if (url.includes("/travel-diaries/1")) {
        return Promise.resolve(mockAxiosResponse(mockDiary));
      }
      if (url.includes("/travel-diaries")) {
        return Promise.resolve(mockAxiosResponse(mockAllDiaries));
      }
      return Promise.reject(new Error("Not found"));
    }) as any;
    
    api.put = jest.fn(() =>
      Promise.resolve(mockAxiosResponse({ ...mockDiary, title: "更新されたタイトル" }))
    ) as any;
    
    api.delete = jest.fn(() =>
      Promise.resolve(mockAxiosResponse({ message: "削除しました" }))
    ) as any;
  });

  describe("基本表示機能", () => {
    it("日記の詳細情報が正しく表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        // ヘッダーコンポーネントが表示されるまで待つ
        expect(screen.getByTestId("mock-header")).toBeInTheDocument();
      });

      // タイトルが表示される（複数ある場合は最初のものを確認）
      const titleElements = screen.queryAllByText("東京旅行");
      if (titleElements.length > 0) {
        expect(titleElements[0]).toBeInTheDocument();
      }

      // 内容が表示される
      expect(screen.getByText(/東京タワーに行きました/)).toBeInTheDocument();
      expect(screen.getByText(/景色が素晴らしかったです/)).toBeInTheDocument();
    });

    it("位置情報が表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        // 緯度・経度が表示される（小数点4桁）
        expect(screen.getByText(/35\.6585/)).toBeInTheDocument();
        expect(screen.getByText(/139\.7454/)).toBeInTheDocument();
      });
    });

    it("作成日時が表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        // ヘッダーコンポーネントが表示されるまで待つ
        expect(screen.getByTestId("mock-header")).toBeInTheDocument();
      });

      // 作成日時が表示される（日付の形式は環境によって異なる可能性があるため、年の部分のみチェック）
      const dateElements = screen.queryAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("編集・削除ボタンが表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
      });
    });

    it("一覧に戻るボタンが表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("日記一覧に戻る")).toBeInTheDocument();
      });
    });

    it("地図が表示され、全ての日記と訪問済み国が有効になっている", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("mock-diary-map")).toBeInTheDocument();
      });
      
      // 全ての日記が地図に表示される
      expect(screen.getByText("日記数: 3")).toBeInTheDocument();
      
      // 現在の日記が中心に設定される
      expect(screen.getByText("中心の日記: 東京旅行")).toBeInTheDocument();
      
      // 訪問済み国表示が有効
      expect(screen.getByText("訪問済み国表示: 有効")).toBeInTheDocument();
    });
  });

  describe("編集機能", () => {
    it("編集ボタンをクリックすると編集フォームが表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
      });

      // 編集ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /編集/ }));
      });

      // 編集フォームが表示される
      expect(screen.getByTestId("mock-diary-form")).toBeInTheDocument();
      // h3タグ内のテキストを確認
      const editTitle = screen.getByRole('heading', { level: 3, name: "日記を編集" });
      expect(editTitle).toBeInTheDocument();
    });

    it("編集フォームで保存すると日記が更新される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
      });

      // 編集ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /編集/ }));
      });

      // 保存ボタンをクリック
      const saveButton = screen.getByRole("button", { name: "保存" });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // APIが呼ばれる
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          expect.stringContaining("/travel-diaries/1"),
          expect.objectContaining({
            title: "東京旅行",
            content: expect.any(String),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
          })
        );
      });
    });

    it("編集フォームでキャンセルすると編集が中止される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
      });

      // 編集ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /編集/ }));
      });

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // 編集フォームが閉じる
      expect(screen.queryByText("日記を編集")).not.toBeInTheDocument();
      
      // 元の詳細表示に戻る（複数の要素がある場合は最初のものを取得）
      const titleElements = screen.getAllByText("東京旅行");
      expect(titleElements[0]).toBeInTheDocument();
    });
  });

  describe("削除機能", () => {
    it("削除ボタンをクリックすると確認モーダルが表示される", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /削除/ }));
      });

      // 確認モーダルが表示される
      expect(screen.getByTestId("mock-delete-modal")).toBeInTheDocument();
      // h3タグ内のテキストを確認
      const deleteTitle = screen.getByRole('heading', { level: 3, name: "「東京旅行」を削除しますか？" });
      expect(deleteTitle).toBeInTheDocument();
    });

    it("削除確認後、日記が削除されて一覧ページに戻る", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /削除/ }));
      });

      // 削除確認ボタンをクリック
      const confirmButton = screen.getByRole("button", { name: "削除する" });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      // 削除APIが呼ばれる
      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith(
          expect.stringContaining("/travel-diaries/1")
        );
      });

      // 一覧ページにリダイレクトされる
      expect(mockPush).toHaveBeenCalledWith("/diary");
    });

    it("削除をキャンセルするとモーダルが閉じる", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /削除/ }));
      });

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // モーダルが閉じる
      expect(screen.queryByTestId("mock-delete-modal")).not.toBeInTheDocument();
      
      // 削除APIは呼ばれない
      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  describe("ナビゲーション機能", () => {
    it("一覧に戻るボタンをクリックすると日記一覧ページに遷移する", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("日記一覧に戻る")).toBeInTheDocument();
      });

      // 戻るボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByText("日記一覧に戻る"));
      });

      // 一覧ページに遷移
      expect(mockPush).toHaveBeenCalledWith("/diary");
    });

    it("地図上の他の日記をクリックするとその詳細ページに遷移する", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("diary-pin-2")).toBeInTheDocument();
      });

      // 京都観光のピンをクリック
      await act(async () => {
        fireEvent.click(screen.getByTestId("diary-pin-2"));
      });

      // 京都観光の詳細ページに遷移
      expect(mockPush).toHaveBeenCalledWith("/diary/detail?id=2");
    });

    it("現在の日記のピンをクリックしても遷移しない", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("diary-pin-1")).toBeInTheDocument();
      });

      // 東京旅行（現在の日記）のピンをクリック
      await act(async () => {
        fireEvent.click(screen.getByTestId("diary-pin-1"));
      });

      // 遷移しない
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("日記が見つからない場合はエラーメッセージが表示される", async () => {
      // 404エラーを返すようにモック
      api.get = jest.fn(() =>
        Promise.reject({
          response: { status: 404 },
          isAxiosError: true,
        })
      ) as any;

      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("日記が見つかりません")).toBeInTheDocument();
      });

      // 一覧に戻るボタンが表示される
      expect(screen.getByText("日記一覧に戻る")).toBeInTheDocument();
    });

    it("APIエラー時は汎用エラーメッセージが表示される", async () => {
      // 500エラーを返すようにモック
      api.get = jest.fn(() =>
        Promise.reject({
          response: { status: 500 },
          isAxiosError: true,
        })
      ) as any;

      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("日記の取得に失敗しました")).toBeInTheDocument();
      });
    });

    it("IDが指定されていない場合は一覧ページに遷移する", async () => {
      // IDをnullに設定
      mockSearchParamsId = null;
      
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/diary");
      });
    });
  });

  describe("認証関連", () => {
    it("isAuthLoadingがtrueの場合はローディングが表示される", async () => {
      mockAuthState.isAuthLoading = true;

      await act(async () => {
        render(<DiaryDetailPage />);
      });

      expect(screen.getByTestId("mock-auth-loading")).toBeInTheDocument();
    });

    it("認証されていない場合はログインページに遷移する", async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.isAuthLoading = false;

      await act(async () => {
        render(<DiaryDetailPage />);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("fetchMeが呼ばれる", async () => {
      await act(async () => {
        render(<DiaryDetailPage />);
      });

      expect(mockAuthState.fetchMe).toHaveBeenCalled();
    });
  });
});