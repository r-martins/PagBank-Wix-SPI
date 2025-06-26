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

    const connect_key = (options.connect_key || (options.credentials && options.credentials.connect_key) || '').trim();
    let response, data;
    try {
        response = await fetch(WS_URL + 'connect/connectInfo', {
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
            console.log("Returned value", {
                credentials: {
                    connect_key: connect_key,
                    pix_enabled: options.credentials.pix_enabled,
                    boleto_enabled: options.credentials.boleto_enabled,
                    cc_enabled: options.credentials.cc_enabled,
                    boleto_expiry_days: options.credentials.boleto_expiry_days,
                    pix_expiry_min: options.credentials.pix_expiry_min,
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
                    boleto_expiry_days: options.credentials.boleto_expiry_days,
                    pix_expiry_min: options.credentials.pix_expiry_min,
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
export const createTransaction = async (options, context) => {};

/**
 * This payment plugin endpoint is triggered when a merchant refunds a payment made on a Wix site.
 * The plugin has to process this refund request but prevent double refunds for the same `wixRefundId`.
 * @param {import('interfaces-psp-v1-payment-service-provider').RefundTransactionOptions} options
 * @param {import('interfaces-psp-v1-payment-service-provider').Context} context
 * @returns {Promise<import('interfaces-psp-v1-payment-service-provider').CreateRefundResponse | import('interfaces-psp-v1-payment-service-provider').BusinessError>}
 */
export const refundTransaction = async (options, context) => {};
