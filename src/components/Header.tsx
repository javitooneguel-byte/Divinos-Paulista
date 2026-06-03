/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Clock, MessageSquare, Compass, ShieldCheck } from "lucide-react";
import { RestaurantConfig } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";

interface HeaderProps {
  onScrollToMenu: () => void;
  restaurant: RestaurantConfig;
}

export function Header({ onScrollToMenu, restaurant }: HeaderProps) {
  const [bannerError, setBannerError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Default fallbacks
  const defaultBanner = "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=1200&auto=format&fit=crop";
  const defaultLogo = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";

  // Optimize banner with a balanced desktop/mobile width (1200px) and quality for rapid initial draw
  const heroBannerUrl = optimizeImageUrl(
    restaurant.banner || defaultBanner,
    { width: 1200, quality: 75 }
  );

  // Logo is small, so we request 100px width with extra compression
  const logoUrl = restaurant.logo ? optimizeImageUrl(restaurant.logo, { width: 100, quality: 75 }) : "";

  return (
    <header className="relative bg-brand-slate text-white overflow-hidden border-b-4 border-brand-yellow">
      {/* Decorative background visual ambient elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,25,25,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-black/45 z-10" />

      {/* Actual Delicious Hero Banner Image */}
      <img
        src={bannerError ? defaultBanner : heroBannerUrl}
        alt="Comida Brasileira Autêntica"
        className="absolute inset-0 w-full h-full object-cover object-center scaling-slow"
        loading="eager"
        width="1200"
        height="600"
        {...imagePerfProps}
        onError={() => setBannerError(true)}
        referrerPolicy="no-referrer"
      />

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-16 text-center z-20 flex flex-col items-center">
        {/* Top bar with logo and badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mb-10 gap-4">
          <div className="flex items-center gap-3">
            {restaurant.logo ? (
              <img
                src={logoError ? defaultLogo : logoUrl}
                alt={restaurant.companyName}
                loading="eager"
                width="48"
                height="48"
                {...imagePerfProps}
                onError={() => setLogoError(true)}
                className="w-12 h-12 rounded-2xl object-cover shadow-lg transform -rotate-3 border-2 border-brand-yellow"
              />
            ) : (
              <div className="bg-brand-red w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 border-2 border-brand-yellow">
                <span className="font-serif font-bold text-xl text-brand-yellow">DP</span>
              </div>
            )}
            <div className="text-left">
              <h1 id="brand-title" className="font-serif text-2xl font-bold tracking-tight text-white m-0">
                {restaurant.companyName}
              </h1>
              <p className="text-xs text-stone-300 font-sans">Sabor caseiro e tradicional</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-brand-yellow" />
            <span className="text-xs font-semibold text-stone-100 uppercase tracking-widest font-sans animate-fade-in">
              {restaurant.workingHours}
            </span>
          </div>
        </div>

        {/* Hero Copywriting */}
        <div className="max-w-3xl mt-2 mb-8">
          <span className="text-brand-yellow text-xs font-semibold tracking-widest uppercase bg-brand-red/90 px-3 py-1 rounded-md mb-4 inline-block shadow-sm">
            {restaurant.subTitle}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mt-1 mb-4 text-white">
            {restaurant.mainTitle}
          </h2>
          <p className="font-sans text-base sm:text-lg text-stone-200 max-w-xl mx-auto font-light leading-relaxed">
            Pratos comerciais, executivos e especiais cuidadosamente preparados com a melhor culinária caseira do país.
          </p>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center mt-2 mb-4">
          <button
            onClick={onScrollToMenu}
            className="flex-1 bg-brand-yellow hover:bg-yellow-500 text-brand-slate font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-brand-yellow/10 transition duration-200 flex items-center justify-center gap-2 transform active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Ver Cardápio
          </button>
          
          <button
            onClick={onScrollToMenu}
            className="flex-1 bg-brand-red hover:bg-brand-red-dark text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 transform active:scale-95 text-sm uppercase tracking-wider border border-red-700/50 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-brand-yellow animate-bounce" />
            Montar Meu Pedido
          </button>
        </div>

        {/* Safety Seals */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10 text-white/75 w-full max-w-lg text-xs font-sans">
          <div className="flex items-center gap-1.5 animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            <span>Entrega estimada: {restaurant.estimatedTime}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-1.5">
            <span className="text-brand-yellow font-bold uppercase">$</span>
            <span>Pagamento via PIX</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">●</span>
            <span>Comida Fresca</span>
          </div>
        </div>
      </div>
    </header>
  );
}
