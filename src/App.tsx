import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
        data.push({
          ano: idadeAtual + m / 12,
          patrimonio,
        });
      }
    }

    const rendaMensal = (patrimonio * 0.04) / 12;

    return {
      resumo: {
        anos,
        taxaReal: taxaAnual,
        patrimonio,
        rendaMensal,
      },
      grafico: data,
    };
  }, [scenario, idadeAtual, idadeAposentadoria, patrimonioAtual, aporteMensal]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      {/* Header */}
      <header className="flex items-center gap-4 mb-10">
        <img src="./logo.png" alt="CryptoLife" className="w-10 h-10 rounded-full" />
        <h1 className="text-3xl font-bold">
          Crypto<span className="text-yellow-400">Life</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Parâmetros */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6">Parâmetros</h2>

          <label className="block mb-4">
            <span className="text-sm text-slate-300">Cenário</span>
            <select
              className="mt-1 w-full bg-black border border-slate-700 rounded-lg px-3 py-2"
              value={scenario}
              onChange={(e) =>
                setScenario(e.target.value as keyof typeof SCENARIOS)
              }
            >
              {Object.entries(SCENARIOS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="text-sm text-slate-300">Idade atual</span>
            <input
              type="number"
              className="mt-1 w-full bg-black border border-slate-700 rounded-lg px-3 py-2"
              value={idadeAtual}
              onChange={(e) => setIdadeAtual(Number(e.target.value))}
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm text-slate-300">
              Idade de aposentadoria
            </span>
            <input
              type="number"
              className="mt-1 w-full bg-black border border-slate-700 rounded-lg px-3 py-2"
              value={idadeAposentadoria}
              onChange={(e) => setIdadeAposentadoria(Number(e.target.value))}
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm text-slate-300">
              Patrimônio atual (R$)
            </span>
            <input
              type="number"
              className="mt-1 w-full bg-black border border-slate-700 rounded-lg px-3 py-2"
              value={patrimonioAtual}
              onChange={(e) => setPatrimonioAtual(Number(e.target.value))}
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">
              Aporte mensal (R$)
            </span>
            <input
              type="number"
              className="mt-1 w-full bg-black border border-slate-700 rounded-lg px-3 py-2"
              value={aporteMensal}
              onChange={(e) => setAporteMensal(Number(e.target.value))}
            />
          </label>
        </div>

        {/* Resultado */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Resultado</h2>
            <p className="text-sm text-slate-400 mb-6">
              Simulação em valores reais (ajustados pela inflação)
            </p>

            <div className="mb-6">
              <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
                Acumulação
              </h3>
              <p className="text-slate-300">
                <strong>Tempo:</strong> {resumo.anos} anos
              </p>
              <p className="text-slate-300">
                <strong>Taxa real:</strong>{" "}
                {(resumo.taxaReal * 100).toFixed(2)}% a.a.
              </p>
              <p className="text-slate-300">
                <strong>Patrimônio estimado:</strong>{" "}
                {formatBRL(resumo.patrimonio)}
              </p>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
                Renda na aposentadoria
              </h3>
              <p className="text-xs text-slate-400 mb-1">
                Regra dos 4% (Trinity Study)
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {formatBRL(resumo.rendaMensal)}
              </p>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400 space-y-1">
            <p>• Simulação educacional.</p>
            <p>• Cenários são estimativas, não garantias.</p>
            <p>• Não constitui recomendação financeira.</p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="max-w-6xl mx-auto mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">
          Evolução do patrimônio ao longo do tempo
        </h3>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grafico}>
              <XAxis
                dataKey="ano"
                stroke="#888"
                tick={{ fill: "#888" }}
              />
              <YAxis
                stroke="#888"
                tick={{ fill: "#888" }}
                tickFormatter={(v) =>
                  `R$ ${(v / 1_000_000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value: number) => formatBRL(value)}
                labelFormatter={(label) => `Ano ${label}`}
              />
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

      <footer className="mt-10 text-center text-slate-500 text-sm">
        CryptoLife • Educação financeira baseada em cenários
      </footer>
    </div>
  );
}
