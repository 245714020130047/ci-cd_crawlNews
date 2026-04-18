# 📰 News Crawler — Web Crawl Tin Tức & Tóm Tắt AI

Ứng dụng web crawl tin tức từ các báo Việt Nam (VnExpress, Tuổi Trẻ) và tóm tắt bằng AI (Gemini / OpenAI).

**Tech stack**: Spring Boot 3.3.5 · Angular 17 · PostgreSQL 16 (JSONB) · Redis 7 · Docker Compose · GitHub Actions CI/CD · AWS Free Tier

---

## 📋 Mục lục


- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt nhanh (Local Dev)](#-cài-đặt-nhanh-local-dev)
- [Cấu hình](#-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [API Endpoints](#-api-endpoints)
- [Tính năng chính](#-tính-năng-chính)
- [Quản trị (Admin)](#-quản-trị-admin)
- [Triển khai Production](#-triển-khai-production)
- [CI/CD GitHub Actions](#-cicd-github-actions)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Troubleshooting](#-troubleshooting)

---

## 💻 Yêu cầu hệ thống

| Công cụ       | Phiên bản tối thiểu |
| ------------- | -------------------- |
| Java JDK      | 17                   |
| Node.js       | 20 LTS               |
| npm           | 10+                  |
| Docker        | 24+                  |
| Docker Compose| 2.20+                |
| Maven         | 3.9+ (hoặc dùng `./mvnw`) |

---

## 🚀 Cài đặt nhanh (Local Dev)

### 1. Clone project

```bash
git clone <repository-url>
cd webCrawlNew
```

### 2. Tạo file `.env`

```bash
cp .env.example .env
```

Mở file `.env` và cập nhật các giá trị:

```env
# PostgreSQL
POSTGRES_DB=newsdb
POSTGRES_USER=newsuser
POSTGRES_PASSWORD=newspass

# JWT - ĐỔI THÀNH CHUỖI BÍ MẬT CỦA BẠN (ít nhất 32 ký tự)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long

# AI Provider: gemini | openai | auto
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key    # Lấy tại https://aistudio.google.com/app/apikey
OPENAI_API_KEY=your-openai-api-key    # Lấy tại https://platform.openai.com/api-keys

# Admin seed
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Khởi động PostgreSQL & Redis

```bash
docker compose up -d
```

Kiểm tra trạng thái:

```bash
docker compose ps
```

Đảm bảo cả `postgres` và `redis` đều ở trạng thái **healthy**.

### 4. Chạy Backend

```bash
cd backend
./mvnw spring-boot:run
```

> **Windows**: dùng `mvnw.cmd spring-boot:run`

Backend sẽ chạy tại: **http://localhost:8080**

Flyway sẽ tự động tạo schema và seed dữ liệu (admin user + news sources) khi khởi động lần đầu.

### 5. Chạy Frontend

```bash
cd frontend
npm install
npm start
```

Frontend sẽ chạy tại: **http://localhost:4200**

---

## ⚙ Cấu hình

### File `backend/src/main/resources/application.yml`

Các cấu hình quan trọng:

| Config                         | Mô tả                                          | Mặc định       |
| ------------------------------ | ----------------------------------------------- | --------------- |
| `app.jwt.secret`               | Khóa bí mật JWT (HS256)                        | từ `JWT_SECRET` |
| `app.jwt.access-token-expiry`  | Thời gian sống access token                     | `3600000` (1h)  |
| `app.jwt.refresh-token-expiry` | Thời gian sống refresh token                    | `604800000` (7 ngày) |
| `app.ai.provider`              | AI provider: `gemini`, `openai`, hoặc `auto`    | `gemini`        |
| `app.ai.gemini.api-key`        | API key Google Gemini                            | từ ENV          |
| `app.ai.openai.api-key`        | API key OpenAI                                   | từ ENV          |
| `app.crawler.enabled`          | Bật/tắt scheduler crawl tự động                 | `true`          |
| `app.summarizer.enabled`       | Bật/tắt scheduler tóm tắt tự động               | `false`         |

### AI Provider

- **Gemini 2.5 Flash** (mặc định): Miễn phí 15 req/phút, 1M token/ngày. Đủ cho dev và project nhỏ.
- **OpenAI GPT-3.5-turbo**: Dùng làm fallback khi Gemini bị rate-limit.
- **Auto mode** (`AI_PROVIDER=auto`): Thử Gemini trước, nếu lỗi 429 tự động chuyển sang OpenAI.

---

## ▶ Chạy ứng dụng

### Chế độ Development (đầy đủ)

```bash
# Terminal 1 — Database & Cache
docker compose up -d

# Terminal 2 — Backend
cd backend
./mvnw spring-boot:run

# Terminal 3 — Frontend
cd frontend
npm start
```

Truy cập:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **Actuator Health**: http://localhost:8080/actuator/health

---

## 👤 Tài khoản mặc định

### Admin

| Field    | Giá trị                |
| -------- | ---------------------- |
| Email    | `admin@newscrawler.com` |
| Password | `admin123`             |
| Role     | `ROLE_ADMIN`           |

> ⚠ **Quan trọng**: Đổi mật khẩu admin ngay sau khi triển khai production!

### Đăng ký tài khoản User

Truy cập http://localhost:4200/register để tạo tài khoản mới với role `ROLE_USER`.

---

## 📡 API Endpoints

### Public (không cần đăng nhập)

| Method | Endpoint                        | Mô tả                              |
| ------ | ------------------------------- | ----------------------------------- |
| GET    | `/api/articles`                 | Danh sách bài viết (phân trang)     |
| GET    | `/api/articles/{slug}`          | Chi tiết bài viết theo slug         |
| GET    | `/api/articles/featured`        | Bài viết nổi bật                    |
| GET    | `/api/articles/top`             | Bài viết mới nhất                   |
| GET    | `/api/articles/most-read`       | Bài đọc nhiều nhất                  |
| GET    | `/api/articles/ai-picks`        | Bài có AI summary                   |
| GET    | `/api/sources`                  | Danh sách nguồn tin                 |
| GET    | `/api/stats`                    | Thống kê tổng quan                  |

### Auth (xác thực)

| Method | Endpoint              | Mô tả                              |
| ------ | --------------------- | ----------------------------------- |
| POST   | `/api/auth/register`  | Đăng ký tài khoản mới              |
| POST   | `/api/auth/login`     | Đăng nhập, nhận JWT token          |
| POST   | `/api/auth/refresh`   | Làm mới access token               |
| POST   | `/api/auth/logout`    | Đăng xuất (blacklist token)        |
| GET    | `/api/auth/me`        | Thông tin user hiện tại            |

### User (cần đăng nhập — `ROLE_USER`)

| Method | Endpoint                          | Mô tả                             |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/api/user/bookmarks`             | Danh sách bookmark                 |
| POST   | `/api/user/bookmarks/{articleId}` | Thêm bookmark                      |
| DELETE | `/api/user/bookmarks/{articleId}` | Xóa bookmark                       |
| POST   | `/api/articles/{id}/summarize`    | Yêu cầu AI tóm tắt bài viết      |

### Admin (cần đăng nhập — `ROLE_ADMIN`)

| Method | Endpoint                              | Mô tả                              |
| ------ | ------------------------------------- | ----------------------------------- |
| GET    | `/api/admin/dashboard`                | Thống kê + trạng thái scheduler    |
| GET    | `/api/admin/sources`                  | Danh sách nguồn tin (admin)        |
| POST   | `/api/admin/sources`                  | Thêm nguồn tin mới                 |
| PUT    | `/api/admin/sources/{id}`             | Cập nhật nguồn tin                 |
| DELETE | `/api/admin/sources/{id}`             | Xóa nguồn tin                      |
| POST   | `/api/admin/sources/{id}/crawl`       | Crawl ngay 1 nguồn                 |
| GET    | `/api/admin/crawl-logs`               | Lịch sử crawl (phân trang)        |
| POST   | `/api/admin/scheduler/crawler/toggle` | Bật/tắt crawler scheduler         |
| POST   | `/api/admin/scheduler/summarizer/toggle` | Bật/tắt summarizer scheduler   |
| GET    | `/api/admin/articles`                 | Danh sách bài viết (admin)        |
| POST   | `/api/admin/articles/{id}/summarize`  | Tóm tắt 1 bài cụ thể             |

---

## ✨ Tính năng chính

### 🕷 Crawl tin tức tự động

- Hỗ trợ: **VnExpress**, **Tuổi Trẻ**
- Lịch crawl: mỗi 30 phút (có thể thay đổi)
- Tự động loại bỏ bài trùng lặp (check URL qua Redis SET)
- Metadata lưu dạng JSONB: category, author, thumbnail, tags
- Bật/tắt crawler qua Admin Dashboard

### 🤖 Tóm tắt AI

- Tóm tắt tự động bài mới (scheduler) hoặc thủ công (nút "Tóm tắt bằng AI")
- Output 3 phần: **Giới thiệu**, **Điểm chính**, **Kết luận**
- Lưu dạng JSONB: `{ "intro": "...", "key_points": [...], "conclusion": "..." }`
- Cache summary trong Redis để tránh gọi AI lặp lại

### 🔐 Xác thực & Phân quyền

- JWT (HS256): Access token (1h) + Refresh token (7 ngày, lưu Redis)
- Tự động refresh token khi access token hết hạn
- Blacklist token khi logout
- 2 roles: `ROLE_USER` (đọc, bookmark) và `ROLE_ADMIN` (quản trị toàn bộ)

### 🔖 Bookmark

- User đăng nhập có thể lưu bài viết yêu thích
- Quản lý bookmark tại trang `/bookmarks`

### 🎨 Giao diện

- Thiết kế responsive với Tailwind CSS
- Skeleton loader khi tải dữ liệu
- SEO-friendly URL dạng slug (`/articles/ten-bai-viet-slug`)
- Dark mode support

---

## 🔧 Quản trị (Admin)

Truy cập: http://localhost:4200/admin

### Dashboard

- Xem thống kê: tổng bài viết, bài chờ xử lý, bài lỗi, bài đã tóm tắt
- Bật/tắt **Crawler Scheduler** và **Summarizer Scheduler** bằng toggle switch

### Quản lý nguồn tin

- Thêm / sửa / xóa nguồn tin
- Bật/tắt từng nguồn
- Nút **"Crawl Now"**: crawl ngay lập tức 1 nguồn cụ thể

### Lịch sử Crawl

- Xem log crawl: thời gian, số bài tìm thấy, số bài mới, trạng thái
- Xem chi tiết lỗi (nếu có)

### Quản lý bài viết

- Lọc theo trạng thái (PENDING, SUMMARIZED, FAILED)
- Nút **"Summarize"**: tóm tắt thủ công 1 bài

---

## 🐳 Triển khai Production

### Sử dụng Docker Compose (Production)

```bash
# Build và chạy
docker compose -f docker-compose.prod.yml up -d --build
```

File `docker-compose.prod.yml` bao gồm:
- **Nginx**: Reverse proxy (port 80 → backend 8080)
- **Spring Boot Backend**: Java 17, `-Xmx256m`
- **PostgreSQL 16**: Dữ liệu lưu trên Docker volume
- **Redis 7**: Cache, `maxmemory 200mb`

### Kiến trúc AWS Free Tier (Recommended)

```
EC2 t2.micro (1GB RAM)
├── nginx container     (80/443 → 8080)
├── springboot-be       (port 8080, -Xmx256m)
├── postgres:16-alpine  (port 5432, internal only)
│   └── volume: EBS 30GB free
└── redis:7-alpine      (port 6379, internal only, maxmemory 200mb)

S3 + CloudFront
└── Angular build (dist/) — HTTPS miễn phí
```

### Bước triển khai AWS

1. **Tạo EC2 t2.micro** (Amazon Linux 2 / Ubuntu):
   ```bash
   # Cài Docker
   sudo yum install docker -y
   sudo systemctl start docker
   sudo usermod -aG docker ec2-user

   # Cài Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Cấu hình Security Group**:
   - Port **80** (HTTP): `0.0.0.0/0`
   - Port **22** (SSH): IP cụ thể của bạn
   - **KHÔNG** mở port 5432, 6379 ra ngoài

3. **Upload code & chạy**:
   ```bash
   scp -i key.pem docker-compose.prod.yml ec2-user@<EC2_IP>:~/
   scp -i key.pem .env ec2-user@<EC2_IP>:~/
   ssh -i key.pem ec2-user@<EC2_IP>

   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Deploy Frontend lên S3**:
   ```bash
   cd frontend
   npm run build

   aws s3 sync dist/news-crawler-fe s3://<bucket-name> --delete
   ```

5. **Tạo CloudFront Distribution**:
   - Distribution 1: Origin = S3 bucket (cho Frontend)
   - Distribution 2: Origin = EC2 public IP:80 (cho Backend API)

### Backup Database

Tạo cron job backup PostgreSQL mỗi ngày:

```bash
# backup.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec postgres pg_dump -U newsuser newsdb | gzip > /tmp/backup_$TIMESTAMP.sql.gz
aws s3 cp /tmp/backup_$TIMESTAMP.sql.gz s3://<bucket-name>/backups/
# Giữ 7 bản mới nhất
aws s3 ls s3://<bucket-name>/backups/ | sort | head -n -7 | awk '{print $4}' | xargs -I {} aws s3 rm s3://<bucket-name>/backups/{}
rm /tmp/backup_$TIMESTAMP.sql.gz
```

```bash
# Thêm vào crontab (chạy lúc 2 giờ sáng)
crontab -e
0 2 * * * /home/ec2-user/backup.sh
```

---

## 🔄 CI/CD GitHub Actions

### Secrets cần cấu hình trên GitHub

Vào **Settings → Secrets and variables → Actions**, thêm:

| Secret                  | Mô tả                            |
| ----------------------- | --------------------------------- |
| `EC2_HOST`              | Public IP / hostname EC2          |
| `EC2_SSH_KEY`           | Private key SSH (PEM format)      |
| `AWS_ACCESS_KEY_ID`     | AWS IAM access key                |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key                |
| `GHCR_TOKEN`            | GitHub token (push Docker image)  |
| `GEMINI_API_KEY`        | Google Gemini API key             |
| `OPENAI_API_KEY`        | OpenAI API key (nếu dùng)        |

### Workflows

- **CI** (`.github/workflows/ci.yml`): Chạy khi push/PR → build + test Backend (Maven) + build Frontend (Angular)
- **Deploy** (`.github/workflows/deploy.yml`): Chạy khi push vào `main` → build Docker image → push GHCR → SSH deploy lên EC2 + sync Frontend lên S3

---

## 📁 Cấu trúc dự án

```
webCrawlNew/
├── .env.example                    # Template biến môi trường
├── .gitignore
├── docker-compose.yml              # Local dev (PostgreSQL + Redis)
├── docker-compose.prod.yml         # Production (full stack)
├── nginx/
│   └── nginx.conf                  # Reverse proxy config
├── .github/workflows/
│   ├── ci.yml                      # CI pipeline
│   └── deploy.yml                  # CD pipeline
│
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── resources/
│       │   ├── application.yml
│       │   └── db/migration/
│       │       ├── V1__init_schema.sql       # Schema + indexes
│       │       └── V2__seed_admin_and_sources.sql  # Dữ liệu seed
│       └── java/com/newscrawler/
│           ├── NewsCrawlerApplication.java
│           ├── config/             # RedisConfig
│           ├── controller/         # REST controllers
│           ├── crawler/            # Crawler Strategy Pattern
│           ├── dto/                # Request/Response DTOs
│           ├── entity/             # JPA entities (JSONB)
│           ├── exception/          # Global error handler
│           ├── repository/         # Spring Data JPA
│           ├── security/           # JWT + Spring Security
│           ├── service/            # Business logic
│           ├── summarizer/         # AI Provider Factory Pattern
│           └── util/               # SlugUtils
│
└── frontend/
    ├── package.json
    ├── angular.json
    ├── tailwind.config.js
    └── src/
        ├── index.html
        ├── styles.css              # Tailwind imports
        ├── environments/           # Dev & Prod config
        └── app/
            ├── app.routes.ts       # Routing (lazy-loaded admin)
            ├── core/
            │   ├── models/         # TypeScript interfaces
            │   ├── services/       # HTTP services
            │   ├── interceptors/   # JWT auto-attach
            │   └── guards/         # Auth & Admin guards
            ├── shared/             # Header, Footer
            ├── pages/              # Home, Article Detail, List, Bookmarks
            ├── auth/               # Login, Register
            └── admin/              # Dashboard, Sources, Articles, Logs
```

---

## ❓ Troubleshooting

### Docker Compose không khởi động được

```bash
# Kiểm tra logs
docker compose logs postgres
docker compose logs redis

# Restart
docker compose down
docker compose up -d
```

### Backend không kết nối được Database

- Kiểm tra PostgreSQL đã **healthy**: `docker compose ps`
- Kiểm tra thông tin kết nối trong `.env` khớp với `application.yml`
- Mặc định: `localhost:5432`, database `newsdb`, user `newsuser`

### Frontend lỗi CORS

- Đảm bảo backend đã cấu hình CORS cho `http://localhost:4200`
- Kiểm tra `SecurityConfig.java` → `corsConfigurationSource()`

### AI Summary không hoạt động

1. Kiểm tra `AI_PROVIDER` trong `.env` (`gemini` / `openai` / `auto`)
2. Kiểm tra API key hợp lệ
3. Gemini free tier: giới hạn 15 req/phút — nếu vượt, hệ thống tự fallback sang OpenAI (mode `auto`)
4. Kiểm tra log backend: `docker compose logs backend` hoặc xem console

### Crawler không crawl bài

1. Kiểm tra Crawler Scheduler đã **BẬT** trong Admin Dashboard
2. Kiểm tra nguồn tin (Sources) đã **enabled**
3. Kiểm tra kết nối internet từ server
4. Xem Crawl Logs trong Admin để biết lỗi cụ thể

### Lỗi "Token expired"

- Frontend tự động refresh token khi access token hết hạn
- Nếu refresh token cũng hết hạn (sau 7 ngày), cần đăng nhập lại
- Kiểm tra Redis đang chạy (refresh token lưu trong Redis)

---

## 📝 Ghi chú

- **Crawler targets**: Hiện hỗ trợ VnExpress và Tuổi Trẻ. Có thể thêm nguồn mới bằng cách implement `CrawlerStrategy` interface và thêm vào DB qua Admin.
- **Rate limiting AI**: Gemini Flash miễn phí 15 req/phút. Nên dùng scheduler tóm tắt từ từ thay vì tóm tắt hàng loạt.
- **Redis**: Đóng vai trò quan trọng — cache API responses, JWT blacklist, crawler dedup, scheduler flags. Nếu Redis down, một số tính năng sẽ không hoạt động.
- **Flyway**: Tự động chạy migration khi backend khởi động. **KHÔNG** sửa trực tiếp file migration đã chạy — tạo file mới (V3, V4...) cho schema changes.
