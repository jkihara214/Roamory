import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EmailVerificationErrorPage from "../src/app/auth/email-verification-error/page";

// useRouterのモック
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("EmailVerificationErrorPage (メール認証エラー)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("エラーメッセージとタイトルが表示される", () => {
    render(<EmailVerificationErrorPage />);

    expect(screen.getByText("認証エラー")).toBeInTheDocument();
    expect(
      screen.getByText(/認証処理中にエラーが発生しました/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/認証リンクが無効か、期限切れの可能性があります/)
    ).toBeInTheDocument();
  });

  it("ログイン画面へ戻るボタンが表示される", () => {
    render(<EmailVerificationErrorPage />);

    const button = screen.getByRole("button", {
      name: "ログイン画面へ戻る",
    });
    expect(button).toBeInTheDocument();
  });

  it("ボタンをクリックするとログイン画面にリダイレクトされる", () => {
    render(<EmailVerificationErrorPage />);

    const button = screen.getByRole("button", {
      name: "ログイン画面へ戻る",
    });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("エラーアイコン(SVG)が表示される", () => {
    const { container } = render(<EmailVerificationErrorPage />);

    // SVG要素の存在を確認
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
