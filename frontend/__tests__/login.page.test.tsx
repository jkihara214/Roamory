import React from "react";
import { render, screen } from "@testing-library/react";
import LoginPage from "../src/app/login/page";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

// App Routerフックのモックは不要

describe("LoginPage (ログイン画面)", () => {
  it("タイトル・入力欄・ボタン・新規登録リンクが表示される", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: "ログイン" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メールアドレス")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("パスワード")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ログイン/ })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toBeInTheDocument();
  });
});
