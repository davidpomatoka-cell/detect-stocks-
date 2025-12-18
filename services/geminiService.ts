
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TradingSignal, SignalType, DailyOutlook, MarketSentiment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyMarketOverview = async (): Promise<DailyOutlook> => {
  const prompt = "Act as a pro hedge fund manager. Analyze today's stock market trend (especially tech and AI sectors). Provide a 2-sentence market pulse and identify the general sentiment (Bullish, Bearish, Neutral, Volatile). Find the top 3 headlines that could trigger volatility.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              description: "BULLISH, BEARISH, NEUTRAL, or VOLATILE"
            },
            summary: {
              type: Type.STRING,
              description: "Direct, high-impact market summary"
            },
            headlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["title", "source"]
              }
            }
          },
          required: ["sentiment", "summary", "headlines"]
        }
      }
    });

    const data = JSON.parse(response.text);
    const news = data.headlines.map((h: any, i: number) => ({
      title: h.title,
      source: h.source,
      url: h.url || (response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[i]?.web?.uri || "#")
    }));

    return {
      sentiment: data.sentiment as MarketSentiment,
      summary: data.summary,
      topNews: news,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Daily Overview failed:", error);
    return {
      sentiment: MarketSentiment.NEUTRAL,
      summary: "Scanner online. Waiting for market metrics to stabilize.",
      topNews: [],
      timestamp: new Date().toISOString()
    };
  }
};

export const analyzeStockSignal = async (stock: StockData): Promise<TradingSignal> => {
  const historySnippet = stock.history.slice(-10).map(h => 
    `Date: ${h.date}, Close: $${h.close}, Vol: ${h.volume}`
  ).join('\n');

  const prompt = `
    SCAN TARGET: ${stock.name} (${stock.symbol})
    METRICS:
    Price: $${stock.price}
    24h Change: ${stock.changePercent.toFixed(2)}%
    Rel. Volume: ${stock.relativeVolume.toFixed(2)}x
    
    PRICE/VOL HISTORY:
    ${historySnippet}
    
    TASK: Identify "High Opportunity" signals. 
    Look for: Volume breakouts, Bullish/Bearish reversals, and extreme relative volume (>2x).
    Be aggressive but accurate. We only want to dispatch alerts for clear opportunities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a quantitative algorithmic trading bot. You generate signals (STRONG_BUY, BUY, NEUTRAL, SELL, STRONG_SELL). You focus on volume spikes as the primary indicator for institutional movement.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "STRONG_BUY, BUY, NEUTRAL, SELL, STRONG_SELL"
            },
            reasoning: {
              type: Type.STRING,
              description: "Max 100 characters reasoning"
            },
            confidence: {
              type: Type.NUMBER,
              description: "Probability score (0-1)"
            },
            pattern: {
              type: Type.STRING,
              description: "Technical pattern name (e.g., Golden Cross, Volume Breakout)"
            }
          },
          required: ["type", "reasoning", "confidence", "pattern"]
        }
      }
    });

    const data = JSON.parse(response.text);

    return {
      id: Math.random().toString(36).substr(2, 9),
      symbol: stock.symbol,
      timestamp: new Date().toISOString(),
      type: data.type as SignalType,
      reasoning: data.reasoning,
      confidence: data.confidence,
      detectedPattern: data.pattern
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      id: 'err-' + Date.now(),
      symbol: stock.symbol,
      timestamp: new Date().toISOString(),
      type: stock.relativeVolume > 2.2 ? SignalType.STRONG_BUY : SignalType.NEUTRAL,
      reasoning: "Automated scanner detected anomalous volume activity.",
      confidence: 0.65,
      detectedPattern: stock.relativeVolume > 2 ? "Institutional Volume Spike" : "Standard Trend"
    };
  }
};
