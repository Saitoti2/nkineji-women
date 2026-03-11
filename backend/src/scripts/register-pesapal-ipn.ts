import dotenv from 'dotenv';
import { PesapalService } from '../services/pesapalService.js';
import { logger } from '../utils/logger.js';

dotenv.config();

async function registerIPN() {
    const callbackUrl = process.argv[2];

    if (!callbackUrl) {
        console.error('Usage: tsx src/scripts/register-pesapal-ipn.ts <YOUR_PUBLIC_IPN_URL>');
        console.error('Example: tsx src/scripts/register-pesapal-ipn.ts https://api.nkineji.org/api/v1/donations/webhooks/pesapal');
        process.exit(1);
    }

    console.log(`--- Registering PesaPal IPN: ${callbackUrl} ---`);
    console.log('Base URL:', process.env.PESAPAL_BASE_URL);

    try {
        const ipnId = await PesapalService.registerIPN(callbackUrl);
        console.log('\n✅ IPN Registration Successful!');
        console.log('IPN ID:', ipnId);
        console.log('\n👉 PLEASE UPDATE YOUR .env FILE:');
        console.log(`PESAPAL_IPN_ID="${ipnId}"`);

    } catch (error: any) {
        console.error('❌ IPN Registration Failed:');
        console.error(error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

registerIPN();
