-- ============================================
-- OPSFLOW VALIDATION QUERIES
-- ============================================

-- 1. Record counts
SELECT 'customers' AS table_name, COUNT(*) AS records FROM customers
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'request_types', COUNT(*) FROM request_types
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'request_events', COUNT(*) FROM request_events
UNION ALL
SELECT 'sla_events', COUNT(*) FROM sla_events
UNION ALL
SELECT 'escalations', COUNT(*) FROM escalations;


-- 2. Requests by priority
SELECT
    priority,
    COUNT(*) AS request_count
FROM requests
GROUP BY priority
ORDER BY request_count DESC;


-- 3. Requests by status
SELECT
    status,
    COUNT(*) AS request_count
FROM requests
GROUP BY status
ORDER BY request_count DESC;


-- 4. Requests by type
SELECT
    rt.type_name,
    COUNT(r.request_id) AS request_count
FROM request_types rt
LEFT JOIN requests r
    ON r.request_type_id = rt.request_type_id
GROUP BY rt.type_name
ORDER BY request_count DESC;


-- 5. Average resolution time by priority
SELECT
    priority,
    ROUND(AVG(resolution_time_hours), 2) AS avg_resolution_hours
FROM requests
WHERE resolved_at IS NOT NULL
GROUP BY priority
ORDER BY avg_resolution_hours DESC;


-- 6. SLA performance
SELECT
    COUNT(*) AS total_sla_events,
    COUNT(*) FILTER (WHERE breached = TRUE) AS breaches,
    ROUND(
        100.0 *
        COUNT(*) FILTER (WHERE breached = FALSE)
        / NULLIF(COUNT(*), 0),
        2
    ) AS compliance_percent
FROM sla_events;


-- 7. SLA breaches by customer
SELECT
    c.customer_name,
    COUNT(*) AS sla_breaches
FROM sla_events s
JOIN requests r
    ON r.request_id = s.request_id
JOIN customers c
    ON c.customer_id = r.customer_id
WHERE s.breached = TRUE
GROUP BY c.customer_name
ORDER BY sla_breaches DESC
LIMIT 10;


-- 8. Current open workload by employee
SELECT
    e.employee_name,
    t.team_name,
    COUNT(r.request_id) AS open_requests
FROM employees e
JOIN teams t
    ON t.team_id = e.team_id
LEFT JOIN requests r
    ON r.assigned_employee_id = e.employee_id
    AND r.status NOT IN ('Resolved', 'Closed', 'Cancelled')
GROUP BY e.employee_id, e.employee_name, t.team_name
ORDER BY open_requests DESC;


-- 9. Team workload vs capacity
SELECT
    t.team_name,
    t.capacity,
    COUNT(r.request_id) FILTER (
        WHERE r.status NOT IN ('Resolved', 'Closed', 'Cancelled')
    ) AS open_requests,
    ROUND(
        100.0 *
        COUNT(r.request_id) FILTER (
            WHERE r.status NOT IN ('Resolved', 'Closed', 'Cancelled')
        ) / t.capacity,
        2
    ) AS utilization_percent
FROM teams t
LEFT JOIN employees e
    ON e.team_id = t.team_id
LEFT JOIN requests r
    ON r.assigned_employee_id = e.employee_id
GROUP BY t.team_id, t.team_name, t.capacity
ORDER BY utilization_percent DESC;


-- 10. Requests currently at risk
SELECT
    r.request_id,
    c.customer_name,
    r.priority,
    r.status,
    r.created_at,
    r.due_at
FROM requests r
JOIN customers c
    ON c.customer_id = r.customer_id
WHERE r.status NOT IN ('Resolved', 'Closed', 'Cancelled')
  AND r.due_at < CURRENT_TIMESTAMP
ORDER BY r.due_at;