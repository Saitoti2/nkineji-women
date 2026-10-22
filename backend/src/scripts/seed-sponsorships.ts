import dotenv from 'dotenv';
import { query } from '../db/connection.js';

dotenv.config();

/**
 * Records offline sponsorships: the donor, the person sponsored, and the gift
 * linking them. Matched by name so re-running updates rather than duplicates.
 *
 *   npx tsx src/scripts/seed-sponsorships.ts          # dry run
 *   npx tsx src/scripts/seed-sponsorships.ts --apply  # write
 */
const APPLY = process.argv.includes('--apply');

const CLOUDINARY = 'https://res.cloudinary.com/dssyfjokh/image/upload';

/** Shown wherever a person has no photo of their own. */
const PLACEHOLDER_AVATAR = '/placeholder-avatar.svg';

interface Sponsorship {
    donor: string;
    amount: number;
    /** A named individual, or null when the gift is designated to a programme. */
    beneficiary: string | null;
    /** Free-text designation when there is no named individual. */
    designation?: string;
    profileImageUrl?: string;
}

const SPONSORSHIPS: Sponsorship[] = [
    { donor: 'Eman Sharrif', amount: 260000, beneficiary: null, designation: 'Women Empowerment Programme' },
    { donor: 'Bettina Thierig', amount: 30000, beneficiary: 'Nemama Nchorira', profileImageUrl: `${CLOUDINARY}/mara-bloom/beneficiary-nemama-nchorira.jpg` },
    { donor: 'Anne Altman', amount: 26000, beneficiary: 'Rikoyian Maatany', profileImageUrl: `${CLOUDINARY}/mara-bloom/beneficiary-rikoyian-maatany.jpg` },
    { donor: 'Marliese Kai', amount: 35000, beneficiary: 'Leina Moriaso' },
];

// Offline gifts already received, recorded in Kenyan shillings.
const CURRENCY = 'KES';
const PAYMENT_METHOD = 'bank_transfer';
const STATUS = 'succeeded';

const makePseudoId = (name: string) =>
    `BEN-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

async function upsertDonor(name: string): Promise<string> {
    const existing = await query<{ id: string }>(
        'SELECT id FROM donors WHERE LOWER(name) = LOWER($1) AND is_deleted = FALSE LIMIT 1',
        [name]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const inserted = await query<{ id: string }>(
        'INSERT INTO donors (name, contact, preferences) VALUES ($1, $2, $3) RETURNING id',
        [name, JSON.stringify({}), JSON.stringify({ source: 'offline' })]
    );
    return inserted.rows[0].id;
}

async function upsertBeneficiary(name: string, profileImageUrl?: string): Promise<string> {
    // Falls back to the silhouette so every record renders a person, not a broken image.
    const imageUrl = profileImageUrl ?? PLACEHOLDER_AVATAR;

    const existing = await query<{ id: string }>(
        'SELECT id FROM beneficiaries WHERE LOWER(COALESCE(name, full_name_encrypted)) = LOWER($1) AND is_deleted = FALSE LIMIT 1',
        [name]
    );

    if (existing.rows.length > 0) {
        await query(
            'UPDATE beneficiaries SET name = $1, full_name_encrypted = $2, profile_image_url = $3, updated_at = NOW() WHERE id = $4',
            [name, name, imageUrl, existing.rows[0].id]
        );
        return existing.rows[0].id;
    }

    // full_name_encrypted is text and name is varchar, so the value is bound
    // twice rather than reused — Postgres cannot deduce one type for both.
    const inserted = await query<{ id: string }>(
        `INSERT INTO beneficiaries (pseudo_id, full_name_encrypted, name, profile_image_url, status)
         VALUES ($1, $2, $3, $4, 'active') RETURNING id`,
        [makePseudoId(name), name, name, imageUrl]
    );
    return inserted.rows[0].id;
}

async function upsertDonation(s: Sponsorship, donorId: string, beneficiaryId: string | null) {
    const metadata = {
        source: 'offline',
        ...(s.designation ? { designation: s.designation } : {}),
        ...(s.beneficiary ? { beneficiaryName: s.beneficiary } : {}),
    };

    const existing = await query<{ id: string }>(
        'SELECT id FROM donations WHERE donor_id = $1 AND amount = $2 AND is_deleted = FALSE LIMIT 1',
        [donorId, s.amount]
    );

    if (existing.rows.length > 0) {
        await query(
            `UPDATE donations SET beneficiary_id = $1, currency = $2, status = $3,
                payment_method = $4, metadata = $5, updated_at = NOW() WHERE id = $6`,
            [beneficiaryId, CURRENCY, STATUS, PAYMENT_METHOD, JSON.stringify(metadata), existing.rows[0].id]
        );
        return 'updated';
    }

    await query(
        `INSERT INTO donations (donor_id, beneficiary_id, amount, currency, payment_method, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [donorId, beneficiaryId, s.amount, CURRENCY, PAYMENT_METHOD, STATUS, JSON.stringify(metadata)]
    );
    return 'created';
}

async function main() {
    console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — ${SPONSORSHIPS.length} sponsorship(s)\n`);

    for (const s of SPONSORSHIPS) {
        const target = s.beneficiary ?? `${s.designation} (programme)`;
        const photo = s.beneficiary ? (s.profileImageUrl ? 'photo' : 'silhouette') : '—';
        console.log(`${s.donor.padEnd(18)} ${CURRENCY} ${String(s.amount).padStart(8)}  ->  ${target.padEnd(38)} ${photo}`);

        if (!APPLY) continue;

        const donorId = await upsertDonor(s.donor);
        const beneficiaryId = s.beneficiary ? await upsertBeneficiary(s.beneficiary, s.profileImageUrl) : null;
        const action = await upsertDonation(s, donorId, beneficiaryId);
        console.log(`  ${action}: donor=${donorId}${beneficiaryId ? ` beneficiary=${beneficiaryId}` : ''}`);
    }

    const total = SPONSORSHIPS.reduce((sum, s) => sum + s.amount, 0);
    console.log(`\nTotal: ${CURRENCY} ${total.toLocaleString()}`);
    if (!APPLY) console.log('Re-run with --apply to write.');
}

main()
    .then(() => process.exit(0))
    .catch((error) => { console.error('Seeding failed:', error.message); process.exit(1); });
