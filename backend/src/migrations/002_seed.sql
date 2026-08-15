-- IT Asset Custody Management System - Sample seed data
-- รันหลัง 001_init.sql เพื่อให้มีข้อมูลทดสอบทันที

-- ป้องกันการรันซ้ำแล้วข้อมูลซ้ำ: ลบของเดิมที่ผูกกับ seed นี้ก่อน (เรียงตามลำดับ FK)
DELETE FROM custody_records;
DELETE FROM assets;
DELETE FROM employees;
DELETE FROM departments;

-- ================== แผนก ==================
INSERT INTO departments (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'IT'),
  ('00000000-0000-0000-0000-000000000002', 'Sales'),
  ('00000000-0000-0000-0000-000000000003', 'HR'),
  ('00000000-0000-0000-0000-000000000004', 'Finance');

-- ================== พนักงาน ==================
INSERT INTO employees (id, department_id, full_name, position) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'สมชาย ใจดี', 'IT Support Specialist'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'สมหญิง รักงาน', 'System Administrator'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'วิชัย ขายเก่ง', 'Sales Executive'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'มานี มีสุข', 'Sales Manager'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'ประภา ทรัพย์มาก', 'HR Officer'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'อนันต์ บัญชีดี', 'Finance Officer');

-- ================== อุปกรณ์ ==================
-- ดึง category_id จาก seed ที่มีอยู่แล้วใน 001_init.sql (Laptop, Monitor, Mobile phone, Keyboard/Mouse, Printer, Network equipment)
INSERT INTO assets (id, category_id, asset_code, brand, model, serial_number, status, purchase_date, purchase_price)
SELECT '20000000-0000-0000-0000-000000000001', id, 'LAP-001', 'Dell', 'Latitude 5440', 'SN-DL5440-001', 'available', '2024-01-15', 32900
FROM asset_categories WHERE name = 'Laptop'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000002', id, 'LAP-002', 'Apple', 'MacBook Air M3', 'SN-MBA-M3-002', 'available', '2024-03-10', 42900
FROM asset_categories WHERE name = 'Laptop'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000003', id, 'LAP-003', 'Lenovo', 'ThinkPad X1 Carbon', 'SN-TP-X1-003', 'available', '2023-11-20', 55900
FROM asset_categories WHERE name = 'Laptop'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000004', id, 'LAP-004', 'Dell', 'Latitude 5440', 'SN-DL5440-004', 'maintenance', '2024-01-15', 32900
FROM asset_categories WHERE name = 'Laptop'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000005', id, 'MON-001', 'LG', '27UL850 4K', 'SN-LG27-001', 'available', '2023-08-05', 12900
FROM asset_categories WHERE name = 'Monitor'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000006', id, 'MON-002', 'Samsung', 'Odyssey G5', 'SN-SM-G5-002', 'available', '2023-08-05', 9900
FROM asset_categories WHERE name = 'Monitor'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000007', id, 'PHN-001', 'Apple', 'iPhone 14', 'SN-IP14-001', 'available', '2023-05-12', 28900
FROM asset_categories WHERE name = 'Mobile phone'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000008', id, 'PHN-002', 'Samsung', 'Galaxy S24', 'SN-GS24-002', 'available', '2024-02-01', 26900
FROM asset_categories WHERE name = 'Mobile phone'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000009', id, 'KBM-001', 'Logitech', 'MX Keys + MX Master 3', 'SN-LGT-001', 'available', '2023-06-01', 4900
FROM asset_categories WHERE name = 'Keyboard/Mouse'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000010', id, 'PRT-001', 'HP', 'LaserJet Pro M404', 'SN-HP404-001', 'available', '2022-09-15', 8900
FROM asset_categories WHERE name = 'Printer'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000011', id, 'NET-001', 'Ubiquiti', 'UniFi Switch 24', 'SN-UBQ24-001', 'available', '2023-01-10', 15900
FROM asset_categories WHERE name = 'Network equipment'
UNION ALL
SELECT '20000000-0000-0000-0000-000000000012', id, 'LAP-005', 'HP', 'EliteBook 840', 'SN-HP840-005', 'retired', '2020-04-01', 29900
FROM asset_categories WHERE name = 'Laptop';

-- ================== ประวัติการยืม-คืน ==================

-- 1) กำลังยืมอยู่ตอนนี้ (active) — สมชาย ถือ LAP-001 อยู่ ยังไม่เกินกำหนด
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, status, assigned_by, condition_on_issue)
VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'active', 'IT Admin', 'สภาพดี');
UPDATE assets SET status = 'in_use' WHERE id = '20000000-0000-0000-0000-000000000001';

-- 2) กำลังยืมอยู่ — วิชัย ถือ LAP-002 (MacBook) เกินกำหนดคืนแล้ว (overdue)
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, status, assigned_by, condition_on_issue)
VALUES ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002',
        CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 'active', 'IT Admin', 'สภาพดี');
UPDATE assets SET status = 'in_use' WHERE id = '20000000-0000-0000-0000-000000000002';

-- 3) กำลังยืมอยู่ — ประภา (HR) ถือโทรศัพท์ PHN-001
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, status, assigned_by, condition_on_issue)
VALUES ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
        CURRENT_DATE - INTERVAL '5 days', NULL, 'active', 'IT Admin', 'สภาพดี');
UPDATE assets SET status = 'in_use' WHERE id = '20000000-0000-0000-0000-000000000007';

-- 4) กำลังยืมอยู่ — อนันต์ (Finance) ถือ MON-001
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, status, assigned_by, condition_on_issue)
VALUES ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004',
        CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', 'active', 'IT Admin', 'สภาพดี');
UPDATE assets SET status = 'in_use' WHERE id = '20000000-0000-0000-0000-000000000005';

-- 5) ประวัติที่คืนแล้ว — สมหญิง เคยยืม LAP-003 แล้วคืนไปแล้ว (เพื่อให้ asset นี้ยังว่างอยู่ แต่มีประวัติ)
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, returned_date, status, assigned_by, condition_on_issue, condition_on_return)
VALUES ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
        CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '61 days',
        'returned', 'IT Admin', 'สภาพดี', 'สภาพดี ไม่มีตำหนิ');

-- 6) ประวัติที่คืนแล้ว — มานี เคยยืมเมาส์/คีย์บอร์ดแล้วคืน
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, returned_date, status, assigned_by, condition_on_issue, condition_on_return)
VALUES ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
        CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE - INTERVAL '100 days', CURRENT_DATE - INTERVAL '99 days',
        'returned', 'IT Admin', 'สภาพดี', 'สภาพดี');

-- 7) ประวัติซ้อน — LAP-001 (เครื่องเดียวกับข้อ 1) เคยมีคนยืมมาก่อนสมชาย แล้วคืนไปแล้ว เพื่อโชว์ว่า 1 เครื่องมีได้หลายรอบ
INSERT INTO custody_records (asset_id, employee_id, department_id, assigned_date, due_date, returned_date, status, assigned_by, condition_on_issue, condition_on_return)
VALUES ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
        CURRENT_DATE - INTERVAL '200 days', CURRENT_DATE - INTERVAL '170 days', CURRENT_DATE - INTERVAL '171 days',
        'returned', 'IT Admin', 'สภาพดี', 'สภาพดี');
