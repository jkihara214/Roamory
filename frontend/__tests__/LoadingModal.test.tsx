import React from "react";
import { render } from "@testing-library/react";
import LoadingModal from "@/components/LoadingModal";

describe("LoadingModal", () => {
  it("レンダリングされ、スピナーと飛行機アイコンが表示される", () => {
    const { container, getByText } = render(
      <LoadingModal message="テスト中..." />
    );
    // スピナーのクラスが存在するか
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    // メッセージが表示されているか
    expect(getByText("テスト中...")).toBeInTheDocument();
    // 飛行機アイコン（svg）が存在するか
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
