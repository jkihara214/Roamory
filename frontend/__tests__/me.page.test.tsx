import React from "react";
import { render, screen } from "@testing-library/react";
import MePage from "../src/app/me/page";

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      user: { name: "テストユーザー", email: "test@example.com" },
      isAuthenticated: true,
      loading: false,
      error: null,
      fetchMe: jest.fn(),
    })
  ),
}));

describe("MePage (ユーザー情報画面)", () => {
  it("タイトル・ユーザー名・メールアドレス・ログアウトボタンが表示される", () => {
    render(<MePage />);
    expect(
      screen.getByText((t) => t.includes("ユーザー情報"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((t) => t.includes("テストユーザー"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((t) => t.includes("test@example.com"))
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログアウト" })
    ).toBeInTheDocument();
  });
});
