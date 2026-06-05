/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Address, Customer } from "../types";

interface CheckoutFormProps {
  customer: Customer;
  onUpdateCustomer: (customer: Customer) => void;
  address: Address;
  onUpdateAddress: (address: Address) => void;
  observation: string;
  onUpdateObservation: (observation: string) => void;
  onSubmitOrder: () => void;
}

export function CheckoutForm({
  customer,
  onUpdateCustomer,
  address,
  onUpdateAddress,
  observation,
  onUpdateObservation,
  onSubmitOrder,
}: CheckoutFormProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Cep lookup automatically when 8 numeric characters are reached
  useEffect(() => {
    const rawCep = address.cep.replace(/\D/g, "");
    if (rawCep.length === 8) {
      lookupCep(rawCep);
    } else {
      setCepStatus("idle");
      setErrorMessage("");
    }
  }, [address.cep]);

  const lookupCep = async (cleanCep: string) => {
    setCepLoading(true);
    setCepStatus("idle");
    setErrorMessage("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepStatus("error");
        setErrorMessage("CEP não encontrado. Digite os dados manualmente.");
        setCepLoading(false);
        return;
      }

      onUpdateAddress({
        ...address,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      });
      setCepStatus("success");
    } catch (error) {
      console.error("Error looking up CEP:", error);
      setCepStatus("error");
      setErrorMessage("Erro ao buscar o CEP. Tente preencher manualmente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Format input as CEP (e.g., 00000-000 or just numbers)
    let formattedCep = value.replace(/\D/g, "");
    if (formattedCep.length > 8) {
      formattedCep = formattedCep.slice(0, 8);
    }
    
    onUpdateAddress({
      ...address,
      cep: formattedCep,
    });
  };

  const isCepComplete = address.cep.replace(/\D/g, "").length === 8;
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Monitor scroll in mobile viewport to dismiss indicators
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById("checkout-form-wrapper");
      if (element && element.scrollTop > 50) {
        setShowScrollHint(false);
      }
    };
    const element = document.getElementById("checkout-form-wrapper");
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Autofocus the Number field when ViaCEP loads successfully
  useEffect(() => {
    if (cepStatus === "success") {
      const numInput = document.getElementById("delivery-number");
      if (numInput) {
        setTimeout(() => {
          numInput.focus();
          numInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [cepStatus]);

  return (
    <div id="checkout-form-wrapper" className="space-y-5 rounded-2xl max-h-[85vh] overflow-y-auto pr-1 pb-4 text-left scrollbar-thin scrollbar-thumb-stone-200">
      
      {/* 1. DADOS DO CLIENTE */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-stone-100 shadow-sm transition hover:shadow-md duration-200 relative">
        <h3 className="font-serif text-base font-extrabold text-stone-950 border-b border-stone-100 pb-2.5 flex items-center gap-2 mb-3.5">
          <User className="w-4.5 h-4.5 text-brand-red" />
          Seus Dados Pessoais
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customer-name" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              Nome Completo <span className="text-brand-red font-black">*</span>
            </label>
            <div className="relative">
              <input
                id="customer-name"
                type="text"
                value={customer.name}
                onChange={(e) => onUpdateCustomer({ ...customer, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
              <User className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
            </div>
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              WhatsApp Celular <span className="text-brand-red font-black">*</span>
            </label>
            <div className="relative">
              <input
                id="customer-phone"
                type="tel"
                value={customer.phone}
                onChange={(e) => onUpdateCustomer({ ...customer, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
              <Phone className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ENDEREÇO DE ENTREGA */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-stone-100 shadow-sm transition hover:shadow-md duration-200">
        <h3 className="font-serif text-base font-extrabold text-stone-950 border-b border-stone-100 pb-2.5 flex items-center gap-2 mb-3.5">
          <MapPin className="w-4.5 h-4.5 text-brand-red" />
          Endereço de Entrega do Almoço
        </h3>

        <div className="space-y-3.5">
          {/* CEP Input with Autofill */}
          <div>
            <label htmlFor="delivery-cep" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              CEP (Apenas números) <span className="text-brand-red font-black">*</span>
            </label>
            <div className="relative">
              <input
                id="delivery-cep"
                type="text"
                value={address.cep}
                onChange={handleCepChange}
                placeholder="01310100"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
              <MapPin className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
              {cepLoading && (
                <div className="absolute right-3.5 top-3.5">
                  <Loader2 className="w-4.5 h-4.5 text-brand-red animate-spin" />
                </div>
              )}
            </div>
            
            {cepStatus === "error" && (
              <div className="flex items-center gap-1.5 mt-2 text-brand-red text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {cepStatus === "success" && (
              <p className="mt-1.5 text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                ✓ CEP validado com sucesso!
              </p>
            )}
          </div>

          {/* ESTIMATED TIMEFRAME - PROBLEMA 1 */}
          {cepStatus === "success" && (
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500/20 flex items-center gap-3 shadow-sm transform transition duration-300 animate-slide-in text-left">
              <span className="text-emerald-600 font-bold text-xl shrink-0">🚚</span>
              <div className="min-w-0 flex-1">
                <p id="estimated-time-delivery-p" className="text-xs font-black text-emerald-950 leading-snug">
                  Tempo estimado de entrega para seu endereço: até 30 minutos.
                </p>
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                  ✓ Entregador Exclusivo Ativo para seu CEP
                </p>
              </div>
            </div>
          )}

          {/* Autocompleted Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label htmlFor="delivery-street" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                Rua / Logradouro <span className="text-brand-red font-black">*</span>
              </label>
              <input
                id="delivery-street"
                type="text"
                value={address.street}
                onChange={(e) => onUpdateAddress({ ...address, street: e.target.value })}
                placeholder="Ex: Avenida Paulista"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="delivery-number" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                Número <span className="text-brand-red font-black">*</span>
              </label>
              <input
                id="delivery-number"
                type="text"
                value={address.number}
                onChange={(e) => onUpdateAddress({ ...address, number: e.target.value })}
                placeholder="Ex: 1000"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="delivery-neighborhood" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                Bairro / Região <span className="text-brand-red font-black">*</span>
              </label>
              <input
                id="delivery-neighborhood"
                type="text"
                value={address.neighborhood}
                onChange={(e) => onUpdateAddress({ ...address, neighborhood: e.target.value })}
                placeholder="Ex: Bela Vista"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="delivery-complement" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                Complemento
              </label>
              <input
                id="delivery-complement"
                type="text"
                value={address.complement}
                onChange={(e) => onUpdateAddress({ ...address, complement: e.target.value })}
                placeholder="Ex: Apto 15, Bloco B"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label htmlFor="delivery-city" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                Cidade <span className="text-brand-red font-black">*</span>
              </label>
              <input
                id="delivery-city"
                type="text"
                value={address.city}
                onChange={(e) => onUpdateAddress({ ...address, city: e.target.value })}
                placeholder="Ex: São Paulo"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="delivery-state" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                UF Estado <span className="text-brand-red font-black">*</span>
              </label>
              <input
                id="delivery-state"
                type="text"
                value={address.state}
                onChange={(e) => onUpdateAddress({ ...address, state: e.target.value })}
                placeholder="SP"
                className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="delivery-reference" className="block text-[10px] sm:text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
              Ponto de Referência do Motoboy
            </label>
            <input
              id="delivery-reference"
              type="text"
              value={address.reference}
              onChange={(e) => onUpdateAddress({ ...address, reference: e.target.value })}
              placeholder="Ex: Travessa da Av. Brigadeiro Luís Antônio"
              className="w-full bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition-all duration-150 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. PAGAMENTO - APENAS PIX */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-stone-100 shadow-sm transition hover:shadow-md duration-200">
        <h3 className="font-serif text-base font-extrabold text-stone-950 border-b border-stone-100 pb-2.5 flex items-center gap-2 mb-3.5">
          <CreditCard className="w-4.5 h-4.5 text-brand-red" />
          Método de Pagamento
        </h3>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-black text-stone-950 font-sans shadow-inner shrink-0 text-sm">
            Pix
          </div>
          <div className="text-left font-sans text-xs">
            <h4 id="payment-pix-title" className="font-black text-stone-950">Pagamento Exclusivo via Pix</h4>
            <p className="text-stone-605 font-semibold text-stone-700 leading-relaxed mt-0.5">
              Praticidade total. A chave de pagamento Pix será compartilhada diretamente no seu WhatsApp para confirmação rápida da cozinha.
            </p>
          </div>
        </div>
      </div>

      {/* INDICADOR DE ROLAGEM MÓVEL - PROBLEMA 2 */}
      {showScrollHint && (
        <div className="sm:hidden sticky bottom-1.5 z-30 flex justify-center animate-bounce mt-2">
          <div className="bg-brand-red text-white py-2 px-4 rounded-full text-xs font-black shadow-lg border border-white flex items-center gap-1.5 uppercase tracking-wider">
            <span>⬇️</span> Continue preenchendo os dados abaixo
          </div>
        </div>
      )}

    </div>
  );
}
