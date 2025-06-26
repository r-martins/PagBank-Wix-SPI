import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';

const WS_URL = 'https://ws.pbintegracoes.com/pspro/v7/';

/** @returns {import('interfaces-psp-v1-payment-service-provider').PaymentServiceProviderConfig} */
export function getConfig() {
    return {
        title: 'PagBank Connect',
        paymentMethods: [
            {
                hostedPage: {
                    title: 'PIX, Cartão ou Boleto via PagBank',
                    billingAddressMandatoryFields: ['EMAIL', 'FIRST_NAME', 'LAST_NAME'],
                    logos: {
                        white: {
                            svg: 'https://static.wixstatic.com/shapes/94b5e2_403ceb582027431cb92f38fd18d1843c.svg',
                            png: 'https://freesvg.org/img/15930333081593032446pitr_Bananas_icon.png'
                        },
                        colored: {
                            svg: 'https://static.wixstatic.com/shapes/94b5e2_403ceb582027431cb92f38fd18d1843c.svg',
                            png: 'https://freesvg.org/img/15930333081593032446pitr_Bananas_icon.png'
                        }
                    }
                },
            }],
        credentialsFields: [
            {
                simpleField: {
                    name: 'connect_key',
                    label: 'Connect Key'
                }
            },
            {
                checkboxField: {
                    name: 'cc_enabled',
                    label: 'Aceitar Pagamentos com Cartão de Crédito',
                    tooltip: ''
                }
            },
            {
                checkboxField: {
                    name: 'pix_enabled',
                    label: 'Aceitar Pagamentos com PIX',
                    tooltip: 'Recebimento na hora (máximo 1 hora)'
                }
            },
            {
                checkboxField: {
                    name: 'boleto_enabled',
                    label: 'Aceitar Pagamentos com Boleto',
                    tooltip: 'Disponível na conta em 2 dias após pagamento'
                }
            },
            {
                simpleField: {
                    name: 'pix_expiry_min',
                    label: 'Validade do PIX em minutos'
                }
            },
            {
                simpleField: {
                    name: 'boleto_expiry_days',
                    label: 'Validade do Boleto em dias'
                }
            }
        ]
    }
}

