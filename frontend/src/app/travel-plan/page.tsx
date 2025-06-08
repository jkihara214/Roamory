"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMapMarkedAlt, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import AuthLoadingModal from "@/components/AuthLoadingModal";
import { getCountries, generateTravelPlan } from "@/lib/api";
import LoadingModal from "@/components/LoadingModal";
import ReactMarkdown from "react-markdown";
import type { HTMLAttributes } from "react";
import { isAxiosError } from "axios";

export default function TravelPlanPage() {
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<{ plan: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [placeInput, setPlaceInput] = useState("");
  const [places, setPlaces] = useState<string[]>([]);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [countries, setCountries] = useState<
    { id: number; name_ja: string; name_en: string; code: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isAuthLoading);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const router = useRouter();

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCountries()
      .then((res) => setCountries(res.data))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const formatBudget = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? parseInt(num, 10).toLocaleString() : "";
  };

  const handleAddPlace = () => {
    const trimmed = placeInput.trim();
    if (trimmed && !places.includes(trimmed)) {
      setPlaces([...places, trimmed]);
      setPlaceInput("");
    }
  };
  const handleRemovePlace = (idx: number) => {
    setPlaces(places.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await generateTravelPlan({
        country,
        start_date: startDate?.toISOString().slice(0, 10) ?? "",
        end_date: endDate?.toISOString().slice(0, 10) ?? "",
        budget,
        must_go_places: places.length > 0 ? places : undefined,
      });
      setResult({ plan: res.data.plan });
    } catch (err: unknown) {
      let msg = "予期せぬエラーが発生しました";
      if (isAxiosError(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isAuthLoading && <AuthLoadingModal />}
      {loading && <LoadingModal message="プランを生成中..." />}
      <Header />
      <div className="flex flex-col items-center py-2 px-2 sm:px-4 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md sm:max-w-xl mx-auto mt-4 sm:mt-6 p-4 sm:p-8 bg-white rounded-2xl shadow-xl border border-sky-100">
          <div className="flex items-center gap-2 mb-6">
            <FaMapMarkedAlt className="text-2xl text-blue-500" />
            <h1 className="text-2xl font-bold tracking-wide text-blue-900">
              旅行プラン生成
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block mb-1 font-semibold text-gray-700"
                htmlFor="country"
              >
                国名
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, country: true }))
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                required
              >
                <option value="">選択してください</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.name_ja}>
                    {c.name_ja}
                  </option>
                ))}
              </select>
              {touched.country && !country && (
                <p className="text-red-500 text-sm mt-1">国名は必須です</p>
              )}
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1">
                <label
                  className="block mb-1 font-semibold text-gray-700"
                  htmlFor="startDate"
                >
                  出国日
                </label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, startDate: true }))
                  }
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="出国日"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                  wrapperClassName="w-full"
                  required
                  dayClassName={(date) => {
                    const day = date.getDay();
                    if (day === 0) return "custom-sunday";
                    if (day === 6) return "custom-saturday";
                    return "";
                  }}
                />
                {touched.startDate && !startDate && (
                  <p className="text-red-500 text-sm mt-1">出国日は必須です</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  className="block mb-1 font-semibold text-gray-700"
                  htmlFor="endDate"
                >
                  帰国日
                </label>
                <DatePicker
                  id="endDate"
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, endDate: true }))
                  }
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate ?? undefined}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="帰国日"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                  wrapperClassName="w-full"
                  required
                  dayClassName={(date) => {
                    const day = date.getDay();
                    if (day === 0) return "custom-sunday";
                    if (day === 6) return "custom-saturday";
                    return "";
                  }}
                />
                {touched.endDate && !endDate && (
                  <p className="text-red-500 text-sm mt-1">帰国日は必須です</p>
                )}
              </div>
            </div>
            <div>
              <label
                className="block mb-1 font-semibold text-gray-700"
                htmlFor="budget"
              >
                予算（円）
              </label>
              <input
                id="budget"
                type="text"
                placeholder="例：100,000"
                value={formatBudget(budget)}
                onChange={(e) =>
                  setBudget(e.target.value.replace(/[^0-9]/g, ""))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, budget: true }))}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                inputMode="numeric"
                required
              />
              {touched.budget && !budget && (
                <p className="text-red-500 text-sm mt-1">予算は必須です</p>
              )}
            </div>
            <div>
              <label htmlFor="placeInput" className="block font-semibold mb-1">
                必ず行きたい場所
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="placeInput"
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                  placeholder="例：東京スカイツリー"
                />
                <button
                  type="button"
                  onClick={handleAddPlace}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {places.map((p, i) => (
                  <span
                    key={i}
                    className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => handleRemovePlace(i)}
                      className="ml-1 text-red-500 hover:text-red-700 font-bold"
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white py-2 rounded-lg shadow-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
              disabled={
                loading || !country || !startDate || !endDate || !budget
              }
            >
              {loading ? "生成中..." : "プランを作成"}
            </button>
          </form>
          <div className="mt-10">
            {error && (
              <div className="p-8 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl shadow-xl border border-red-300">
                <h2 className="font-bold mb-4 text-red-700 text-xl flex items-center gap-2">
                  <FaInfoCircle className="text-red-400" /> エラー
                </h2>
                <div className="text-red-700 text-lg font-semibold">
                  {error}
                </div>
              </div>
            )}
            {result && !error && (
              <div className="p-8 bg-gradient-to-br from-sky-50 to-blue-100 rounded-3xl shadow-xl border border-sky-200">
                <h2 className="font-bold mb-4 text-blue-700 text-xl flex items-center gap-2">
                  <FaMapMarkedAlt className="text-blue-400" /> 生成結果
                </h2>
                <div className="prose prose-blue max-w-none">
                  <ReactMarkdown
                    components={{
                      h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
                        <h2
                          {...props}
                          className="flex items-center gap-2 text-lg text-blue-700 mt-8 mb-2"
                        >
                          <FaInfoCircle className="text-blue-400" />
                          {props.children}
                        </h2>
                      ),
                      h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
                        <h3
                          {...props}
                          className="flex items-center gap-2 text-base text-blue-600 mt-6 mb-1"
                        >
                          <FaCalendarAlt className="text-blue-300" />
                          {props.children}
                        </h3>
                      ),
                    }}
                  >
                    {result.plan}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
