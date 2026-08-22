CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    customer_tier VARCHAR(30) NOT NULL
        CHECK (customer_tier IN ('Standard', 'Premium', 'Enterprise')),
    account_manager VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(team_id),
    employee_name VARCHAR(120) NOT NULL,
    role VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE request_types (
    request_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE requests (
    request_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    request_type_id INTEGER NOT NULL REFERENCES request_types(request_type_id),
    assigned_employee_id INTEGER REFERENCES employees(employee_id),

    priority VARCHAR(20) NOT NULL
        CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'New',
                'Assigned',
                'In Progress',
                'Waiting',
                'Resolved',
                'Closed',
                'Cancelled'
            )
        ),

    created_at TIMESTAMP NOT NULL,
    first_response_at TIMESTAMP,
    due_at TIMESTAMP,
    resolved_at TIMESTAMP,

    first_response_hours NUMERIC(10,2),
    resolution_time_hours NUMERIC(10,2),

    CHECK (
        resolved_at IS NULL
        OR resolved_at >= created_at
    )
);

CREATE TABLE request_events (
    event_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(request_id),
    event_type VARCHAR(50) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    employee_id INTEGER REFERENCES employees(employee_id),
    event_timestamp TIMESTAMP NOT NULL
);

CREATE TABLE sla_events (
    sla_event_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(request_id),
    sla_type VARCHAR(50) NOT NULL,
    target_hours INTEGER NOT NULL CHECK (target_hours > 0),
    breached BOOLEAN NOT NULL DEFAULT FALSE,
    breached_at TIMESTAMP,
    resolved_within_sla BOOLEAN
);

CREATE TABLE escalations (
    escalation_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(request_id),
    reason VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL
        CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_to INTEGER REFERENCES employees(employee_id),
    status VARCHAR(30) NOT NULL DEFAULT 'Open'
        CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_requests_customer
    ON requests(customer_id);

CREATE INDEX idx_requests_employee
    ON requests(assigned_employee_id);

CREATE INDEX idx_requests_status
    ON requests(status);

CREATE INDEX idx_requests_created
    ON requests(created_at);

CREATE INDEX idx_request_events_request
    ON request_events(request_id);

CREATE INDEX idx_sla_events_request
    ON sla_events(request_id);

CREATE INDEX idx_escalations_request
    ON escalations(request_id);