# IT Asset Custody Management System

ระบบบริหารการครอบครองอุปกรณ์ IT แยกเป็น backend (Node.js + Express + PostgreSQL) และ frontend (React + Vite + Tailwind)

```
it-asset-custody/
├── backend/     Express API + PostgreSQL
├── frontend/    React + Vite dashboard
└── docker-compose.yml
```

## รันด้วย Docker (แนะนำ)

```bash
docker compose up --build
```

(ไม่ต้องสร้างไฟล์ `.env` ก็รันได้ทันทีสำหรับทดสอบในเครื่อง เพราะทุกตัวแปรมีค่า default ไว้แล้วใน `docker-compose.yml` — ไฟล์ `.env` จำเป็นเฉพาะตอนจะ deploy จริงบน Synology NAS หรืออยากเปลี่ยนพอร์ต/รหัสผ่าน ดูหัวข้อ "รันบน Synology NAS" ด้านล่าง)

- Postgres: `localhost:5432`
- Backend API: `http://localhost:4000`
- Frontend: `http://localhost:8080` (build production ผ่าน nginx)

ครั้งแรกที่รัน ต้อง migrate schema เข้า database:

```bash
docker compose exec backend node src/migrations/run.js
```

อยากได้ข้อมูลตัวอย่าง (แผนก/พนักงาน/อุปกรณ์/ประวัติยืม-คืน) เพื่อทดสอบทันที ให้ใช้ flag `--seed` แทน:

```bash
docker compose exec backend node src/migrations/run.js --seed
```

**หมายเหตุ:** รัน `--seed` ซ้ำได้เรื่อยๆ โดยไม่พัง เพราะ `002_seed.sql` จะลบข้อมูลเดิมของ seed ก่อนแล้วค่อยใส่ใหม่ทุกครั้ง (เหมาะเวลาอยากรีเซ็ตข้อมูลทดสอบกลับไปที่จุดเริ่มต้น) — **ห้ามรันกับข้อมูลจริงบน production เด็ดขาด** เพราะจะลบ departments/employees/assets/custody_records ทั้งหมดทิ้ง

## รันแบบ local (ไม่ใช้ Docker)

### 1. เตรียม PostgreSQL
ติดตั้ง PostgreSQL แล้วสร้าง database:
```sql
CREATE DATABASE it_asset_custody;
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # แก้ DATABASE_URL ให้ตรงกับเครื่องตัวเอง
npm install
npm run migrate        # รัน schema migration เฉยๆ
# หรือ npm run migrate:seed   ถ้าอยากได้ข้อมูลตัวอย่างด้วย
npm run dev             # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## โครงสร้าง database

- `departments` — แผนก
- `employees` — พนักงาน (ผูกกับแผนก)
- `asset_categories` — ประเภทอุปกรณ์ (Laptop, Monitor, ฯลฯ)
- `assets` — อุปกรณ์แต่ละชิ้น (มี `status`: available / in_use / maintenance / retired)
- `custody_records` — บันทึกการยืม-คืน แต่ละแถวคือ 1 รอบการยืม
  - `status = 'active'` = กำลังถูกยืมอยู่, `status = 'returned'` = คืนแล้ว
  - **กติกาสำคัญ**: อุปกรณ์ 1 ชิ้น มี custody record ที่ active พร้อมกันได้แค่ 1 แถวเท่านั้น (บังคับด้วย partial unique index ในระดับ database) ป้องกันการยืมซ้ำซ้อน

## API หลัก

| Method | Endpoint | ใช้ทำอะไร |
|---|---|---|
| POST | `/api/assets` | เพิ่มอุปกรณ์ใหม่ |
| GET | `/api/assets/summary` | สรุปจำนวนอุปกรณ์แบ่งตามประเภท |
| GET | `/api/assets/:id/custody/current` | ดูว่าอุปกรณ์เครื่องนี้อยู่กับใคร |
| GET | `/api/assets/:id/history` | ประวัติยืม-คืนทั้งหมดของเครื่องนี้ |
| POST | `/api/custody/checkout` | จ่าย/ยืมอุปกรณ์ให้พนักงาน |
| POST | `/api/custody/:id/checkin` | บันทึกการคืนอุปกรณ์ |
| GET | `/api/custody?status=active&department_id=&employee_id=&category_id=` | ค้นหาการครอบครองแบบผสมเงื่อนไข |
| GET | `/api/custody?overdue=true` | อุปกรณ์ที่เกินกำหนดคืนแล้วยังไม่คืน |
| GET | `/api/custody/by-department` | สรุปจำนวนอุปกรณ์ที่แต่ละแผนกถืออยู่ |

## รันบน Synology NAS (Container Manager)

1. เปิด **File Station** บน Synology แล้วอัปโหลดโฟลเดอร์ `it-asset-custody` ทั้งหมดไปไว้ที่ shared folder เช่น `/docker/it-asset-custody`
2. คัดลอกไฟล์ `.env.example` เป็นชื่อ `.env` แล้วแก้ค่าให้ตรงกับ NAS ของตัวเอง โดยเฉพาะ `VITE_API_URL` ต้องเป็น IP หรือโดเมนจริงของ NAS (ห้ามใส่ `localhost` เพราะเครื่องอื่นในบ้าน/บริษัทจะเข้าไม่ได้)
3. เปิด **Container Manager** (ถ้ายังไม่มีให้ติดตั้งจาก Package Center ก่อน) → เมนู **Project** → **Create** → เลือก path เป็นโฟลเดอร์ที่อัปโหลดไว้ → Container Manager จะเจอ `docker-compose.yml` และ `.env` เองอัตโนมัติ
4. กด **Build** รอสักครู่ (ครั้งแรกจะช้าหน่อยเพราะต้องโหลด image และ build) แล้ว **Start**
5. เข้าใช้งานผ่าน `http://<NAS-IP>:8080` (หรือพอร์ตที่ตั้งไว้ใน `.env`)
6. รัน migration ครั้งแรก: เปิด **Container Manager** → คลิก container ชื่อ `backend` → แท็บ **Terminal** → เลือก `Create` เพื่อเปิด interactive terminal → รันคำสั่ง `node src/migrations/run.js --seed` (หรือไม่ใส่ `--seed` ถ้าไม่ต้องการข้อมูลตัวอย่าง)

**อยากได้โดเมนของตัวเอง + HTTPS:** ใช้ **Control Panel > Login Portal > Advanced > Reverse Proxy** ของ Synology สร้าง proxy rule ชี้โดเมนย่อย (เช่น `asset.mynas.synology.me`) ไปที่พอร์ต frontend (8080) แล้วขอใบรับรอง SSL ฟรีจาก Let's Encrypt ผ่าน **Control Panel > Security > Certificate** ได้เลย — ถ้าทำแบบนี้ต้องอัปเดต `VITE_API_URL`/`CORS_ORIGIN` ใน `.env` ให้เป็นโดเมนใหม่แล้ว rebuild ใหม่ (เพราะ `VITE_API_URL` ถูกฝังเข้า JS bundle ตอน build ไม่ใช่ค่าที่เปลี่ยนตอน runtime ได้)

## Deploy ขึ้น production (บนคลาวด์)

ดูขั้นตอนละเอียดที่ผมแนะนำไว้ในแชท (Supabase + Railway + Vercel) — สรุปสั้นๆ:

1. **Database**: สร้างโปรเจกต์ใหม่บน [supabase.com](https://supabase.com) → เข้า SQL Editor → รัน `backend/src/migrations/001_init.sql` แล้วตามด้วย `002_seed.sql` (ถ้าต้องการข้อมูลตัวอย่าง) → คัดลอก connection string (Settings > Database > Connection string > URI)
2. **Backend**: deploy โฟลเดอร์ `backend/` ขึ้น [railway.app](https://railway.app) (เชื่อม GitHub repo แล้วเลือกโฟลเดอร์ `backend`) ตั้ง environment variables: `DATABASE_URL` (จาก Supabase), `CORS_ORIGIN` (ใส่ URL ของ frontend หลัง deploy เสร็จ)
3. **Frontend**: deploy โฟลเดอร์ `frontend/` ขึ้น [vercel.com](https://vercel.com) (เชื่อม GitHub repo เดียวกัน เลือก root directory เป็น `frontend`) ตั้ง environment variable `VITE_API_URL` เป็น URL ของ backend บน Railway + `/api`
4. กลับไปอัปเดต `CORS_ORIGIN` บน Railway ให้ตรงกับ URL จริงของ Vercel แล้ว redeploy backend

**หมายเหตุสำคัญ:** ไฟล์ `frontend/vercel.json` ที่มีอยู่แล้วในโปรเจกต์ทำหน้าที่ rewrite ทุก route กลับไปที่ `index.html` — จำเป็นมากสำหรับ React Router เพราะถ้าไม่มีไฟล์นี้ การ refresh หน้าเว็บตรงๆ ที่ path เช่น `/assets/xxx` จะเจอ 404 จาก Vercel (เพราะ Vercel serve static file ตรงๆ ไม่รู้ว่าต้องส่งกลับไปให้ React Router จัดการ routing เอง)
#   - i t - a s s e t - c u s t o d y  
 