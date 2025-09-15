import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "../src/app/forgot-password/page";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

const mockPost = jest.fn();
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

jest.mock("react-icons/fa", () => ({
  FaEnvelope: () => <div data-testid="icon-envelope" />,
  FaArrowLeft: () => <div data-testid="icon-arrow-left" />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ForgotPasswordPage (パスワードリセットメール送信画面)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockClear();
  });

  it("タイトル・入力欄・ボタン・ログイン画面へのリンクが表示される", () => {
    render(<ForgotPasswordPage />);
    
    expect(
      screen.getByRole("heading", { name: "パスワードリセット" })
    ).toBeInTheDocument();
    
    expect(
      screen.getByPlaceholderText("メールアドレスを入力")
    ).toBeInTheDocument();
    
    expect(
      screen.getByRole("button", { name: "リセットメールを送信" })
    ).toBeInTheDocument();
    
    expect(
      screen.getByRole("link", { name: /ログイン画面に戻る/ })
    ).toBeInTheDocument();
  });

  it("メールアドレスが未入力だとボタンがdisabledになる", () => {
    render(<ForgotPasswordPage />);
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    expect(button).toBeDisabled();
  });

  it("メールアドレスを入力するとボタンがenabledになる", async () => {
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    
    await userEvent.type(input, "test@example.com");
    expect(button).not.toBeDisabled();
  });

  it("メール送信成功時に成功メッセージと送信先メールアドレスが表示される", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    
    await userEvent.type(input, "test@example.com");
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(
        screen.getByText(/メールアドレスが登録されている場合、パスワードリセットメールを送信しました/)
      ).toBeInTheDocument();
      
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("送信先メールアドレス:")).toBeInTheDocument();
    });
    
    expect(mockPost).toHaveBeenCalledWith("/v1/forgot-password", {
      email: "test@example.com",
    });
  });

  it("送信中はローディング表示になる", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockPost.mockReturnValue(promise);

    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });

    await userEvent.type(input, "test@example.com");

    // ボタンをクリック
    userEvent.click(button);

    // 送信中の状態を確認
    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn.textContent).toBe("送信中...");
      expect(btn).toBeDisabled();
    });

    // Promiseを解決
    resolvePromise!({ data: {} });

    // 成功状態を確認
    await waitFor(() => {
      expect(screen.getByText(/メールアドレスが登録されている場合/)).toBeInTheDocument();
    });
  });

  it("429エラー時にレート制限エラーメッセージが表示される", async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 429,
        data: {
          message: "パスワードリセットメールの再送信は5分間隔で行えます。\n既に送信済みのメールをご確認ください。\nメールが届かない場合は迷惑メールフォルダもご確認ください。"
        },
      },
    });

    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });

    await userEvent.type(input, "test@example.com");
    await userEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("パスワードリセットメールの再送信は5分間隔で行えます。")
      ).toBeInTheDocument();
      expect(
        screen.getByText("既に送信済みのメールをご確認ください。")
      ).toBeInTheDocument();
      expect(
        screen.getByText("メールが届かない場合は迷惑メールフォルダもご確認ください。")
      ).toBeInTheDocument();
    });
  });

  it("APIエラー時にエラーメッセージが表示される", async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: "サーバーエラーが発生しました" },
      },
    });
    
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    
    await userEvent.type(input, "test@example.com");
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(
        screen.getByText("サーバーエラーが発生しました")
      ).toBeInTheDocument();
    });
  });

  it("ネットワークエラー時に汎用エラーメッセージが表示される", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network error"));
    
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力");
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    
    await userEvent.type(input, "test@example.com");
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(
        screen.getByText("エラーが発生しました。もう一度お試しください。")
      ).toBeInTheDocument();
    });
  });

  it("成功後にフォームがクリアされる", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    
    render(<ForgotPasswordPage />);
    const input = screen.getByPlaceholderText("メールアドレスを入力") as HTMLInputElement;
    const button = screen.getByRole("button", { name: "リセットメールを送信" });
    
    await userEvent.type(input, "test@example.com");
    expect(input.value).toBe("test@example.com");
    
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
    
    // フォームは成功画面に切り替わるため、入力欄は表示されない
    expect(
      screen.queryByPlaceholderText("メールアドレスを入力")
    ).not.toBeInTheDocument();
  });
});