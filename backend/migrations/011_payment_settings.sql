CREATE TABLE IF NOT EXISTS payment_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default M-Pesa settings if not exists
INSERT INTO payment_settings (key, value)
VALUES (
    'mpesa',
    '{
        "paybill": "522533",
        "accountNumber": "8142935",
        "phoneNumber": "",
        "instructions": "Go to M-PESA menu > Lipa na M-PESA > Paybill > Enter Business No. 522533 > Enter Account No. 8142935 > Enter Amount > Enter PIN"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Insert default Bank Transfer settings if not exists
INSERT INTO payment_settings (key, value)
VALUES (
    'bank_transfer',
    '{
        "bankName": "",
        "accountName": "Nkineji CBO",
        "accountNumber": "1356633358",
        "swiftCode": "",
        "date": "25/09/2026",
        "instructions": "Please transfer the amount to the bank account above. Include your email as reference."
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
