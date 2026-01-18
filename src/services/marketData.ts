import { MarketData } from '../types';

// Fallback data in case API fails
const FALLBACK_DATA: MarketData = {
  bitcoin: {
    brl: 481222,
    usd: 82000,
    eur: 75000
  },
  rates: {
    usd_brl: 5.85,
    eur_brl: 6.15
  }
};

export const fetchMarketData = async (): Promise<MarketData> => {
  try {
    // Fetch Bitcoin prices
    const btcResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,brl,eur'
    );
    
    // Fetch Fiat Rates (USD/BRL, EUR/BRL) using a free API or deriving from BTC pairs
    // Using explicit rate API is better, but to keep it simple without API keys for forex:
    // We can derive implied rates from the BTC price difference which is accurate enough for this context
    // or fetch from an open exchange rate API. Let's use open-meteo or similar if possible, 
    // but Coingecko BTC pairs are a good proxy for "Crypto street rate".
    
    // Let's stick to Coingecko for BTC and derive rates to ensure consistency within the calculator
    
    if (!btcResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const btcData = await btcResponse.json();
    
    if (btcData && btcData.bitcoin) {
      const btc = btcData.bitcoin;
      
      // Derive rates
      const usd_brl = btc.brl / btc.usd;
      const eur_brl = btc.brl / btc.eur;

      return {
        bitcoin: {
          brl: btc.brl,
          usd: btc.usd,
          eur: btc.eur
        },
        rates: {
          usd_brl,
          eur_brl
        }
      };
    }
    
    return FALLBACK_DATA;
  } catch (error) {
    console.error("Failed to fetch market data, using fallback:", error);
    return FALLBACK_DATA;
  }
};

export const formatCurrency = (value: number, currency: string, compact = false): string => {
  return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : (currency === 'EUR' ? 'de-DE' : 'en-US'), {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: compact ? 0 : 2,
    minimumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
};
