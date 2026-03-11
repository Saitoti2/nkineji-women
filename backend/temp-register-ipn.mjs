import 'dotenv/config';
import { PesapalService } from './src/services/pesapalService.js';

async function main() {
    try {
        const url = 'https://nkineji.org/api/v1/donations/webhooks/pesapal';
        console.log('Registering IPN for:', url);
        const ipnId = await PesapalService.registerIPN(url);
        console.log('SUCCESS! IPN_ID:', ipnId);
    } catch (e) {
        console.error('FAILED TO REGISTER IPN:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

main();
