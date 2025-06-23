import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../src/app/register/page";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);
jest.mock(
  "@/components/LoadingModal",
  () =>
    ({ message }: { message: string }) =>
      <div data-testid="loading-modal">{message}</div>
);
jest.mock("@/components/AuthLoadingModal", () => () => (
  <div data-testid="auth-loading-modal" />
));

const mockRegister = jest.fn();
const mockClearRegistrationState = jest.fn();
const mockClearResendState = jest.fn();
const mockResendVerificationEmail = jest.fn();
const mockFetchMe = jest.fn();

// useAuthStoreのモック - 複数の呼び出しパターンに対応
jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) => {
    // selectorが提供された場合（fetchMe用）
    if (selector) {
      return mockFetchMe;
    }
    // selectorがない場合（通常のオブジェクト取得）
    return {
      loading: false,
      isAuthenticated: false,
      error: null,
      registrationSuccess: false,
      registrationMessage: null,
      registrationEmail: null,
      resendLoading: false,
      resendSuccess: null,
      resendError: null,
      emailUnverified: false,
      unverifiedEmail: null,
      register: mockRegister,
      clearRegistrationState: mockClearRegistrationState,
      clearResendState: mockClearResendState,
      resendVerificationEmail: mockResendVerificationEmail,
      clearEmailUnverifiedState: jest.fn(),
      isAuthLoading: false,
    };
  }),
}));

// useRouter のモック
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe("RegisterPage (新規登録画面)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("登録成功時に成功カードが表示される", () => {
    // 成功状態のためのモック更新
    const { useAuthStore } = require("@/store/auth");
    useAuthStore.mockImplementation((selector: any) => {
      if (selector) {
        return mockFetchMe;
      }
      return {
        loading: false,
        isAuthenticated: false,
        error: null,
        registrationSuccess: true,
        registrationMessage:
          "アカウントが作成されました。認証メールを確認してからログインしてください。",
        registrationEmail: "test@example.com",
        resendLoading: false,
        resendSuccess: null,
        resendError: null,
        emailUnverified: false,
        unverifiedEmail: null,
        register: mockRegister,
        clearRegistrationState: mockClearRegistrationState,
        clearResendState: mockClearResendState,
        resendVerificationEmail: mockResendVerificationEmail,
        clearEmailUnverifiedState: jest.fn(),
        isAuthLoading: false,
      };
    });

    render(<RegisterPage />);

    // 成功カードの要素が表示されることを確認
    expect(screen.getByText("アカウント作成完了")).toBeInTheDocument();
    expect(
      screen.getByText(
        "アカウントが作成されました。認証メールを確認してからログインしてください。"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("認証メール送信先：")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("認証メールを再送信")).toBeInTheDocument();
    expect(screen.getByText("別のアカウントを作成")).toBeInTheDocument();

    // フォームが非表示になることを確認
    expect(
      screen.queryByRole("heading", { name: "新規登録" })
    ).not.toBeInTheDocument();
  });

  it("別のアカウントを作成ボタンで登録状態がクリアされる", () => {
    // 成功状態のためのモック更新
    const { useAuthStore } = require("@/store/auth");
    useAuthStore.mockImplementation((selector: any) => {
      if (selector) {
        return mockFetchMe;
      }
      return {
        loading: false,
        isAuthenticated: false,
        error: null,
        registrationSuccess: true,
        registrationMessage: "アカウントが作成されました。",
        registrationEmail: "test@example.com",
        resendLoading: false,
        resendSuccess: null,
        resendError: null,
        emailUnverified: false,
        unverifiedEmail: null,
        register: mockRegister,
        clearRegistrationState: mockClearRegistrationState,
        clearResendState: mockClearResendState,
        resendVerificationEmail: mockResendVerificationEmail,
        clearEmailUnverifiedState: jest.fn(),
        isAuthLoading: false,
      };
    });

    render(<RegisterPage />);

    const tryAgainButton = screen.getByText("別のアカウントを作成");
    fireEvent.click(tryAgainButton);

    expect(mockClearRegistrationState).toHaveBeenCalled();
    expect(mockClearResendState).toHaveBeenCalled();
  });
});
