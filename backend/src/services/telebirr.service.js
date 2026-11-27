'use strict';

const axios  = require('axios');
const crypto = require('crypto');

const APP_ID      = process.env.TELEBIRR_APP_ID;
const APP_KEY     = process.env.TELEBIRR_APP_KEY;
const SHORT_CODE  = process.env.TELEBIRR_SHORT_CODE;
const PUBLIC_KEY  = process.env.TELEBIRR_PUBLIC_KEY; // Base64 encoded RSA public key
const BASE_URL    = process.env.TELEBIRR_BASE_URL || 'https://api.ethiomobilemoney.et/ammapi/payment';

/**
 * Encrypt a value using the Telebirr RSA public key.
 */
const encryptWithPublicKey = (value) => {
  try {
    const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${PUBLIC_KEY}\n-----END PUBLIC KEY-----`;
    const encrypted = crypto.publicEncrypt(
      { key: pubKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      Buffer.from(String(value))
    );
    return encrypted.toString('base64');
  } catch (err) {
    throw new Error(`Telebirr RSA encryption failed: ${err.message}`);
  }
};

/**
 * Generate HMAC-SHA256 signature for request body.
 */
const generateSignature = (params) => {
  const sortedKeys  = Object.keys(params).sort();
  const queryString = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHmac('sha256', APP_KEY).update(queryString).digest('hex').toUpperCase();
};

/**
 * Initiate a Telebirr payment.
 * @param {Object} options - { amount, phone, transactionRef, description, returnUrl }
 */
const initiatePayment = async ({ amount, phone, transactionRef, description, returnUrl }) => {
  if (!APP_ID || !APP_KEY || !SHORT_CODE) {
    throw new Error('Telebirr credentials are not configured.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const notifyUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/transactions/telebirr/callback`;

  const ussd = {
    appId:         APP_ID,
    shortCode:     SHORT_CODE,
    timeStamp:     timestamp,
    nonce:         crypto.randomBytes(8).toString('hex'),
    outTradeNo:    transactionRef,
    totalAmount:   String(amount),
    receiveName:   'OLMS',
    subject:       description || 'Lottery Ticket Purchase',
    returnUrl:     returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
    notifyUrl,
    payerInfo:     encryptWithPublicKey(phone),
  };

  ussd.sign = generateSignature(ussd);

  const payload = {
    appid:   APP_ID,
    sign:    ussd.sign,
    ussd:    encryptWithPublicKey(JSON.stringify(ussd)),
  };

  const response = await axios.post(`${BASE_URL}/service/initiate`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  return {
    success:        response.data?.code === '0' || response.data?.success === true,
    toPayUrl:       response.data?.data?.toPayUrl,
    transactionRef,
    rawResponse:    response.data,
  };
};

/**
 * Verify a Telebirr payment status.
 */
const verifyPayment = async (transactionRef) => {
  const params = {
    appId:      APP_ID,
    outTradeNo: transactionRef,
    timeStamp:  Math.floor(Date.now() / 1000).toString(),
    nonce:      crypto.randomBytes(8).toString('hex'),
  };
  params.sign = generateSignature(params);

  const payload = {
    appid: APP_ID,
    sign:  params.sign,
    ussd:  encryptWithPublicKey(JSON.stringify(params)),
  };

  const response = await axios.post(`${BASE_URL}/service/queryTrade`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const data = response.data;
  return {
    success:        data?.code === '0',
    status:         data?.data?.tradeStatus || 'unknown',
    transactionRef,
    telebirrRef:    data?.data?.msisdn,
    rawResponse:    data,
  };
};

/**
 * Handle a Telebirr callback (webhook payload).
 */
const handleCallback = (payload) => {
  // In production, decrypt and verify signature
  const result = {
    transactionRef: payload.outTradeNo || payload.out_trade_no,
    telebirrRef:    payload.msisdn,
    status:         payload.tradeStatus === 'SUCCESS' ? 'Completed' : 'Failed',
    amount:         parseFloat(payload.totalAmount || 0),
  };
  return result;
};

module.exports = { initiatePayment, verifyPayment, handleCallback };
