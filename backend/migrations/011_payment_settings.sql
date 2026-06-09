`CREATE TABLE IF NOT EXISTS payment_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default M-Pesa settings if not exists
INSERT INTO payment_settings (key, value)
VALUES (
    'mpesa',
    '{
        "paybill": "",
        "accountNumber": "",
        "phoneNumber": "", 
        "instructions": "Go to M-PESA menu > Lipa na M-PESA > Paybill > Enter Business No. > Enter Account No. > Enter Amount > Enter PIN"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Insert default Bank Transfer settings if not exists
INSERT INTO payment_settings (key, value)
VALUES (
    'bank_transfer',
    '{
        "bankName": "",
        "accountName": "",
        "accountNumber": "",
        "swiftCode": "",
        "instructions": "Please transfer the amount to the bank account above. Include your email as reference."
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
