import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DiaryPage from "../src/app/diary/page";
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
const mockDiaries: TravelDiary[] = [
  {
    id: 1,
    user_id: 1,
    title: "東京旅行",
    content: "東京タワーに行きました。景色が素晴らしかったです。",
    latitude: 35.6585,
    longitude: 139.7454,
    visited_at: "2024-01-10T14:00:00Z",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    user_id: 1,
    title: "京都観光",
    content: "清水寺と金閣寺を巡りました。日本の伝統文化に触れることができました。",
    latitude: 35.0116,
    longitude: 135.7681,
    visited_at: "2024-01-18T10:00:00Z",
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
    visited_at: "2024-02-08T18:00:00Z",
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

// DiaryMapコンポーネントのモック（テストに必要な機能のみ）
jest.mock("@/components/DiaryMap", () => {
  return function MockDiaryMap({
    onMapClick,
  }: {
    onMapClick: (event: { lat: number; lng: number }) => void;
  }) {
    return (
      <div data-testid="mock-diary-map">
        <button
          data-testid="mock-map-click"
          onClick={() => onMapClick({ lat: 35.6762, lng: 139.6503 })}
        >
          地図をクリック（モック）
        </button>
      </div>
    );
  };
});

// Linkコンポーネントのモック
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// APIモック（現在のテストで必要なもののみ）
beforeAll(() => {
  api.get = jest.fn(() => Promise.resolve(mockAxiosResponse([])) as any);
});

describe("DiaryPage (旅の日記画面)", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: true,
      isAuthLoading: false,
      fetchMe: jest.fn(),
    };
  });

  it("主要なUI要素（ヘッダー・説明・地図・Header）が表示される", async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /旅の日記/ })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "地図をクリックすると、ピンが表示され下に日記作成フォームが表示されます"
      )
    ).toBeInTheDocument();

    expect(screen.getByTestId("mock-diary-map")).toBeInTheDocument();
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  });

  it("地図クリック時に日記作成フォームが表示される", async () => {
    await act(async () => {
      render(<DiaryPage />);
    });

    // 初期状態では日記作成フォームは表示されない
    expect(screen.queryByText("新しい日記を作成")).not.toBeInTheDocument();

    // 地図をクリック（モック）
    const mapClickButton = screen.getByTestId("mock-map-click");
    await act(async () => {
      fireEvent.click(mapClickButton);
    });

    await waitFor(() => {
      expect(screen.getByText("新しい日記を作成")).toBeInTheDocument();
    });

    // フォーム要素が表示される
    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/訪問日時/)).toBeInTheDocument();
    expect(screen.getByLabelText(/内容/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();

    // キャンセルボタンが存在することを確認
    const cancelButtons = screen.getAllByRole("button", { name: "キャンセル" });
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("isAuthLoadingがtrueならAuthLoadingModalが表示される", async () => {
    mockAuthState.isAuthLoading = true;

    await act(async () => {
      render(<DiaryPage />);
    });

    expect(screen.getByTestId("mock-auth-loading")).toBeInTheDocument();
  });

  it("認証されていない場合にfetchMeが呼ばれる", async () => {
    mockAuthState.isAuthenticated = false;
    mockAuthState.isAuthLoading = false;

    await act(async () => {
      render(<DiaryPage />);
    });

    expect(mockAuthState.fetchMe).toHaveBeenCalled();
  });

  describe("日記一覧表示機能", () => {
    beforeEach(() => {
      // 日記データを返すようにAPIをモック
      api.get = jest.fn(() =>
        Promise.resolve(mockAxiosResponse(mockDiaries)) as any
      );
    });

    it("日記一覧が正しく表示される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("あなたの日記 (3件)")).toBeInTheDocument();
      });

      // 各日記のタイトルが表示される
      expect(screen.getByText("東京旅行")).toBeInTheDocument();
      expect(screen.getByText("京都観光")).toBeInTheDocument();
      expect(screen.getByText("大阪食べ歩き")).toBeInTheDocument();
    });

    it("日記が訪問日時の年月でグループ化されて表示される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 訪問日時の年月のヘッダーが表示される
        expect(screen.getByText("2024年2月")).toBeInTheDocument();
        expect(screen.getByText("2024年1月")).toBeInTheDocument();
      });

      // 各グループに正しい日記が含まれている
      const february = screen.getByText("2024年2月").parentElement;
      expect(february).toHaveTextContent("大阪食べ歩き");

      const january = screen.getByText("2024年1月").parentElement;
      expect(january).toHaveTextContent("東京旅行");
      expect(january).toHaveTextContent("京都観光");
    });

    it("訪問日時が正しく表示される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 訪問日時のラベルと値が表示される
        const visitedDateElements = screen.getAllByText(/訪問日時:/);
        expect(visitedDateElements.length).toBe(3);
        
        // 日時のフォーマットが正しい（例：2024/01/10）
        expect(screen.getByText(/2024\/01\/10/)).toBeInTheDocument();
      });
    });

    it("訪問日時のみが表示され、作成日時と更新日時は表示されない", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 各日記カードに訪問日時が表示される
        const visitedDateElements = screen.getAllByText(/訪問日時:/);
        expect(visitedDateElements.length).toBe(3);
        
        // 作成日時と最終更新は表示されない
        expect(screen.queryByText(/作成日時:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/最終更新:/)).not.toBeInTheDocument();
      });
    });

    it("位置情報（緯度・経度）が表示される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 東京旅行の位置情報
        expect(screen.getByText(/35\.6585/)).toBeInTheDocument();
        expect(screen.getByText(/139\.7454/)).toBeInTheDocument();
      });
    });

    it("日記の内容が100文字を超える場合は省略される", async () => {
      const longContentDiary: TravelDiary = {
        id: 4,
        user_id: 1,
        title: "長い日記",
        content: "あ".repeat(150), // 150文字の内容
        latitude: 35.0,
        longitude: 135.0,
        visited_at: "2024-03-01T10:00:00Z",
        created_at: "2024-03-01T10:00:00Z",
        updated_at: "2024-03-01T10:00:00Z",
      };

      api.get = jest.fn(() =>
        Promise.resolve(mockAxiosResponse([longContentDiary])) as any
      );

      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 100文字 + "..." が表示される
        const content = screen.getByText(/あ{100}\.\.\./);
        expect(content).toBeInTheDocument();
      });
    });

    it("日記カードをクリックすると詳細ページへのリンクが正しく設定される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 東京旅行のリンクを確認
        const tokyoLink = screen.getByText("東京旅行").closest("a");
        expect(tokyoLink).toHaveAttribute("href", "/diary/detail?id=1");

        // 京都観光のリンクを確認
        const kyotoLink = screen.getByText("京都観光").closest("a");
        expect(kyotoLink).toHaveAttribute("href", "/diary/detail?id=2");
      });
    });

    it("日記がない場合は一覧が表示されない", async () => {
      api.get = jest.fn(() => Promise.resolve(mockAxiosResponse([])) as any);

      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 「あなたの日記」セクションが表示されない
        expect(screen.queryByText(/あなたの日記/)).not.toBeInTheDocument();
      });
    });

    it("詳細を見るアイコンが各カードに表示される", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      await waitFor(() => {
        // 目のアイコン（FaEye）が3つ表示される（title属性で確認）
        const eyeIcons = screen.getAllByTitle("詳細を見る");
        expect(eyeIcons).toHaveLength(3);
      });
    });
  });

  describe("日記作成フォーム", () => {
    it("フォームのキャンセルボタンをクリックするとフォームが閉じる", async () => {
      await act(async () => {
        render(<DiaryPage />);
      });

      // 地図をクリックしてフォームを表示
      const mapClickButton = screen.getByTestId("mock-map-click");
      await act(async () => {
        fireEvent.click(mapClickButton);
      });

      await waitFor(() => {
        expect(screen.getByText("新しい日記を作成")).toBeInTheDocument();
      });

      // キャンセルボタンをクリック
      const cancelButtons = screen.getAllByRole("button", { name: "キャンセル" });
      await act(async () => {
        fireEvent.click(cancelButtons[0]);
      });

      // フォームが閉じる
      await waitFor(() => {
        expect(screen.queryByText("新しい日記を作成")).not.toBeInTheDocument();
      });
    });
  });
});
