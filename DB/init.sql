-- First create our tables

CREATE TABLE IF NOT EXISTS catalogue (
    id              SERIAL PRIMARY KEY, 
    name            TEXT, 
    display_name    TEXT, 
    category        TEXT, 
    base_fee        NUMERIC(10, 2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crew (
    id              SERIAL PRIMARY KEY, 
    name            TEXT,
    display_name    TEXT,
    vehicle         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    display_name    TEXT,
    email           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking (
    id              SERIAL PRIMARY KEY,
    item_id         INTEGER REFERENCES catalogue(id),
    crew_id         INTEGER REFERENCES crew(id),
    user_id         INTEGER REFERENCES users(id),
    reference       TEXT,
    item_number     INTEGER,
    quote           NUMERIC(10, 2),
    booking_status  TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Then populate with data from seed 

INSERT INTO catalogue (name, display_name, category, base_fee)
SELECT seed.name, seed.display_name, seed.category, seed.base_fee
FROM (
    VALUES
        ('sofa-2-seater', 'Sofa (2-seater)', 'furniture', 35.00),
        ('sofa-3-seater', 'Sofa (3-seater)', 'furniture', 45.00),
        ('armchair', 'Armchair', 'furniture', 20.00),
        ('mattress-single', 'Mattress (single)', 'furniture', 25.00),
        ('mattress-double', 'Mattress (double)', 'furniture', 30.00),
        ('fridge', 'Fridge', 'appliances', 40.00),
        ('fridge-freezer', 'Fridge-freezer', 'appliances', 50.00),
        ('washing-machine', 'Washing machine', 'appliances', 40.00),
        ('tv-large', 'TV (large)', 'electronics', 25.00),
        ('bin-bag', 'Bin bag', 'general', 5.00),
        ('cardboard-bundle', 'Cardboard bundle', 'general', 7.50),
        ('garden-waste-bag', 'Garden waste bag', 'garden', 6.00)
) AS seed(name, display_name, category, base_fee)
WHERE NOT EXISTS (
    SELECT 1
    FROM catalogue existing
    WHERE existing.name = seed.name
);

INSERT INTO crew (name, display_name, vehicle)
SELECT seed.name, seed.display_name, seed.vehicle
FROM (
    VALUES
        ('crew-1', 'Crew 1 — Alex & Sam', 'Luton van'),
        ('crew-2', 'Crew 2 — Priya & Jordan', 'Luton van'),
        ('crew-3', 'Crew 3 — John & Steve', 'Cage Van'),
        ('crew-4', 'Crew 4 — Femi & Casey', 'Cage Van')
) AS seed(name, display_name, vehicle)
WHERE NOT EXISTS (
    SELECT 1
    FROM crew existing
    WHERE existing.name = seed.name
);
