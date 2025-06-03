import React from "react";
import { render, screen } from "@testing-library/react";
import MePage from "../src/app/dashboard/page";

let mockAuthState: any;
jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: any) => selector(mockAuthState),
}));

jest.mock("@/components/AuthLoadingModal", () => () => (
  <div data-testid="mock-auth-loading" />
));

describe("DashboardPage (ダッシュボード画面)", () => {
  beforeEach(() => {
    mockAuthState = {
      isAuthenticated: true,
      isAuthLoading: false,
      fetchMe: jest.fn(),
    };
  });

  it("タイトル・旅行プラン生成リンクが表示される", () => {
    render(<MePage />);
    expect(
      screen.getByRole("heading", { name: /ダッシュボード/ })
    ).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /旅行プラン生成/ });
    const cardLink = links.find((link) =>
      link.textContent?.includes("AIで旅行プランを自動作成できます。")
    );
    expect(cardLink).toBeInTheDocument();
    expect(
      screen.getByText(/AIで旅行プランを自動作成できます。/)
    ).toBeInTheDocument();
  });

  it("isAuthLoadingがtrueならAuthLoadingModalが表示される", () => {
    mockAuthState.isAuthLoading = true;
    render(<MePage />);
    expect(screen.getByTestId("mock-auth-loading")).toBeInTheDocument();
  });
});
