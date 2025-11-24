import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TravelPlanPage from "../src/app/travel-plan/page";
import api from "../src/lib/api";
import { AxiosResponse } from "axios";

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as any,
  };
}

let mockAuthState: any;
jest.mock("@/store/auth", () => ({
  useAuthStore: (selector: any) => selector(mockAuthState),
}));

beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () =>
        Promise.resolve([
          {
            id: 1,
            name_ja: "日本",
            name_en: "Japan",
            code: "JP",
            geojson_url: null,
          },
          {
            id: 2,
            name_ja: "アメリカ合衆国",
            name_en: "United States",
            code: "US",
            geojson_url: null,
          },
        ]),
      headers: new Headers(),
      redirected: false,
      type: "basic",
      url: "",
      clone: function () {
        return this;
      },
      body: null,
      bodyUsed: false,
      text: async () => JSON.stringify([]),
    } as Response)
  );

  // apiインスタンスのget/postを直接モック
  api.get = jest.fn((url) => {
    if (url.includes("/countries")) {
      return Promise.resolve(
        mockAxiosResponse([
          {
            id: 1,
            name_ja: "日本",
            name_en: "Japan",
            code: "JP",
            geojson_url: null,
          },
          {
            id: 2,
            name_ja: "アメリカ合衆国",
            name_en: "United States",
            code: "US",
            geojson_url: null,
          },
        ])
      ) as any;
    }
    return Promise.resolve(mockAxiosResponse({})) as any;
  });
  api.post = jest.fn((url, data) => {
    if (url.includes("/travel-plans/generate")) {
      return Promise.resolve(
        mockAxiosResponse({ plan: "# ダミー旅行プラン\n- サンプル日程" })
      ) as any;
    }
    return Promise.resolve(mockAxiosResponse({})) as any;
  });
});

jest.mock("@/components/Header", () => () => <div data-testid="mock-header" />);
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

beforeEach(() => {
  mockAuthState = {
    user: { name: "テストユーザー", email: "test@example.com" },
    isAuthenticated: true,
    loading: false,
    error: null,
    fetchMe: jest.fn(),
  };
});

describe("TravelPlanPage (旅行プラン生成画面)", () => {
  it("主要なUI要素が表示される", async () => {
    render(<TravelPlanPage />);
    await waitFor(() => {
      expect(screen.getByText("旅行プラン生成")).toBeInTheDocument();
      expect(screen.getByLabelText("国名")).toBeInTheDocument();
      expect(screen.getByLabelText("入国日時（旅行先）")).toBeInTheDocument();
      expect(screen.getByLabelText("出国日時（旅行先）")).toBeInTheDocument();
      expect(screen.getByLabelText("予算（円）")).toBeInTheDocument();
      expect(screen.getByLabelText("必ず行きたい場所")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /プランを作成/ })
      ).toBeInTheDocument();
    });
  });

  it("必須項目が未入力だとボタンがdisabledになる", async () => {
    render(<TravelPlanPage />);
    await waitFor(() => {
      const button = screen.getByRole("button", { name: /プランを作成/ });
      expect(button).toBeDisabled();
    });
  });

  it("場所追加・削除ができる", async () => {
    render(<TravelPlanPage />);
    const input = await screen.findByPlaceholderText("例：東京スカイツリー");
    const addBtn = screen.getByRole("button", { name: "追加" });
    fireEvent.change(input, { target: { value: "東京スカイツリー" } });
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(screen.getByText("東京スカイツリー")).toBeInTheDocument();
    });
    const delBtn = screen.getByLabelText("削除");
    fireEvent.click(delBtn);
    await waitFor(() => {
      expect(screen.queryByText("東京スカイツリー")).not.toBeInTheDocument();
    });
  });
});
