import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../src/components/Header";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

// Zustandのセレクタ関数対応モック
let mockState: any;
const mockLogout = jest.fn().mockResolvedValue(undefined);
jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: any) => selector(mockState),
}));

describe("Header", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockState = {
      isAuthenticated: false,
      logout: mockLogout,
    };
  });

  it("未ログイン時はロゴ・ログイン・新規登録ボタンが表示される", () => {
    mockState.isAuthenticated = false;
    render(<Header />);
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toBeInTheDocument();
  });

  it("未ログイン時もバーガーメニューボタンが表示される", () => {
    mockState.isAuthenticated = false;
    render(<Header />);
    expect(screen.getByLabelText("メニューを開く")).toBeInTheDocument();
  });

  it("未ログイン時にバーガーメニューをクリックするとメニューが表示される", () => {
    mockState.isAuthenticated = false;
    render(<Header />);

    // 初期状態ではメニューは表示されない
    expect(screen.queryByLabelText("メニューを閉じる")).not.toBeInTheDocument();

    // バーガーメニューをクリック
    const menuButton = screen.getByLabelText("メニューを開く");
    fireEvent.click(menuButton);

    // メニューが表示される
    expect(screen.getByLabelText("メニューを閉じる")).toBeInTheDocument();
    // メニュー内にログイン・新規登録ボタンが表示される
    expect(screen.getAllByRole("link", { name: "ログイン" })).toHaveLength(2); // PC用とメニュー用
    expect(screen.getAllByRole("link", { name: "新規登録" })).toHaveLength(2); // PC用とメニュー用
  });

  it("ログイン時はダッシュボード・旅行プラン生成・ログアウトボタンが表示される", () => {
    mockState.isAuthenticated = true;
    render(<Header />);
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "ダッシュボード" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "旅行プラン生成" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログアウト" })
    ).toBeInTheDocument();
  });

  it("ログアウトボタンを押すとlogoutが呼ばれる", async () => {
    mockState.isAuthenticated = true;
    render(<Header />);
    const logoutBtn = screen.getByRole("button", { name: "ログアウト" });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
