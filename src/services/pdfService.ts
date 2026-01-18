import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationInput, SimulationResult, Currency, MarketData } from '../types';
import { formatCurrency } from './marketData';

const drawLogo = (doc: jsPDF, x: number, y: number) => {
  const scale = 0.8;
  const centerX = x + 15;
  const centerY = y + 15;
  
  // 1. Black Circle
  doc.setFillColor(17, 17, 17); 
  doc.circle(centerX, centerY, 14 * scale, 'F');
  
  // 2. White Arc (Approximation)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.lines([[15 * scale, -8 * scale, 15 * scale, -8 * scale, 25 * scale, -20 * scale]], centerX - 12 * scale, centerY + 2 * scale, [1, 1]);

  // 3. Gold B
  doc.setDrawColor(201, 121, 24);
  doc.setLineWidth(1.5 * scale);
  
  // Vertical line
  doc.line(centerX - 4 * scale, centerY - 10 * scale, centerX - 4 * scale, centerY + 10 * scale);
  // B curves
  doc.lines([[15 * scale, 0], [0, 8 * scale], [-15 * scale, 0]], centerX - 4 * scale, centerY - 10 * scale);
  doc.lines([[15 * scale, 0], [0, 8 * scale], [-15 * scale, 0]], centerX - 4 * scale, centerY);
};

export const generatePDF = (
  input: CalculationInput,
  result: SimulationResult,
  currency: Currency,
  marketData: MarketData | null,
  t: any,
  cagrLabel: string,
  aiAnalysis: string | null,
  chartImage: string | null,
  comparisonData: any
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Background
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo
  drawLogo(doc, 5, 5);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CryptoLife", 50, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(201, 121, 24); // Brand Gold
  doc.text(t.subtitle.toUpperCase(), 50, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString(), pageWidth - 20, 25, { align: 'right' });
  
  let yPos = 50;
  
  // --- Input Summary ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.configTitle, 20, yPos);
  yPos += 8;
  
  const inputData = [
      [t.currentAge, `${result.currentAge} anos`, t.retirementAge, `${input.retirementAge} anos`],
      [t.monthlyContribution, formatCurrency(input.monthlyContribution, currency), t.initialSavings, formatCurrency(input.currentSavings, currency)],
      [t.desiredIncome, formatCurrency(input.desiredMonthlyIncome, currency), t.inflation, `${input.inflationRate}%`],
      [t.strategy, `Bitcoin (${cagrLabel})`, t.btcAllocation, `${input.btcAllocation}%`]
  ];
  
  autoTable(doc, {
      startY: yPos,
      head: [],
      body: inputData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', width: 45 }, 2: { fontStyle: 'bold', width: 45 } },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // --- Results Summary ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.results, 20, yPos);
  yPos += 8;
  
  const resultsData = [
      [t.wealthToday, formatCurrency(result.wealthNeededToday, currency)],
      [t.finalWealth, formatCurrency(result.finalWealth, currency)],
      [t.monthlyIncome, formatCurrency(result.monthlyPassiveIncome, currency)],
      [t.incomeGap, formatCurrency(result.incomeGap, currency)]
  ];
  
   autoTable(doc, {
      startY: yPos,
      head: [],
      body: resultsData,
      theme: 'grid',
      headStyles: { fillColor: [201, 121, 24] },
      styles: { fontSize: 11, cellPadding: 4 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;

  // --- Chart Image ---
  if (chartImage) {
      const imgProps = doc.getImageProperties(chartImage);
      const pdfWidth = pageWidth - 40;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      if (yPos + pdfHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
      }
      
      doc.addImage(chartImage, 'PNG', 20, yPos, pdfWidth, pdfHeight);
      yPos += pdfHeight + 15;
  }
  
  // --- Comparison Table ---
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.compTitle, 20, yPos);
  yPos += 8;
  
  // Determine Ages for PDF
  const apEndAge = result.btcBankruptcyAge ? `Idade ${result.btcBankruptcyAge}` : t.compPerpetual;
  const pensionEndAge = input.advanced.pensionMode === 'vitalicio' ? t.compPerpetual : (result.pensionBankruptcyAge ? `Idade ${result.pensionBankruptcyAge}` : t.compPerpetual);

  const compData = [
      [t.compMetric, t.compAposenta, t.compPension, t.compINSS],
      [t.compContrib, formatCurrency(comparisonData.aposenta.contrib, currency), formatCurrency(comparisonData.pension.contrib, currency), formatCurrency(comparisonData.inss.contrib, currency)],
      [t.compIncome, formatCurrency(comparisonData.aposenta.income, currency), formatCurrency(comparisonData.pension.income, currency), formatCurrency(comparisonData.inss.income, currency)],
      [t.compWealth, formatCurrency(comparisonData.aposenta.wealth, currency), formatCurrency(comparisonData.pension.wealth, currency), formatCurrency(comparisonData.inss.wealth, currency)],
      [t.compBankruptcyAge, apEndAge, pensionEndAge, t.compPerpetual]
  ];
  
  autoTable(doc, {
      startY: yPos,
      head: [compData[0]],
      body: compData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [17, 17, 17], textColor: [255, 255, 255] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`CryptoLife - ${t.disclaimer.substring(0, 50)}...`, 20, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  doc.save('cryptolife-plan.pdf');
};
