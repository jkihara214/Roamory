import React from "react";
import { render, screen } from "@testing-library/react";
import MePage from "../src/app/dashboard/page";

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      isAuthenticated: true,
      isAuthLoading: false,
      fetchMe: jest.fn(),
    })
  ),
}));

jest.mock("@/components/AuthLoadingModal", () => () => (
  <div data-testid="mock-auth-loading" />
));

describe("DashboardPage (ダッシュボード画面)", () => {
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
    jest.mock("@/store/auth", () => ({
      useAuthStore: jest.fn((selector) =>
        selector({
          isAuthenticated: true,
          isAuthLoading: true,
          fetchMe: jest.fn(),
        })
      ),
    }));
    const MePageWithLoading = require("../src/app/dashboard/page").default;
    render(<MePageWithLoading />);
    expect(screen.getByTestId("mock-auth-loading")).toBeInTheDocument();
  });
});
