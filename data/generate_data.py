import os
import random
from datetime import datetime, timedelta

import psycopg
from dotenv import load_dotenv
from faker import Faker

load_dotenv()

fake = Faker()
random.seed(42)
Faker.seed(42)

DB_CONFIG = {
    "host": os.getenv("DATABASE_HOST", "localhost"),
    "port": os.getenv("DATABASE_PORT", "5433"),
    "dbname": os.getenv("DATABASE_NAME", "opsflow"),
    "user": os.getenv("DATABASE_USER", "opsflow"),
    "password": os.getenv("DATABASE_PASSWORD", "opsflow_dev"),
}

INDUSTRIES = [
    "Logistics",
    "Healthcare",
    "Financial Services",
    "Manufacturing",
    "Retail",
    "Technology",
    "Professional Services",
    "Hospitality",
]

TIERS = ["Standard", "Premium", "Enterprise"]

ROLES = {
    "Operations": ["Operations Specialist", "Operations Coordinator", "Team Lead"],
    "Customer Success": ["Customer Success Manager", "Customer Success Specialist", "Team Lead"],
    "Technical Support": ["Support Specialist", "Technical Analyst", "Team Lead"],
    "Field Services": ["Field Coordinator", "Field Specialist", "Team Lead"],
}

PRIORITIES = ["Low", "Medium", "High", "Critical"]

PRIORITY_WEIGHTS = [0.40, 0.40, 0.15, 0.05]

SLA_HOURS = {
    "Low": 48,
    "Medium": 24,
    "High": 8,
    "Critical": 4,
}

STATUS_FLOW = [
    "New",
    "Assigned",
    "In Progress",
    "Waiting",
    "Resolved",
]


def weighted_priority():
    return random.choices(
        PRIORITIES,
        weights=PRIORITY_WEIGHTS,
        k=1
    )[0]


def generate_customers(cur, count=50):
    customers = []

    for _ in range(count):
        name = fake.unique.company()
        industry = random.choice(INDUSTRIES)
        tier = random.choices(
            TIERS,
            weights=[0.55, 0.30, 0.15],
            k=1
        )[0]
        manager = fake.name()
        created = fake.date_time_between(
            start_date="-2y",
            end_date="-30d"
        )

        cur.execute(
            """
            INSERT INTO customers
                (customer_name, industry, customer_tier,
                 account_manager, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING customer_id
            """,
            (name, industry, tier, manager, created),
        )

        customers.append(cur.fetchone()[0])

    return customers


def generate_employees(cur):
    team_ids = {}

    cur.execute("SELECT team_id, team_name FROM teams")

    for team_id, team_name in cur.fetchall():
        team_ids[team_name] = team_id

    employees = []

    for team_name, team_id in team_ids.items():
        for _ in range(6):
            role = random.choice(ROLES[team_name])

            cur.execute(
                """
                INSERT INTO employees
                    (team_id, employee_name, role, active)
                VALUES (%s, %s, %s, TRUE)
                RETURNING employee_id
                """,
                (team_id, fake.name(), role),
            )

            employees.append(cur.fetchone()[0])

    return employees


def get_request_types(cur):
    cur.execute(
        "SELECT request_type_id FROM request_types"
    )
    return [row[0] for row in cur.fetchall()]


def generate_requests(cur, customers, employees, request_types, count=1500):
    now = datetime.now()
    requests = []

    for _ in range(count):

        customer_id = random.choice(customers)
        employee_id = random.choice(employees)
        request_type_id = random.choice(request_types)

        priority = weighted_priority()

        created_at = now - timedelta(
            days=random.randint(0, 365),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
        )

        # Make a subset of technical issues slower.
        technical_bias = random.random() < 0.25

        first_response_hours = max(
            0.25,
            random.gauss(
                2.5 if priority in ["High", "Critical"] else 8,
                2.5
            )
        )

        target = SLA_HOURS[priority]

        # Deliberately create realistic variation.
        resolution_hours = max(
            first_response_hours + 0.5,
            random.gauss(
                12 if not technical_bias else 20,
                8
            )
        )

        is_recent = created_at > now - timedelta(days=30)

        if is_recent and random.random() < 0.35:
            status = random.choice([
                "New",
                "Assigned",
                "In Progress",
                "Waiting",
            ])
            resolved_at = None
        else:
            status = random.choices(
                ["Resolved", "Closed", "Cancelled"],
                weights=[0.55, 0.40, 0.05],
                k=1,
            )[0]

            resolved_at = created_at + timedelta(
                hours=resolution_hours
            )

        first_response_at = created_at + timedelta(
            hours=first_response_hours
        )

        due_at = created_at + timedelta(hours=target)

        if resolved_at:
            resolution_value = round(
                (resolved_at - created_at).total_seconds() / 3600,
                2
            )
        else:
            resolution_value = None

        cur.execute(
            """
            INSERT INTO requests (
                customer_id,
                request_type_id,
                assigned_employee_id,
                priority,
                status,
                created_at,
                first_response_at,
                due_at,
                resolved_at,
                first_response_hours,
                resolution_time_hours
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s
            )
            RETURNING request_id
            """,
            (
                customer_id,
                request_type_id,
                employee_id,
                priority,
                status,
                created_at,
                first_response_at,
                due_at,
                resolved_at,
                round(first_response_hours, 2),
                resolution_value,
            ),
        )

        requests.append(
            {
                "request_id": cur.fetchone()[0],
                "customer_id": customer_id,
                "employee_id": employee_id,
                "priority": priority,
                "status": status,
                "created_at": created_at,
                "first_response_at": first_response_at,
                "resolved_at": resolved_at,
                "due_at": due_at,
            }
        )

    return requests


def generate_events(cur, requests):
    for request in requests:

        request_id = request["request_id"]
        employee_id = request["employee_id"]
        created_at = request["created_at"]

        event_time = created_at

        statuses = [
            "New",
            "Assigned",
            "In Progress",
        ]

        if request["status"] == "Waiting":
            statuses.append("Waiting")

        if request["resolved_at"]:
            statuses.append("Resolved")

        previous = None

        for status in statuses:

            event_time += timedelta(
                minutes=random.randint(10, 240)
            )

            event_type = (
                "Created"
                if status == "New"
                else "Status Change"
            )

            cur.execute(
                """
                INSERT INTO request_events (
                    request_id,
                    event_type,
                    old_status,
                    new_status,
                    employee_id,
                    event_timestamp
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    request_id,
                    event_type,
                    previous,
                    status,
                    employee_id,
                    event_time,
                ),
            )

            previous = status


def generate_sla_events(cur, requests):
    for request in requests:

        priority = request["priority"]
        target = SLA_HOURS[priority]

        resolved_at = request["resolved_at"]
        due_at = request["due_at"]

        breached = (
            resolved_at is not None
            and resolved_at > due_at
        )

        # Some open requests are already overdue.
        if resolved_at is None and datetime.now() > due_at:
            breached = True

        breached_at = due_at if breached else None

        resolved_within_sla = (
            not breached
            if resolved_at is not None
            else None
        )

        cur.execute(
            """
            INSERT INTO sla_events (
                request_id,
                sla_type,
                target_hours,
                breached,
                breached_at,
                resolved_within_sla
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                request["request_id"],
                f"{priority} Resolution SLA",
                target,
                breached,
                breached_at,
                resolved_within_sla,
            ),
        )


def generate_escalations(cur, requests):
    for request in requests:

        should_escalate = False
        reason = None
        severity = None

        if request["priority"] == "Critical":
            should_escalate = random.random() < 0.65
            reason = "Critical priority request"
            severity = "Critical"

        elif request["status"] not in (
            "Resolved",
            "Closed",
            "Cancelled",
        ):
            if datetime.now() > request["due_at"]:
                should_escalate = True
                reason = "SLA breach"
                severity = "High"

        if should_escalate:
            cur.execute(
                """
                INSERT INTO escalations (
                    request_id,
                    reason,
                    severity,
                    assigned_to,
                    status,
                    created_at
                )
                VALUES (%s, %s, %s, %s, 'Open', %s)
                """,
                (
                    request["request_id"],
                    reason,
                    severity,
                    request["employee_id"],
                    datetime.now(),
                ),
            )


def main():
    print("Connecting to OpsFlow database...")

    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:

            print("Generating customers...")
            customers = generate_customers(cur)

            print("Generating employees...")
            employees = generate_employees(cur)

            print("Loading request types...")
            request_types = get_request_types(cur)

            print("Generating requests...")
            requests = generate_requests(
                cur,
                customers,
                employees,
                request_types,
            )

            print("Generating request events...")
            generate_events(cur, requests)

            print("Generating SLA events...")
            generate_sla_events(cur, requests)

            print("Generating escalations...")
            generate_escalations(cur, requests)

        conn.commit()

    print("OpsFlow dataset generated successfully.")


if __name__ == "__main__":
    main()