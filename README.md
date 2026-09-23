# 🦈 SharkFin — AI Personal Finance Assistant

**SharkFin** adalah aplikasi manajemen keuangan pribadi berbasis web yang dirancang untuk membantu pengguna **mencatat, memahami, mengelola, dan merencanakan kondisi keuangan** dalam satu platform.

SharkFin menggabungkan pencatatan keuangan dengan **Financial Engine** dan **AI Financial Assistant** untuk membantu pengguna memahami pola pengeluaran, kondisi cashflow, budget, financial goal, serta kewajiban keuangan yang akan datang.

Nama **SharkFin** berasal dari:

- **Shark** — menggambarkan kemampuan membaca kondisi dan peluang dengan tajam.

- **Fin** — singkatan dari *Finance* dan merepresentasikan dunia finansial.

> SharkFin — **AI finansial yang tajam dalam membaca kondisi keuanganmu.**

🌐 **Live Website:** [Masukkan URL Website Anda]

📦 **Repository:** [Masukkan URL GitHub Anda]

---

# ✨ Fitur Utama

## 💰 Manajemen Keuangan

### 📝 Pencatatan Transaksi

Mencatat berbagai aktivitas keuangan seperti:

- Income / pemasukan

- Expense / pengeluaran

- Transfer antar wallet

- Adjustment / penyesuaian saldo

Setiap transaksi dapat menyimpan informasi seperti nominal, kategori, wallet, tanggal, dan deskripsi.

### 📊 Riwayat Transaksi

Menampilkan riwayat transaksi sehingga pengguna dapat melihat dan memahami aktivitas keuangan yang telah dilakukan.

### 🔄 Transfer Antar Wallet

Memungkinkan pengguna memindahkan saldo dari satu wallet ke wallet lainnya tanpa dianggap sebagai pemasukan atau pengeluaran.

Contoh:

```text

BCA       Rp1.000.000

GoPay     Rp0

Transfer Rp200.000

BCA       Rp800.000

GoPay     Rp200.000

```

Total saldo tetap Rp1.000.000.

---

# 👛 Wallet

SharkFin menggunakan konsep **Wallet** untuk membantu pengguna memisahkan sumber atau tempat penyimpanan uang.

Contoh wallet:

- 🏦 BCA

- 📱 GoPay

- 💵 Cash

- 🛡️ Emergency Fund

- 💻 Laptop Savings

### Fitur Wallet

- Membuat wallet

- Mengubah wallet

- Mengaktifkan atau menonaktifkan wallet

- Melihat saldo wallet

- Transfer antar wallet

- Menghitung total saldo seluruh wallet

Saldo wallet dikelola berdasarkan transaksi yang tercatat sehingga perubahan transaksi dapat memengaruhi saldo secara konsisten.

---

# 📊 Budget Management

SharkFin menyediakan fitur **Budget** untuk membantu pengguna mengontrol pengeluaran berdasarkan kategori.

Contoh:

```text

Budget Makanan

Rp500.000 / bulan

Penggunaan

Rp350.000

Sisa

Rp150.000

```

Budget dapat digunakan untuk kategori seperti:

- 🍔 Makanan

- 🚗 Transportasi

- 🛍️ Belanja

- 🎮 Hiburan

- 📚 Pendidikan

- 🏥 Kesehatan

- 🧾 Tagihan & Langganan

- 🏠 Kebutuhan

SharkFin juga memberikan status penggunaan budget berdasarkan kondisi pengeluaran.

```text

< 70%      → Normal

70–84%     → Watch

85–99%     → Warning

≥ 100%     → Exceeded

```

---

# 🎯 Financial Goals

Financial Goal membantu pengguna merencanakan target keuangan tertentu.

Contoh:

```text

Target:

Laptop

Target Nominal:

Rp12.000.000

Deadline:

Desember 2027

Progress:

Rp4.500.000

```

SharkFin dapat membantu menghitung kebutuhan tabungan berdasarkan target dan waktu yang tersedia.

Contohnya:

```text

Target:

Rp12.000.000

Progress:

Rp4.500.000

Sisa:

Rp7.500.000

```

Pengguna dapat melihat perkembangan target keuangannya secara lebih terstruktur.

---

# 📅 Scheduled Expenses

Fitur **Scheduled Expenses** digunakan untuk mencatat pengeluaran yang akan terjadi di masa depan.

Contoh:

- Tagihan bulanan

- Pembayaran langganan

- Cicilan

- Pembayaran yang sudah direncanakan

- Pengeluaran berkala lainnya

Informasi pengeluaran mendatang dapat digunakan SharkFin untuk membantu memahami kondisi **future cashflow** pengguna.

---

# 📈 Financial Engine

SharkFin memiliki **Financial Engine** yang bertugas mengolah data transaksi menjadi informasi keuangan yang lebih bermakna.

Financial Engine memisahkan proses perhitungan finansial dari AI sehingga perhitungan utama tidak bergantung pada model AI.

Financial Engine menangani beberapa perhitungan seperti:

- 💰 Total Balance

- 📥 Income

- 📤 Expense

- 📊 Cashflow

- 💵 Spending Analysis

- 📈 Saving Rate

- 📊 Budget Usage

- 🎯 Goal Progress

- 📅 Upcoming Obligations

- 🔮 Cashflow Forecast

- 💳 Available Balance

- 🧠 Financial Health Indicators

- 💡 Affordability Analysis

Arsitektur sederhananya:

```text

Database

   ↓

Financial Engine

   ↓

Financial Metrics

   ↓

AI Context

   ↓

AI Model

   ↓

Insight / Recommendation

```

Dengan pendekatan ini, AI tidak langsung mengambil keputusan berdasarkan data transaksi mentah.

---

# 🧠 SharkFin Insights

**SharkFin Insights** memberikan informasi mengenai kondisi keuangan yang perlu diperhatikan pengguna.

Insight dapat muncul berdasarkan kondisi seperti:

### 🔴 Critical

Kondisi yang membutuhkan perhatian lebih cepat.

Contoh:

- Budget sudah melebihi batas

- Available balance negatif

- Kondisi cashflow yang sangat bermasalah

### 🟡 Warning

Kondisi yang sebaiknya diperhatikan.

Contoh:

- Penggunaan budget mendekati batas

- Pengeluaran meningkat

- Financial goal tertinggal

- Cashflow negatif

### 🔵 Info

Informasi tambahan mengenai kondisi keuangan pengguna.

Contoh:

- Pengeluaran mendatang

- Informasi perkembangan kondisi keuangan

- Kondisi tertentu yang perlu diketahui pengguna

Pengguna dapat memfilter insight berdasarkan:

```text

Semua

Critical

Warning

Info

```

---

# 🤖 Ask SharkFin

**Ask SharkFin** adalah fitur AI yang memungkinkan pengguna bertanya langsung mengenai kondisi keuangannya.

Contoh pertanyaan:

```text

Saya punya Rp500.000 sampai akhir bulan.

Apakah masih aman?

```

```text

Kenapa pengeluaran saya bulan ini meningkat?

```

```text

Berapa yang sebaiknya saya sisihkan untuk goal saya?

```

```text

Apakah saya masih mampu membeli barang seharga Rp300.000?

```

AI menggunakan data dan hasil analisis Financial Engine sebagai konteks sehingga jawaban dapat disesuaikan dengan kondisi keuangan pengguna.

---

# 💬 AI Conversation History

Ask SharkFin juga menyediakan sistem percakapan sehingga pengguna dapat menyimpan dan mengelola percakapan dengan AI.

Fitur yang tersedia:

- 💬 Membuat conversation baru

- 📝 Menyimpan pesan pengguna

- 🤖 Menyimpan jawaban AI

- 📚 Melihat conversation history

- ✏️ Mengubah nama conversation

- 🗑️ Menghapus conversation

- 🔄 Melanjutkan conversation sebelumnya

Conversation disimpan berdasarkan akun pengguna sehingga data percakapan tetap terhubung dengan user yang sesuai.

---

# 🛡️ AI Financial Safety

SharkFin dirancang sebagai **decision-support system**, bukan sebagai pengambil keputusan finansial otomatis.

AI digunakan untuk:

- Membantu memahami kondisi keuangan

- Memberikan insight

- Membantu membuat perencanaan

- Membandingkan pilihan

- Menjelaskan risiko

- Membantu pengguna memahami affordability

SharkFin tidak dirancang untuk:

- Menjamin keuntungan investasi

- Mengambil keputusan finansial secara otomatis

- Mengklaim sebagai penasihat keuangan berlisensi

- Melakukan pembelian atau transaksi investasi secara otomatis

- Memberikan rekomendasi investasi tanpa mempertimbangkan risiko

---

# 🔐 Authentication & Security

SharkFin menggunakan sistem authentication untuk melindungi data keuangan pengguna.

### Authentication

Pengguna harus login sebelum dapat mengakses dashboard dan fitur utama SharkFin.

### Session Management

Session menggunakan JWT dengan masa berlaku tertentu.

Session yang sudah expired tidak dapat digunakan untuk mengakses dashboard.

### Route Protection

Halaman dashboard dilindungi menggunakan server-side authentication sehingga pengguna yang belum login akan diarahkan ke halaman login.

### User Data Protection

Data pengguna dipisahkan berdasarkan user ID sehingga pengguna hanya dapat mengakses data miliknya sendiri.

### Environment Variables

Credential dan secret yang bersifat sensitif disimpan menggunakan environment variables dan tidak disimpan langsung di source code.

---

# 🛠️ Tech Stack

SharkFin dibangun menggunakan teknologi berikut:

| Teknologi | Penggunaan |

| ------------------- | --------------------------------------- |

| **Next.js** | Framework aplikasi web |

| **React** | Library antarmuka pengguna |

| **TypeScript** | Bahasa pemrograman |

| **Tailwind CSS** | Styling dan layout |

| **shadcn/ui** | Komponen antarmuka |

| **Lucide React** | Icon library |

| **Auth.js / NextAuth** | Authentication dan session |

| **Prisma ORM** | Database ORM |

| **PostgreSQL** | Database relasional |

| **Supabase** | PostgreSQL database service |

| **bcryptjs** | Password hashing |

| **OpenAI API** | AI financial assistant |

| **Vercel** | Deployment |

---

# 📸 Screenshots

> 🚧 **Coming Soon**
>
> Screenshot aplikasi **SharkFin** akan ditambahkan setelah proses penyempurnaan tampilan dan sistem selesai.

Saat ini SharkFin masih dalam tahap pengembangan dan beberapa bagian aplikasi masih terus disempurnakan, sehingga screenshot final belum ditampilkan pada README.

Screenshot akan mencakup beberapa bagian utama aplikasi seperti:

- 🏠 Dashboard
- 👛 Wallet
- 💰 Transactions
- 📊 Budget Management
- 🎯 Financial Goals
- 🧠 SharkFin Insights
- 🤖 Ask SharkFin

---

🚀 Instalasi**

Ikuti langkah berikut untuk menjalankan SharkFin secara lokal.

## 1. Clone Repository

Clone repository SharkFin menggunakan Git:

```bash

git clone [URL_GITHUB_SHARKFIN_ANDA]

```

Masuk ke direktori project:

```bash

cd sharkfin

```

---

## 2. Install Dependencies

Install seluruh dependency yang diperlukan:

```bash

npm install

```

---

## 3. Konfigurasi Database

SharkFin menggunakan **PostgreSQL** sebagai database dan **Prisma ORM** untuk mengelola database.

Project ini dapat menggunakan PostgreSQL melalui **Supabase**.

Buat database PostgreSQL terlebih dahulu, kemudian siapkan connection string database.

---

## 4. Environment Variables

Buat file `.env.local` pada root project:

```text

.env.local

```

Kemudian masukkan konfigurasi yang diperlukan:

```env

DATABASE_URL=masukkan_database_url_anda

AUTH_SECRET=masukkan_auth_secret_anda

OPENAI_API_KEY=masukkan_openai_api_key_anda

SHARKFIN_AI_MODEL=gpt-5.6-luna

```

> Nama environment variable dapat disesuaikan dengan konfigurasi project yang digunakan.

### ⚠️ Penting

Jangan pernah mengunggah file `.env.local` ke GitHub.

Pastikan `.env.local` terdapat di dalam `.gitignore`:

```gitignore

.env*

```

Jangan membagikan:

- Database connection string

- Authentication secret

- OpenAI API key

- Credential lainnya

---

## 5. Generate Prisma Client

Setelah database dikonfigurasi, generate Prisma Client:

```bash

npx prisma generate

```

---

## 6. Database Migration

Untuk menjalankan migration database:

```bash

npx prisma migrate dev

```

Pastikan database sudah dapat diakses sebelum menjalankan migration.

---

# ▶️ Menjalankan Project

Setelah seluruh konfigurasi selesai, jalankan development server:

```bash

npm run dev

```

Kemudian buka browser dan akses:

```text

http://localhost:3000

```

Pengguna yang belum login akan diarahkan ke halaman login ketika mencoba mengakses dashboard.

---

# 🏗️ Build untuk Production

Untuk memastikan project dapat dibuild dengan baik, jalankan:

```bash

npm run build

```

Jika proses build berhasil, project dapat dijalankan menggunakan:

```bash

npm start

```

---

# 🧪 Development & Validation

Sebelum melakukan commit atau deployment, beberapa pengecekan yang dapat dilakukan:

### TypeScript

```bash

npx tsc --noEmit

```

### Lint

```bash

npm run lint

```

### Production Build

```bash

npm run build

```

Pastikan tidak terdapat error sebelum melakukan deployment.

---

# 🌐 Deployment

SharkFin dapat di-deploy menggunakan **Vercel**.

### 1. Install Vercel CLI

```bash

npm install -g vercel

```

### 2. Login

```bash

vercel login

```

### 3. Deploy

Untuk deployment production:

```bash

vercel --prod

```

### Environment Variables

Pastikan environment variables yang digunakan oleh project telah ditambahkan pada **Vercel Project Settings**.

Contoh:

```env

DATABASE_URL=your_database_url

AUTH_SECRET=your_auth_secret

OPENAI_API_KEY=your_openai_api_key

SHARKFIN_AI_MODEL=gpt-5.6-luna

```

> Jangan memasukkan secret secara langsung ke dalam source code atau repository GitHub.

---

# 📂 Struktur Project

Struktur project SharkFin secara umum:

```text

sharkfin/

│

├── prisma/

│   ├── migrations/

│   └── schema.prisma

│

├── public/

│   └── screenshots/

│

├── src/

│   ├── app/

│   │   ├── api/

│   │   ├── dashboard/

│   │   ├── login/

│   │   ├── register/

│   │   └── onboarding/

│   │

│   ├── components/

│   │   ├── ai/

│   │   ├── dashboard/

│   │   ├── goals/

│   │   ├── transactions/

│   │   ├── wallets/

│   │   └── ...

│   │

│   ├── lib/

│   │   ├── ai/

│   │   ├── financial-engine/

│   │   ├── auth/

│   │   └── ...

│   │

│   ├── services/

│   │   ├── ai-conversation.service.ts

│   │   └── ...

│   │

│   ├── auth.ts

│   └── generated/

│       └── prisma/

│

├── .env.local

├── .gitignore

├── package.json

├── prisma7.config.ts

├── tsconfig.json

└── README.md

```

Struktur dapat berubah mengikuti perkembangan aplikasi.

---

# 🎯 Tujuan Pengembangan

SharkFin dikembangkan untuk membantu pengguna memahami dan mengelola keuangan pribadi dengan cara yang lebih terstruktur.

Beberapa tujuan utama SharkFin adalah:

### 💰 Memahami Kondisi Keuangan

Membantu pengguna mengetahui kondisi saldo, pemasukan, pengeluaran, dan cashflow mereka.

### 📊 Mengontrol Pengeluaran

Membantu pengguna mengontrol pengeluaran melalui budget dan analisis pola pengeluaran.

### 🎯 Membantu Mencapai Financial Goal

Membantu pengguna membuat target keuangan dan memahami kebutuhan tabungan untuk mencapainya.

### 📅 Merencanakan Pengeluaran

Membantu pengguna memperhitungkan kewajiban dan pengeluaran yang akan datang.

### 🧠 Menggunakan AI Secara Bermakna

Menggunakan AI bukan hanya sebagai chatbot, tetapi sebagai assistant yang memahami konteks kondisi keuangan pengguna melalui hasil Financial Engine.

### 📈 Pengambilan Keputusan yang Lebih Terinformasi

Memberikan insight dan informasi yang dapat membantu pengguna mempertimbangkan keputusan finansial berdasarkan kondisi keuangannya.

---

# 🔮 Pengembangan Selanjutnya

SharkFin masih dapat dikembangkan lebih lanjut sesuai kebutuhan pengguna.

Beberapa kemungkinan pengembangan:

- 🏦 Integrasi rekening bank

- 💳 Integrasi e-wallet

- 📱 Peningkatan pengalaman mobile

- 📊 Financial analytics yang lebih lengkap

- 📈 Net worth tracking

- 💵 Investment tracking

- 💳 Debt management

- 🔔 Notifikasi financial insight

- 📅 Otomatisasi scheduled expenses

- 🤖 AI financial planning yang lebih mendalam

- 📊 Financial report dan export

- 🔐 Peningkatan keamanan API

- 🧠 AI personalization yang lebih baik

Fitur-fitur tersebut berada di luar fokus MVP saat ini dan dapat dikembangkan secara bertahap.

---

# 🤝 Kontribusi

Kontribusi terhadap pengembangan SharkFin sangat terbuka.

Jika ingin melakukan perubahan atau menambahkan fitur:

### 1. Fork Repository

Fork repository SharkFin terlebih dahulu.

### 2. Buat Branch Baru

```bash

git checkout -b feature/nama-fitur

```

### 3. Lakukan Perubahan

Implementasikan perubahan atau fitur yang diperlukan.

### 4. Commit Perubahan

Gunakan **Conventional Commits** jika memungkinkan.

Contoh:

```bash

git commit -m "feat: add financial report"

```

Contoh lainnya:

```bash

git commit -m "fix: resolve wallet balance calculation"

```

### 5. Push Branch

```bash

git push origin feature/nama-fitur

```

### 6. Buat Pull Request

Buat Pull Request untuk mengajukan perubahan ke repository utama.

---

# 📄 License

SharkFin dikembangkan sebagai project aplikasi manajemen keuangan pribadi berbasis web.

Lisensi project dapat disesuaikan dengan kebutuhan pemilik atau pengembang project.

---

# 👨‍💻 Developer

**SharkFin**

AI Personal Finance Assistant

Built with:

**Next.js · TypeScript · PostgreSQL · Prisma · Tailwind CSS · Auth.js · OpenAI**

---

© 2026 SharkFin. All rights reserved.