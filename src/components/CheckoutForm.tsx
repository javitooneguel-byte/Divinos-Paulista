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

  return (
    <div className="space-y-6">
      {/* 1. DADOS DO CLIENTE */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-brand-red" />
          Dados do Cliente
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="customer-name" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <input
                id="customer-name"
                type="text"
                value={customer.name}
                onChange={(e) => onUpdateCustomer({ ...customer, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
              <User className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
            </div>
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Telefone / WhatsApp *
            </label>
            <div className="relative">
              <input
                id="customer-phone"
                type="tel"
                value={customer.phone}
                onChange={(e) => onUpdateCustomer({ ...customer, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
              <Phone className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ENDEREÇO DE ENTREGA */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-brand-red" />
          Endereço de Entrega
        </h3>

        <div className="space-y-4">
          {/* CEP Input with Autofill */}
          <div>
            <label htmlFor="delivery-cep" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1-label">
              CEP (Apenas números) *
            </label>
            <div className="relative">
              <input
                id="delivery-cep"
                type="text"
                value={address.cep}
                onChange={handleCepChange}
                placeholder="01310100"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 pl-10 pr-10 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
              <MapPin className="absolute left-3.5 top-3.5 text-stone-400 w-4.5 h-4.5" />
              {cepLoading && (
                <div className="absolute right-3.5 top-3.5">
                  <Loader2 className="w-4.5 h-4.5 text-brand-red animate-spin" />
                </div>
              )}
            </div>
            
            {cepStatus === "error" && (
              <div className="flex items-center gap-1.5 mt-2 text-brand-red text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            {cepStatus === "success" && (
              <p className="mt-1.5 text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                ✓ Endereço preenchido automaticamente!
              </p>
            )}
          </div>

          {/* Autocompleted Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label htmlFor="delivery-street" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Rua / Logradouro *
              </label>
              <input
                id="delivery-street"
                type="text"
                value={address.street}
                onChange={(e) => onUpdateAddress({ ...address, street: e.target.value })}
                placeholder="Ex: Avenida Paulista"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="delivery-number" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Número *
              </label>
              <input
                id="delivery-number"
                type="text"
                value={address.number}
                onChange={(e) => onUpdateAddress({ ...address, number: e.target.value })}
                placeholder="Ex: 1000"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="delivery-complement" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Complemento
              </label>
              <input
                id="delivery-complement"
                type="text"
                value={address.complement}
                onChange={(e) => onUpdateAddress({ ...address, complement: e.target.value })}
                placeholder="Apto 15, Bloco B"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
            </div>

            <div>
              <label htmlFor="delivery-neighborhood" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Bairro *
              </label>
              <input
                id="delivery-neighborhood"
                type="text"
                value={address.neighborhood}
                onChange={(e) => onUpdateAddress({ ...address, neighborhood: e.target.value })}
                placeholder="Bela Vista"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150 relative"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label htmlFor="delivery-city" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Cidade *
              </label>
              <input
                id="delivery-city"
                type="text"
                value={address.city}
                onChange={(e) => onUpdateAddress({ ...address, city: e.target.value })}
                placeholder="São Paulo"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="delivery-state" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
                Estado *
              </label>
              <input
                id="delivery-state"
                type="text"
                value={address.state}
                onChange={(e) => onUpdateAddress({ ...address, state: e.target.value })}
                placeholder="SP"
                className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
              />
            </div>
          </div>

          <div>
            <label htmlFor="delivery-reference" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1">
              Ponto de Referência
            </label>
            <input
              id="delivery-reference"
              type="text"
              value={address.reference}
              onChange={(e) => onUpdateAddress({ ...address, reference: e.target.value })}
              placeholder="Ex: Próximo ao metrô Trianon-Masp"
              className="w-full bg-stone-50 border border-stone-200 focus:border-brand-red focus:bg-white rounded-xl py-3 px-4 text-sm font-sans font-medium text-stone-900 outline-none transition duration-150"
            />
          </div>

          {/* ESTIMATED TIMEFRAME */}
          {isCepComplete && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 shadow-sm transform transition duration-200">
              <span className="text-emerald-600 font-bold text-sm">⏱</span>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Tempo estimado de entrega: até 30 minutos
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  O prazo pode variar conforme a região e será confirmado pelo WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PAGAMENTO - APENAS PIX */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-100 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-brand-red" />
          Método de Pagamento
        </h3>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-stone-950 font-sans shadow-inner shrink-0">
            Pix
          </div>
          <div className="text-left font-sans text-xs">
            <h4 id="payment-pix-title" className="font-bold text-stone-900">Pagamento Exclusivo via Pix</h4>
            <p className="text-stone-500 font-medium leading-relaxed">
              Praticidade total. A chave de pagamento Pix será compartilhada diretamente no seu WhatsApp para confirmação rápida da cozinha.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
