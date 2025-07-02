import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';
import fetch from 'node-fetch';


const WS_URL = 'https://ws.pbintegracoes.com/pspro/v7/';

/**
 * This payment plugin endpoint is triggered when a merchant provides required data to connect their PSP account to a Wix site.
 * The plugin has to verify merchant's credentials, and ensure the merchant has an operational PSP account.
 * @param {import('interfaces-psp-v1-payment-service-provider').ConnectAccountOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').ConnectAccountResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const connectAccount = async (options, context) => {
    console.debug('connectAccount reveived options', options);
    const connect_key = (options.connect_key || (options.credentials && options.credentials.connect_key) || '').trim();
    const isSandbox = connect_key.startsWith('CONSANDBOX');
    const url = WS_URL + 'connect/connectInfo' + (isSandbox ? '?isSandbox=1' : '');
    let response, data;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connect_key}`,
                'Content-Type': 'application/json',
            },
            timeout: 7000,
        });
        data = await response.json();
    } catch (e) {
        return {
            errorCode: 'UNKNOWN',
            errorMessage: 'Tivemos problemas ao consultar sua conta. Tente novamente',
            reasonCode: 2004,
        };
    }

    if (!response.ok || !data || !data.status) {
        return {
            errorCode: 'UNKNOWN',
            errorMessage: 'Tivemos problemas ao consultar sua conta. Tente novamente',
            reasonCode: 2004,
        };
    }
    switch (data.status) {
        case 'VALID':
        console.log("Returned value connectAccount", {
                credentials: {
                    connect_key: connect_key,
                    pix_enabled: options.credentials.pix_enabled,
                    boleto_enabled: options.credentials.boleto_enabled,
                    cc_enabled: options.credentials.cc_enabled,
                    store_url: options.credentials.store_url || '',
                },
                accountId: '',
                accountName: data.authorizerEmail || '',
            })
            return {
                credentials: {
                    connect_key: connect_key,
                    pix_enabled: options.credentials.pix_enabled,
                    boleto_enabled: options.credentials.boleto_enabled,
                    cc_enabled: options.credentials.cc_enabled,
                    store_url: options.credentials.store_url || '',
                },
                accountId: '',
                accountName: data.authorizerEmail || '',
            };
        case 'INVALID':
            return {
                errorCode: 'INVALID',
                errorMessage: 'Sua conta é uma conta de comprador. Você precisa de uma conta Vendedor ou Empresarial',
                reasonCode: 2002,
            };
        case 'UNAUTHORIZED':
            return {
                errorCode: 'UNAUTHORIZED',
                errorMessage: 'Chave inválida ou com acesso não permitido. Certifique-se de ter obtido uma connect key em https://pbintegracoes.com/connect/autorizar',
                reasonCode: 2004,
            };
        case 'UNKNOWN':
        default:
            return {
                errorCode: 'UNKNOWN',
                errorMessage: 'Tivemos problemas ao consultar sua conta. Tente novamente',
                reasonCode: 2004,
            };
    }
};

/**
 * This payment plugin endpoint is triggered when a buyer pays on a Wix site.
 * The plugin has to process this payment request but prevent double payments for the same `wixTransactionId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').CreateTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateTransactionResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const createTransaction = async (options, context) => {
  console.debug('Criando Transação PagBank', options, context);

  // Prepare connect key and sandbox mode
  const connect_key = (options.merchantCredentials.connect_key || '').trim();
  const isSandbox = connect_key.startsWith('CONSANDBOX');
  let url = WS_URL + 'connect/ws/checkouts';
  if (isSandbox) url += '?isSandbox=1';

  // Prepare notification URL
  const notificationUrl = (options.merchantCredentials.store_url || '').replace(/\/?$/, '/') + '_functions/nt';

  // Extract order and description
  const order = options.order || {};
  const desc = order.description || {};
  const billing = desc.billingAddress || {};
  const shipping = desc.shippingAddress || {};
  const items = Array.isArray(desc.items) ? desc.items : [];

  // Helper to split phone into area and number
  function parsePhone(phone) {
    if (!phone) return { area: '', number: '' };
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return {
        area: Number(cleaned.substring(0, 2)),
        number: Number(cleaned.substring(2))
      };
    }
    return { area: '', number: cleaned };
  }

  // Build customer
  const customer = {
    name: (billing.firstName || '') + (billing.lastName ? ' ' + billing.lastName : ''),
    email: billing.email,
    tax_id: billing.taxIdentifier?._id,
    phone: {
      country: 55,
      ...parsePhone(billing.phone),
      type: 'MOBILE'
    }
  };

  // Build items
  const pagbankItems = items.map(item => ({
    reference_id: item._id || item.reference_id || '',
    name: item.name,
    quantity: item.quantity,
    unit_amount: parseInt(item.price || item.unit_amount, 10)
  }));

  // Build shipping
  const pagbankShipping = {
    type: 'FREE',
    address_modifiable: false,
    address: {
      street: shipping.street,
      number: shipping.houseNumber || shipping.number,
      complement: shipping.complement,
      locality: shipping.city,
      city: shipping.city,
      region: shipping.state,
      region_code: shipping.state,
      country: 'BRA',
      postal_code: shipping.zipCode ? shipping.zipCode.replace(/\D/g, '') : '',
    }
  };

  // Build payment_methods
  const payment_methods = [];
  if (options.merchantCredentials.cc_enabled === 'true') payment_methods.push({ type: 'CREDIT_CARD' });
  if (options.merchantCredentials.pix_enabled === 'true') payment_methods.push({ type: 'PIX' });
  if (options.merchantCredentials.boleto_enabled === 'true') payment_methods.push({ type: 'BOLETO' });

  // Build redirect_url
  const redirect_url = (order.returnUrls && order.returnUrls.successUrl) || options.redirectUrl;

  // Prepare payload
  const payload = {
    reference_id: options.wixTransactionId,
    customer,
    items: pagbankItems,
    notification_urls: [notificationUrl],
    shipping: pagbankShipping,
    payment_methods,
    customer_modifiable: true,
    redirect_url
  };
  
  console.debug('PagBank payload para criação de pedido:', payload);

  // Make request to PagBank
  let response, data;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connect_key}`,
        'Content-Type': 'application/json',
        'Platform': 'Wix Stores',
      },
      body: JSON.stringify(payload),
      timeout: 10000,
    });
    data = await response.json();
  } catch (e) {
      console.error('Erro ao conectar com PagBank para criação de pedido:', e);
      console.error('Resposta recebida:', response);
      return {
          pluginTransactionId: response.headers.get('x-amz-cf-id') || Math.random().toString(36).substring(2, 15),
          reasonCode: 5000,
          errorCode: 'CONNECTION_ERROR',
          errorMessage: 'Could not connect to PagBank',
      };
  }

  // Handle PagBank errors
  if (!response.ok || data.error_messages) {
    const err = Array.isArray(data.error_messages) ? data.error_messages[0] : {};
    console.debug('Erro ao criar pedido PagBank:', err);
    return {
      reasonCode: 3012,
      errorCode: err.code || err.error || 'PAGBANK_ERROR',
      errorMessage: err.description || 'Unknown error',
    };
  }
  console.debug('Checkout PagBank criado com sucesso:', data);
  // Find PAY link for redirect
  const payLink = Array.isArray(data.links) ? data.links.find(l => l.rel === 'PAY') : null;
  return {
    pluginTransactionId: data.id,
    redirectUrl: payLink ? payLink.href : ''
  };
};

/**
 * This payment plugin endpoint is triggered when a merchant refunds a payment made on a Wix site.
 * The plugin has to process this refund request but prevent double refunds for the same `wixRefundId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').RefundTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateRefundResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const refundTransaction = async (options, context) => {
    console.debug('Refunding PagBank transaction/order', options, context);
    const connect_key = (options.merchantCredentials.connect_key || '').trim();
    const isSandbox = connect_key.startsWith('CONSANDBOX');
    const wsUrl = WS_URL.replace(/\/?$/, '/');
    const sandboxParam = isSandbox ? '?isSandbox=1' : '';
    let orderResp, orderData;
    try {
        orderResp = await fetch(`${wsUrl}connect/ws/orders/${options.pluginTransactionId}${sandboxParam}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connect_key}`,
                'Content-Type': 'application/json',
            },
            timeout: 7000,
        });
        orderData = await orderResp.json();
    } catch (e) {
        console.error('Erro ao consultar o pedido para reembolso:', e);
        return {
            errorCode: 'UNKNOWN',
            errorMessage: 'Erro ao consultar o pedido para reembolso.',
            reasonCode: 3022,
        };
    }
    if (!orderResp.ok || !orderData || !orderData.charges || !orderData.charges.length) {
        console.debug('Pedido ou cobrança não encontrada para reembolso:', orderResp);
        return {
            errorCode: 'NOT_FOUND',
            errorMessage: 'Pedido ou cobrança não encontrada.',
            reasonCode: 3022,
        };
    }
    const chargeId = orderData.charges[0].id;
    let cancelResp, cancelData;
    try {
        cancelResp = await fetch(`${wsUrl}connect/ws/charges/${chargeId}/cancel${sandboxParam}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${connect_key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: { value: options.refundAmount } }),
            timeout: 7000,
        });
        cancelData = await cancelResp.json();
    } catch (e) {
        console.error('Erro ao tentar cancelar a cobrança:', e);
        return {
            pluginRefundId: chargeId,
            reasonCode: 3022,
            errorCode: 'REFUND_NOT_ALLOWED',
            errorMessage: 'Erro ao tentar cancelar a cobrança.',
        };
    }
    if (cancelData && cancelData.id) {
        console.debug('Reembolso realizado com sucesso:', cancelData);
        // Success
        return {
            pluginRefundId: cancelData.id
        };
    } else if (cancelData && Array.isArray(cancelData.error_messages) && cancelData.error_messages.length) {
        console.debug('Erro ao tentar reembolsar:', cancelData, chargeId);
        // Error from API
        return {
            pluginRefundId: chargeId,
            reasonCode: 3022,
            errorCode: 'REFUND_NOT_ALLOWED',
            errorMessage: cancelData.error_messages[0].description || 'Erro desconhecido ao tentar reembolsar.'
        };
    } else {
        console.debug('Erro desconhecido ao tentar reembolsar:', cancelData);
        // Unknown error
        return {
            pluginRefundId: chargeId,
            reasonCode: 3022,
            errorCode: 'REFUND_NOT_ALLOWED',
            errorMessage: 'Erro desconhecido ao tentar reembolsar.'
        };
    }
};

/**
 * Exemplos de chamada para createTransaction:
 - Options:
{
  "wixTransactionId": "93c516fd-b54d-42ff-b983-ab59606846af",
  "paymentMethod": "051e184a-4cfe-4918-adf2-8034e439bdba",
  "merchantCredentials": {
    "pix_enabled": "false",
    "store_url": "https://pagbank-exemplo-wix.pbintegracoes.com/",
    "connect_key": "CONSANDBOXCA0E5C9805C352E75F211CA87BF1EB",
    "boleto_enabled": "true",
    "cc_enabled": "true"
  },
  "order": {
    "description": {
      "billingAddress": {
        "houseNumber": "17",
        "city": "Santos",
        "email": "clientewix@pbintegracoes.com",
        "state": "SP",
        "taxIdentifier": {
          "type": "CPF",
          "_id": "01234567890"
        },
        "zipCode": "11045-510",
        "lastName": "PagBank",
        "firstName": "Teste",
        "countryCode": "BR",
        "address": "Rua Ângelo Guerra 17",
        "street": "Rua Ângelo Guerra",
        "phone": "1331133300"
      },
      "items": [
        {
          "name": "TROPICAL TWIST SET Color:Pink | Size:S",
          "quantity": 1,
          "price": "12500",
          "category": "undefined",
          "_id": "b555fe24-cc84-a60f-28f9-4c7b64824d95"
        }
      ],
      "totalAmount": "12500",
      "charges": {},
      "buyerInfo": {
        "buyerId": "6fd393c5-330b-4c78-8256-bba816f5d74f",
        "buyerLanguage": "pt"
      },
      "currency": "BRL",
      "shippingAddress": {
        "houseNumber": "17",
        "city": "Santos",
        "email": "clientewix@pbintegracoes.com",
        "state": "SP",
        "taxIdentifier": {
          "type": "CPF",
          "_id": "01234567890"
        },
        "zipCode": "11045-510",
        "lastName": "PagBank",
        "firstName": "Teste",
        "countryCode": "BR",
        "address": "Rua Ângelo Guerra 17",
        "street": "Rua Ângelo Guerra",
        "phone": "1331133300"
      }
    },
    "returnUrls": {
      "successUrl": "https://cashier-services.wix.com/_api/payment-services-web/redirect/success/93c516fd-b54d-42ff-b983-ab59606846af",
      "errorUrl": "https://cashier-services.wix.com/_api/payment-services-web/redirect/error/93c516fd-b54d-42ff-b983-ab59606846af?pmName=EmptyPayment&pmUrl=&failureCode=6000",
      "cancelUrl": "https://cashier-services.wix.com/_api/payment-services-web/redirect/cancel/93c516fd-b54d-42ff-b983-ab59606846af",
      "pendingUrl": "https://cashier-services.wix.com/_api/payment-services-web/redirect/pending/93c516fd-b54d-42ff-b983-ab59606846af"
    },
    "_id": "61f107e1-4fd8-4518-99f4-84a6b2959823"
  },
  "wixMerchantId": "15e9dfc1-54ac-47fa-9231-91d7100f7efb",
  "fraudInformation": {
    "remoteIp": "122.199.5.38"
  }
}

 - Context:
 {
     "currency": null,
     "languages": [],
     "requestId": "1750984822.880113125064023719867",
     "identity": {
     "identityType": "APP",
     "appId": "14bca956-e09f-f4d6-14d7-466cb3f09103"
 
 }
 */