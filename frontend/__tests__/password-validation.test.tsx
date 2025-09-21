import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../src/app/register/page";
import { Suspense } from "react";
import ResetPasswordPage from "../src/app/reset-password/page";

// モック
jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));
jest.mock("react-icons/fa", () => ({
  FaUserPlus: () => <div data-testid="icon-user-plus" />,
  FaCheckCircle: () => <div data-testid="icon-check-circle" />,
  FaEnvelope: () => <div data-testid="icon-envelope" />,
  FaPaperPlane: () => <div data-testid="icon-paper-plane" />,
  FaEye: () => <div data-testid="icon-eye" />,
  FaEyeSlash: () => <div data-testid="icon-eye-slash" />,
  FaKey: () => <div data-testid="icon-key" />,
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "token") return "test-token";
      if (key === "email") return "test@example.com";
      return null;
    },
  }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockRegister = jest.fn();
const mockClearRegistrationState = jest.fn();
const mockClearResendState = jest.fn();
const mockResendVerificationEmail = jest.fn();
const mockFetchMe = jest.fn();

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) => {
    if (selector) {
      return mockFetchMe;
    }
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
      setState: jest.fn(),
    };
  }),
}));

describe("パスワードバリデーション - ユーザー登録", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("8文字未満のパスワードでエラー表示", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Pass1");
    await userEvent.tab(); // フォーカスを外す

    await waitFor(() => {
      expect(screen.getByText("パスワードは8文字以上で入力してください。")).toBeInTheDocument();
    });
  });

  it("20文字を超えるパスワードはmaxLength属性で制限される", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字") as HTMLInputElement;

    // maxLength属性が設定されていることを確認
    expect(passwordInput.maxLength).toBe(20);

    // 20文字まで入力
    await userEvent.type(passwordInput, "Password123456789012");
    expect(passwordInput.value).toBe("Password123456789012");
    expect(passwordInput.value.length).toBe(20);

    // 21文字目は入力されない
    await userEvent.type(passwordInput, "3");
    expect(passwordInput.value).toBe("Password123456789012"); // 20文字のまま
    expect(passwordInput.value.length).toBe(20);
  });

  it("数字のみのパスワードでエラー表示", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "12345678");
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText("パスワードは英字と数字の両方を含む必要があります。")).toBeInTheDocument();
    });
  });

  it("英字のみのパスワードでエラー表示", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Password");
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText("パスワードは英字と数字の両方を含む必要があります。")).toBeInTheDocument();
    });
  });

  it("正しい形式のパスワードではエラーが表示されない", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Password123");
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.queryByText("パスワードは8文字以上で入力してください。")).not.toBeInTheDocument();
      expect(screen.queryByText("パスワードは20文字以内で入力してください。")).not.toBeInTheDocument();
      expect(screen.queryByText("パスワードは英字と数字の両方を含む必要があります。")).not.toBeInTheDocument();
    });
  });

  it("パスワード要件の説明が表示される", () => {
    render(<RegisterPage />);
    expect(screen.getByText("※ 英字と数字を含む8～20文字で入力してください")).toBeInTheDocument();
  });
});

describe("パスワードバリデーション - パスワードリセット", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("8文字未満のパスワードでエラー表示", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Pass1");

    await waitFor(() => {
      expect(screen.getByText("パスワードは8文字以上で入力してください。")).toBeInTheDocument();
    });
  });

  it("20文字を超えるパスワードはmaxLength属性で制限される", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字") as HTMLInputElement;

    // maxLength属性が設定されていることを確認
    expect(passwordInput.maxLength).toBe(20);

    // 20文字まで入力
    await userEvent.type(passwordInput, "Password123456789012");
    expect(passwordInput.value).toBe("Password123456789012");
    expect(passwordInput.value.length).toBe(20);

    // 21文字目は入力されない
    await userEvent.type(passwordInput, "3");
    expect(passwordInput.value).toBe("Password123456789012"); // 20文字のまま
    expect(passwordInput.value.length).toBe(20);
  });

  it("数字のみのパスワードでエラー表示", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "12345678");

    await waitFor(() => {
      expect(screen.getByText("パスワードは英字と数字の両方を含む必要があります。")).toBeInTheDocument();
    });
  });

  it("英字のみのパスワードでエラー表示", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Password");

    await waitFor(() => {
      expect(screen.getByText("パスワードは英字と数字の両方を含む必要があります。")).toBeInTheDocument();
    });
  });

  it("正しい形式のパスワードではエラーが表示されない", async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );

    const passwordInput = screen.getByPlaceholderText("英字と数字を含む8～20文字");
    await userEvent.type(passwordInput, "Password123");

    await waitFor(() => {
      expect(screen.queryByText("パスワードは8文字以上で入力してください。")).not.toBeInTheDocument();
      expect(screen.queryByText("パスワードは20文字以内で入力してください。")).not.toBeInTheDocument();
      expect(screen.queryByText("パスワードは英字と数字の両方を含む必要があります。")).not.toBeInTheDocument();
    });
  });

  it("パスワード要件の説明が表示される", () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    );
    expect(screen.getByText("※ 英字と数字を含む8～20文字で入力してください")).toBeInTheDocument();
  });
});