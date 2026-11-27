'use strict';

const axios = require('axios');
const crypto = require('crypto');

const MERCHANT_ID = process.env.CBE_MERCHANT_ID;
const API_KEY     = process.env.CBE_API_KEY;
const BASE_URL    = process.env.CBE_BASE_URL || 'https://api.cbe.com.et/payment';

/**
 * Generate HMAC-SHA256 signature for CBE API requests.
 */
const generateSignature = (data) => {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHmac('sha256', API_KEY).update(payload).digest('hex');
};

/**
 * Initiate a CBE Birr payment.
 */
const initiatePayment = async ({ amount, phone, transactionRef, description }) => {
  if (!MERCHANT_ID || !API_KEY) {
    throw new Error('CBE payment credentials are not configured.');
  }

  const payload = {
    merchantId:    MERCHANT_ID,
    outTradeNo:    transactionRef,
    totalAmount:   String(amount),
    currency:      'ETB',
    payerPhone:    phone,
    subject:       description || 'Lottery Ticket Purchase',
    notifyUrl:     `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/transactions/cbe/callback`,
    returnUrl:     `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
    timestamp:     Date.now().toString(),
    nonce:         crypto.randomBytes(8).toString('hex'),
  };

  payload.sign = generateSignature(payload);

  const response = await axios.post(`${BASE_URL}/v1/create`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Merchant-Id': MERCHANT_ID,
      'X-Signature':   payload.sign,
    },
    timeout: 15000,
  });

  return {
    success:        response.data?.code === '0' || response.data?.success === true,
    paymentUrl:     response.data?.data?.paymentUrl,
    transactionRef,
    rawResponse:    response.data,
  };
};

/**
 * Verify a CBE Birr payment.
 */
const verifyPayment = async (transactionRef) => {
  const params = {
    merchantId: MERCHANT_ID,
    outTradeNo: transactionRef,
    timestamp:  Date.now().toString(),
    nonce:      crypto.randomBytes(8).toString('hex'),
  };
  params.sign = generateSignature(params);

  const response = await axios.get(`${BASE_URL}/v1/query`, {
    params,
    headers: {
      'X-Merchant-Id': MERCHANT_ID,
      'X-Signature':   params.sign,
    },
    timeout: 15000,
  });

  const data = response.data;
  return {
    success:        data?.code === '0',
    status:         data?.data?.status || 'unknown',
    transactionRef,
    cbeRef:         data?.data?.cbeRef,
    rawResponse:    data,
  };
};

/**
 * Handle CBE Birr callback (webhook payload).
 */
const handleCallback = (payload) => {
  return {
    transactionRef: payload.outTradeNo || payload.out_trade_no,
    cbeRef:         payload.cbeRef,
    status:         payload.status === 'SUCCESS' ? 'Completed' : 'Failed',
    amount:         parseFloat(payload.totalAmount || 0),
  };
};

module.exports = { initiatePayment, verifyPayment, handleCallback };
