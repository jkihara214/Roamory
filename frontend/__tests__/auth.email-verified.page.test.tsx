import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import EmailVerifiedPage from "../src/app/auth/email-verified/page";

// useRouterのモック
const mockPush = jest.fn();
const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("EmailVerifiedPage (メール認証完了・自動ログイン)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it("トークンがある場合、localStorageに保存してダッシュボードへリダイレクト", async () => {
    // トークンありのモック
    mockGet.mockImplementation((key) => {
      if (key === "token") return "test-token-123";
      return null;
    });

    render(<EmailVerifiedPage />);

    // "ログイン中..."が表示される
    expect(screen.getByText("ログイン中...")).toBeInTheDocument();

    // トークンがlocalStorageに保存される
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token-123");
    });

    // ダッシュボードにリダイレクト
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("トークンがない場合、エラーページにリダイレクト", async () => {
    // トークンなしのモック
    mockGet.mockReturnValue(null);

    render(<EmailVerifiedPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/email-verification-error");
    });
  });

  it("Suspenseのフォールバック表示が正しい", () => {
    // トークンありのモック
    mockGet.mockImplementation((key) => {
      if (key === "token") return "test-token-123";
      return null;
    });

    render(<EmailVerifiedPage />);

    // "読み込み中..."または"ログイン中..."が表示される
    expect(
      screen.getByText(/読み込み中|ログイン中/)
    ).toBeInTheDocument();
  });
});
