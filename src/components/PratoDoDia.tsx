/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Flame, Plus, Sparkles } from "lucide-react";
import { Product } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";

interface PratoDoDiaProps {
  product: Product;
  onAdd: (product: Product) => void;
  cartQuantity: number;
}

export function PratoDoDia({ product, onAdd, cartQuantity }: PratoDoDiaProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const priceParts = product.price.toFixed(2).split(".");
  const reais = priceParts[0];
  const centavos = priceParts[1];

  // Optimize featured banner image URL to match large display area (750px width)
  const optimizedUrl = optimizeImageUrl(product.image, { width: 750, quality: 75 });

  return (
    <div id="prato-do-dia-section" className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-brand-yellow shadow-card transition-all grid grid-cols-1 md:grid-cols-12 gap-0 group">
        {/* Flag "Prato do Dia" */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-brand-yellow text-stone-950 py-1.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg border border-yellow-400/20">
          <span>⭐ Prato do Dia</span>
        </div>

        {/* Product image section */}
        <div className="relative md:col-span-5 h-64 md:h-auto min-h-[250px] overflow-hidden bg-stone-100">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-stone-200/60 animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-stone-300 animate-[bounce_1.5s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <img
            src={optimizedUrl}
            alt="Prato do Dia Divinos Paulista"
            loading="eager"
            {...imagePerfProps}
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
          
          <div className="absolute bottom-4 left-4 right-4 z-20 md:hidden">
            <span className="text-white/80 font-sans text-xs">A escolha perfeita da farta mesa paulista</span>
          </div>
        </div>

        {/* Content text section */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2 text-brand-red">
              <Sparkles className="w-4 h-4 text-brand-yellow fill-current" />
              <span className="text-xs font-bold uppercase tracking-widest font-display">Sabores que Apaixonam</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-tight mb-3">
              {product.name}
            </h3>

            <p className="font-sans text-stone-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-stone-200/60">
            {/* Price section */}
            <div>
              <p className="text-stone-500 text-xs font-sans uppercase tracking-widest">Valor Especial</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-brand-red font-bold text-lg">R$</span>
                <span className="text-brand-red font-sans text-3xl font-black tracking-tight">{reais}</span>
                <span className="text-brand-red font-bold text-xl">,{centavos}</span>
              </div>
            </div>

            {/* Quick add button */}
            <div className="relative">
              <button
                onClick={() => onAdd(product)}
                className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-brand-red/10 active:scale-95 text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4 text-brand-yellow" />
                Adicionar ao pedido
              </button>

              {cartQuantity > 0 && (
                <div className="absolute -top-3.5 -right-2 bg-brand-yellow text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                  {cartQuantity} no pedido
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
