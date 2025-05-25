import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

describe("Home (トップページ)", () => {
  it("タイトル・キャッチコピー・特徴カード・ボタンが表示される", () => {
    render(<Home />);
    // タイトル
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    // キャッチコピー
    expect(screen.getByText(/旅する、記憶を残す/)).toBeInTheDocument();
    // 特徴カード
    expect(screen.getByText("AI旅行プラン生成")).toBeInTheDocument();
    expect(screen.getByText("地図×日記")).toBeInTheDocument();
    expect(screen.getByText("訪問国の可視化")).toBeInTheDocument();
    // 行動喚起ボタン
    expect(
      screen.getByRole("link", { name: "今すぐはじめる" })
    ).toBeInTheDocument();
  });
});
