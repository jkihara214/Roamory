import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TravelPlanPage from "../src/app/travel-plan/page";

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("@/store/auth", () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      user: { name: "テストユーザー", email: "test@example.com" },
      isAuthenticated: true,
      loading: false,
      error: null,
      fetchMe: jest.fn(),
    })
  ),
}));

describe("TravelPlanPage (旅行プラン生成画面)", () => {
  it("主要なUI要素が表示される", () => {
    render(<TravelPlanPage />);
    expect(screen.getByText("旅行プラン生成")).toBeInTheDocument();
    expect(screen.getByLabelText("国名")).toBeInTheDocument();
    expect(screen.getByLabelText("出国日")).toBeInTheDocument();
    expect(screen.getByLabelText("帰国日")).toBeInTheDocument();
    expect(screen.getByLabelText("予算（円）")).toBeInTheDocument();
    expect(screen.getByLabelText("必ず行きたい場所")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /プランを作成/ })
    ).toBeInTheDocument();
  });

  it("必須項目が未入力だとボタンがdisabledになる", () => {
    render(<TravelPlanPage />);
    const button = screen.getByRole("button", { name: /プランを作成/ });
    expect(button).toBeDisabled();
  });

  it("場所追加・削除ができる", () => {
    render(<TravelPlanPage />);
    const input = screen.getByPlaceholderText("例：東京スカイツリー");
    const addBtn = screen.getByRole("button", { name: "追加" });
    fireEvent.change(input, { target: { value: "東京スカイツリー" } });
    fireEvent.click(addBtn);
    expect(screen.getByText("東京スカイツリー")).toBeInTheDocument();
    const delBtn = screen.getByLabelText("削除");
    fireEvent.click(delBtn);
    expect(screen.queryByText("東京スカイツリー")).not.toBeInTheDocument();
  });
});
