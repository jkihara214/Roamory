import "@testing-library/jest-dom";
// next/navigationのuseRouter, usePathnameをテスト時にモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));
