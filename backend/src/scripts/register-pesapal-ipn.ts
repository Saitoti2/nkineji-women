import dotenv from 'dotenv';
import { PesapalService } from '../services/pesapalService.js';
import { getPesapalIpnUrl } from '../utils/publicUrls.js';

dotenv.config();

/**
 * Ensures PesaPal has an IPN registered for THIS service's own host and prints
 * the id to use. The URL is derived from BACKEND_PUBLIC_URL rather than typed
 * by hand, so callbacks cannot be pointed at the frontend domain or a stale
 * host — either of which leaves every donation stuck pending.
 */
async function main() {
    const callbackUrl = getPesapalIpnUrl();

    console.log(`--- Ensuring PesaPal IPN: ${callbackUrl} ---`);
    console.log('Base URL:', process.env.PESAPAL_BASE_URL);

    const ipnId = await PesapalService.ensureIPN();

    console.log('\n✅ IPN active for this host.');
    console.log(`PESAPAL_IPN_ID="${ipnId}"`);

    const ipns = await PesapalService.listIPNs();
    console.log('\nAll registered IPNs:');
    for (const ipn of ipns) {
        const marker = ipn.ipn_id === ipnId ? '→' : ' ';
        console.log(`${marker} [${ipn.ipn_status_decription}] ${ipn.ipn_id}  ${ipn.url}`);
    }
}

main().catch((error) => {
    console.error('❌ Failed to register PesaPal IPN:', error.message);
    process.exit(1);
});
