import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../src/components/Header";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

// useAuthStoreのモック
const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockUseAuthStore = jest.fn();
jest.mock("@/store/auth", () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

describe("Header", () => {
  beforeEach(() => {
    mockLogout.mockClear();
  });

  it("未ログイン時はロゴ・ログイン・新規登録ボタンが表示される", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      logout: mockLogout,
    });
    render(<Header />);
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toBeInTheDocument();
  });

  it("ログイン時はダッシュボード・旅行プラン生成・ログアウトボタンが表示される", () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });
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
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    });
    render(<Header />);
    const logoutBtn = screen.getByRole("button", { name: "ログアウト" });
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
  });
});
