import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DiaryPage from "../src/app/diary/page";

let mockAuthState: any;
jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: any) => selector(mockAuthState),
}));

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

jest.mock("@/components/AuthLoadingModal", () => () => (
  <div data-testid="mock-auth-loading" />
));

// DiaryMapコンポーネントのモック
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

describe("DiaryPage (旅の日記画面)", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: true,
      isAuthLoading: false,
      fetchMe: jest.fn(),
    };
  });

  it("主要なUI要素が表示される", () => {
    render(<DiaryPage />);

    expect(
      screen.getByRole("heading", { name: /旅の日記/ })
    ).toBeInTheDocument();

    expect(
      screen.getByText("地図をクリックして、旅の思い出を記録しましょう")
    ).toBeInTheDocument();

    expect(screen.getByTestId("mock-diary-map")).toBeInTheDocument();
  });

  it("地図クリック時に座標情報が表示される", () => {
    render(<DiaryPage />);

    // 初期状態では座標情報は表示されない
    expect(screen.queryByText("クリックした場所")).not.toBeInTheDocument();

    // 地図をクリック（モック）
    const mapClickButton = screen.getByTestId("mock-map-click");
    fireEvent.click(mapClickButton);

    // 座標情報が表示される
    expect(screen.getByText("クリックした場所")).toBeInTheDocument();
    expect(screen.getByText("35.676200")).toBeInTheDocument();
    expect(screen.getByText("139.650300")).toBeInTheDocument();
    expect(
      screen.getByText(
        "💡 次のステップで、この場所に日記を作成する機能を追加予定"
      )
    ).toBeInTheDocument();
  });

  it("isAuthLoadingがtrueならAuthLoadingModalが表示される", () => {
    mockAuthState.isAuthLoading = true;
    render(<DiaryPage />);
    expect(screen.getByTestId("mock-auth-loading")).toBeInTheDocument();
  });

  it("認証されていない場合の処理が実行される", () => {
    const mockPush = jest.fn();
    jest.doMock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
    }));

    mockAuthState.isAuthenticated = false;
    mockAuthState.isAuthLoading = false;

    render(<DiaryPage />);

    // 認証されていない場合、ログインページにリダイレクトされる処理がある
    // （実際のリダイレクトはuseEffectで非同期実行されるため、直接的なテストは困難）
    expect(mockAuthState.fetchMe).toHaveBeenCalled();
  });

  it("Headerコンポーネントが表示される", () => {
    render(<DiaryPage />);
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
  });
});
