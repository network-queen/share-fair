CREATE TABLE IF NOT EXISTS insurance_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    coverage_type   VARCHAR(20) NOT NULL,
    premium_amount  NUMERIC(10,2) NOT NULL,
    max_coverage    NUMERIC(10,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMP NOT NULL,

    CONSTRAINT insurance_coverage_type_check CHECK (coverage_type IN ('BASIC', 'STANDARD', 'PREMIUM')),
    CONSTRAINT insurance_status_check CHECK (status IN ('ACTIVE', 'EXPIRED', 'CLAIMED'))
);

CREATE TABLE IF NOT EXISTS insurance_claims (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id        UUID NOT NULL REFERENCES insurance_policies(id),
    claimant_id      UUID NOT NULL REFERENCES users(id),
    description      TEXT NOT NULL,
    claim_amount     NUMERIC(10,2) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    resolution_notes TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at      TIMESTAMP,

    CONSTRAINT insurance_claim_status_check CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'))
);

CREATE INDEX idx_insurance_policies_transaction ON insurance_policies(transaction_id);
CREATE INDEX idx_insurance_policies_user ON insurance_policies(user_id);
CREATE INDEX idx_insurance_claims_policy ON insurance_claims(policy_id);
CREATE INDEX idx_insurance_claims_claimant ON insurance_claims(claimant_id);
