/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Product } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";
import { safeTrack } from "../lib/metaPixel";

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAdd: (product: Product) => void;
  onRemoveOne: (productId: string) => void;
  key?: string;
}

export function ProductCard({ product, quantityInCart, onAdd, onRemoveOne }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Safely trigger ViewContent event for this loaded product item
    safeTrack("ViewContent", {
      content_name: product.name,
      content_category: product.category,
      value: product.price,
      currency: "BRL",
      content_ids: [product.id],
      content_type: "product"
    });
  }, [product.id]);

  // Format price in Brazilian Real context
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(product.price);

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
          src={optimizedUrl}
          alt={product.name}
          loading="lazy"
          {...imagePerfProps}
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Badge (Selo) */}
        {product.selo && (
          <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider shadow-md">
            {product.selo}
          </div>
        )}
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
        <div className="flex items-center justify-between gap-2.5 pt-4 border-t border-stone-100/60 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-sans text-stone-400 font-medium">Preço</span>
            <span className="font-extrabold text-stone-950 font-sans text-lg leading-tight">{formattedPrice}</span>
          </div>

          <div className="flex items-center">
            {quantityInCart > 0 ? (
              <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/50">
                <button
                  type="button"
                  onClick={() => onRemoveOne(product.id)}
                  aria-label="Remover um item"
                  className="w-8 h-8 rounded-lg hover:bg-white text-stone-700 flex items-center justify-center transition active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-sans font-bold text-stone-900 text-sm px-2.5 min-w-[20px] text-center">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => onAdd(product)}
                  aria-label="Adicionar outro item"
                  className="w-8 h-8 rounded-lg hover:bg-white text-stone-700 flex items-center justify-center transition active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(product)}
                className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-3.5 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm active:scale-95 text-xs uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
