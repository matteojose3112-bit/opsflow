INSERT INTO teams (team_name, department, capacity)
VALUES
    ('Operations', 'Operations', 80),
    ('Customer Success', 'Customer Experience', 70),
    ('Technical Support', 'Technology', 65),
    ('Field Services', 'Operations', 60);

INSERT INTO request_types (type_name, description)
VALUES
    ('Technical Issue', 'Technical problem requiring investigation or resolution'),
    ('Billing', 'Billing, invoice, or payment related request'),
    ('Onboarding', 'Customer onboarding and implementation request'),
    ('Service Request', 'Standard operational service request'),
    ('Account Change', 'Customer account or configuration change'),
    ('General Support', 'General customer support request');