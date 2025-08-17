"use client";
import React from "react";
import {
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaMagic,
  FaCameraRetro,
  FaRocket,
  FaCheck,
  FaStar,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0">
          <div className="absolute top-40 -left-20 w-96 h-96 bg-gradient-to-br from-sky-200/40 to-blue-300/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 -right-20 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-pink-300/40 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-50 to-orange-50 border border-sky-200 rounded-full px-5 py-2.5 mb-8 shadow-sm">
              <FaRocket className="text-sky-600 animate-pulse" />
              <span className="text-sm font-semibold text-gray-700">AI搭載の次世代旅行記録アプリ</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
              旅の記憶を
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 animate-gradient">
                  永遠に残す
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              AIが創る完璧な旅行プラン。地図に刻む大切な思い出。
              <br />
              あなたの冒険を、美しいデジタルアーカイブへ。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  無料で始める
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                機能を詳しく見る
              </Link>
            </div>
            
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-green-600 text-xs" />
                </div>
                <span className="font-medium">クレジットカード不要</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-green-600 text-xs" />
                </div>
                <span className="font-medium">完全無料で開始</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheck className="text-green-600 text-xs" />
                </div>
                <span className="font-medium">いつでも解約可能</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="py-24 relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-sky-100 to-orange-100 rounded-full mb-4">
              <span className="text-sm font-bold text-gray-700">FEATURES</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              革新的な3つの機能
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              最先端のAI技術と直感的なUIで、旅行体験を劇的に変える
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <FaMagic className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI旅行プランナー</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  最新AIが予算・日程・好みを分析し、あなただけの完璧な旅行プランを瞬時に生成。隠れた名所も提案します。
                </p>
                <button className="flex items-center text-pink-500 font-bold hover:gap-3 gap-2 transition-all">
                  詳しく見る
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <FaMapMarkedAlt className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">インタラクティブマップ</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  訪れた場所をピンで記録。写真や思い出と共に、あなただけの世界地図を作成。美しいビジュアルで振り返れます。
                </p>
                <button className="flex items-center text-sky-500 font-bold hover:gap-3 gap-2 transition-all">
                  詳しく見る
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl opacity-50 blur-xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                  COMING SOON
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg opacity-60">
                  <FaCameraRetro className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-500 mb-4">スマート写真解析</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  AIが写真から場所を自動認識。訪問国を自動でトラッキングし、美しいビジュアルで可視化します。
                </p>
                <button className="flex items-center text-gray-400 font-bold gap-2 cursor-not-allowed" disabled>
                  準備中
                  <FaArrowRight className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                  <span className="text-sm font-bold text-gray-700">WHY ROAMORY</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                  なぜRoamoryが
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    選ばれるのか
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  旅行の計画から記録まで、すべてを一つのアプリで完結。
                  シンプルで美しいインターフェースで、誰でも簡単に使いこなせます。
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaGlobeAsia className="text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">世界中の場所を記録</h3>
                      <p className="text-gray-600">地図上のどこでもピンを立てて、思い出を記録できます</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaStar className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">直感的な操作</h3>
                      <p className="text-gray-600">複雑な設定は不要。すぐに使い始められます</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaHeart className="text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">思い出を永久保存</h3>
                      <p className="text-gray-600">クラウド保存で大切な旅の思い出を永久に</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-200/50 via-purple-200/50 to-orange-200/50 blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-sky-50 via-purple-50 to-orange-50 rounded-3xl p-12 shadow-2xl">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center gap-4 mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0s' }}>
                        <FaMapMarkedAlt className="text-3xl text-white" />
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
                        <FaGlobeAsia className="text-3xl text-white" />
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.4s' }}>
                        <FaMagic className="text-3xl text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      すべての旅を
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500">
                        特別な記憶に
                      </span>
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      地図×AI×日記で、あなたの旅行体験を最高のものに変えます
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-24 relative bg-gradient-to-t from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-300/30 via-purple-300/30 to-orange-300/30 blur-3xl"></div>
            <div className="relative bg-white rounded-3xl p-12 lg:p-16 text-center shadow-2xl border border-gray-100">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                今すぐ旅の記録を
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-purple-500 to-orange-500">
                  始めよう
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                無料アカウントを作成して、AIと一緒に最高の旅を計画しましょう。
                クレジットカード不要で、今すぐ始められます。
              </p>
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-3">
                  無料アカウント作成
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-sky-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Roamory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}