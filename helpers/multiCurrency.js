/**
 * Multi-Currency Support System
 * 
 * This helper provides comprehensive multi-currency support for international
 * construction projects with real-time exchange rates and localization.
 */

const { DataTypes } = require('sequelize');

/**
 * Supported currencies with metadata
 */
const SUPPORTED_CURRENCIES = {
  // North America
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    format: '$#,##0.00',
    locale: 'en-US',
    countries: ['US', 'UM', 'EC'],
    isBaseCurrency: true
  },

  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    decimals: 2,
    format: 'C$#,##0.00',
    locale: 'en-CA',
    countries: ['CA']
  },

  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    decimals: 2,
    format: '$#,##0.00',
    locale: 'es-MX',
    countries: ['MX']
  },

  // Europe
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    format: '€#,##0.00',
    locale: 'de-DE',
    countries: ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES']
  },

  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    format: '£#,##0.00',
    locale: 'en-GB',
    countries: ['GB', 'IM', 'JE', 'GG']
  },

  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    decimals: 2,
    format: 'CHF #,##0.00',
    locale: 'de-CH',
    countries: ['CH', 'LI']
  },

  // Asia Pacific
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimals: 0,
    format: '¥#,##0',
    locale: 'ja-JP',
    countries: ['JP']
  },

  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimals: 2,
    format: '¥#,##0.00',
    locale: 'zh-CN',
    countries: ['CN']
  },

  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    decimals: 2,
    format: 'A$#,##0.00',
    locale: 'en-AU',
    countries: ['AU', 'CX', 'CC', 'HM', 'KI', 'NR', 'NF', 'TV']
  },

  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    decimals: 2,
    format: 'NZ$#,##0.00',
    locale: 'en-NZ',
    countries: ['NZ', 'CK', 'NU', 'PN', 'TK']
  },

  // Middle East & Africa
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    decimals: 2,
    format: 'د.إ #,##0.00',
    locale: 'ar-AE',
    countries: ['AE']
  },

  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    decimals: 2,
    format: '﷼ #,##0.00',
    locale: 'ar-SA',
    countries: ['SA']
  },

  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    decimals: 2,
    format: 'R #,##0.00',
    locale: 'en-ZA',
    countries: ['ZA', 'LS', 'NA', 'SZ']
  },

  // South America
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimals: 2,
    format: 'R$ #,##0.00',
    locale: 'pt-BR',
    countries: ['BR']
  },

  // Crypto currencies (for modern construction payments)
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    decimals: 8,
    format: '₿ #,##0.00000000',
    locale: 'en-US',
    countries: [],
    isCrypto: true
  }
};

/**
 * Multi-currency field templates
 */
const CURRENCY_FIELDS = {
  // Basic currency amount
  CURRENCY_AMOUNT: {
    type: DataTypes.DECIMAL(20, 8), // High precision for crypto and exchange rates
    allowNull: false,
    defaultValue: 0.00000000,
    validate: {
      min: 0,
      isDecimal: true
    },
    comment: 'Amount in specified currency'
  },

  CURRENCY_CODE: {
    type: DataTypes.ENUM(...Object.keys(SUPPORTED_CURRENCIES)),
    allowNull: false,
    defaultValue: 'USD',
    comment: 'ISO 4217 currency code'
  },

  // Base currency conversion
  BASE_AMOUNT: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false,
    defaultValue: 0.00000000,
    validate: {
      min: 0
    },
    comment: 'Amount converted to base currency (USD)'
  },

  EXCHANGE_RATE: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 1.00000000,
    validate: {
      min: 0.00000001 // Prevent division by zero
    },
    comment: 'Exchange rate used for conversion (currency to USD)'
  },

  EXCHANGE_RATE_DATE: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date when exchange rate was retrieved'
  },

  EXCHANGE_RATE_SOURCE: {
    type: DataTypes.ENUM('manual', 'api', 'bank', 'market', 'fixed'),
    allowNull: false,
    defaultValue: 'api',
    comment: 'Source of exchange rate data'
  },

  // Currency conversion metadata
  ORIGINAL_AMOUNT: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true,
    comment: 'Original amount before any currency conversion'
  },

  ORIGINAL_CURRENCY: {
    type: DataTypes.ENUM(...Object.keys(SUPPORTED_CURRENCIES)),
    allowNull: true,
    comment: 'Original currency before conversion'
  },

  CONVERSION_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when currency conversion was performed'
  },

  // Localization
  FORMATTED_AMOUNT: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Human-readable formatted amount with currency symbol'
  },

  LOCALE: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'en-US',
    validate: {
      is: /^[a-z]{2}-[A-Z]{2}$/
    },
    comment: 'Locale for number formatting (e.g., en-US, de-DE)'
  }
};

/**
 * Exchange rate providers
 */
const EXCHANGE_RATE_PROVIDERS = {
  EXCHANGERATE_API: {
    name: 'ExchangeRate-API',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    apiKey: process.env.EXCHANGERATE_API_KEY,
    rateLimit: 1500, // requests per month for free tier
    updateFrequency: 'daily'
  },

  FIXER_IO: {
    name: 'Fixer.io',
    url: 'http://data.fixer.io/api/latest',
    apiKey: process.env.FIXER_API_KEY,
    rateLimit: 100, // requests per month for free tier
    updateFrequency: 'hourly'
  },

  OPEN_EXCHANGE_RATES: {
    name: 'Open Exchange Rates',
    url: 'https://openexchangerates.org/api/latest.json',
    apiKey: process.env.OPEN_EXCHANGE_RATES_KEY,
    rateLimit: 1000, // requests per month for free tier
    updateFrequency: 'hourly'
  },

  COINBASE: {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/exchange-rates',
    apiKey: null, // No API key required for basic rates
    rateLimit: 10000, // requests per hour
    updateFrequency: 'real-time',
    supportsCrypto: true
  }
};

/**
 * Currency conversion utilities
 */
class CurrencyConverter {
  /**
   * Converts amount from one currency to another
   */
  static async convert(amount, fromCurrency, toCurrency, options = {}) {
    const {
      date = new Date(),
      source = 'api',
      useCache = true,
      precision = 8
    } = options;

    // No conversion needed for same currency
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1.0,
        fromCurrency,
        toCurrency,
        conversionDate: date,
        source: 'none'
      };
    }

    // Get exchange rate
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency, {
      date,
      source,
      useCache
    });

    // Perform conversion
    const convertedAmount = this.roundToPrecision(amount * exchangeRate.rate, precision);

    return {
      originalAmount: amount,
      convertedAmount,
      exchangeRate: exchangeRate.rate,
      fromCurrency,
      toCurrency,
      conversionDate: date,
      source: exchangeRate.source,
      provider: exchangeRate.provider
    };
  }

  /**
   * Gets exchange rate between two currencies
   */
  static async getExchangeRate(fromCurrency, toCurrency, options = {}) {
    const {
      date = new Date(),
      source = 'api',
      useCache = true
    } = options;

    // Check cache first
    if (useCache) {
      const cachedRate = await this.getCachedRate(fromCurrency, toCurrency, date);
      if (cachedRate) {
        return cachedRate;
      }
    }

    // Get rate from API
    const rate = await this.fetchExchangeRate(fromCurrency, toCurrency, date);

    // Cache the rate
    if (useCache) {
      await this.cacheExchangeRate(fromCurrency, toCurrency, rate, date);
    }

    return rate;
  }

  /**
   * Fetches exchange rate from external API
   */
  static async fetchExchangeRate(fromCurrency, toCurrency, date) {
    // Try primary provider first
    let provider = EXCHANGE_RATE_PROVIDERS.EXCHANGERATE_API;
    
    try {
      const response = await fetch(`${provider.url}?base=${fromCurrency}&symbols=${toCurrency}`);
      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        return {
          rate: data.rates[toCurrency],
          source: 'api',
          provider: provider.name,
          date: new Date(data.date || date),
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch rate from ${provider.name}:`, error.message);
    }

    // Fallback to secondary provider
    provider = EXCHANGE_RATE_PROVIDERS.FIXER_IO;
    try {
      const response = await fetch(`${provider.url}?access_key=${provider.apiKey}&base=${fromCurrency}&symbols=${toCurrency}`);
      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        return {
          rate: data.rates[toCurrency],
          source: 'api',
          provider: provider.name,
          date: new Date(data.date || date),
          lastUpdated: new Date()
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch rate from ${provider.name}:`, error.message);
    }

    // Return fallback rate (1.0) with warning
    console.warn(`Unable to fetch exchange rate for ${fromCurrency} to ${toCurrency}, using rate of 1.0`);
    return {
      rate: 1.0,
      source: 'fallback',
      provider: 'none',
      date: date,
      lastUpdated: new Date()
    };
  }

  /**
   * Formats currency amount for display
   */
  static formatCurrency(amount, currencyCode, locale = null) {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const formatLocale = locale || currency.locale;
    
    try {
      return new Intl.NumberFormat(formatLocale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals
      }).format(amount);
    } catch (error) {
      // Fallback to manual formatting
      return `${currency.symbol}${this.formatNumber(amount, currency.decimals, formatLocale)}`;
    }
  }

  /**
   * Formats number with locale-specific separators
   */
  static formatNumber(number, decimals, locale = 'en-US') {
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number);
    } catch (error) {
      return number.toFixed(decimals);
    }
  }

  /**
   * Rounds amount to specified precision
   */
  static roundToPrecision(amount, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(amount * factor) / factor;
  }

  /**
   * Validates currency code
   */
  static isValidCurrency(currencyCode) {
    return SUPPORTED_CURRENCIES.hasOwnProperty(currencyCode);
  }

  /**
   * Gets currency information
   */
  static getCurrencyInfo(currencyCode) {
    return SUPPORTED_CURRENCIES[currencyCode] || null;
  }

  /**
   * Gets list of supported currencies
   */
  static getSupportedCurrencies() {
    return Object.keys(SUPPORTED_CURRENCIES);
  }

  /**
   * Gets currencies for a specific country
   */
  static getCurrenciesForCountry(countryCode) {
    return Object.entries(SUPPORTED_CURRENCIES)
      .filter(([code, currency]) => currency.countries.includes(countryCode))
      .map(([code, currency]) => ({ code, ...currency }));
  }

  /**
   * Caches exchange rate
   */
  static async cacheExchangeRate(fromCurrency, toCurrency, rateData, date) {
    try {
      const cacheKey = `exchange_rate:${fromCurrency}:${toCurrency}:${date.toISOString().split('T')[0]}`;
      
      // Store in Redis cache if available
      if (global.redisClient) {
        await global.redisClient.setex(cacheKey, 3600, JSON.stringify(rateData)); // Cache for 1 hour
      }
      
      // Store in database cache
      await ExchangeRateCache.upsert({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        rate: rateData.rate,
        rate_date: date,
        source: rateData.source,
        provider: rateData.provider,
        cached_at: new Date()
      });
    } catch (error) {
      console.warn('Failed to cache exchange rate:', error.message);
    }
  }

  /**
   * Gets cached exchange rate
   */
  static async getCachedRate(fromCurrency, toCurrency, date) {
    try {
      const cacheKey = `exchange_rate:${fromCurrency}:${toCurrency}:${date.toISOString().split('T')[0]}`;
      
      // Try Redis cache first
      if (global.redisClient) {
        const cached = await global.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }
      
      // Try database cache
      const dbCached = await ExchangeRateCache.findOne({
        where: {
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate_date: date
        },
        order: [['cached_at', 'DESC']]
      });
      
      if (dbCached && this.isCacheValid(dbCached.cached_at)) {
        return {
          rate: parseFloat(dbCached.rate),
          source: dbCached.source,
          provider: dbCached.provider,
          date: dbCached.rate_date,
          lastUpdated: dbCached.cached_at
        };
      }
    } catch (error) {
      console.warn('Failed to get cached exchange rate:', error.message);
    }
    
    return null;
  }

  /**
   * Checks if cached rate is still valid
   */
  static isCacheValid(cachedAt, maxAgeHours = 1) {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    return (now - cachedAt) < maxAge;
  }
}

/**
 * Multi-currency model hooks
 */
const createCurrencyHooks = (options = {}) => {
  const {
    autoConvert = true,
    baseCurrency = 'USD',
    autoFormat = true,
    trackExchangeRates = true
  } = options;

  return {
    beforeValidate: async (instance, options) => {
      // Auto-convert to base currency if enabled
      if (autoConvert && instance.currency_code && instance.currency_code !== baseCurrency) {
        try {
          const conversion = await CurrencyConverter.convert(
            instance.amount,
            instance.currency_code,
            baseCurrency,
            { source: 'api' }
          );
          
          instance.base_amount = conversion.convertedAmount;
          instance.exchange_rate = conversion.exchangeRate;
          instance.exchange_rate_date = conversion.conversionDate;
          instance.exchange_rate_source = conversion.source;
        } catch (error) {
          console.warn('Currency conversion failed:', error.message);
          // Set base amount equal to original amount as fallback
          instance.base_amount = instance.amount;
          instance.exchange_rate = 1.0;
        }
      } else if (instance.currency_code === baseCurrency) {
        // Same currency, no conversion needed
        instance.base_amount = instance.amount;
        instance.exchange_rate = 1.0;
        instance.exchange_rate_date = new Date();
        instance.exchange_rate_source = 'none';
      }

      // Auto-format currency display
      if (autoFormat && instance.amount && instance.currency_code) {
        instance.formatted_amount = CurrencyConverter.formatCurrency(
          instance.amount,
          instance.currency_code,
          instance.locale
        );
      }
    },

    afterCreate: async (instance, options) => {
      if (trackExchangeRates && instance.exchange_rate && instance.exchange_rate !== 1.0) {
        // Log exchange rate usage for analytics
        console.log(`Currency conversion: ${instance.amount} ${instance.currency_code} = ${instance.base_amount} ${baseCurrency} (rate: ${instance.exchange_rate})`);
      }
    },

    beforeUpdate: async (instance, options) => {
      // Recalculate conversions if amount or currency changed
      if (instance.changed('amount') || instance.changed('currency_code')) {
        // Re-run beforeValidate logic
        await this.beforeValidate(instance, options);
      }
    }
  };
};

/**
 * Multi-currency validation
 */
const CURRENCY_VALIDATIONS = {
  validateCurrencyCode: (value) => {
    if (!CurrencyConverter.isValidCurrency(value)) {
      throw new Error(`Unsupported currency code: ${value}`);
    }
  },

  validateExchangeRate: (value) => {
    if (value <= 0) {
      throw new Error('Exchange rate must be greater than zero');
    }
    if (value > 10000) {
      throw new Error('Exchange rate seems unrealistic (>10,000)');
    }
  },

  validateCurrencyAmount: (value, currencyCode) => {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    if (currency) {
      const maxDecimals = currency.decimals;
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      if (decimalPlaces > maxDecimals) {
        throw new Error(`Amount has too many decimal places for ${currencyCode} (max: ${maxDecimals})`);
      }
    }
  }
};

module.exports = {
  SUPPORTED_CURRENCIES,
  CURRENCY_FIELDS,
  EXCHANGE_RATE_PROVIDERS,
  CURRENCY_VALIDATIONS,
  CurrencyConverter,
  createCurrencyHooks
};
