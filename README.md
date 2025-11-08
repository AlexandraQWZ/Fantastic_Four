👩‍💻 Kontributor
- Alexandra (Ketua Kelompok)
- Christopher Luhur
- Calvin Christofel Sibuea
- Lampita E.R. Hutasoit



🌟 **Fantastic_Four**

Proyek ini dikembangkan oleh kelompok Fantastic Four untuk mata kuliah pemrograman Web Lanjut.  
Fokus utama proyek ini adalah penerapan DevOps Workflow, CI/CD Automation, dan **Deployment menggunakan Docker & Railway.

---

🚀 Cara Menjalankan Aplikasi

1. Clone Repository
```bash
    git clone https://github.com/AlexandraQWZ/Fantastic_Four.git
    cd Fantastic_Four
```
2. Install Dependencies
```bash
    npm install
```
3. Jalankan Aplikasi Secara Lokal
```bash
    npm start
```

Aplikasi akan berjalan di:
👉 http://localhost:3000

4. Build & Jalankan Menggunakan Docker
docker build -t fantastic-four-app .
docker run -p 3000:3000 fantastic-four-app

⚙️ Penjelasan Singkat Workflow CI/CD

Workflow CI/CD otomatis dijalankan menggunakan GitHub Actions setiap kali:

Ada commit baru di branch main atau feature/*

Ada Pull Request yang dibuat / diperbarui

🔄 Alur CI Pipeline

Install dependencies → npm install

Build aplikasi

Jalankan testing (menggunakan Jest / Supertest)

Deploy otomatis ke Railway (jika semua tahap berhasil ✅)

📁 File konfigurasi pipeline:

.github/workflows/ci.yml


Tujuan CI/CD:

Menjamin aplikasi selalu dalam kondisi build-ready

Menghindari error sebelum merge ke main

Memastikan kolaborasi tim terekam otomatis di GitHub