import * as paymentProvider from 'interfaces-psp-v1-payment-service-provider';

const WS_URL = 'https://ws.pbintegracoes.com/pspro/v7/';

/** @returns {import('interfaces-psp-v1-payment-service-provider').PaymentServiceProviderConfig} */
export function getConfig() {
    return {
        title: 'PagBank Connect',
        paymentMethods: [
            {
                hostedPage: {
                    title: 'Checkout PagBank (PIX, Boleto ou Cartão de Crédito)',
                    billingAddressMandatoryFields: ['EMAIL', 'FIRST_NAME', 'LAST_NAME'],
                    logos: {
                        white: {
                            svg: 'https://cdn.jsdelivr.net/gh/r-martins/PagBank-Assets/icons/pagbank.svg',
                            png: 'https://cdn.jsdelivr.net/gh/r-martins/PagBank-Assets/icons/pagbank.png'
                        },
                        colored: {
                            svg: 'https://cdn.jsdelivr.net/gh/r-martins/PagBank-Assets/icons/pagbank.svg',
                            png: 'https://cdn.jsdelivr.net/gh/r-martins/PagBank-Assets/icons/pagbank.png'
                        }
                    }
                }
            }],
        credentialsFields: [
            {
                simpleField: {
                    name: 'connect_key',
                    label: 'Connect Key'
                }
            },{
                simpleField: {
                    name: 'store_url',
                    label: 'URL da Loja (com https:// e barra no final)',
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
            }
        ]
    }
}
