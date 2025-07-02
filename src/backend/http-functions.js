/*******************
 http-functions.js
********************

'http-functions.js' is a reserved backend file that lets you expose APIs that respond to fetch 
requests from external services.

Use this file to create functions that expose the functionality of your site as a service. 
This functionality can be accessed by writing code that calls this site's APIs as defined by the 
functions you create here.

To learn more about using HTTP functions, including the endpoints for accessing the APIs, see:
https://wix.to/0lZ9qs8

*********
 Example
*********

The following HTTP function example returns the product of 2 operands.

To call this API, assuming this HTTP function is located in a premium site that is published 
and has the domain "mysite.com", you would use this URL:

https://mysite.com/_functions/multiply?leftOperand=3&rightOperand=4

Note: To access the APIs for your site, use one of the endpoint structures documented here:
https://wix.to/rZ5Dh89

***/

import { ok, badRequest } from 'wix-http-functions';
import wixPaymentProviderBackend from "wix-payment-provider-backend";

// Helper: Map PagBank charge status to Wix event object
function buildWixEventFromPagBank(body, charge) {
    const base = {
        wixTransactionId: body.reference_id,
        pluginTransactionId: body.id
    };
    // Refund event
    if (charge.amount && charge.amount.refunded && charge.amount.refunded > 0) {
        return {
            refund: {
                wixTransactionId: body.reference_id,
                pluginRefundId: charge.id,
                amount: String(charge.amount.refunded)
            }
        };
    }
    // Status-based transaction events
    switch (charge.status) {
        case 'PAID':
        case 'AUTHORIZED':
            return { transaction: base };
        case 'WAITING':
        case 'IN_ANALYSIS':
            return { transaction: { ...base, reasonCode: 5005 } };
        case 'CANCELED':
            return { transaction: { ...base, reasonCode: 3030, errorCode: 'BUYER_CANCELED', errorMessage: 'Buyer canceled the transaction.' } };
        case 'DECLINED': {
            // Map PagBank error codes/messages to Wix errorCode/errorMessage
            let errorCode = 'DECLINED';
            let errorMessage = 'Transaction declined.';
            let reasonCode = 0;
            if (charge.payment_response) {
                // Example: code 10000 = 'NAO AUTORIZADO PELO PAGSEGURO' (not authorized)
                errorCode = charge.payment_response.code;
                errorMessage = charge.payment_response.message;
            }
            return { transaction: { ...base, reasonCode, errorCode, errorMessage } };
        }
        default:
            return { transaction: base };
    }
}

// An endpoint for receiving notifications from PagBank
// Name is short on purpose, as PagBank's limit for notification URLs is 100 characters
export async function post_nt(request) {
    console.log("Received notification from PagBank:", request.body);
    const body = request.body && typeof request.body.json === "function" ? await request.body.json() : {};
    const response = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    // Defensive: check for required fields
    if (!body.id || !body.reference_id) {
        return badRequest(response);
    }

    // Defensive: check for charges array
    const charge = Array.isArray(body.charges) && body.charges.length > 0 ? body.charges[0] : null;
    if (!charge) {
        // No payment made yet, ignore or handle as needed
        return ok(response);
    }

    // Map PagBank status to Wix event
    const event = buildWixEventFromPagBank(body, charge);

    console.debug("Mapped event for Wix after PagBank Notification:", event);
    // Submit event to Wix
    await wixPaymentProviderBackend.submitEvent({ event });
    return ok(response);
}

// ## EXAMPLE ONLY ##
// An endpoint for receiving updates about transactions.
export async function post_updateTransaction(request) {
    const transactionRequestBody = await request.body.json();
    const response = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    // Validate the request content.
    if (transactionRequestBody.state === "Payment_Received") {
        // Update the transaction status on your site. This code assumes that the Wix
        // transaction ID and the payment provider's transaction ID are included in
        // the URL as query parameters.
        await wixPaymentProviderBackend.submitEvent({
            event: {
                transaction: {
                    wixTransactionId: request.query["wixTransactionId"],
                    pluginTransactionId: request.query["pluginTransactionId"],
                },
            },
        });
        return ok(response);
    } else {
        return badRequest(response);
    }
}

// ## EXAMPLE ONLY ##
// An endpoint for receiving updates about refunds.
export async function post_updateRefund(request) {
    const refundRequestBody = await request.body.json();
    const response = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    // Validate the request content.
    if (refundRequestBody.state === "approved") {
        // Update the refund status on your site. This code assumes that Wix
        // transaction and refund IDs as well as other refund information are
        // included in the URL as query parameters.
        await wixPaymentProviderBackend.submitEvent({
            event: {
                refund: {
                    wixTransactionId: request.query["wixTransactionId"],
                    wixRefundId: request.query["wixRefundId"],
                    pluginRefundId: refundRequestBody.reference_id,
                    amount: request.query["amount"],
                },
            },
        });
        return ok(response);
    } else {
        return badRequest(response);
    }
}


