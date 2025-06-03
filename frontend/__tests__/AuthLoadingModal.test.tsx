import React from "react";
import { render } from "@testing-library/react";
import AuthLoadingModal from "@/components/AuthLoadingModal";

describe("AuthLoadingModal", () => {
  it("レンダリングされ、スピナーが表示される", () => {
    const { container } = render(<AuthLoadingModal />);
    // スピナーのクラスが存在するか
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
