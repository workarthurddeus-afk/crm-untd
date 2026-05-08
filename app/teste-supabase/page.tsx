"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TesteSupabasePage() {
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarLeads() {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar leads:", error);
      alert("Erro ao buscar leads. Veja o console do navegador.");
    } else {
      setLeads(data || []);
    }

    setLoading(false);
  }

  async function criarLeadTeste() {
    const { error } = await supabase.from("leads").insert({
      company_name: "Lead Teste UNTD",
      niche: "Estética",
      city: "Presidente Prudente",
      state: "SP",
      instagram: "@leadteste",
      website: "https://exemplo.com",
      commercial_email: "contato@exemplo.com",
      commercial_phone: "(18) 99999-9999",
      whatsapp: "(18) 99999-9999",
      owner_name: "Dono Teste",
      owner_role: "CEO",
      owner_instagram: "@donoteste",
      owner_linkedin: "https://linkedin.com/in/teste",
      visual_quality_score: 2,
      fit_score: 5,
      visual_problems: "Feed inconsistente, artes amadoras e pouca padronização visual.",
      why_good_lead: "Negócio visual que pode precisar de posts melhores para Instagram.",
      suggested_approach: "Mostrar exemplo de post usando a identidade atual da marca.",
      status: "novo"
    });

    if (error) {
      console.error("Erro ao criar lead:", error);
      alert("Erro ao criar lead. Veja o console do navegador.");
      return;
    }

    await carregarLeads();
  }

  return (
    <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
      <h1>Teste Supabase</h1>

      <p>
        Esta página testa se o CRM consegue criar e buscar leads no Supabase.
      </p>

      <button
        onClick={criarLeadTeste}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          marginBottom: 24
        }}
      >
        Criar lead teste
      </button>

      <button
        onClick={carregarLeads}
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          marginLeft: 12,
          marginBottom: 24
        }}
      >
        Recarregar leads
      </button>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <h2>Leads encontrados: {leads.length}</h2>

          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 16,
              borderRadius: 8,
              overflowX: "auto"
            }}
          >
            {JSON.stringify(leads, null, 2)}
          </pre>
        </>
      )}

      <button
        onClick={carregarLeads}
        style={{ display: "none" }}
      />
    </main>
  );
}
