# OpenJob API

RESTful API untuk platform rekrutmen internal perusahaan. Dibuat sebagai submission kelas **Back-End Fundamental with JavaScript** di Dicoding.

## Tech Stack

- Node.js + Express.js
- PostgreSQL + node-pg-migrate
- JWT Authentication (Access Token 3h + Refresh Token)
- Joi Validation
- Multer (file upload)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file `.env`
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi database dan secret key kamu
```

### 3. Buat database PostgreSQL
```bash
createdb openjob
```

### 4. Jalankan migrations
```bash
npm run migrate:up
```

### 5. Jalankan server
```bash
npm run start:dev
```

Server berjalan di `http://localhost:3000`

## ERD

![ERD OpenJob](./ERD-OpenJob-versi-1.png)

## Endpoints

### Public
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | /users | Register user baru |
| GET | /users/:id | Get user by ID |
| POST | /authentications | Login |
| PUT | /authentications | Refresh access token |
| GET | /companies | List semua company |
| GET | /companies/:id | Detail company |
| GET | /categories | List semua category |
| GET | /categories/:id | Detail category |
| GET | /jobs | List semua job (support ?title & ?company-name) |
| GET | /jobs/:id | Detail job |
| GET | /jobs/company/:companyId | Jobs by company |
| GET | /jobs/category/:categoryId | Jobs by category |
| GET | /documents | List semua document |
| GET | /documents/:id | Detail document |

### Protected (Bearer Token Required)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| DELETE | /authentications | Logout |
| POST | /companies | Buat company |
| PUT | /companies/:id | Update company |
| DELETE | /companies/:id | Hapus company |
| POST | /categories | Buat category |
| PUT | /categories/:id | Update category |
| DELETE | /categories/:id | Hapus category |
| POST | /jobs | Buat job |
| PUT | /jobs/:id | Update job |
| DELETE | /jobs/:id | Hapus job |
| POST | /applications | Apply job |
| GET | /applications | List semua application |
| GET | /applications/:id | Detail application |
| GET | /applications/user/:userId | Applications by user |
| GET | /applications/job/:jobId | Applications by job |
| PUT | /applications/:id | Update status application |
| DELETE | /applications/:id | Hapus application |
| POST | /jobs/:jobId/bookmark | Buat bookmark |
| GET | /jobs/:jobId/bookmark/:id | Detail bookmark |
| DELETE | /jobs/:jobId/bookmark | Hapus bookmark |
| GET | /bookmarks | List bookmark user login |
| GET | /profile | Profile user login |
| GET | /profile/applications | Lamaran user login |
| GET | /profile/bookmarks | Bookmark user login |
| POST | /documents | Upload document |
| DELETE | /documents/:id | Hapus document |
