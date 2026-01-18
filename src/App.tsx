import React, { useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SCENARIOS = {
  pessimista: { label: "Pessimista (8% / 4%)", realRate: 0.038 },
  base: { label: "Base (12% / 4%)", realRate: 0.0769 },
  otimista: { label: "Otimista (20% / 4%)", realRate: 0.1538 },
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function App() {
  const pdfRef = useRef<HTMLDivElement>(null);

  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>("base");
  const [idadeAtual, setIdadeAtual] = useState(30);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [patrimonioAtual, setPatrimonioAtual] = useState(0);
  const [aporteMensal, setAporteMensal] = useState(1000);

  const { resumo, grafico } = useMemo(() => {
    const anos = Math.max(idadeAposentadoria - idadeAtual, 0);
    const taxaAnual = SCENARIOS[scenario].realRate;
    const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
    const meses = anos * 12;

    let patrimonio = patrimonioAtual;
    const data: { ano: number; patrimonio: number }[] = [];

    for (let m = 1; m <= meses; m++) {
      patrimonio = patrimonio * (1 + taxaMensal) + aporteMensal;
      if (m % 12 === 0) {
        data.push({ ano: idadeAtual + m / 12, patrimonio });
      }
    }

    const rendaMensal = (patrimonio * 0.04) / 12;

    return {
      resumo: { anos, taxaReal: taxaAnual, patrimonio, rendaMensal },
      grafico: data,
    };
  }, [scenario, idadeAtual, idadeAposentadoria, patrimonioAtual, aporteMensal]);

  async function exportarPDF() {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      backgroundColor: "#000",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("simulacao-aposentacrypto.pdf");
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <img src="./logo.png" alt="CryptoLife" className="w-10 h-10 rounded-full" />
          <h1 className="text-3xl font-bold">
            Crypto<span className="text-yellow-400">Life</span>
          </h1>
        </div>

        <button
          onClick={exportarPDF}
          className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
        >
          Exportar PDF
        </button>
      </header>

      {/* Conteúdo exportável */}
      <div ref={pdfRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Parâmetros */}
          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Parâmetros</h2>

            <p>Cenário: {SCENARIOS[scenario].label}</p>
            <p>Idade atual: {idadeAtual}</p>
            <p>Idade aposentadoria: {idadeAposentadoria}</p>
            <p>Patrimônio atual: {formatBRL(patrimonioAtual)}</p>
            <p>Aporte mensal: {formatBRL(aporteMensal)}</p>
          </div>

          {/* Resultado */}
          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>

            <p>Tempo: {resumo.anos} anos</p>
            <p>Taxa real: {(resumo.taxaReal * 100).toFixed(2)}% a.a.</p>
            <p className="mt-2">
              Patrimônio estimado:{" "}
              <strong>{formatBRL(resumo.patrimonio)}</strong>
            </p>

            <div className="mt-6 border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400">Renda mensal estimada</p>
              <p className="text-3xl font-bold text-yellow-400">
                {formatBRL(resumo.rendaMensal)}
              </p>
              <p className="text-xs text-slate-400">
                Regra dos 4% (Trinity Study)
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="max-w-6xl mx-auto mt-10 bg-slate-900 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            Evolução do patrimônio
          </h3>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grafico}>
                <XAxis dataKey="ano" stroke="#888" />
                <YAxis
                  stroke="#888"
                  tickFormatter={(v) => `R$ ${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip formatter={(v: number) => formatBRL(v)} />
                <Line
                  type="monotone"
                  dataKey="patrimonio"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrativa */}
        <div className="max-w-6xl mx-auto mt-10 bg-slate-900 rounded-2xl p-6 text-sm text-slate-300">
          <h3 className="text-lg font-semibold mb-3">
            Como interpretar esta simulação
          </h3>
          <ul className="space-y-2">
            <li>• Valores ajustados pela inflação (taxa real).</li>
            <li>• Cenários são hipóteses educacionais.</li>
            <li>• Aportes têm grande impacto no resultado.</li>
            <li>• Regra dos 4% é uma referência histórica.</li>
            <li>• Simulação educacional, não é recomendação.</li>
          </ul>
        </div>
      </div>

      <footer className="mt-10 text-center text-slate-500 text-sm">
        CryptoLife • A liberdade é individual, mas transforma o coletivo
      </footer>
    </div>
  );
}
