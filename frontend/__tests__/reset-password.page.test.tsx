import React, { Suspense } from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "../src/app/reset-password/page";
import { useRouter, useSearchParams } from "next/navigation";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);

const mockPost = jest.fn();
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: (...args: any[]) => mockPost(...args),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("react-icons/fa", () => ({
  FaKey: () => <div data-testid="icon-key" />,
  FaEye: () => <div data-testid="icon-eye" />,
  FaEyeSlash: () => <div data-testid="icon-eye-slash" />,
  FaCheckCircle: () => <div data-testid="icon-check-circle" />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ResetPasswordPage (パスワードリセット画面)", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockClear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe("正常なトークンとメールアドレスがある場合", () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === "token") return "valid-token";
          if (key === "email") return "test@example.com";
          return null;
        }),
      });
    });

    it("タイトル・パスワード入力欄・確認入力欄・ボタンが表示される", () => {
      render(<ResetPasswordPage />);
      
      expect(
        screen.getByRole("heading", { name: "新しいパスワードを設定" })
      ).toBeInTheDocument();
      
      expect(
        screen.getByPlaceholderText("英字と数字を含む8～20文字")
      ).toBeInTheDocument();
      
      expect(
        screen.getByPlaceholderText("パスワードを再入力")
      ).toBeInTheDocument();
      
      expect(
        screen.getByRole("button", { name: "パスワードをリセット" })
      ).toBeInTheDocument();
      
      expect(
        screen.getByRole("link", { name: "ログイン画面に戻る" })
      ).toBeInTheDocument();
    });

    it("パスワードが未入力だとボタンがdisabledになる", () => {
      render(<ResetPasswordPage />);
      const button = screen.getByRole("button", { name: "パスワードをリセット" });
      expect(button).toBeDisabled();
    });

    it("パスワードと確認パスワードを入力するとボタンがenabledになる", async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });
      
      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");
      
      expect(button).not.toBeDisabled();
    });

    it("パスワード表示/非表示の切り替えができる", async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字") as HTMLInputElement;
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力") as HTMLInputElement;
      
      // 初期状態はpassword type
      expect(passwordInput.type).toBe("password");
      expect(confirmInput.type).toBe("password");
      
      // パスワードを表示ボタンをクリック
      const toggleButtons = screen.getAllByRole("button", { name: /パスワードを表示/ });
      await userEvent.click(toggleButtons[0]);
      
      expect(passwordInput.type).toBe("text");
      
      // パスワードを隠すボタンをクリック
      const hideButton = screen.getByRole("button", { name: /パスワードを隠す/ });
      await userEvent.click(hideButton);
      
      expect(passwordInput.type).toBe("password");
    });

    it("パスワードが一致しない場合エラーメッセージが表示される", async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });
      
      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "differentpassword");
      await userEvent.click(button);
      
      expect(screen.getByText("パスワードが一致しません。")).toBeInTheDocument();
    });

    it("パスワードが8文字未満の場合エラーメッセージが表示される", async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });
      
      await userEvent.type(passwordInput, "short");
      await userEvent.type(confirmInput, "short");
      await userEvent.click(button);
      
      // 複数のエラーメッセージが表示される可能性があるので、少なくとも1つあることを確認
      const errors = screen.getAllByText("パスワードは8文字以上で入力してください。");
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it.skip("リセット成功時に成功画面が表示され、3秒後にログイン画面へ遷移する", async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      const { container } = render(<ResetPasswordPage />);

      // コンポーネントがマウントされるのを待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Suspenseが解決されるまで待つ
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "新しいパスワードを設定" })).toBeInTheDocument();
      }, { timeout: 5000 });

      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");

      // フェイクタイマーを設定
      jest.useFakeTimers();

      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("パスワードがリセットされました")
        ).toBeInTheDocument();
        expect(
          screen.getByText("3秒後にログイン画面へ移動します...")
        ).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(mockPost).toHaveBeenCalledWith("/v1/reset-password", {
        token: "valid-token",
        email: "test@example.com",
        password: "newpassword123",
        password_confirmation: "newpassword123",
      });

      // 3秒後にリダイレクト
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });

      jest.useRealTimers();
    }, 20000);

    it.skip("送信中はローディング表示になる", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockPost.mockReturnValue(promise);

      render(<ResetPasswordPage />);

      // コンポーネントがマウントされるのを待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Suspenseが解決されるまで待つ
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "新しいパスワードを設定" })).toBeInTheDocument();
      }, { timeout: 5000 });

      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");

      // ボタンをクリックするが、awaitしない
      userEvent.click(button);

      // 送信中の状態を確認
      await waitFor(() => {
        const btn = screen.getByRole("button", { name: "パスワードをリセット" });
        expect(btn.textContent).toBe("リセット中...");
        expect(btn).toBeDisabled();
      });

      // Promiseを解決
      resolvePromise!({ data: {} });

      // 成功状態を確認
      await waitFor(() => {
        expect(
          screen.getByText("パスワードがリセットされました")
        ).toBeInTheDocument();
      });
    }, 20000);

    it("APIエラー時にエラーメッセージが表示される", async () => {
      mockPost.mockRejectedValueOnce({
        response: {
          data: { message: "トークンが無効です" },
        },
      });

      render(<ResetPasswordPage />);

      // コンポーネントがマウントされるのを待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Suspenseが解決されるまで待つ
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "新しいパスワードを設定" })).toBeInTheDocument();
      }, { timeout: 5000 });

      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("トークンが無効です")).toBeInTheDocument();
      });
    }, 20000);

    it("ネットワークエラー時に汎用エラーメッセージが表示される", async () => {
      mockPost.mockRejectedValueOnce(new Error("Network error"));

      render(<ResetPasswordPage />);

      // コンポーネントがマウントされるのを待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Suspenseが解決されるまで待つ
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "新しいパスワードを設定" })).toBeInTheDocument();
      }, { timeout: 5000 });

      const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
      const confirmInput = screen.getByPlaceholderText("パスワードを再入力");
      const button = screen.getByRole("button", { name: "パスワードをリセット" });

      await userEvent.type(passwordInput, "newpassword123");
      await userEvent.type(confirmInput, "newpassword123");
      await userEvent.click(button);

      await waitFor(() => {
        expect(
          screen.getByText("エラーが発生しました。もう一度お試しください。")
        ).toBeInTheDocument();
      });
    }, 20000);
  });

  describe("トークンまたはメールアドレスがない場合", () => {
    it("トークンがない場合はエラー画面が表示される", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === "email") return "test@example.com";
          return null;
        }),
      });
      
      render(<ResetPasswordPage />);
      
      expect(screen.getByText("無効なリセットリンクです。")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "パスワードリセットをやり直す" })
      ).toBeInTheDocument();
    });

    it("メールアドレスがない場合はエラー画面が表示される", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === "token") return "valid-token";
          return null;
        }),
      });
      
      render(<ResetPasswordPage />);
      
      expect(screen.getByText("無効なリセットリンクです。")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "パスワードリセットをやり直す" })
      ).toBeInTheDocument();
    });

    it("両方ない場合はエラー画面が表示される", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
      });
      
      render(<ResetPasswordPage />);
      
      expect(screen.getByText("無効なリセットリンクです。")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "パスワードリセットをやり直す" })
      ).toBeInTheDocument();
    });
  });
});