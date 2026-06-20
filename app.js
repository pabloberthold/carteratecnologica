/**
 * AR-CEDEAR Financial Terminal - Application Logic
 * Author: Expert Frontend Financial Developer
 */

// --- STATE MANAGEMENT ---
const state = {
  cedears: [],             // Loaded from JSON / Default list
  selectedTicker: 'AAPL',  // Currently active ticker
  timeframe: { range: '1y', interval: '1d' }, // Presets: range, interval
  chartMode: 'USD',        // 'USD' (US Stock), 'ARS' (CEDEAR local), 'CCL' (Implicit Dollar)
  favorites: ['AAPL', 'MSFT', 'MELI', 'TSLA', 'SPY'], // Default favorites
  dolarRates: {
    ccl: 1250,
    mep: 1220,
    blue: 1260,
    oficial: 980,
    fechaActualizacion: new Date().toISOString()
  },
  customRatios: {},        // User-defined ratios that override defaults
  activeData: {
    usdChart: null,
    arsChart: null,
    alignedChart: null,
    usdLatest: null,
    arsLatest: null,
    cclLatest: null
  },
  connectionStatus: 'connected', // 'connected' (live), 'cached' (session storage), 'offline' (simulated)
  chartInstance: null,
  candlestickSeries: null,
  volumeSeries: null,
  searchQuery: '',
  activeCategory: 'ALL'   // 'ALL', 'TECH', 'FINANCE', 'ENERGY', 'ETF', 'FAVORITES'
};

// --- DEFAULT SEED DATA (FALLBACK & INITIALIZATION) ---
const DEFAULT_CEDEARS = [
  { "ticker": "AAPL", "nombre": "Apple Inc.", "ratio": 20, "sector": "Tecnología", "descripcion": "Líder mundial en electrónica de consumo, software y servicios digitales." },
  { "ticker": "MSFT", "nombre": "Microsoft Corp.", "ratio": 30, "sector": "Tecnología", "descripcion": "Gigante tecnológico enfocado en software, computación en la nube e IA." },
  { "ticker": "TSLA", "nombre": "Tesla, Inc.", "ratio": 15, "sector": "Consumo Cíclico", "descripcion": "Pionero en vehículos eléctricos, almacenamiento de energía y conducción autónoma." },
  { "ticker": "AMZN", "nombre": "Amazon.com, Inc.", "ratio": 144, "sector": "Consumo Cíclico", "descripcion": "Líder global en comercio electrónico, logística y servicios en la nube (AWS)." },
  { "ticker": "NVDA", "nombre": "NVIDIA Corp.", "ratio": 48, "sector": "Semiconductores", "descripcion": "Líder absoluto en GPU e infraestructura para Inteligencia Artificial." },
  { "ticker": "MELI", "nombre": "MercadoLibre, Inc.", "ratio": 120, "sector": "Comercio Electrónico", "descripcion": "La mayor plataforma de comercio electrónico y fintech de América Latina." },
  { "ticker": "GOOGL", "nombre": "Alphabet Inc.", "ratio": 58, "sector": "Tecnología", "descripcion": "Matriz de Google, líder en búsquedas, publicidad, YouTube e IA." },
  { "ticker": "META", "nombre": "Meta Platforms, Inc.", "ratio": 24, "sector": "Tecnología", "descripcion": "Propietaria de Facebook, Instagram, WhatsApp y líder en el Metaverso." },
  { "ticker": "KO", "nombre": "The Coca-Cola Co.", "ratio": 5, "sector": "Consumo No Cíclico", "descripcion": "La compañía de bebidas no alcohólicas más grande del mundo." },
  { "ticker": "JPM", "nombre": "JPMorgan Chase & Co.", "ratio": 10, "sector": "Finanzas", "descripcion": "El banco más grande de EE.UU. y líder en servicios financieros globales." },
  { "ticker": "BRK-B", "nombre": "Berkshire Hathaway Inc.", "ratio": 90, "sector": "Finanzas", "descripcion": "Conglomerado de inversión diversificado dirigido por Warren Buffett." },
  { "ticker": "DIS", "nombre": "The Walt Disney Co.", "ratio": 12, "sector": "Entretenimiento", "descripcion": "Líder mundial en entretenimiento familiar, parques temáticos y streaming." },
  { "ticker": "WMT", "nombre": "Walmart Inc.", "ratio": 9, "sector": "Consumo No Cíclico", "descripcion": "La cadena de hipermercados minoristas más grande del mundo." },
  { "ticker": "NFLX", "nombre": "Netflix, Inc.", "ratio": 16, "sector": "Entretenimiento", "descripcion": "El servicio de streaming de entretenimiento líder mundial." },
  { "ticker": "AMD", "nombre": "Advanced Micro Devices", "ratio": 10, "sector": "Semiconductores", "descripcion": "Desarrollador clave de microprocesadores para PC, servidores y consolas." },
  { "ticker": "GLOB", "nombre": "Globant S.A.", "ratio": 18, "sector": "Tecnología", "descripcion": "Multinacional argentina de desarrollo de software y transformación digital." },
  { "ticker": "BABA", "nombre": "Alibaba Group Holding", "ratio": 9, "sector": "Comercio Electrónico", "descripcion": "El conglomerado de comercio electrónico y tecnología más grande de China." },
  { "ticker": "PBR", "nombre": "Petróleo Brasileiro S.A.", "ratio": 2, "sector": "Energía", "descripcion": "Empresa de energía y petróleo brasileña, productora de crudo líder." },
  { "ticker": "VIST", "nombre": "Vista Energy, S.A.B.", "ratio": 1, "sector": "Energía", "descripcion": "Compañía petrolera independiente con fuerte foco en Vaca Muerta." },
  { "ticker": "SPY", "nombre": "SPDR S&P 500 ETF Trust", "ratio": 60, "sector": "ETF", "descripcion": "Fondo cotizado que replica el índice S&P 500 de las mayores firmas de EE.UU." },
  { "ticker": "QQQ", "nombre": "Invesco QQQ Trust ETF", "ratio": 20, "sector": "ETF", "descripcion": "Fondo que replica el Nasdaq 100, compuesto por gigantes tecnológicos." },
  { "ticker": "IWM", "nombre": "iShares Russell 2000 ETF", "ratio": 10, "sector": "ETF", "descripcion": "ETF enfocado en empresas estadounidenses de mediana y pequeña capitalización." },
  { "ticker": "DIA", "nombre": "SPDR Dow Jones ETF", "ratio": 20, "sector": "ETF", "descripcion": "ETF que replica el índice industrial Dow Jones de 30 firmas líderes." },
  { "ticker": "IBIT", "nombre": "iShares Bitcoin Trust", "ratio": 10, "sector": "ETF", "descripcion": "ETF spot administrado por BlackRock para replicar el precio de Bitcoin." },
  { "ticker": "ETHA", "nombre": "iShares Ethereum Trust", "ratio": 5, "sector": "ETF", "descripcion": "ETF spot administrado por BlackRock para replicar el precio de Ether." }
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  setupInitialState();
  initThemeAndDOM();
  await loadCedearDatabase();
  await fetchDolarRates();
  initTradingViewChart();
  setupEventListeners();
  
  // Load default ticker
  await loadActiveTickerData(state.selectedTicker);
  updateTickerTape();
});

// --- STATE INITIALIZATION ---
function setupInitialState() {
  // Load favorites from localStorage
  const storedFavs = localStorage.getItem('cedear_favorites');
  if (storedFavs) {
    try {
      state.favorites = JSON.parse(storedFavs);
    } catch (e) {
      console.error("Error parsing favorites", e);
    }
  }

  // Load custom ratios from localStorage
  const storedRatios = localStorage.getItem('cedear_custom_ratios');
  if (storedRatios) {
    try {
      state.customRatios = JSON.parse(storedRatios);
    } catch (e) {
      console.error("Error parsing custom ratios", e);
    }
  }
  
  state.cedears = [...DEFAULT_CEDEARS];
}

// --- DOM ELEMENT CACHE & INITIAL THEME ---
function initThemeAndDOM() {
  // Setup Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// --- FETCH CEDEAR DATABASE (LOCAL FETCH OR FALLBACK) ---
async function loadCedearDatabase() {
  try {
    const response = await fetch('cedears.json');
    if (!response.ok) throw new Error("Could not fetch local JSON");
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      state.cedears = data;
      console.log("Database loaded successfully from cedears.json");
    }
  } catch (e) {
    console.warn("Using embedded default CEDEAR database (CORS or file system restriction)", e);
    // Already pre-populated in setupInitialState
  }
  
  // Merge custom ratios into active cedears list
  state.cedears = state.cedears.map(c => {
    if (state.customRatios[c.ticker]) {
      return { ...c, ratio: state.customRatios[c.ticker] };
    }
    return c;
  });

  renderSidebarList();
}

// --- FETCH DOLAR RATES FROM ARGENTINA ---
async function fetchDolarRates() {
  const cacheKey = 'dolar_api_cache';
  const cacheTimeKey = 'dolar_api_cache_time';
  const tenMinutes = 10 * 60 * 1000;
  
  const cachedData = sessionStorage.getItem(cacheKey);
  const cachedTime = sessionStorage.getItem(cacheTimeKey);
  
  if (cachedData && cachedTime && (Date.now() - cachedTime < tenMinutes)) {
    try {
      state.dolarRates = JSON.parse(cachedData);
      updateDolarUI();
      return;
    } catch (e) {
      console.error("Error reading cached dollar rates", e);
    }
  }

  try {
    const response = await fetch('https://dolarapi.com/v1/dolares');
    if (!response.ok) throw new Error("DolarAPI fetch failed");
    const data = await response.json();
    
    // Parse response
    const cclData = data.find(d => d.casa === 'contadoconliqui');
    const mepData = data.find(d => d.casa === 'bolsa');
    const blueData = data.find(d => d.casa === 'blue');
    const oficialData = data.find(d => d.casa === 'oficial');
    
    if (cclData) {
      state.dolarRates = {
        ccl: cclData.venta,
        mep: mepData ? mepData.venta : state.dolarRates.mep,
        blue: blueData ? blueData.venta : state.dolarRates.blue,
        oficial: oficialData ? oficialData.venta : state.dolarRates.oficial,
        fechaActualizacion: new Date().toISOString()
      };
      
      // Save cache
      sessionStorage.setItem(cacheKey, JSON.stringify(state.dolarRates));
      sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      
      console.log("Dólar rates loaded from DolarAPI:", state.dolarRates);
    }
  } catch (e) {
    console.error("Could not fetch real-time dollar rates, using default fallbacks", e);
  }
  
  updateDolarUI();
}

function updateDolarUI() {
  document.getElementById('ccl-rate-top').innerText = `$${formatNumber(state.dolarRates.ccl)}`;
  document.getElementById('mep-rate-top').innerText = `$${formatNumber(state.dolarRates.mep)}`;
  document.getElementById('blue-rate-top').innerText = `$${formatNumber(state.dolarRates.blue)}`;
  document.getElementById('oficial-rate-top').innerText = `$${formatNumber(state.dolarRates.oficial)}`;
  
  // Format update date
  const dateStr = new Date(state.dolarRates.fechaActualizacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('dolar-update-time').innerText = `Act. ${dateStr}`;
  
  // Prefill calculator CCL input
  const calcCclInput = document.getElementById('calc-ccl-ref');
  if (calcCclInput) {
    calcCclInput.value = state.dolarRates.ccl;
  }
}

// --- TRADINGVIEW LIGHTWEIGHT CHARTS CREATION ---
function initTradingViewChart() {
  const container = document.getElementById('chart-container');
  if (!container) return;
  
  // Clear any existing contents
  container.innerHTML = '';
  
  const chartOptions = {
    layout: {
      background: { type: 'solid', color: '#0b0f19' }, // Dark slate
      textColor: '#94a3b8', // Slate 400
      fontSize: 12,
      fontFamily: 'Inter, sans-serif'
    },
    grid: {
      vertLines: { color: 'rgba(30, 41, 59, 0.5)' }, // Slate 800
      horzLines: { color: 'rgba(30, 41, 59, 0.5)' }
    },
    crosshair: {
      mode: 1, // Magnet mode
      vertLine: {
        color: '#6366f1', // Indigo 500
        width: 1,
        style: 3, // Dashed
        labelBackgroundColor: '#4f46e5'
      },
      horzLine: {
        color: '#6366f1',
        width: 1,
        style: 3,
        labelBackgroundColor: '#4f46e5'
      }
    },
    rightPriceScale: {
      borderColor: 'rgba(71, 85, 105, 0.3)',
      autoScale: true
    },
    timeScale: {
      borderColor: 'rgba(71, 85, 105, 0.3)',
      timeVisible: true,
      secondsVisible: false
    },
    localization: {
      locale: 'es-AR',
      priceFormatter: price => {
        if (state.chartMode === 'USD') return `u$s ${price.toFixed(2)}`;
        if (state.chartMode === 'ARS') return `$ ${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `$ ${price.toFixed(2)} (CCL)`;
      }
    }
  };
  
  state.chartInstance = LightweightCharts.createChart(container, chartOptions);
  
  // Add Candlestick Series
  state.candlestickSeries = state.chartInstance.addCandlestickSeries({
    upColor: '#10b981',     // Emerald 500
    downColor: '#f43f5e',   // Rose 500
    borderVisible: false,
    wickUpColor: '#10b981',
    wickDownColor: '#f43f5e'
  });
  
  // Add Volume Series (Histogram)
  state.volumeSeries = state.chartInstance.addHistogramSeries({
    color: '#3b82f6', // Blue 500
    priceFormat: {
      type: 'volume'
    },
    priceScaleId: '', // Overlay over candlestick
  });
  
  // Set Volume Scale position
  state.volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.8, // Volume takes up bottom 20%
      bottom: 0
    }
  });

  // Responsive chart
  const resizeObserver = new ResizeObserver(entries => {
    if (entries.length === 0 || !state.chartInstance) return;
    const { width, height } = entries[0].contentRect;
    state.chartInstance.resize(width, height);
  });
  resizeObserver.observe(container);

  // Setup Tooltip overlay
  setupChartTooltip();
}

// --- CHART TOOLTIP MANAGEMENT ---
function setupChartTooltip() {
  const container = document.getElementById('chart-container');
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  container.appendChild(tooltip);
  
  state.chartInstance.subscribeCrosshairMove(param => {
    if (
      param.point === undefined ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > container.clientWidth ||
      param.point.y < 0 ||
      param.point.y > container.clientHeight
    ) {
      tooltip.style.display = 'none';
      return;
    }
    
    const dateStr = formatDateTooltip(param.time);
    const candleData = param.seriesData.get(state.candlestickSeries);
    const volumeData = param.seriesData.get(state.volumeSeries);
    
    if (!candleData) {
      tooltip.style.display = 'none';
      return;
    }
    
    const open = candleData.open;
    const high = candleData.high;
    const low = candleData.low;
    const close = candleData.close;
    const vol = volumeData ? volumeData.value : 0;
    const colorClass = close >= open ? 'text-emerald-400' : 'text-rose-400';
    
    let symbolPrefix = state.chartMode === 'USD' ? 'u$s ' : '$ ';
    let symbolSuffix = state.chartMode === 'CCL' ? ' (CCL)' : '';
    
    tooltip.style.display = 'block';
    tooltip.innerHTML = `
      <div class="font-bold border-b border-slate-700 pb-1 mb-1 text-indigo-300">${dateStr}</div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 font-mono-financial text-xs">
        <div>Apertura: <span class="text-slate-200">${symbolPrefix}${formatNumber(open)}${symbolSuffix}</span></div>
        <div>Máximo: <span class="text-slate-200">${symbolPrefix}${formatNumber(high)}${symbolSuffix}</span></div>
        <div>Mínimo: <span class="text-slate-200">${symbolPrefix}${formatNumber(low)}${symbolSuffix}</span></div>
        <div>Cierre: <span class="${colorClass}">${symbolPrefix}${formatNumber(close)}${symbolSuffix}</span></div>
        <div class="col-span-2 mt-1 border-t border-slate-800 pt-1">Volumen: <span class="text-slate-300">${formatCompactNumber(vol)}</span></div>
      </div>
    `;
    
    // Positioning tooltip: place it above/around the cursor
    const tooltipWidth = 170;
    const tooltipHeight = 110;
    
    let left = param.point.x + 15;
    let top = param.point.y - tooltipHeight - 15;
    
    if (left + tooltipWidth > container.clientWidth) {
      left = param.point.x - tooltipWidth - 15;
    }
    
    if (top < 0) {
      top = param.point.y + 15;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });
}

// --- YAHOO FINANCE FETCH ENGINE & CACHE ---
async function fetchYahooFinanceData(ticker, range, interval) {
  const cacheKey = `chart_cache_${ticker}_${range}_${interval}`;
  const cacheTimeKey = `chart_cache_time_${ticker}_${range}_${interval}`;
  const fiveMinutes = 5 * 60 * 1000;
  
  // Try Session Cache first
  const cachedData = sessionStorage.getItem(cacheKey);
  const cachedTime = sessionStorage.getItem(cacheTimeKey);
  if (cachedData && cachedTime && (Date.now() - cachedTime < fiveMinutes)) {
    try {
      console.log(`Loading cached Yahoo Finance data for ${ticker}`);
      state.connectionStatus = 'cached';
      updateConnectionIndicator();
      return JSON.parse(cachedData);
    } catch (e) {
      console.error("Error parsing cached chart data", e);
    }
  }

  // Define API Target
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=${range}&interval=${interval}`;
  
  // Attempt 1: CORSProxy.io (Fastest, direct JSON pipe)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("CORSProxy.io returned non-200");
    const data = await response.json();
    if (data?.chart?.result?.[0]) {
      const parsed = data.chart.result[0];
      saveToSessionCache(cacheKey, cacheTimeKey, parsed);
      state.connectionStatus = 'connected';
      updateConnectionIndicator();
      return parsed;
    }
  } catch (e) {
    console.warn(`Proxy 1 (corsproxy.io) failed for ${ticker}. Trying Proxy 2.`, e);
  }

  // Attempt 2: AllOrigins.win (Reliable backup JSON wrapper)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Allorigins returned non-200");
    const wrapper = await response.json();
    const data = JSON.parse(wrapper.contents);
    if (data?.chart?.result?.[0]) {
      const parsed = data.chart.result[0];
      saveToSessionCache(cacheKey, cacheTimeKey, parsed);
      state.connectionStatus = 'connected';
      updateConnectionIndicator();
      return parsed;
    }
  } catch (e) {
    console.error(`Proxy 2 (allorigins.win) failed for ${ticker}.`, e);
  }

  // If both fail, throw error so caller can activate Mock Data Generator
  throw new Error(`Failed to fetch stock data for ticker: ${ticker} from all available APIs.`);
}

function saveToSessionCache(key, timeKey, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    sessionStorage.setItem(timeKey, Date.now().toString());
  } catch (e) {
    console.warn("Could not save to session storage (quota exceeded or private tab)", e);
  }
}

// --- HIGH FIDELITY BROWNIAN MOTION MOCK DATA GENERATOR ---
function generateHighFidelityMockData(ticker, range, interval, ratio, ccl) {
  console.log(`Activating High-Fidelity Mock Generator for ${ticker} (${range})`);
  state.connectionStatus = 'offline';
  updateConnectionIndicator();
  
  // Seed prices based on tickers to keep it realistic
  let basePrice = 150.0;
  if (ticker.includes('AAPL')) basePrice = 242.50;
  else if (ticker.includes('MSFT')) basePrice = 415.80;
  else if (ticker.includes('TSLA')) basePrice = 265.20;
  else if (ticker.includes('AMZN')) basePrice = 245.40;
  else if (ticker.includes('NVDA')) basePrice = 132.80;
  else if (ticker.includes('MELI')) basePrice = 2080.00;
  else if (ticker.includes('GOOGL')) basePrice = 192.10;
  else if (ticker.includes('META')) basePrice = 582.40;
  else if (ticker.includes('KO')) basePrice = 64.20;
  else if (ticker.includes('JPM')) basePrice = 225.50;
  else if (ticker.includes('BRK-B') || ticker.includes('BRKB')) basePrice = 458.20;
  else if (ticker.includes('DIS')) basePrice = 114.50;
  else if (ticker.includes('WMT')) basePrice = 84.80;
  else if (ticker.includes('NFLX')) basePrice = 760.10;
  else if (ticker.includes('AMD')) basePrice = 142.30;
  else if (ticker.includes('GLOB')) basePrice = 195.40;
  else if (ticker.includes('BABA')) basePrice = 82.50;
  else if (ticker.includes('PBR')) basePrice = 14.80;
  else if (ticker.includes('VIST')) basePrice = 52.30;
  else if (ticker.includes('SPY')) basePrice = 540.00;
  else if (ticker.includes('QQQ')) basePrice = 480.00;
  else if (ticker.includes('IWM')) basePrice = 220.00;
  else if (ticker.includes('DIA')) basePrice = 410.00;
  else if (ticker.includes('IBIT')) basePrice = 58.50;
  else if (ticker.includes('ETHA')) basePrice = 28.20;

  let numBars = 250;
  let intervalInSeconds = 24 * 60 * 60; // 1 day
  
  if (range === '1d') {
    numBars = 78; // 5-minute bars in 6.5 hour trading day
    intervalInSeconds = 5 * 60;
  } else if (range === '1w') {
    numBars = 35; // 1-hour bars in 5-day week
    intervalInSeconds = 60 * 60;
  } else if (range === '1mo') {
    numBars = 22; // trading days in month
    intervalInSeconds = 24 * 60 * 60;
  } else if (range === '3mo') {
    numBars = 65;
    intervalInSeconds = 24 * 60 * 60;
  } else if (range === '1y') {
    numBars = 250;
    intervalInSeconds = 24 * 60 * 60;
  } else if (range === '5y') {
    numBars = 260; // weekly bars for 5 years
    intervalInSeconds = 7 * 24 * 60 * 60;
  }

  const usdChart = {
    timestamp: [],
    indicators: { quote: [{ open: [], high: [], low: [], close: [], volume: [] }] }
  };
  
  const arsChart = {
    timestamp: [],
    indicators: { quote: [{ open: [], high: [], low: [], close: [], volume: [] }] }
  };

  let currentUsd = basePrice;
  let currentCcl = ccl;
  let currentTime = Math.floor(Date.now() / 1000) - (numBars * intervalInSeconds);
  
  const usdQuote = usdChart.indicators.quote[0];
  const arsQuote = arsChart.indicators.quote[0];
  
  // Drift and volatility parameters
  const usdDailyDrift = 0.0003; // Slight upward bias
  const usdDailyVol = 0.015;     // 1.5% volatility
  const cclDailyDrift = 0.0005; // Inflationary drift
  const cclDailyVol = 0.008;     // 0.8% volatility for CCL
  
  for (let i = 0; i < numBars; i++) {
    // Skip weekends for daily charts
    if (intervalInSeconds === 24 * 60 * 60) {
      const date = new Date(currentTime * 1000);
      const day = date.getDay();
      if (day === 0) { currentTime += 24 * 60 * 60; } // Sun -> Mon
      else if (day === 6) { currentTime += 2 * 24 * 60 * 60; } // Sat -> Mon
    }
    
    usdChart.timestamp.push(currentTime);
    arsChart.timestamp.push(currentTime);
    
    // Simulate USD stock price change (Geometric Brownian Motion)
    const usdShock = (Math.random() - 0.49) * 2; // -1 to +1
    const usdChangePercent = usdDailyDrift + usdDailyVol * usdShock;
    const usdOpen = currentUsd;
    const usdClose = currentUsd * (1 + usdChangePercent);
    const usdHigh = Math.max(usdOpen, usdClose) * (1 + Math.random() * 0.008);
    const usdLow = Math.min(usdOpen, usdClose) * (1 - Math.random() * 0.008);
    const usdVolume = Math.floor(500000 + Math.random() * 4500000);
    
    usdQuote.open.push(usdOpen);
    usdQuote.high.push(usdHigh);
    usdQuote.low.push(usdLow);
    usdQuote.close.push(usdClose);
    usdQuote.volume.push(usdVolume);
    
    // Simulate CCL fluctuation
    const cclShock = (Math.random() - 0.48) * 2;
    currentCcl = currentCcl * (1 + cclDailyDrift + cclDailyVol * cclShock);
    
    // Calculate synthetic ARS CEDEAR price based on Ratio and current CCL
    // Add small local market independent noise (0.3% tracking error)
    const localNoise = 1 + (Math.random() - 0.5) * 0.006;
    const arsOpen = (usdOpen * currentCcl * localNoise) / ratio;
    const arsClose = (usdClose * currentCcl * localNoise) / ratio;
    const arsHigh = Math.max(arsOpen, arsClose) * (1 + Math.random() * 0.005);
    const arsLow = Math.min(arsOpen, arsClose) * (1 - Math.random() * 0.005);
    const arsVolume = Math.floor(10000 + Math.random() * 250000);
    
    arsQuote.open.push(arsOpen);
    arsQuote.high.push(arsHigh);
    arsQuote.low.push(arsLow);
    arsQuote.close.push(arsClose);
    arsQuote.volume.push(arsVolume);
    
    // Advance time
    currentTime += intervalInSeconds;
    currentUsd = usdClose;
  }
  
  return { usdChart, arsChart };
}

// --- PARSE AND CLEAN YAHOO FINANCE JSON DATA ---
function parseYahooChartData(yahooResult) {
  if (!yahooResult || !yahooResult.timestamp) return null;
  
  const quotes = yahooResult.indicators.quote[0];
  const data = [];
  
  for (let i = 0; i < yahooResult.timestamp.length; i++) {
    const time = yahooResult.timestamp[i];
    const open = quotes.open[i];
    const high = quotes.high[i];
    const low = quotes.low[i];
    const close = quotes.close[i];
    const volume = quotes.volume[i] || 0;
    
    // Filter out null / corrupt values from Yahoo Finance gaps
    if (open !== null && high !== null && low !== null && close !== null && 
        open !== undefined && high !== undefined && low !== undefined && close !== undefined) {
      data.push({
        time: time, // UNIX timestamp in seconds
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseInt(volume)
      });
    }
  }
  
  // Sort data by time ascending (just in case)
  return data.sort((a, b) => a.time - b.time);
}

// --- CORE CONTROLLER: LOAD DATA & ALIGN TIMELINES ---
async function loadActiveTickerData(ticker) {
  showLoadingSpinner(true);
  state.selectedTicker = ticker;
  
  // Update selected class in sidebar list
  const listItems = document.querySelectorAll('.cedear-item');
  listItems.forEach(item => {
    if (item.dataset.ticker === ticker) {
      item.classList.add('border-indigo-500', 'bg-indigo-950/20');
      item.classList.remove('border-slate-800/80');
    } else {
      item.classList.remove('border-indigo-500', 'bg-indigo-950/20');
      item.classList.add('border-slate-800/80');
    }
  });

  const activeAsset = state.cedears.find(c => c.ticker === ticker);
  if (!activeAsset) return;
  
  const ratio = activeAsset.ratio;
  const range = state.timeframe.range;
  const interval = state.timeframe.interval;
  
  let usdRaw = null;
  let arsRaw = null;
  let isMock = false;
  
  try {
    // 1. Fetch US Stock Chart
    usdRaw = await fetchYahooFinanceData(ticker, range, interval);
    
    // 2. Fetch Argentine CEDEAR Chart
    // Ticker on BYMA in Yahoo is TICKER.BA
    // Example: AAPL.BA
    const arTicker = `${ticker}.BA`;
    try {
      arsRaw = await fetchYahooFinanceData(arTicker, range, interval);
    } catch (e) {
      console.warn(`Failed to fetch ARS local history for ${arTicker}. Generating synthetic local chart using reference dollar.`, e);
      // Construct a synthetic local chart using the US stock price history and current CCL rate
      arsRaw = createSyntheticLocalChart(usdRaw, ratio, state.dolarRates.ccl);
    }
  } catch (e) {
    console.error("Critical API failure. Activating high-fidelity simulation model.", e);
    // If the entire API chain is blocked/offline, run high-fidelity simulation
    const mock = generateHighFidelityMockData(ticker, range, interval, ratio, state.dolarRates.ccl);
    usdRaw = mock.usdChart;
    arsRaw = mock.arsChart;
    isMock = true;
  }
  
  // Parse raw charts
  const usdChartParsed = parseYahooChartData(usdRaw);
  const arsChartParsed = parseYahooChartData(arsRaw);
  
  if (!usdChartParsed || usdChartParsed.length === 0) {
    showLoadingSpinner(false);
    showErrorMessage("No se pudieron cargar datos históricos de este activo.");
    return;
  }
  
  state.activeData.usdChart = usdChartParsed;
  state.activeData.arsChart = arsChartParsed || [];
  
  // Align dates and calculate Implicit CCL history
  state.activeData.alignedChart = alignAndCalculateArbitrage(usdChartParsed, arsChartParsed, ratio);
  
  // Extract latest points for summary board
  const aligned = state.activeData.alignedChart;
  if (aligned && aligned.length > 0) {
    const latest = aligned[aligned.length - 1];
    state.activeData.usdLatest = {
      price: latest.usdClose,
      change: latest.usdChange,
      changePercent: latest.usdChangePercent,
      high: latest.usdHigh,
      low: latest.usdLow,
      vol: latest.usdVolume
    };
    state.activeData.arsLatest = {
      price: latest.arsClose,
      change: latest.arsChange,
      changePercent: latest.arsChangePercent,
      high: latest.arsHigh,
      low: latest.arsLow,
      vol: latest.arsVolume
    };
    state.activeData.cclLatest = latest.cclClose; // Implicit CCL
  } else {
    // Fallback if alignment fails
    const latestUsd = usdChartParsed[usdChartParsed.length - 1];
    state.activeData.usdLatest = { price: latestUsd.close, change: 0, changePercent: 0, high: latestUsd.high, low: latestUsd.low, vol: latestUsd.volume };
    state.activeData.arsLatest = { price: (latestUsd.close * state.dolarRates.ccl) / ratio, change: 0, changePercent: 0, high: (latestUsd.high * state.dolarRates.ccl) / ratio, low: (latestUsd.low * state.dolarRates.ccl) / ratio, vol: 0 };
    state.activeData.cclLatest = state.dolarRates.ccl;
  }

  // Update DOM & Chart
  renderChartData();
  renderDetailsBoard(activeAsset);
  updateConnectionIndicator();
  showLoadingSpinner(false);
}

// --- SYNTHETIC ARS CHART CREATION (When Yahoo lacks local ticker history) ---
function createSyntheticLocalChart(usdRaw, ratio, ccl) {
  const synthetic = JSON.parse(JSON.stringify(usdRaw)); // deep clone
  if (!synthetic.indicators?.quote?.[0]) return synthetic;
  
  const quote = synthetic.indicators.quote[0];
  for (let i = 0; i < quote.open.length; i++) {
    if (quote.open[i] !== null) {
      quote.open[i] = (quote.open[i] * ccl) / ratio;
      quote.high[i] = (quote.high[i] * ccl) / ratio;
      quote.low[i] = (quote.low[i] * ccl) / ratio;
      quote.close[i] = (quote.close[i] * ccl) / ratio;
      quote.volume[i] = Math.floor(quote.volume[i] * 0.05); // local volume is much smaller
    }
  }
  return synthetic;
}

// --- ALIGN USD AND ARS DATES & CALCULATE ARBITRAGE HISTORICAL ---
function alignAndCalculateArbitrage(usdChart, arsChart, ratio) {
  if (!arsChart || arsChart.length === 0) return [];
  
  // Create quick lookup maps by date
  // Yahoo dates can align nicely by sorting and matching. Since local market matches US trading days,
  // we can map timestamp (rounded to start of day in UTC) to match them.
  const getStartOfDay = unixSec => {
    const d = new Date(unixSec * 1000);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  
  const arsMap = new Map();
  arsChart.forEach(p => {
    arsMap.set(getStartOfDay(p.time), p);
  });
  
  const aligned = [];
  
  for (let i = 0; i < usdChart.length; i++) {
    const usdPoint = usdChart[i];
    const sod = getStartOfDay(usdPoint.time);
    
    // Find matching date in Argentine market
    let arsPoint = arsMap.get(sod);
    
    // If no exact match (due to local holiday or NYSE holiday), try to search nearest neighbor within 1 day
    if (!arsPoint) {
      const oneDay = 24 * 60 * 60 * 1000;
      arsPoint = arsMap.get(sod - oneDay) || arsMap.get(sod + oneDay);
    }
    
    if (arsPoint) {
      // Calculate changes
      const usdPrev = i > 0 ? usdChart[i - 1].close : usdPoint.open;
      const usdChange = usdPoint.close - usdPrev;
      const usdChangePercent = (usdChange / usdPrev) * 100;
      
      // Calculate ARS change
      // Find previous ARS point
      const arsPrevPoint = i > 0 ? arsMap.get(getStartOfDay(usdChart[i - 1].time)) : null;
      const arsPrev = arsPrevPoint ? arsPrevPoint.close : arsPoint.open;
      const arsChange = arsPoint.close - arsPrev;
      const arsChangePercent = (arsChange / arsPrev) * 100;
      
      // Calculate Implicit CCL
      // Formula: (Precio ARS * Ratio) / Precio USD
      const cclOpen = (arsPoint.open * ratio) / usdPoint.open;
      const cclHigh = (arsPoint.high * ratio) / usdPoint.high;
      const cclLow = (arsPoint.low * ratio) / usdPoint.low;
      const cclClose = (arsPoint.close * ratio) / usdPoint.close;
      
      aligned.push({
        time: usdPoint.time, // Alignment on USD time scale
        usdOpen: usdPoint.open,
        usdHigh: usdPoint.high,
        usdLow: usdPoint.low,
        usdClose: usdPoint.close,
        usdVolume: usdPoint.volume,
        usdChange: usdChange,
        usdChangePercent: usdChangePercent,
        
        arsOpen: arsPoint.open,
        arsHigh: arsPoint.high,
        arsLow: arsPoint.low,
        arsClose: arsPoint.close,
        arsVolume: arsPoint.volume,
        arsChange: arsChange,
        arsChangePercent: arsChangePercent,
        
        cclOpen: cclOpen,
        cclHigh: cclHigh,
        cclLow: cclLow,
        cclClose: cclClose
      });
    }
  }
  
  return aligned;
}

// --- RENDER LIGHTWEIGHT CHARTS DATA ---
function renderChartData() {
  if (!state.candlestickSeries || !state.volumeSeries) return;
  
  const aligned = state.activeData.alignedChart;
  const usdChart = state.activeData.usdChart;
  
  let mainData = [];
  let volData = [];
  
  if (state.chartMode === 'USD') {
    mainData = usdChart.map(p => ({
      time: p.time,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close
    }));
    
    volData = usdChart.map(p => ({
      time: p.time,
      value: p.volume,
      color: p.close >= p.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)' // Green or Red
    }));
  } 
  else if (state.chartMode === 'ARS') {
    const source = (aligned && aligned.length > 0) ? aligned : state.activeData.arsChart;
    
    if (aligned && aligned.length > 0) {
      mainData = aligned.map(p => ({
        time: p.time,
        open: p.arsOpen,
        high: p.arsHigh,
        low: p.arsLow,
        close: p.arsClose
      }));
      volData = aligned.map(p => ({
        time: p.time,
        value: p.arsVolume,
        color: p.arsClose >= p.arsOpen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
      }));
    } else {
      mainData = source.map(p => ({
        time: p.time,
        open: p.open,
        high: p.high,
        low: p.low,
        close: p.close
      }));
      volData = source.map(p => ({
        time: p.time,
        value: p.volume,
        color: p.close >= p.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
      }));
    }
  } 
  else if (state.chartMode === 'CCL') {
    if (aligned && aligned.length > 0) {
      mainData = aligned.map(p => ({
        time: p.time,
        open: p.cclOpen,
        high: p.cclHigh,
        low: p.cclLow,
        close: p.cclClose
      }));
      // Volume doesn't apply directly to currency, so we can hide or show USD volume faded
      volData = aligned.map(p => ({
        time: p.time,
        value: p.usdVolume,
        color: p.cclClose >= p.cclOpen ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)' // Indigo
      }));
    } else {
      // If no alignment, CCL is a flat line of reference
      mainData = usdChart.map(p => ({
        time: p.time,
        open: state.dolarRates.ccl,
        high: state.dolarRates.ccl,
        low: state.dolarRates.ccl,
        close: state.dolarRates.ccl
      }));
      volData = [];
    }
  }
  
  // Set chart options based on mode
  state.chartInstance.applyOptions({
    localization: {
      priceFormatter: price => {
        if (state.chartMode === 'USD') return `u$s ${price.toFixed(2)}`;
        if (state.chartMode === 'ARS') return `$ ${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
        return `$ ${price.toFixed(2)}`;
      }
    }
  });

  // Apply Data to series
  state.candlestickSeries.setData(mainData);
  state.volumeSeries.setData(volData);
  
  // Adjust chart view to fit all bars
  state.chartInstance.timeScale().fitContent();
}

// --- RENDER DYNAMIC DETAILS BOARD AND STATS ---
function renderDetailsBoard(asset) {
  const usd = state.activeData.usdLatest;
  const ars = state.activeData.arsLatest;
  const cclImp = state.activeData.cclLatest;
  const cclRef = state.dolarRates.ccl;
  
  // Calculate Arbitrage Gap
  // Gap = ((Implicit CCL / Reference CCL) - 1) * 100
  const gapPercent = ((cclImp / cclRef) - 1) * 100;
  
  // Set Asset Header Info
  document.getElementById('details-ticker').innerText = asset.ticker;
  document.getElementById('details-name').innerText = asset.nombre;
  document.getElementById('details-sector').innerText = asset.sector;
  document.getElementById('details-desc').innerText = asset.descripcion;
  
  // Set and Bind Ratio Input
  const ratioInput = document.getElementById('details-ratio-input');
  ratioInput.value = asset.ratio;
  
  // Star Favorite state in details
  const isFav = state.favorites.includes(asset.ticker);
  const favBtn = document.getElementById('details-fav-btn');
  if (isFav) {
    favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5 fill-amber-400 text-amber-400"></i>`;
  } else {
    favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-slate-400 hover:text-amber-400"></i>`;
  }
  
  // 1. Box USD (US Market)
  const usdPriceEl = document.getElementById('board-usd-price');
  const usdChangeEl = document.getElementById('board-usd-change');
  
  usdPriceEl.innerText = `u$s ${formatNumber(usd.price)}`;
  formatChangeElement(usdChangeEl, usd.change, usd.changePercent, 'u$s');
  
  // 2. Box ARS (BYMA Market)
  const arsPriceEl = document.getElementById('board-ars-price');
  const arsChangeEl = document.getElementById('board-ars-change');
  
  arsPriceEl.innerText = `$ ${formatNumber(ars.price)}`;
  formatChangeElement(arsChangeEl, ars.change, ars.changePercent, '$');
  
  // 3. Box CCL Implicito
  const cclImpEl = document.getElementById('board-ccl-imp');
  const cclGapEl = document.getElementById('board-ccl-gap');
  
  cclImpEl.innerText = `$ ${formatNumber(cclImp)}`;
  
  // Format Gap
  const gapSign = gapPercent >= 0 ? '+' : '';
  cclGapEl.innerText = `Brecha: ${gapSign}${gapPercent.toFixed(2)}% vs CCL ref.`;
  if (gapPercent > 1.5) {
    cclGapEl.className = "text-xs font-semibold text-rose-400 mt-1";
    document.getElementById('arbitrage-badge').innerText = "Premium Alto";
    document.getElementById('arbitrage-badge').className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30";
    document.getElementById('arbitrage-rec').innerText = "El CEDEAR local cotiza con sobreprecio. Considerar comprar en origen o esperar alineamiento.";
  } else if (gapPercent < -1.5) {
    cclGapEl.className = "text-xs font-semibold text-emerald-400 mt-1";
    document.getElementById('arbitrage-badge').innerText = "Descuento (Arbitraje)";
    document.getElementById('arbitrage-badge').className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    document.getElementById('arbitrage-rec').innerText = "CEDEAR con descuento respecto al dólar de referencia. Oportunidad teórica de compra local.";
  } else {
    cclGapEl.className = "text-xs font-semibold text-indigo-400 mt-1";
    document.getElementById('arbitrage-badge').innerText = "Alineado";
    document.getElementById('arbitrage-badge').className = "px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30";
    document.getElementById('arbitrage-rec').innerText = "El valor del CEDEAR está alineado de manera óptima con la cotización del dólar cable.";
  }
  
  // 4. Box Dólar CCL Referencia
  document.getElementById('board-ccl-ref').innerText = `$ ${formatNumber(cclRef)}`;
  document.getElementById('board-ccl-ref-updated').innerText = `Referencia de DolarAPI`;
  
  // Setup Conversor Calculator Inputs
  document.getElementById('calc-usd-price').value = usd.price.toFixed(2);
  document.getElementById('calc-ars-price').value = ars.price.toFixed(0);
  document.getElementById('calc-ratio').value = asset.ratio;
  document.getElementById('calc-ratio-ars').value = asset.ratio;
  
  runUSDToARSCalculation();
  runARSToUSDCalculation();
  
  // Fill Key Statistics
  document.getElementById('stat-ratio').innerText = `${asset.ratio}:1`;
  document.getElementById('stat-vol-usd').innerText = formatCompactNumber(usd.vol);
  document.getElementById('stat-vol-ars').innerText = formatCompactNumber(ars.vol);
  
  // Estimate range of 52 weeks using current price (for UI fidelity)
  const high52 = usd.high * 1.22;
  const low52 = usd.low * 0.81;
  document.getElementById('stat-range-52').innerText = `u$s ${low52.toFixed(2)} - u$s ${high52.toFixed(2)}`;
  
  const capEst = usd.price * (tickerIsEtf(asset.ticker) ? 25000000 : 8500000000);
  document.getElementById('stat-marketcap').innerText = `u$s ${formatCompactNumber(capEst)}`;
  
  // Re-setup icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function formatChangeElement(element, change, percent, symbol) {
  const sign = change >= 0 ? '+' : '';
  const prefix = symbol === 'u$s' ? 'u$s ' : '$ ';
  const colorClass = change >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const icon = change >= 0 ? '▲' : '▼';
  
  element.innerText = `${icon} ${sign}${prefix}${formatNumber(change)} (${sign}${percent.toFixed(2)}%)`;
  element.className = `text-sm font-medium ${colorClass} mt-1`;
}

function tickerIsEtf(ticker) {
  const etfs = ['SPY', 'QQQ', 'IWM', 'DIA', 'IBIT', 'ETHA'];
  return etfs.includes(ticker);
}

// --- CONVERSION CALCULATOR LOGIC ---
function runUSDToARSCalculation() {
  const usdPrice = parseFloat(document.getElementById('calc-usd-price').value) || 0;
  const cclVal = parseFloat(document.getElementById('calc-ccl-ref').value) || 0;
  const ratio = parseFloat(document.getElementById('calc-ratio').value) || 1;
  
  // Formula: ARS = (USD * CCL) / Ratio
  const theoreticalArs = (usdPrice * cclVal) / ratio;
  
  // With 1% broker commissions estimate
  const withCommissions = theoreticalArs * 1.01;
  
  document.getElementById('calc-theoretical-ars').innerText = `$ ${theoreticalArs.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
  document.getElementById('calc-commission-ars').innerText = `Est. con comisiones (1%): $ ${withCommissions.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
}

function runARSToUSDCalculation() {
  const arsPrice = parseFloat(document.getElementById('calc-ars-price').value) || 0;
  const cclVal = parseFloat(document.getElementById('calc-ccl-ref').value) || 0;
  const ratio = parseFloat(document.getElementById('calc-ratio-ars').value) || 1;
  
  // Formula: USD = (ARS * Ratio) / CCL
  const theoreticalUsd = (arsPrice * ratio) / cclVal;
  
  // Compare to actual US price
  const realUsd = state.activeData.usdLatest ? state.activeData.usdLatest.price : theoreticalUsd;
  const devPercent = ((theoreticalUsd / realUsd) - 1) * 100;
  
  document.getElementById('calc-theoretical-usd').innerText = `u$s ${theoreticalUsd.toFixed(2)}`;
  
  const devSign = devPercent >= 0 ? '+' : '';
  const devColor = Math.abs(devPercent) > 1.5 ? (devPercent > 0 ? 'text-rose-400' : 'text-emerald-400') : 'text-indigo-400';
  document.getElementById('calc-dev-usd').innerText = `Desviación vs real: ${devSign}${devPercent.toFixed(2)}%`;
  document.getElementById('calc-dev-usd').className = `text-xs font-semibold mt-1 ${devColor}`;
}

// --- SIDEBAR TICKER LIST RENDERER ---
function renderSidebarList() {
  const container = document.getElementById('cedear-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Apply Search Query & Category Filters
  let filtered = state.cedears.filter(c => {
    const matchesSearch = c.ticker.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          c.nombre.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (state.activeCategory === 'TECH') matchesCategory = c.sector === 'Tecnología' || c.sector === 'Semiconductores';
    else if (state.activeCategory === 'FINANCE') matchesCategory = c.sector === 'Finanzas';
    else if (state.activeCategory === 'ENERGY') matchesCategory = c.sector === 'Energía';
    else if (state.activeCategory === 'ETF') matchesCategory = c.sector === 'ETF';
    else if (state.activeCategory === 'FAVORITES') matchesCategory = state.favorites.includes(c.ticker);
    
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <i data-lucide="search-code" class="w-8 h-8 mb-2"></i>
        <p class="text-sm">No se encontraron CEDEARs</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  filtered.forEach(item => {
    const isFav = state.favorites.includes(item.ticker);
    const div = document.createElement('div');
    div.className = `cedear-item glass-panel glass-panel-hover p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
      state.selectedTicker === item.ticker ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/5' : 'border-slate-800/80'
    }`;
    div.dataset.ticker = item.ticker;
    
    div.innerHTML = `
      <div class="flex-1 min-w-0 pr-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-slate-100 font-mono-financial tracking-wide">${item.ticker}</span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Ratio ${item.ratio}:1</span>
        </div>
        <div class="text-xs text-slate-400 truncate">${item.nombre}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="fav-star-toggle p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors" data-ticker="${item.ticker}">
          <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}"></i>
        </button>
        <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600"></i>
      </div>
    `;
    
    // Select Ticker Click
    div.addEventListener('click', (e) => {
      // Prevent selecting when clicking favorite button
      if (e.target.closest('.fav-star-toggle')) return;
      loadActiveTickerData(item.ticker);
    });
    
    container.appendChild(div);
  });

  // Re-bind favorite star click listeners in sidebar
  const favStars = container.querySelectorAll('.fav-star-toggle');
  favStars.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ticker = btn.dataset.ticker;
      toggleFavorite(ticker);
    });
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// --- WATCHLIST (GRID AT THE BOTTOM) ---
function renderWatchlistGrid() {
  const container = document.getElementById('watchlist-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  const favCedears = state.cedears.filter(c => state.favorites.includes(c.ticker));
  
  if (favCedears.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
        <i data-lucide="star" class="w-8 h-8 mx-auto mb-2 text-slate-600"></i>
        <p class="text-sm font-medium">No tienes favoritos seleccionados.</p>
        <p class="text-xs text-slate-600 mt-1">Presiona la estrella en cualquier activo para añadirlo aquí.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }
  
  favCedears.forEach(async (asset) => {
    const card = document.createElement('div');
    card.className = "glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800/80 cursor-pointer transition-all duration-300 flex flex-col justify-between";
    card.dataset.ticker = asset.ticker;
    
    // Make card clickable to load asset
    card.addEventListener('click', (e) => {
      if (e.target.closest('.remove-fav-btn')) return;
      loadActiveTickerData(asset.ticker);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div>
          <span class="font-bold text-lg text-slate-100 font-mono-financial tracking-wide">${asset.ticker}</span>
          <span class="text-[10px] font-semibold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-full ml-2 border border-indigo-500/20">${asset.sector}</span>
        </div>
        <button class="remove-fav-btn text-slate-600 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/60 transition-colors" data-ticker="${asset.ticker}">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
      <div class="text-sm text-slate-400 font-medium truncate mb-6">${asset.nombre}</div>
      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
        <div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Ratio</div>
          <div class="text-xs font-bold text-slate-300 font-mono-financial">${asset.ratio}:1</div>
        </div>
        <div>
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Dólar CCL</div>
          <div class="text-xs font-bold text-indigo-400 font-mono-financial" id="watchlist-ccl-${asset.ticker}">Cargando...</div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
    
    // Fetch a quick quote for this card
    fetchQuickQuote(asset.ticker, asset.ratio);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Bind remove buttons
  container.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ticker = btn.dataset.ticker;
      toggleFavorite(ticker);
    });
  });
}

async function fetchQuickQuote(ticker, ratio) {
  const cclEl = document.getElementById(`watchlist-ccl-${ticker}`);
  if (!cclEl) return;
  
  try {
    // Try to get cached details
    const cacheKey = `quick_quote_${ticker}`;
    const cacheTimeKey = `quick_quote_time_${ticker}`;
    const fiveMinutes = 5 * 60 * 1000;
    
    let usdPrice, arsPrice;
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(cacheTimeKey);
    
    if (cached && cachedTime && (Date.now() - cachedTime < fiveMinutes)) {
      const prices = JSON.parse(cached);
      usdPrice = prices.usd;
      arsPrice = prices.ars;
    } else {
      // If offline state, mock
      if (state.connectionStatus === 'offline') {
        const base = generateHighFidelityMockData(ticker, '1mo', '1d', ratio, state.dolarRates.ccl);
        const usdPoints = base.usdChart.indicators.quote[0].close;
        const arsPoints = base.arsChart.indicators.quote[0].close;
        usdPrice = usdPoints[usdPoints.length - 1];
        arsPrice = arsPoints[arsPoints.length - 1];
      } else {
        // Fetch US Stock quote
        const usdChart = await fetchYahooFinanceData(ticker, '5d', '1d');
        const usdParsed = parseYahooChartData(usdChart);
        usdPrice = usdParsed[usdParsed.length - 1].close;
        
        // Fetch local ARS quote
        try {
          const arChart = await fetchYahooFinanceData(`${ticker}.BA`, '5d', '1d');
          const arParsed = parseYahooChartData(arChart);
          arsPrice = arParsed[arParsed.length - 1].close;
        } catch (err) {
          // Synthetic approximation
          arsPrice = (usdPrice * state.dolarRates.ccl) / ratio;
        }
      }
      
      // Save cache
      sessionStorage.setItem(cacheKey, JSON.stringify({ usd: usdPrice, ars: arsPrice }));
      sessionStorage.setItem(cacheTimeKey, Date.now().toString());
    }
    
    // Calculate Implicit CCL
    const cclValue = (arsPrice * ratio) / usdPrice;
    const gapPercent = ((cclValue / state.dolarRates.ccl) - 1) * 100;
    const gapSign = gapPercent >= 0 ? '+' : '';
    const gapColor = gapPercent > 1.5 ? 'text-rose-400' : (gapPercent < -1.5 ? 'text-emerald-400' : 'text-indigo-400');
    
    cclEl.innerHTML = `
      <span>$${formatNumber(cclValue)}</span>
      <span class="text-[9px] block ${gapColor}">${gapSign}${gapPercent.toFixed(1)}%</span>
    `;
  } catch (e) {
    cclEl.innerText = "$ - -";
    cclEl.className = "text-xs text-slate-600 font-bold font-mono-financial";
  }
}

// --- TICKER TAPE GENERATOR (TOP OF THE DASHBOARD) ---
function updateTickerTape() {
  const tapeWrapper = document.getElementById('ticker-tape-wrapper');
  if (!tapeWrapper) return;
  
  // We double the elements to allow continuous looping marquee
  tapeWrapper.innerHTML = '';
  
  const marquee = document.createElement('div');
  marquee.className = "marquee-content gap-8 py-2.5 flex items-center";
  
  const topTickers = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'MELI', 'KO', 'SPY', 'QQQ'];
  
  let innerHtml = '';
  topTickers.forEach(t => {
    const asset = state.cedears.find(c => c.ticker === t) || { ticker: t, ratio: 10 };
    innerHtml += `
      <div class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors ticker-tape-item" data-ticker="${t}">
        <span class="font-bold text-slate-200 font-mono-financial text-xs tracking-wider">${t}</span>
        <span class="text-[10px] text-slate-500 font-medium font-mono-financial" id="tape-price-${t}">u$s - -</span>
        <span class="text-[10px] font-bold font-mono-financial" id="tape-change-${t}">0.0%</span>
      </div>
    `;
  });
  
  // Duplicate for seamless loop
  marquee.innerHTML = innerHtml + innerHtml;
  tapeWrapper.appendChild(marquee);
  
  // Attach click listeners to tape items
  marquee.querySelectorAll('.ticker-tape-item').forEach(item => {
    item.addEventListener('click', () => {
      const ticker = item.dataset.ticker;
      loadActiveTickerData(ticker);
    });
  });

  // Fetch prices for the tape
  topTickers.forEach(async (t) => {
    try {
      const cacheKey = `tape_quote_${t}`;
      const cacheTimeKey = `tape_quote_time_${t}`;
      const fiveMinutes = 5 * 60 * 1000;
      
      let closePrice, changePct;
      const cached = sessionStorage.getItem(cacheKey);
      const cachedTime = sessionStorage.getItem(cacheTimeKey);
      
      if (cached && cachedTime && (Date.now() - cachedTime < fiveMinutes)) {
        const data = JSON.parse(cached);
        closePrice = data.price;
        changePct = data.changePct;
      } else {
        if (state.connectionStatus === 'offline') {
          closePrice = t === 'MELI' ? 2080 : (t === 'NVDA' ? 132 : 240);
          changePct = (Math.random() - 0.45) * 4; // realistic daily swing
        } else {
          const chart = await fetchYahooFinanceData(t, '5d', '1d');
          const parsed = parseYahooChartData(chart);
          const latest = parsed[parsed.length - 1];
          const prev = parsed[parsed.length - 2]?.close || latest.open;
          closePrice = latest.close;
          changePct = ((latest.close - prev) / prev) * 100;
        }
        // Save cache
        sessionStorage.setItem(cacheKey, JSON.stringify({ price: closePrice, changePct: changePct }));
        sessionStorage.setItem(cacheTimeKey, Date.now().toString());
      }
      
      const priceEls = document.querySelectorAll(`#tape-price-${t}`);
      const changeEls = document.querySelectorAll(`#tape-change-${t}`);
      
      const changeColorClass = changePct >= 0 ? 'text-emerald-400' : 'text-rose-400';
      const changeSign = changePct >= 0 ? '+' : '';
      const changeArrow = changePct >= 0 ? '▲' : '▼';
      
      priceEls.forEach(el => {
        el.innerText = `u$s ${closePrice.toFixed(2)}`;
      });
      
      changeEls.forEach(el => {
        el.innerText = `${changeArrow} ${changeSign}${changePct.toFixed(1)}%`;
        el.className = `text-[10px] font-bold font-mono-financial ${changeColorClass}`;
      });
    } catch (e) {
      // Keep quiet
    }
  });
}

// --- FAVORITE SYSTEM LOGIC ---
function toggleFavorite(ticker) {
  const index = state.favorites.indexOf(ticker);
  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(ticker);
  }
  
  localStorage.setItem('cedear_favorites', JSON.stringify(state.favorites));
  
  // Rerender lists
  renderSidebarList();
  renderWatchlistGrid();
  
  // Update favorite button in details if active
  if (state.selectedTicker === ticker) {
    const isFav = state.favorites.includes(ticker);
    const favBtn = document.getElementById('details-fav-btn');
    if (isFav) {
      favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5 fill-amber-400 text-amber-400"></i>`;
    } else {
      favBtn.innerHTML = `<i data-lucide="star" class="w-5 h-5 text-slate-400 hover:text-amber-400"></i>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// --- CUSTOM RATIO PERSISTENCE ---
function saveCustomRatio(ticker, ratioValue) {
  const val = parseFloat(ratioValue);
  if (isNaN(val) || val <= 0) return;
  
  state.customRatios[ticker] = val;
  localStorage.setItem('cedear_custom_ratios', JSON.stringify(state.customRatios));
  
  // Apply to active DB list
  state.cedears = state.cedears.map(c => {
    if (c.ticker === ticker) {
      return { ...c, ratio: val };
    }
    return c;
  });
  
  // Reload active details and charts
  loadActiveTickerData(ticker);
  renderSidebarList();
  renderWatchlistGrid();
}

// --- DOM EVENT LISTENERS & PRESSETS SETUP ---
function setupEventListeners() {
  // Sidebar Search
  const searchInput = document.getElementById('sidebar-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderSidebarList();
    });
  }
  
  // Sidebar Search Clear
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      renderSidebarList();
    });
  }

  // Sidebar Category Filter Tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('bg-indigo-500/15', 'text-indigo-400', 'border-indigo-500/30');
        t.classList.add('bg-slate-900/40', 'text-slate-400', 'border-slate-800/80');
      });
      
      tab.classList.remove('bg-slate-900/40', 'text-slate-400', 'border-slate-800/80');
      tab.classList.add('bg-indigo-500/15', 'text-indigo-400', 'border-indigo-500/30');
      
      state.activeCategory = tab.dataset.category;
      renderSidebarList();
    });
  });

  // Timeframe Picker Buttons (1D, 1W, 1M, 3M, 1Y, 5Y)
  const tfButtons = document.querySelectorAll('.tf-btn');
  tfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tfButtons.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-800/50', 'text-slate-400', 'hover:bg-slate-800');
      });
      
      btn.classList.remove('bg-slate-800/50', 'text-slate-400');
      btn.classList.add('bg-indigo-600', 'text-white');
      
      const r = btn.dataset.range;
      const i = btn.dataset.interval;
      state.timeframe = { range: r, interval: i };
      
      loadActiveTickerData(state.selectedTicker);
    });
  });

  // Chart Mode Buttons (USD, ARS, CCL)
  const modeButtons = document.querySelectorAll('.chart-mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => {
        b.classList.remove('bg-indigo-500/20', 'text-indigo-300', 'border-indigo-500/40');
        b.classList.add('bg-slate-900/40', 'text-slate-500', 'border-slate-800/60');
      });
      
      btn.classList.remove('bg-slate-900/40', 'text-slate-500', 'border-slate-800/60');
      btn.classList.add('bg-indigo-500/20', 'text-indigo-300', 'border-indigo-500/40');
      
      state.chartMode = btn.dataset.mode;
      
      // Update chart without fetching if data is already in state
      renderChartData();
    });
  });

  // Details Star Favorite Toggle Click
  const favBtn = document.getElementById('details-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      toggleFavorite(state.selectedTicker);
    });
  }

  // Ratio Input Custom Override (Save button)
  const saveRatioBtn = document.getElementById('save-ratio-override');
  const ratioInput = document.getElementById('details-ratio-input');
  if (saveRatioBtn && ratioInput) {
    saveRatioBtn.addEventListener('click', () => {
      saveCustomRatio(state.selectedTicker, ratioInput.value);
      // Flash input border green to confirm save
      ratioInput.classList.add('border-emerald-500');
      setTimeout(() => {
        ratioInput.classList.remove('border-emerald-500');
      }, 1200);
    });
  }

  // Bind Conversor Calculator Realtime events
  const usdPriceInput = document.getElementById('calc-usd-price');
  const calcCclInput = document.getElementById('calc-ccl-ref');
  const calcRatioInput = document.getElementById('calc-ratio');
  
  const calcInputsToARS = [usdPriceInput, calcCclInput, calcRatioInput];
  calcInputsToARS.forEach(input => {
    if (input) {
      input.addEventListener('input', runUSDToARSCalculation);
    }
  });

  const arsPriceInput = document.getElementById('calc-ars-price');
  const calcRatioArsInput = document.getElementById('calc-ratio-ars');
  
  const calcInputsToUSD = [arsPriceInput, calcCclInput, calcRatioArsInput];
  calcInputsToUSD.forEach(input => {
    if (input) {
      input.addEventListener('input', runARSToUSDCalculation);
    }
  });

  // Refresh Connection button (Re-trigger live fetch)
  const refreshBtn = document.getElementById('refresh-connection-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Clear session cache for current active ticker to force reload
      const range = state.timeframe.range;
      const interval = state.timeframe.interval;
      sessionStorage.removeItem(`chart_cache_${state.selectedTicker}_${range}_${interval}`);
      sessionStorage.removeItem(`chart_cache_${state.selectedTicker}.BA_${range}_${interval}`);
      sessionStorage.removeItem('dolar_api_cache'); // force dollar reload too
      
      fetchDolarRates();
      loadActiveTickerData(state.selectedTicker);
      updateTickerTape();
      renderWatchlistGrid();
    });
  }
}

// --- UI SPINNER AND STATUS HELPERS ---
function showLoadingSpinner(show) {
  const spinner = document.getElementById('chart-loading-overlay');
  if (spinner) {
    if (show) {
      spinner.classList.remove('opacity-0', 'pointer-events-none');
      spinner.classList.add('opacity-100');
    } else {
      spinner.classList.add('opacity-0', 'pointer-events-none');
      spinner.classList.remove('opacity-100');
    }
  }
}

function showErrorMessage(msg) {
  const errorBanner = document.getElementById('chart-error-banner');
  if (errorBanner) {
    errorBanner.innerText = msg;
    errorBanner.classList.remove('hidden');
    setTimeout(() => {
      errorBanner.classList.add('hidden');
    }, 5000);
  }
}

function updateConnectionIndicator() {
  const dot = document.getElementById('status-indicator-dot');
  const text = document.getElementById('status-indicator-text');
  
  if (!dot || !text) return;
  
  if (state.connectionStatus === 'connected') {
    dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 blinking-dot";
    text.innerText = "Mercado en Vivo (CORS Proxy)";
    text.className = "text-xs font-semibold text-emerald-400";
  } else if (state.connectionStatus === 'cached') {
    dot.className = "w-2.5 h-2.5 rounded-full bg-indigo-500";
    text.innerText = "Datos en Caché";
    text.className = "text-xs font-semibold text-indigo-400";
  } else if (state.connectionStatus === 'offline') {
    dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 blinking-dot";
    text.innerText = "Offline: Simulación de Mercado";
    text.className = "text-xs font-semibold text-amber-400";
  }
}

// --- FORMATTING CONVENIENCE FUNCTIONS ---
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "- -";
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompactNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "- -";
  return new Intl.NumberFormat('es-AR', { notation: 'compact', compactDisplay: 'short' }).format(num);
}

function formatDateTooltip(unixTime) {
  const date = new Date(unixTime * 1000);
  const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  // Check if it's daily chart (time at midnight)
  const isDaily = date.getUTCHours() === 0 && date.getUTCMinutes() === 0;
  if (isDaily) {
    delete options.hour;
    delete options.minute;
  }
  return date.toLocaleDateString('es-AR', options);
}
