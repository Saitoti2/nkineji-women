-- Set the live Nkineji CBO payment details.
-- Migration 011 seeds these with ON CONFLICT DO NOTHING, so databases created
-- before this change still hold the original blank values. This migration
-- merges the real details over whatever is stored, leaving any other
-- admin-entered fields (phone number, bank name, swift code) untouched.

CREATE TABLE IF NOT EXISTS payment_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- M-PESA: Paybill 522533, Account 8142935
INSERT INTO payment_settings (key, value, updated_at)
VALUES (
    'mpesa',
    '{
        "paybill": "522533",
        "accountNumber": "8142935",
        "phoneNumber": "",
        "instructions": "Go to M-PESA menu > Lipa na M-PESA > Paybill > Enter Business No. 522533 > Enter Account No. 8142935 > Enter Amount > Enter PIN"
    }'::jsonb,
    NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = payment_settings.value || jsonb_build_object(
        'paybill', '522533',
        'accountNumber', '8142935'
    ),
    updated_at = NOW();

-- Bank: Account Title "Nkineji CBO", Account Number 1356633358, dated 25/09/2026
INSERT INTO payment_settings (key, value, updated_at)
VALUES (
    'bank_transfer',
    '{
        "bankName": "",
        "accountName": "Nkineji CBO",
        "accountNumber": "1356633358",
        "swiftCode": "",
        "date": "25/09/2026",
        "instructions": "Please transfer the amount to the bank account above. Include your email as reference."
    }'::jsonb,
    NOW()
)
ON CONFLICT (key) DO UPDATE
SET value = payment_settings.value || jsonb_build_object(
        'accountName', 'Nkineji CBO',
        'accountNumber', '1356633358',
        'date', '25/09/2026'
    ),
    updated_at = NOW();

-- Refresh the M-PESA instructions only when they are blank or still the
-- original seeded text, so custom wording written by an admin is preserved.
UPDATE payment_settings
SET value = value || jsonb_build_object(
        'instructions',
        'Go to M-PESA menu > Lipa na M-PESA > Paybill > Enter Business No. 522533 > Enter Account No. 8142935 > Enter Amount > Enter PIN'
    ),
    updated_at = NOW()
WHERE key = 'mpesa'
  AND COALESCE(value->>'instructions', '') IN (
        '',
        'Go to M-PESA menu > Lipa na M-PESA > Paybill > Enter Business No. > Enter Account No. > Enter Amount > Enter PIN'
    );
