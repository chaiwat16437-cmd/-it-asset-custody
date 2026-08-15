-- IT Asset Custody Management System - Initial schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  position VARCHAR(150),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES asset_categories(id) ON DELETE RESTRICT,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(150),
  status VARCHAR(20) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  purchase_date DATE,
  purchase_price NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custody_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  returned_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'returned')),
  assigned_by VARCHAR(150),
  condition_on_issue VARCHAR(100),
  condition_on_return VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce: an asset can only have ONE active (not-yet-returned) custody record at a time
CREATE UNIQUE INDEX IF NOT EXISTS one_active_custody_per_asset
  ON custody_records (asset_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_custody_employee ON custody_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_custody_department ON custody_records (department_id);
CREATE INDEX IF NOT EXISTS idx_custody_status ON custody_records (status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets (category_id);

-- Seed some categories to start with
INSERT INTO asset_categories (name) VALUES
  ('Laptop'), ('Monitor'), ('Mobile phone'), ('Keyboard/Mouse'), ('Printer'), ('Network equipment')
ON CONFLICT (name) DO NOTHING;
