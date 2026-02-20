CREATE TABLE IF NOT EXISTS disputes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL REFERENCES transactions(id),
    reporter_id     UUID NOT NULL REFERENCES users(id),
    reason          VARCHAR(100) NOT NULL,
    details         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution      TEXT,
    resolved_by_id  UUID REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMP,

    CONSTRAINT disputes_status_check CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED')),
    CONSTRAINT disputes_reason_check CHECK (reason IN ('ITEM_NOT_RETURNED', 'ITEM_DAMAGED', 'NO_SHOW', 'PAYMENT_ISSUE', 'MISREPRESENTATION', 'OTHER'))
);

CREATE INDEX idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX idx_disputes_reporter_id ON disputes(reporter_id);
CREATE INDEX idx_disputes_status ON disputes(status);
