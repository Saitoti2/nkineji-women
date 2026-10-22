import dotenv from 'dotenv';
import { query } from '../db/connection.js';
import { PesapalService, mapPesapalOutcome } from '../services/pesapalService.js';
import { updateDonationStatus } from '../services/donationService.js';

dotenv.config();

/**
 * Re-reads the authoritative status of every non-final PesaPal donation and
 * optionally writes it back. Use this to recover donations whose IPN never
 * arrived (e.g. while the IPN was registered against the wrong host).
 *
 *   npx tsx src/scripts/reconcile-pesapal-donations.ts          # dry run
 *   npx tsx src/scripts/reconcile-pesapal-donations.ts --apply  # write
 */
const APPLY = process.argv.includes('--apply');

const OUTCOME_TO_STATUS: Record<string, string | null> = {
    completed: 'succeeded',
    failed: 'failed',
    reversed: 'refunded',
    invalid: null,
    unknown: null,
};

async function main() {
    const { rows } = await query<{ id: string; status: string; payment_provider_id: string; amount: string; currency: string; created_at: string }>(
        `SELECT id, status, payment_provider_id, amount, currency, created_at
         FROM donations
         WHERE payment_method = 'pesapal'
           AND is_deleted = FALSE
           AND payment_provider_id IS NOT NULL
           AND status NOT IN ('succeeded', 'refunded')
         ORDER BY created_at`
    );

    console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${rows.length} PesaPal donation(s) to check\n`);

    const tally: Record<string, number> = {};
    let changed = 0;

    for (const d of rows) {
        let outcome: string;
        let detail = '';

        try {
            const status = await PesapalService.getTransactionStatus(d.payment_provider_id);
            outcome = mapPesapalOutcome(status);
            detail = `${status?.payment_status_description ?? '?'} / code=${status?.status_code ?? '?'}`;
            if (status?.confirmation_code) detail += ` / conf=${status.confirmation_code}`;
        } catch (error: any) {
            outcome = 'error';
            detail = error.message;
        }

        tally[outcome] = (tally[outcome] ?? 0) + 1;

        const next = OUTCOME_TO_STATUS[outcome] ?? null;
        const willChange = next !== null && next !== d.status;

        console.log(
            `${d.created_at.toString().slice(0, 10)}  ${d.currency} ${String(d.amount).padStart(10)}  ` +
            `${d.status.padEnd(9)} -> ${(next ?? d.status).padEnd(9)} ${willChange ? '*' : ' '}  ${detail}`
        );

        if (willChange) {
            changed++;
            if (APPLY) await updateDonationStatus(d.id, next!);
        }
    }

    console.log('\n--- PesaPal outcomes ---');
    for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(10)} ${v}`);
    console.log(`\n${changed} donation(s) ${APPLY ? 'updated' : 'would change'}.`);
    if (!APPLY && changed > 0) console.log('Re-run with --apply to write these changes.');
}

main()
    .then(() => process.exit(0))
    .catch((error) => { console.error('Reconciliation failed:', error.message); process.exit(1); });
