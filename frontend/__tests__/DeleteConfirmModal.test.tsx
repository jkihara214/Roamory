import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteConfirmModal from "../src/components/DeleteConfirmModal";

describe("DeleteConfirmModal (削除確認モーダル)", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "テスト日記",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("isOpenがfalseの場合はモーダルが表示されない", () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("削除の確認")).not.toBeInTheDocument();
  });

  it("isOpenがtrueの場合にモーダルが表示される", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText("削除の確認")).toBeInTheDocument();
    // 「テスト日記」はstrongタグ内にあるので、getByTextで検索可能
    expect(
      screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "strong" &&
          content.includes("テスト日記")
        );
      })
    ).toBeInTheDocument();
    expect(screen.getByText("を削除しますか？")).toBeInTheDocument();
    expect(
      screen.getByText("この操作は取り消すことができません。")
    ).toBeInTheDocument();
  });

  it("キャンセルボタンをクリックするとonCloseが呼ばれる", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンをクリックするとonConfirmが呼ばれる", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("XボタンをクリックするとonCloseが呼ばれる", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByTitle("閉じる"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("isLoadingがtrueの場合に削除中状態が表示される", () => {
    render(<DeleteConfirmModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText("削除中...")).toBeInTheDocument();

    // ローディング中はボタンが無効化される
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    expect(screen.getByText("削除中...").closest("button")).toBeDisabled();
  });

  it("背景クリックでonCloseが呼ばれる", () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const backdrop = screen.getByTestId("delete-modal-backdrop");
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("カスタムメッセージが表示される", () => {
    render(
      <DeleteConfirmModal {...defaultProps} message="カスタム警告メッセージ" />
    );
    expect(screen.getByText("カスタム警告メッセージ")).toBeInTheDocument();
  });
});
