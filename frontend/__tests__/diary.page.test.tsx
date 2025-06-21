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
});
