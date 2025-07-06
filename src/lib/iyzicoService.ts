/**
 * İyzico Payment Gateway Service
 * Professional subscription management and payment processing
 */

import crypto from 'crypto';

// Type definitions for İyzico API
export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseURL: string;
}

export interface SubscriptionProduct {
  name: string;
  description: string;
  referenceCode: string;
}

export interface SubscriptionPlan {
  productReferenceCode: string;
  name: string;
  price: string;
  currencyCode: string;
  paymentInterval: 'MONTHLY' | 'YEARLY';
  paymentIntervalCount: number;
  trialPeriodDays?: number;
  recurringPaymentCount?: number;
}

export interface CustomerData {
  customerId: string;
  email: string;
  name: string;
  surname: string;
  gsmNumber?: string;
  billingAddress: BillingAddress;
  shippingAddress?: ShippingAddress;
}

export interface BillingAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface ShippingAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface CardData {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  cardAlias?: string;
}

export interface CreateSubscriptionData {
  customerId: string;
  planReferenceCode: string;
  cardToken?: string;
  cardData?: CardData;
  trialDays?: number;
}

export interface IyzicoResponse {
  status: 'success' | 'failure';
  locale?: string;
  systemTime?: number;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  [key: string]: any;
}

export interface SubscriptionResponse extends IyzicoResponse {
  referenceCode?: string;
  parentReferenceCode?: string;
  price?: string;
  paidPrice?: string;
  currency?: string;
  state?: 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED';
  startDate?: string;
  endDate?: string;
}

export interface CardTokenResponse extends IyzicoResponse {
  cardToken?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardType?: string;
  binNumber?: string;
}

/**
 * İyzico Service Class
 * Handles all subscription and payment operations
 */
export class IyzicoService {
  private readonly config: IyzicoConfig;

  constructor() {
    this.config = {
      apiKey: process.env.IYZICO_API_KEY || '',
      secretKey: process.env.IYZICO_SECRET_KEY || '',
      baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://api.iyzipay.com' 
        : 'https://sandbox-api.iyzipay.com'
    };

    if (!this.config.apiKey || !this.config.secretKey) {
      throw new Error('İyzico API credentials not found in environment variables');
    }
  }

  /**
   * Generate authorization header for İyzico API requests
   */
  private generateAuthString(requestBody: any): string {
    const randomKey = this.generateRandomString();
    const requestBodyStr = JSON.stringify(requestBody);
    const hashStr = this.config.apiKey + randomKey + this.config.secretKey + requestBodyStr;
    const hashData = crypto.createHash('sha1').update(hashStr, 'utf8').digest('base64');
    
    return `IYZWSv2 ${this.config.apiKey}:${randomKey}:${hashData}`;
  }

  /**
   * Generate random string for authorization
   */
  private generateRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Make authenticated request to İyzico API
   */
  private async makeRequest(
    endpoint: string, 
    data: any, 
    method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<IyzicoResponse> {
    const url = `${this.config.baseURL}${endpoint}`;
    const authString = this.generateAuthString(data);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authString,
          'x-iyzi-rnd': this.generateRandomString()
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('İyzico API request failed:', error);
      throw new Error(`İyzico API Error: ${error}`);
    }
  }

  /**
   * Create subscription product
   */
  async createSubscriptionProduct(productData: SubscriptionProduct): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      ...productData
    };

    return this.makeRequest('/v2/subscription/products', requestData);
  }

  /**
   * Create subscription plan
   */
  async createSubscriptionPlan(planData: SubscriptionPlan): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      ...planData
    };

    return this.makeRequest('/v2/subscription/plans', requestData);
  }

  /**
   * Create customer
   */
  async createCustomer(customerData: CustomerData): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      ...customerData
    };

    return this.makeRequest('/v2/subscription/customers', requestData);
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, customerData: Partial<CustomerData>): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      ...customerData
    };

    return this.makeRequest(`/v2/subscription/customers/${customerId}`, requestData, 'PUT');
  }

  /**
   * Save card (tokenization for secure storage)
   */
  async saveCard(cardData: CardData, customerId: string): Promise<CardTokenResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      customerId,
      card: cardData
    };

    return this.makeRequest('/v2/subscription/cards', requestData) as Promise<CardTokenResponse>;
  }

  /**
   * Delete saved card
   */
  async deleteCard(cardToken: string, customerId: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      customerId,
      cardToken
    };

    return this.makeRequest('/v2/subscription/cards', requestData, 'DELETE');
  }

  /**
   * Create subscription
   */
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<SubscriptionResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      ...subscriptionData
    };

    return this.makeRequest('/v2/subscription/subscriptions', requestData) as Promise<SubscriptionResponse>;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString()
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}`, requestData, 'GET') as Promise<SubscriptionResponse>;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString()
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}/cancel`, requestData, 'PUT');
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString()
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}/pause`, requestData, 'PUT');
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString()
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}/resume`, requestData, 'PUT');
  }

  /**
   * Upgrade/Downgrade subscription plan
   */
  async upgradePlan(subscriptionId: string, newPlanReferenceCode: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString(),
      planReferenceCode: newPlanReferenceCode
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}/upgrade`, requestData, 'PUT');
  }

  /**
   * Get subscription payments (billing history)
   */
  async getSubscriptionPayments(subscriptionId: string): Promise<IyzicoResponse> {
    const requestData = {
      locale: 'tr',
      conversationId: this.generateRandomString()
    };

    return this.makeRequest(`/v2/subscription/subscriptions/${subscriptionId}/payments`, requestData, 'GET');
  }

  /**
   * Validate card data
   */
  static validateCardData(cardData: CardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Card number validation
    if (!cardData.cardNumber || cardData.cardNumber.length < 13 || cardData.cardNumber.length > 19) {
      errors.push('Geçersiz kart numarası');
    }

    // Expiry date validation
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expireYear = parseInt(cardData.expireYear);
    const expireMonth = parseInt(cardData.expireMonth);

    if (expireYear < currentYear || (expireYear === currentYear && expireMonth < currentMonth)) {
      errors.push('Kartın süresi dolmuş');
    }

    // CVC validation
    if (!cardData.cvc || cardData.cvc.length < 3 || cardData.cvc.length > 4) {
      errors.push('Geçersiz CVC kodu');
    }

    // Cardholder name validation
    if (!cardData.cardHolderName || cardData.cardHolderName.trim().length < 2) {
      errors.push('Geçersiz kart sahibi adı');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Detect card brand from card number
   */
  static detectCardBrand(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'unknown' {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || (parseInt(number.substring(0, 4)) >= 2221 && parseInt(number.substring(0, 4)) <= 2720)) return 'mastercard';
    if (number.startsWith('34') || number.startsWith('37')) return 'amex';
    
    return 'unknown';
  }

  /**
   * Format card number for display
   */
  static formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Mask card number for secure display
   */
  static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  }
}

// Singleton instance for app-wide usage
export const iyzicoService = new IyzicoService(); 