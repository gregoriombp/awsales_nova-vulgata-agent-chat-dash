"use client";

import React from "react";
import Image from "next/image";

interface KnowledgeOSEmptyStateProps {
  onCreateBase: () => void;
}

export default function KnowledgeOSEmptyState({
  onCreateBase,
}: KnowledgeOSEmptyStateProps) {
  return (
    <div className="relative w-full rounded-2xl bg-[#0c1421] overflow-hidden" style={{ minHeight: "427px" }}>
      {/* Pattern Background */}
      <div className="absolute right-0 top-0 bottom-0 w-[60%] opacity-80">
        <Image
          src="/assets/knowledge-os-pattern.svg"
          alt=""
          fill
          className="object-cover object-left"
          priority
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-10 py-20">
        <div className="max-w-md">
          <h2 className="text-white text-2xl font-heading font-bold mb-6 leading-tight">
            Você ainda não possui nenhuma<br />
            Base de Conhecimento.
          </h2>
          <button
            onClick={onCreateBase}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#0c1421] rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Nova base
          </button>
        </div>
      </div>
    </div>
  );
}
