/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { ChefHat, ShoppingBag, Send, ArrowRight, CheckCircle2 } from "lucide-react";
import { optimizeImageUrl } from "../lib/imageOptimizer";
import { safeTrack, initAdvancedMatching } from "../lib/metaPixel";

interface RedirectionPageProps {
  logo?: string;
  companyName?: string;
}

export function RedirectionPage({ logo, companyName = "Divinos Paulista" }: RedirectionPageProps) {
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // 1. Safely track Lead and Purchase events once per order
    try {
      const orderDataStr = sessionStorage.getItem("last_order_details");
      if (orderDataStr) {
        const orderData = JSON.parse(orderDataStr);
        if (orderData && orderData.orderId) {
          const flagKey = `purchase_tracked_${orderData.orderId}`;
          if (!sessionStorage.getItem(flagKey)) {
            // Apply Advanced Matching
            if (orderData.customer) {
              initAdvancedMatching({
                name: orderData.customer.name,
                phone: orderData.customer.phone,
                city: orderData.customer.city
              });
            }

            // Track Lead
            safeTrack("Lead", {
              value: orderData.cartTotal,
              currency: "BRL",
              content_name: `Pedido de ${orderData.customer?.name || "Cliente"}`,
              num_items: orderData.totalItems
            });

            // Track Purchase
            safeTrack("Purchase", {
              value: orderData.cartTotal,
              currency: "BRL",
              num_items: orderData.totalItems,
              content_type: "product",
              contents: (orderData.cartItems || []).map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                item_price: item.price
              })),
              order_id: orderData.orderId
            });

            // Prevent duplicate fires
            sessionStorage.setItem(flagKey, "true");
          } else {
            console.log(`[Meta Pixel] Order ${orderData.orderId} was already tracked in this session.`);
          }
        }
      }
    } catch (e) {
      console.error("[Meta Pixel] Error tracking Conversion Events in RedirectionPage:", e);
    }

    // 2. Get the pending WhatsApp redirect URL from sessionStorage
    const url = sessionStorage.getItem("pending_whatsapp_url") || "";
    setWhatsappUrl(url);

    // Dynamic step progress mock intervals (Faster now - approx 1.6s total for premium snappy feel)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2 for faster animation
      });
    }, 30); // 50 increments * 30ms = 1.5 seconds

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 2) {
          clearInterval(stepInterval);
          return 2;
        }
        return prev + 1;
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  // Helper function to convert standard WhatsApp web URLs (wa.me) into deep links (whatsapp://)
  const convertToDeepLink = (url: string): string => {
    if (!url) return url;
    try {
      // If it's already a custom protocol, return as is
      if (url.startsWith("whatsapp://")) {
        return url;
      }

      // Convert wa.me/PHONE?text=... -> whatsapp://send?phone=PHONE&text=...
      if (url.includes("wa.me/")) {
        const match = url.match(/wa\.me\/([^\s?]+)(?:\?(.+))?/);
        if (match) {
          const phone = match[1];
          const queryParams = match[2] || "";
          return `whatsapp://send?phone=${phone}${queryParams ? `&${queryParams}` : ""}`;
        }
      }

      // Convert api.whatsapp.com/send?phone=PHONE&text=... -> whatsapp://send?phone=PHONE&text=...
      if (url.includes("api.whatsapp.com/send")) {
        return url
          .replace("https://api.whatsapp.com/send", "whatsapp://send")
          .replace("http://api.whatsapp.com/send", "whatsapp://send");
      }
    } catch (e) {
      console.error("Error converting to WhatsApp native deep link:", e);
    }
    return url;
  };

  // Safe redirect function to prioritize native app opening and escaping iframe layers
  const performRedirect = (url: string) => {
    if (!url) return;

    let targetUrl = url;
    
    // Detect mobile user agent (including iOS/iPhone and Android)
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      targetUrl = convertToDeepLink(url);
    }

    try {
      // Check if we are inside an iframe/embed or webview and try to target top window to trigger deep links securely
      if (window.top && window.top !== window) {
        window.top.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    } catch (e) {
      // Fallback for cross-origin environments or restricted webviews
      window.location.href = targetUrl;
    }
  };

  // When progress reaches 100%, trigger automatic redirection to WhatsApp
  useEffect(() => {
    if (progress >= 100 && whatsappUrl) {
      const redirectTimeout = setTimeout(() => {
        performRedirect(whatsappUrl);
      }, 200);
      return () => clearTimeout(redirectTimeout);
    }
  }, [progress, whatsappUrl]);

  const fallbackLogo = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80";
  const logoThumb = logo ? optimizeImageUrl(logo, { width: 120, quality: 80 }) : null;

  const steps = [
    { label: "Conferindo os itens do seu pedido...", emoji: "📝" },
    { label: "Separando e organizando na cozinha...", emoji: "🍳" },
    { label: "Preparando envio para o WhatsApp da loja...", emoji: "🚀" }
  ];

  const handleManualRedirect = () => {
    if (whatsappUrl) {
      performRedirect(whatsappUrl);
    } else {
      // Fallback to home screen securely
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = "/";
        } else {
          window.location.href = "/";
        }
      } catch (e) {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/15 to-orange-50/20 flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* Container Card */}
      <div className="bg-white border border-stone-200/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Glow absolute decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-yellow via-amber-500 to-brand-red animate-pulse"></div>

        {/* Brand / Logo Header */}
        <div className="mb-6 flex flex-col items-center">
          {logoThumb ? (
            <img 
              src={logoThumb} 
              alt={companyName} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-yellow/30 shadow-md mb-2 bg-stone-50"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red to-amber-500 flex items-center justify-center shadow-md mb-2">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
          )}
          <h2 className="font-serif text-lg font-black text-stone-900 tracking-tight uppercase leading-tight">
            {companyName}
          </h2>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
            Gerenciador de Pedidos
          </span>
        </div>

        {/* Central Animated Scene */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Rotating halo */}
          <div className="absolute inset-0 border border-dashed border-brand-yellow/80 rounded-full animate-[spin_12s_linear_infinite]"></div>
          
          {/* Pulsing visual core */}
          <div className="absolute inset-2 bg-brand-yellow/10 rounded-full blur-md animate-pulse"></div>

          {/* Steaming cooking animation */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5 justify-center z-10 animate-pulse">
            <span className="text-xl animate-bounce [animation-delay:-0.3s]">💨</span>
            <span className="text-xl animate-bounce [animation-delay:-0.15s]">🍳</span>
            <span className="text-xl animate-bounce">🔥</span>
          </div>

          {/* Cooking Pot / Bag Icon */}
          <div className="w-20 h-20 bg-stone-50 border border-stone-100/90 rounded-full flex items-center justify-center shadow-md relative">
            <ShoppingBag className="w-9 h-9 text-brand-red animate-pulse" />
            <div className="absolute -bottom-1 -right-1 bg-brand-yellow p-1.5 rounded-full shadow-sm border border-white">
              <Send className="w-3.5 h-3.5 text-stone-950 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Beautiful Title Message */}
        <div className="space-y-2 mb-6">
          <h3 className="text-stone-900 font-sans font-extrabold text-base tracking-tight p-0.5">
            Preparando seu redirecionamento!
          </h3>
          <p className="text-stone-500 text-xs sm:text-[13px] leading-relaxed max-w-[325px] mx-auto">
            Estamos organizando cada detalhe do seu pedido para enviá-lo ao WhatsApp oficial do <span className="font-bold text-stone-700">{companyName}</span>.
          </p>
        </div>

        {/* Beautiful Custom Step-By-Step Checklist Indicator */}
        <div className="w-full text-left bg-stone-50/80 border border-stone-150/50 rounded-2xl p-4 mb-6 space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCompleted ? "opacity-100 text-stone-850" : isCurrent ? "opacity-100 font-bold scale-[1.01]" : "opacity-40 text-stone-400"
                }`}
              >
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-brand-red border-t-transparent animate-spin"></div>
                  ) : (
                    <span className="text-xs">{step.emoji}</span>
                  )}
                </div>
                <span className="text-xs font-sans font-medium">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Custom Progress Bar with Percent Numbers */}
        <div className="w-full mt-2 mb-6 space-y-1">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Progresso</span>
            <span className="text-xs text-brand-red font-black font-mono">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full border border-stone-200/40 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-yellow via-amber-500 to-brand-red rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Fallback Manual Link Trigger */}
        <button
          type="button"
          onClick={handleManualRedirect}
          className="w-full bg-slate-900 hover:bg-black text-white py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-100 cursor-pointer"
        >
          {progress < 100 ? "Concluindo pedido..." : "Entrar no WhatsApp Agora"}
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Support Help note */}
        <p className="text-[10px] text-indigo-900 mt-4 max-w-[300px]">
          Seu WhatsApp abrirá automaticamente. Caso não abra, utilize o botão acima para prosseguir manualmente.
        </p>

      </div>
    </div>
  );
}
