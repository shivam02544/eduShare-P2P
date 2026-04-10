# EduShare — Advanced Peer Learning Ecosystem

**EduShare** is a high-performance, student-driven knowledge exchange platform. It facilitates a decentralized learning economy where users exchange teaching videos, study resources, and live sessions through a robust, credit-based incentive system.

Built for scalability and professional oversight, it features a sophisticated administrative suite with real-time analytics and unified management capabilities.

---

## 💎 Core Design Philosophy
- **Product-First Aesthetics**: A minimalist, high-contrast UI designed for focus and professional utility.
- **Zero-Dependency Dashboards**: All high-density visualizations are built using Vanilla SVG/CSS to ensure zero runtime overhead.
- **Unified Identity Sync**: Seamless role-based synchronization between Firebase Auth and MongoDB profiles.
- **Atomic Credit Economy**: Reliable transaction layer ensuring integrity across all peer-to-peer exchanges.

---

## ⚡ Key Features

### 🎓 Learning & Exchange
- **Dynamic Content Hub**: Advanced Video and Study Note distribution with subject-based filtering.
- **Interactive Quizzes**: Integrated assessment engine with auto-graded results and credit rewards.
- **Live Classroom**: Real-time collaborative sessions with participation incentives.
- **Verified Certificates**: Cryptographically unique digital completion certificates.

### 📊 Admin Intelligence Hub
- **Executive Insights**: Platform-wide KPIs including user growth trends and content volume metrics.
- **Unified Management Suite**: A centralized control center for overseeing users, moderation queues, and resource libraries.
- **Advanced Content Moderation**: Powerful filtering and oversight tools for managing community-generated content.
- **Identity Control**: Granular RBAC (Role-Based Access Control) integrated at the layout level.

### 🚀 Performance & Scale
- **Direct S3 Uploads**: Zero-buffer binary streaming directly to AWS S3 via presigned URLs.
- **Global Content Delivery**: Optimized asset loading through AWS CloudFront integration.
- **Analytics Aggregation**: High-performance MongoDB aggregation pipelines for real-time reporting.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Logic** | JavaScript (ES6+), Node.js |
| **Styling** | Vanilla CSS, Tailwind (Foundational) |
| **Database** | MongoDB (Mongoose) |
| **Identity** | Firebase Auth + Internal Role Middleware |
| **Infrastructure** | AWS S3, CloudFront |
| **Monitoring** | Sentry & Pino |
| **Visualization** | Custom Vanilla SVG Engine |

---

## 📂 Architecture Overview

```bash
edushare/
├── app/
│   ├── admin/             # Unified Management Suite (Dashboard, Reports, Users, Content)
│   ├── api/               # Optimized REST Layer (Admin Stats, Identity Sync, Resource CRUD)
│   ├── (platform)/        # Core P2P Learning Interface
│   └── globals.css        # Design System & Professional Tokens
├── components/            # High-Performance UI Components
├── context/               # Auth & Identity Synchronization Layer
├── lib/                   # Core Utilities (S3, MongoDB, RBAC, Credits)
└── models/                # Production Data Schemas
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- MongoDB Atlas or local instance
- Firebase Project (Authentication enabled)
- AWS IAM User (S3 FullAccess)

### Setup & Installation

1. **Clone & Install**:
   ```bash
   git clone https://github.com/shivam02544/eduShare-P2P.git
   cd eduShare-P2P
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` based on the following manifest:
   ```env
   # Core
   MONGODB_URI=
   ADMIN_EMAILS=                 # Comma-separated list for super-admin elevation
   
   # AWS
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=
   
   # Identity (Firebase)
   NEXT_PUBLIC_FIREBASE_API_KEY=
   FIREBASE_PRIVATE_KEY=
   FIREBASE_CLIENT_EMAIL=
   
   # Infrastructure
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   EMAIL_PASS=                   # Gmail App Password
   ```

3. **Development Cycle**:
   ```bash
   npm run dev
   ```

---

## 📡 API Reference Manifest

### Platform Administration
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/stats` | `GET` | Aggregated platform growth & volume KPIs |
| `/api/admin/content` | `GET/DELETE` | Centralized resource library management |
| `/api/admin/users` | `GET/PATCH` | Global user oversight and account control |
| `/api/admin/reports` | `GET/PATCH` | Moderation queue and enforcement actions |

### Identity & Access
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/profile` | `GET` | Role synchronization and profile fetching |
| `/api/auth/verify-email` | `GET` | Token-based secure account verification |

### Learning Resources
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/videos` | `GET/POST` | Large-scale teaching video lifecycle |
| `/api/notes` | `GET/POST` | Study resource distribution & unlocking |
| `/api/live` | `GET/POST` | Real-time session scheduling & orchestration |

---

## 🛡️ Security & Integrity
- **Layout-Level Protection**: RBAC checks are enforced at the root layout of privileged routes.
- **Sanitized Inputs**: 100% endpoint validation using deterministic `Zod` schemas.
- **Transaction Safety**: Peer credit transfers are handled via atomic MongoDB sessions to prevent data loss.
- **Global Rate Limiting**: Intelligent sliding-window protection on high-frequency and sensitive endpoints.

---

## ⚖️ License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

Built with precision by the **EduShare Engineering Team**.
