import psycopg
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OpsFlow API",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5433,
    "dbname": "opsflow",
    "user": "opsflow",
    "password": "opsflow_dev",
}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "opsflow-api",
    }


@app.get("/health/db")
def database_health_check():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            result = cur.fetchone()

    return {
        "status": "ok",
        "database": "connected",
        "test": result[0],
    }


@app.get("/requests")
def get_requests(
    status: str | None = None,
    priority: str | None = None,
    limit: int = 25,
    offset: int = 0,
):
    if limit < 1 or limit > 100:
        limit = 25

    if offset < 0:
        offset = 0

    query = """
        SELECT
            request_id,
            customer_id,
            request_type_id,
            assigned_employee_id,
            priority,
            status,
            created_at
        FROM requests
    """

    conditions = []
    params = []

    if status:
        conditions.append("status = %s")
        params.append(status)

    if priority:
        conditions.append("priority = %s")
        params.append(priority)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += """
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """

    params.extend([limit, offset])

    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()

    return [
        {
            "request_id": row[0],
            "customer_id": row[1],
            "request_type_id": row[2],
            "assigned_employee_id": row[3],
            "priority": row[4],
            "status": row[5],
            "created_at": row[6],
        }
        for row in rows
    ]


@app.get("/metrics/overview")
def get_metrics_overview():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    COUNT(*) AS total_requests,
                    COUNT(*) FILTER (
                        WHERE status NOT IN (
                            'Resolved',
                            'Closed',
                            'Cancelled'
                        )
                    ) AS open_requests,
                    COUNT(*) FILTER (
                        WHERE priority = 'Critical'
                    ) AS critical_requests,
                    COUNT(*) FILTER (
                        WHERE status = 'Resolved'
                    ) AS resolved_requests,
                    ROUND(
                        AVG(resolution_time_hours)::numeric,
                        2
                    ) AS average_resolution_hours
                FROM requests
            """)

            request_metrics = cur.fetchone()

            cur.execute("""
                SELECT
                    COUNT(*) AS total_sla_events,
                    COUNT(*) FILTER (
                        WHERE breached = TRUE
                    ) AS breached_sla_events
                FROM sla_events
            """)

            sla_metrics = cur.fetchone()

            cur.execute("""
                SELECT
                    COUNT(*) AS open_escalations
                FROM escalations
                WHERE status != 'Resolved'
            """)

            escalation_metrics = cur.fetchone()

    total_sla_events = sla_metrics[0]
    breached_sla_events = sla_metrics[1]

    sla_breach_rate = (
        round(
            (breached_sla_events / total_sla_events) * 100,
            2,
        )
        if total_sla_events
        else 0
    )

    return {
        "total_requests": request_metrics[0],
        "open_requests": request_metrics[1],
        "critical_requests": request_metrics[2],
        "resolved_requests": request_metrics[3],
        "average_resolution_hours": request_metrics[4],
        "sla_breach_rate": sla_breach_rate,
        "open_escalations": escalation_metrics[0],
    }


@app.get("/metrics/teams")
def get_team_metrics():
    query = """
        SELECT
            t.team_id,
            t.team_name,
            t.department,
            t.capacity,

            COUNT(DISTINCT r.request_id) AS total_requests,

            COUNT(DISTINCT r.request_id) FILTER (
                WHERE r.status NOT IN (
                    'Resolved',
                    'Closed',
                    'Cancelled'
                )
            ) AS open_requests,

            COUNT(DISTINCT r.request_id) FILTER (
                WHERE r.status = 'Resolved'
            ) AS resolved_requests,

            ROUND(
                AVG(r.resolution_time_hours)::numeric,
                2
            ) AS average_resolution_hours,

            COUNT(DISTINCT se.sla_event_id) AS total_sla_events,

            COUNT(DISTINCT se.sla_event_id) FILTER (
                WHERE se.breached = TRUE
            ) AS breached_sla_events,

            COUNT(DISTINCT e.escalation_id) FILTER (
                WHERE e.status != 'Resolved'
            ) AS open_escalations

        FROM teams t

        LEFT JOIN employees emp
            ON emp.team_id = t.team_id

        LEFT JOIN requests r
            ON r.assigned_employee_id = emp.employee_id

        LEFT JOIN sla_events se
            ON se.request_id = r.request_id

        LEFT JOIN escalations e
            ON e.request_id = r.request_id

        GROUP BY
            t.team_id,
            t.team_name,
            t.department,
            t.capacity

        ORDER BY total_requests DESC
    """

    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            rows = cur.fetchall()

    results = []

    for row in rows:
        total_sla_events = row[8]
        breached_sla_events = row[9]

        sla_breach_rate = (
            round(
                (breached_sla_events / total_sla_events) * 100,
                2,
            )
            if total_sla_events
            else 0
        )

        results.append(
            {
                "team_id": row[0],
                "team_name": row[1],
                "department": row[2],
                "capacity": row[3],
                "total_requests": row[4],
                "open_requests": row[5],
                "resolved_requests": row[6],
                "average_resolution_hours": row[7],
                "total_sla_events": total_sla_events,
                "breached_sla_events": breached_sla_events,
                "sla_breach_rate": sla_breach_rate,
                "open_escalations": row[10],
            }
        )

    return results


@app.get("/metrics/sla")
def get_sla_metrics():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    COUNT(*) AS total_sla_events,
                    COUNT(*) FILTER (
                        WHERE breached = TRUE
                    ) AS breached_sla_events,
                    COUNT(*) FILTER (
                        WHERE breached = FALSE
                    ) AS successful_sla_events
                FROM sla_events
            """)

            overall = cur.fetchone()

            cur.execute("""
                SELECT
                    rt.request_type_id,
                    rt.type_name,

                    COUNT(se.sla_event_id) AS total_sla_events,

                    COUNT(se.sla_event_id) FILTER (
                        WHERE se.breached = TRUE
                    ) AS breached_sla_events

                FROM request_types rt

                LEFT JOIN requests r
                    ON r.request_type_id = rt.request_type_id

                LEFT JOIN sla_events se
                    ON se.request_id = r.request_id

                GROUP BY
                    rt.request_type_id,
                    rt.type_name

                ORDER BY
                    total_sla_events DESC
            """)

            request_type_rows = cur.fetchall()

            cur.execute("""
                SELECT
                    r.priority,

                    COUNT(se.sla_event_id) AS total_sla_events,

                    COUNT(se.sla_event_id) FILTER (
                        WHERE se.breached = TRUE
                    ) AS breached_sla_events

                FROM requests r

                LEFT JOIN sla_events se
                    ON se.request_id = r.request_id

                GROUP BY
                    r.priority

                ORDER BY
                    CASE r.priority
                        WHEN 'Critical' THEN 1
                        WHEN 'High' THEN 2
                        WHEN 'Medium' THEN 3
                        WHEN 'Low' THEN 4
                    END
            """)

            priority_rows = cur.fetchall()

    total_sla_events = overall[0]
    breached_sla_events = overall[1]
    successful_sla_events = overall[2]

    overall_breach_rate = (
        round(
            (breached_sla_events / total_sla_events) * 100,
            2,
        )
        if total_sla_events
        else 0
    )

    request_types = []

    for row in request_type_rows:
        total = row[2]
        breached = row[3]

        breach_rate = (
            round((breached / total) * 100, 2)
            if total
            else 0
        )

        request_types.append(
            {
                "request_type_id": row[0],
                "request_type": row[1],
                "total_sla_events": total,
                "breached_sla_events": breached,
                "sla_breach_rate": breach_rate,
            }
        )

    priorities = []

    for row in priority_rows:
        total = row[1]
        breached = row[2]

        breach_rate = (
            round((breached / total) * 100, 2)
            if total
            else 0
        )

        priorities.append(
            {
                "priority": row[0],
                "total_sla_events": total,
                "breached_sla_events": breached,
                "sla_breach_rate": breach_rate,
            }
        )

    return {
        "overall": {
            "total_sla_events": total_sla_events,
            "breached_sla_events": breached_sla_events,
            "successful_sla_events": successful_sla_events,
            "sla_breach_rate": overall_breach_rate,
        },
        "by_request_type": request_types,
        "by_priority": priorities,
    }

@app.get("/metrics/performance")
def get_performance_metrics():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    e.employee_id,
                    e.employee_name,
                    e.role,
                    t.team_name,
                    COUNT(r.request_id) AS total_requests,
                    COUNT(r.request_id) FILTER (
                        WHERE r.status IN ('Resolved', 'Closed')
                    ) AS resolved_requests,
                    COUNT(r.request_id) FILTER (
                        WHERE r.priority = 'Critical'
                    ) AS critical_requests,
                    ROUND(
                        AVG(r.resolution_time_hours)::numeric,
                        2
                    ) AS average_resolution_hours,
                    COUNT(se.sla_event_id) FILTER (
                        WHERE se.breached = TRUE
                    ) AS sla_breaches
                FROM employees e
                JOIN teams t
                    ON e.team_id = t.team_id
                LEFT JOIN requests r
                    ON e.employee_id = r.assigned_employee_id
                LEFT JOIN sla_events se
                    ON r.request_id = se.request_id
                GROUP BY
                    e.employee_id,
                    e.employee_name,
                    e.role,
                    t.team_name
                ORDER BY total_requests DESC
            """)

            rows = cur.fetchall()

    return [
        {
            "employee_id": row[0],
            "employee_name": row[1],
            "role": row[2],
            "team_name": row[3],
            "total_requests": row[4],
            "resolved_requests": row[5],
            "critical_requests": row[6],
            "average_resolution_hours": row[7],
            "sla_breaches": row[8],
        }
        for row in rows
    ]

@app.get("/metrics/workload")
def get_workload_metrics():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    t.team_id,
                    t.team_name,
                    t.department,
                    t.capacity,

                    COUNT(r.request_id) AS total_requests,

                    COUNT(r.request_id) FILTER (
                        WHERE r.status NOT IN (
                            'Resolved',
                            'Closed',
                            'Cancelled'
                        )
                    ) AS open_requests,

                    COUNT(r.request_id) FILTER (
                        WHERE r.priority = 'Critical'
                    ) AS critical_requests,

                    COUNT(se.sla_event_id) FILTER (
                        WHERE se.breached = TRUE
                    ) AS sla_breaches

                FROM teams t

                LEFT JOIN employees e
                    ON t.team_id = e.team_id

                LEFT JOIN requests r
                    ON e.employee_id = r.assigned_employee_id

                LEFT JOIN sla_events se
                    ON r.request_id = se.request_id

                GROUP BY
                    t.team_id,
                    t.team_name,
                    t.department,
                    t.capacity

                ORDER BY open_requests DESC
            """)

            rows = cur.fetchall()

    return [
        {
            "team_id": row[0],
            "team_name": row[1],
            "department": row[2],
            "capacity": row[3],
            "total_requests": row[4],
            "open_requests": row[5],
            "critical_requests": row[6],
            "sla_breaches": row[7],
        }
        for row in rows
    ]

@app.get("/metrics/request-types")
def get_request_type_metrics():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            cur.execute("""
                SELECT
                    rt.request_type_id,
                    rt.type_name,

                    COUNT(r.request_id) AS total_requests,

                    COUNT(r.request_id) FILTER (
                        WHERE r.status NOT IN (
                            'Resolved',
                            'Closed',
                            'Cancelled'
                        )
                    ) AS open_requests,

                    COUNT(r.request_id) FILTER (
                        WHERE r.priority = 'Critical'
                    ) AS critical_requests,

                    COUNT(r.request_id) FILTER (
                        WHERE r.status IN ('Resolved', 'Closed')
                    ) AS resolved_requests,

                    ROUND(
                        AVG(r.resolution_time_hours)::numeric,
                        2
                    ) AS average_resolution_hours,

                    COUNT(se.sla_event_id) AS total_sla_events,

                    COUNT(se.sla_event_id) FILTER (
                        WHERE se.breached = TRUE
                    ) AS sla_breaches

                FROM request_types rt

                LEFT JOIN requests r
                    ON rt.request_type_id = r.request_type_id

                LEFT JOIN sla_events se
                    ON r.request_id = se.request_id

                GROUP BY
                    rt.request_type_id,
                    rt.type_name

                ORDER BY total_requests DESC
            """)

            rows = cur.fetchall()

    return [
        {
            "request_type_id": row[0],
            "type_name": row[1],
            "total_requests": row[2],
            "open_requests": row[3],
            "critical_requests": row[4],
            "resolved_requests": row[5],
            "average_resolution_hours": row[6],
            "total_sla_events": row[7],
            "sla_breaches": row[8],
            "sla_breach_rate": (
                round((row[8] / row[7]) * 100, 2)
                if row[7]
                else 0
            ),
        }
        for row in rows
    ]