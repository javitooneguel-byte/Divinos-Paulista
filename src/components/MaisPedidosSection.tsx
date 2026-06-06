import { useMemo } from "react";
import { useState } from "react";
import { Plus, Flame, Star, Award, Sparkles } from "lucide-react";
import { Product } from "../types";
import { optimizeImageUrl, imagePerfProps } from "../lib/imageOptimizer";

interface MaisPedidosSectionProps {
  products: Product[];
  cartItems: any[];
  onAdd: (product: Product) => void;
}

export function MaisPedidosSection({ products, cartItems, onAdd }: MaisPedidosSectionProps) {
  return (
    <section id="mais-pedidos-section" className="max-w-5xl mx-auto w-full px-4 py-8 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-white rounded-3xl border border-brand-yellow/15 my-4">
      {/* Header of Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-red/10 border border-brand-red/25 px-3 py-1 rounded-full text-brand-red font-black text-[10px] tracking-wider uppercase mb-1.5">
            <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-brand-yellow" />
            Sucesso de Vendas
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            🔥 Mais pedidos do Divinos
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 font-medium leading-relaxed">
            Os queridinhos da casa com aquele sabor brasileiro autêntico e bem servidos!
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-stone-150 text-xs font-semibold text-stone-600 shadow-sm shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-brand-yellow fill-current" />
          <span>Fritos e grelhados na hora</span>
        </div>
      </div>

      {/* Grid List of Premium High-Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => {
          const qtyInCart = cartItems
            .filter((item) => item.product.id === product.id)
            .reduce((acc, item) => acc + item.quantity, 0);

          return (
            <MaisPedidoCard
              key={product.id}
              product={product}
              qtyInCart={qtyInCart}
              onAdd={onAdd}
            />
          );
        })}
      </div>
    </section>
  );
}

interface CardProps {
  product: Product;
  qtyInCart: number;
  onAdd: (product: Product) => void;
  key?: string;
}

function MaisPedidoCard({ product, qtyInCart, onAdd }: CardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
  // Larger optimized size for prominent layout
  const optimizedUrl = optimizeImageUrl(product.image, { width: 600, quality: 75 });

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-105 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row h-full group relative">
      {/* Banner/badge accent color line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow via-brand-red to-orange-500 z-10" />

      {/* Product Big Responsive Aspect Image */}
      <div className="relative w-full sm:w-44 md:w-48 lg:w-52 h-44 sm:h-auto overflow-hidden bg-stone-100 shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-stone-200/60 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-300/85 animate-[spin_3s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <img
          src={imageError ? fallbackUrl : (optimizedUrl || fallbackUrl)}
          alt={product.name}
          loading="lazy"
          {...imagePerfProps}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
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
            <div className={`absolute top-4 left-4 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-lg border ${badgeColor}`}>
              {product.selo}
            </div>
          );
        })()}

        {/* Subtle Category tag */}
        <div className="absolute bottom-3 left-3 bg-stone-900/60 backdrop-blur-sm text-[8px] text-white/90 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
          {product.category?.replace("Pratos ", "")}
        </div>
      </div>

      {/* Info & Content Panel */}
      <div className="p-5 flex flex-col flex-1 justify-between font-sans">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-sans text-base sm:text-lg font-black text-stone-950 tracking-tight group-hover:text-brand-red transition-colors leading-tight">
              {product.name}
            </h3>
            {qtyInCart > 0 && (
              <span className="text-[10px] bg-amber-500/15 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-lg shrink-0 animate-pulse">
                x{qtyInCart}
              </span>
            )}
          </div>
          <p className="font-sans text-stone-605 text-xs sm:text-xs leading-relaxed mt-2 line-clamp-3 font-medium">
            {product.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100/60 mt-4">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-stone-400">Preço Especial</span>
            <span className="font-sans font-black text-stone-950 text-base sm:text-lg leading-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAdd(product)}
            className="bg-brand-red hover:bg-brand-red-dark text-white font-extrabold py-3 px-5 sm:py-2.5 sm:px-4 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-md shadow-brand-red/10 active:scale-95 text-xs uppercase tracking-wider w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Quero esse prato
          </button>
        </div>
      </div>
    </div>
  );
}
