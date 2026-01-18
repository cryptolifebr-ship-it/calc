import React from 'react';
import { AreaChart, Area, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar } from 'recharts';
import { ProjectionYear, Currency } from '../types';
import { formatCurrency } from '../services/marketData';

interface ResultsChartProps {
  data: ProjectionYear[];
  currency: Currency;
  isLogScale: boolean;
  mode: 'wealth' | 'income' | 'contribution';
  labels: {
    wealthTitle: string;
    incomeTitle: string;
    btc: string;
    pension: string;
    traditional: string;
    age: string;
  };
}

const ResultsChart: React.FC<ResultsChartProps> = ({ data, currency, isLogScale, mode, labels }) => {
  const isIncome = mode === 'income';
  const isContrib = mode === 'contribution';
  
  // Choose keys based on mode
  let btcKey = 'btcStrategyValue';
  let pensionKey = 'privatePensionValue';
  let tradKey = 'traditionalValue';
  let title = labels.wealthTitle;

  if (isIncome) {
    btcKey = 'btcMonthlyIncome';
    pensionKey = 'pensionMonthlyIncome';
    tradKey = 'traditionalMonthlyIncome';
    title = labels.incomeTitle;
  } else if (isContrib) {
    btcKey = 'btcContribution';
    pensionKey = 'pensionContribution';
    tradKey = 'traditionalContribution';
    title = "Comparativo de Contribuição Anual";
  }

  // Fix for log scale with 0 values
  const processedData = isLogScale && !isIncome && !isContrib ? data.map(d => ({
    ...d,
    [btcKey]: (d as any)[btcKey] <= 0 ? 0.1 : (d as any)[btcKey],
    [pensionKey]: (d as any)[pensionKey] <= 0 ? 0.1 : (d as any)[pensionKey],
    [tradKey]: (d as any)[tradKey] <= 0 ? 0.1 : (d as any)[tradKey],
  })) : data;

  return (
    <div className="h-[450px] w-full bg-brand-dark rounded-xl p-4 border border-brand-brown shadow-lg gold-glow">
      <h3 className="text-brand-gold text-sm font-semibold mb-4 uppercase tracking-wider font-heading">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={processedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c97918" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#c97918" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a4a4a" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#4a4a4a" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#332412" vertical={false} />
          <XAxis 
            dataKey="age" 
            stroke="#666" 
            tick={{ fill: '#888', fontSize: 12, fontFamily: 'Open Sans' }}
            tickLine={false}
            axisLine={false}
            label={{ value: labels.age, position: 'insideBottomRight', offset: -5, fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12, fontFamily: 'Open Sans' }}
            tickFormatter={(value) => formatCurrency(value, currency, true)}
            tickLine={false}
            axisLine={false}
            scale={isLogScale && !isIncome && !isContrib ? 'log' : 'auto'}
            domain={isLogScale && !isIncome && !isContrib ? ['auto', 'auto'] : [0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#101010', borderColor: '#c97918', color: '#FFFFFF', borderRadius: '8px' }}
            itemStyle={{ color: '#FFFFFF' }}
            formatter={(value: number, name: string) => [formatCurrency(value, currency), name]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return `${labels.age} ${label} (${payload[0].payload.year})`;
              }
              return `${labels.age} ${label}`;
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          
          {/* Main Strategy */}
          <Area 
            type="monotone" 
            dataKey={btcKey} 
            name={labels.btc}
            stroke="#c97918" 
            fillOpacity={1} 
            fill="url(#colorBtc)" 
            strokeWidth={3}
          />

          {/* Pension */}
          <Line 
            type="monotone" 
            dataKey={pensionKey} 
            name={labels.pension}
            stroke="#FFFFFF" 
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />

          {/* Traditional/INSS */}
          {isContrib ? (
             <Line 
                type="monotone" 
                dataKey={tradKey} 
                name={labels.traditional}
                stroke="#6b7280" 
                strokeWidth={2}
                dot={false}
            />
          ) : (
            <Line 
                type="monotone" 
                dataKey={tradKey} 
                name={labels.traditional}
                stroke="#4a4a4a" 
                strokeWidth={2}
                dot={false}
            />
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;
