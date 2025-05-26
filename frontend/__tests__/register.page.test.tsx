import React from "react";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../src/app/register/page";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      loading: false,
      isAuthenticated: false,
      error: null,
      register: jest.fn(),
      fetchMe: jest.fn(),
    })
  ),
}));

// App Routerフックのモックは不要

describe("RegisterPage (新規登録画面)", () => {
  it("タイトル・入力欄・ボタン・ログインリンクが表示される", () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole("heading", { name: "新規登録" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ユーザー名")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("パスワード（確認）")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /登録/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
  });

  it("必須項目が未入力だとボタンがdisabledになる", () => {
    render(<RegisterPage />);
    const button = screen.getByRole("button", { name: /登録/ });
    expect(button).toBeDisabled();
  });
});
