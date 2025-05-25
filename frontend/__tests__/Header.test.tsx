import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "../src/components/Header";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

describe("Header", () => {
  it("ロゴ・リンク・ログイン/新規登録ボタンが表示される（未ログイン時）", () => {
    render(<Header />);
    // ロゴ
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    // ログイン・新規登録ボタン
    expect(screen.getByRole("link", { name: "ログイン" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新規登録" })).toBeInTheDocument();
  });
});
