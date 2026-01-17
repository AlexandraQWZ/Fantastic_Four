👩‍💻 **Kontributor**
- Alexandra (Ketua Kelompok)
- Christopher Luhur
- Calvin Christofel Sibuea
- Lampita E.R. Hutasoit



🌟 **Fantastic_Four**

Proyek ini dikembangkan oleh kelompok Fantastic Four untuk mata kuliah pemrograman Web Lanjut.  
Fokus utama proyek ini adalah penerapan DevOps Workflow, CI/CD Automation, dan **Deployment menggunakan Docker & Railway.

---

🚀 **Cara Menjalankan Aplikasi**

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
```bash
docker build -t fantastic-four-app .
docker run -p 3000:3000 fantastic-four-app
```

⚙️ **Penjelasan Singkat Workflow CI/CD**

Workflow CI/CD otomatis dijalankan menggunakan GitHub Actions setiap kali:

1. Ada commit baru di branch main atau feature/*

2. Ada Pull Request yang dibuat / diperbarui

🔄 **Alur CI Pipeline**

1. Install dependencies → npm install

2. Build aplikasi

3. Jalankan testing (menggunakan Jest / Supertest)

4. Deploy otomatis ke Railway (jika semua tahap berhasil ✅)

5. 📁 File konfigurasi pipeline:

- .github/workflows/ci.yml


**Tujuan CI/CD:**

Menjamin aplikasi selalu dalam kondisi build-ready

Menghindari error sebelum merge ke main

Memastikan kolaborasi tim terekam otomatis di GitHub




# Fantastic Four Application  
UAS Container Orchestration & DevOps

## 1. Informasi Kelompok
Nama Kelompok: Fantastic Four

Anggota Kelompok:
1. Alexandra (Ketua Kelompok)
2. Christopher Luhur
3. Calvin Christofel Sibuea
4. Lampita E.R. Hutasoit

Proyek ini dikembangkan untuk memenuhi Ujian Akhir Semester mata kuliah terkait pengembangan dan deployment aplikasi modern dengan fokus pada Kubernetes, Horizontal Pod Autoscaler (HPA), CI/CD, dan sistem monitoring.

## 2. Deskripsi Aplikasi
Fantastic Four Application merupakan aplikasi web backend berbasis Node.js yang dirancang untuk berjalan pada lingkungan containerized dan cloud-native. Aplikasi ini mampu berjalan secara terus-menerus, mudah diperbarui melalui pipeline CI/CD, serta mampu menangani peningkatan beban secara otomatis menggunakan Horizontal Pod Autoscaler.

Aplikasi ini terhubung dengan database PostgreSQL dan dilengkapi dengan konfigurasi berbasis ConfigMap dan Secret untuk menjaga keamanan data dan kredensial.

## 3. Cara Menjalankan Aplikasi Secara Lokal
Langkah-langkah menjalankan aplikasi tanpa container:

1. Clone repository  
   git clone https://github.com/AlexandraQWZ/Fantastic_Four.git  
   cd Fantastic_Four

2. Install dependencies  
   npm install

3. Jalankan aplikasi  
   npm start

Aplikasi akan berjalan pada alamat:  
http://localhost:3000

## 4. Build dan Menjalankan Aplikasi Menggunakan Docker
Aplikasi dikemas dalam Docker image agar dapat dijalankan secara konsisten di berbagai environment.

Langkah-langkah:
1. Build Docker image  
   docker build -t fantastic-four-app .

2. Jalankan container  
   docker run -p 3000:3000 fantastic-four-app

## 5. Arsitektur Sistem
Arsitektur sistem aplikasi terdiri dari:
1. Source code yang dikelola menggunakan GitHub.
2. Docker image yang disimpan di Docker Hub.
3. Kubernetes cluster sebagai platform orkestrasi container.
4. Namespace khusus untuk isolasi resource aplikasi.
5. Deployment dan Service Kubernetes.
6. PostgreSQL sebagai database aplikasi.
7. Horizontal Pod Autoscaler untuk autoscaling.
8. CI/CD pipeline menggunakan GitHub Actions.
9. Sistem monitoring berbasis Kubernetes monitoring stack.

## 6. Implementasi Kubernetes
Aplikasi dideploy ke Kubernetes menggunakan beberapa resource utama:
1. Namespace untuk memisahkan resource aplikasi.
2. Deployment untuk mengatur lifecycle pod dan rolling update.
3. Service untuk mengekspos aplikasi.
4. ConfigMap untuk konfigurasi non-sensitif.
5. Secret untuk menyimpan kredensial database dan monitoring.

Pendekatan ini memastikan aplikasi mudah dikelola, aman, dan scalable.

## 7. Implementasi Horizontal Pod Autoscaler
Horizontal Pod Autoscaler digunakan untuk menyesuaikan jumlah pod secara otomatis berdasarkan penggunaan CPU.

Konfigurasi HPA mencakup:
1. Minimum jumlah pod.
2. Maksimum jumlah pod.
3. Target utilisasi CPU.

Ketika terjadi peningkatan beban, Kubernetes secara otomatis menambah jumlah pod, dan akan menguranginya kembali ketika beban menurun.

## 8. Implementasi CI/CD
CI/CD diimplementasikan menggunakan GitHub Actions melalui file workflow `deploy.yml`.

Pipeline berjalan secara otomatis ketika terjadi push ke branch main dengan alur:
1. Checkout source code.
2. Build Docker image menggunakan Docker Buildx.
3. Push image ke Docker Hub.
4. Konfigurasi akses ke Kubernetes cluster menggunakan kubeconfig.
5. Update image pada Deployment Kubernetes.
6. Melakukan rollout dan verifikasi deployment.

Dengan pipeline ini, setiap perubahan kode dapat langsung diterapkan ke cluster Kubernetes secara otomatis.

## 9. Implementasi Monitoring
Monitoring digunakan untuk memantau kondisi aplikasi dan resource Kubernetes seperti CPU dan memory usage.

Tool monitoring yang digunakan terintegrasi dengan Kubernetes dan mendukung:
1. Pemantauan performa pod dan node.
2. Visualisasi metrik aplikasi.
3. Analisis autoscaling yang dilakukan oleh HPA.

Monitoring ini memastikan aplikasi tetap stabil dan berjalan sesuai kebutuhan.

## 10. Repository dan Referensi
Repository GitHub:  
https://github.com/AlexandraQWZ/Fantastic_Four

Docker Hub Image:  
https://hub.docker.com/r/username/fantastic_four

Referensi:
1. Dokumentasi resmi Kubernetes.
2. Dokumentasi Docker.
3. Dokumentasi GitHub Actions.

## 11. Video Penjelasan Implementasi
Video penjelasan implementasi Kubernetes dan aplikasi:  
[Link Video Deployment Kubernetes]

Video penjelasan implementasi HPA, CI/CD, dan Monitoring:  
[Link Video HPA, CI/CD, dan Monitoring]

## 12. Penutup
Melalui proyek ini, kelompok Fantastic Four berhasil menerapkan konsep aplikasi modern berbasis Kubernetes dengan dukungan autoscaling, CI/CD, dan monitoring sesuai dengan kebutuhan sistem yang andal, scalable, dan mudah dikelola.
