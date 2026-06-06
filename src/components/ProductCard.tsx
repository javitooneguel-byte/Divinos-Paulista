/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Product } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAdd: (product: Product) => void;
  key?: string;
}

export function ProductCard({ product, quantityInCart, onAdd }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format price in Brazilian Real context
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(product.price);

  // Fallback plate image when user's actual image is broken or timed out
  const fallbackUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=450&q=80";

  // Optimize product image URL to be highly compressed (450px wide for grid thumbnails on mobile/desktop)
  const optimizedUrl = optimizeImageUrl(product.image, { width: 450, quality: 70 });

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-card hover:shadow-md transition duration-200 flex flex-col h-full group">
      {/* Product Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100">
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-stone-200/60 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-300 animate-[bounce_1.5s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <img
          src={imageError ? fallbackUrl : (optimizedUrl || fallbackUrl)}
          alt={product.name}
          loading="lazy"
          width="450"
          height="300"
          {...imagePerfProps}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setIsImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Badge (Selo) */}
        {product.selo && (() => {
          let badgeColor = "bg-brand-red text-white border-red-600/10";
          const lowerSelo = product.selo.toLowerCase();
          if (lowerSelo.includes("especial")) {
            badgeColor = "bg-amber-500 text-stone-950 border-amber-600/10";
          } else if (lowerSelo.includes("servido")) {
            badgeColor = "bg-emerald-600 text-white border-emerald-700/10";
          }
          return (
            <div className={`absolute top-3 left-3 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-md border ${badgeColor}`}>
              {product.selo}
            </div>
          );
        })()}
        {/* Subtle category tag inside card */}
        <div className="absolute top-3 right-3 bg-stone-900/70 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-sans text-base sm:text-lg font-bold text-stone-950 tracking-tight group-hover:text-brand-red transition-colors mb-1.5 leading-tight">
            {product.name}
          </h4>
          <p className="font-sans text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Pricing and Adjustive Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100/60 mt-auto">
          <div className="flex justify-between items-center sm:block">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-sans text-stone-400 font-medium">Preço</span>
              <span className="font-extrabold text-stone-950 font-sans text-base sm:text-lg leading-tight">{formattedPrice}</span>
            </div>
            {quantityInCart > 0 && (
              <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-500/20 font-extrabold px-2.5 py-1 rounded-lg sm:hidden">
                x{quantityInCart} no pedido
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {quantityInCart > 0 && (
              <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-500/20 font-extrabold px-2.5 py-1 rounded-lg shrink-0 hidden sm:inline-block">
                x{quantityInCart}
              </span>
            )}
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="bg-brand-red hover:bg-brand-red-dark text-white font-extrabold py-3.5 px-4 sm:py-2 sm:px-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-1 shadow-md active:scale-95 text-xs uppercase tracking-wider w-full sm:w-auto cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" strokeWidth={3} />
              Quero esse prato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
