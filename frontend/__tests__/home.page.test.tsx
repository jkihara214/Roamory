import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../src/app/page";

describe("Home (トップページ)", () => {
  it("タイトル・キャッチコピー・特徴カード・ボタンが表示される", () => {
    render(<Home />);
    // タイトル
    expect(screen.getByText("Roamory")).toBeInTheDocument();
    // キャッチコピー
    expect(screen.getByText(/旅の記憶を/)).toBeInTheDocument();
    expect(screen.getByText(/永遠に残す/)).toBeInTheDocument();
    // 特徴カード
    expect(screen.getByText("AI旅行プランナー")).toBeInTheDocument();
    expect(screen.getByText("インタラクティブマップ")).toBeInTheDocument();
    expect(screen.getByText("スマート写真解析")).toBeInTheDocument();
    // 行動喚起ボタン
    expect(
      screen.getByRole("link", { name: /無料で始める/ })
    ).toBeInTheDocument();
  });
});
