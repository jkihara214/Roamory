import React from "react";
import { render, screen } from "@testing-library/react";
import MePage from "../src/app/me/page";

describe("MePage (ユーザー情報画面)", () => {
  it("タイトル・ユーザー名・メールアドレス・ログアウトボタンが表示される", () => {
    render(<MePage />);
    expect(screen.getByText("ユーザー情報")).toBeInTheDocument();
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ログアウト" })
    ).toBeInTheDocument();
  });
});
