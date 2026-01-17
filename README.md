# Fantastic Four Application  
UAS Container Orchestration & DevOps

## 1. Informasi Kelompok
Nama Kelompok: Fantastic Four

Anggota Kelompok:
1. Alexandra (Ketua Kelompok)
2. Christopher Luhur
3. Calvin Christofel Sibuea
4. Lampita E.R. Hutasoit

Proyek ini dikembangkan untuk memenuhi Ujian Akhir Semester (UAS) pada mata kuliah Container Orchestration & DevOps. Fokus utama proyek adalah penerapan Docker, Kubernetes, Horizontal Pod Autoscaler (HPA v2), CI/CD Automation, serta sistem monitoring berbasis Prometheus dan Grafana.

## 2. Deskripsi Aplikasi
Fantastic Four Application merupakan aplikasi web backend berbasis Node.js (Express) yang dirancang menggunakan pendekatan cloud-native dan containerized. Aplikasi ini mendukung deployment terotomatisasi melalui pipeline CI/CD serta mampu menangani peningkatan beban secara dinamis menggunakan Horizontal Pod Autoscaler.

Aplikasi terhubung dengan database PostgreSQL dan menggunakan Kubernetes Secret untuk pengelolaan kredensial secara aman. Selain itu, aplikasi menyediakan endpoint /metrics untuk integrasi monitoring dan autoscaling.

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

## 5. Menjalankan Aplikasi Menggunakan Docker Compose

Docker Compose digunakan untuk menjalankan aplikasi beserta database PostgreSQL secara bersamaan.

docker-compose up --build

Akses aplikasi melalui:
http://localhost:4000

## 6. Arsitektur Sistem
Arsitektur sistem aplikasi terdiri dari:
1. Source code yang dikelola menggunakan GitHub.
2. Docker image sebagai unit distribusi aplikasi.
3. Kubernetes cluster sebagai platform orkestrasi container.
4. Namespace Kubernetes untuk isolasi resource aplikasi.
5. Deployment dan Service untuk manajemen aplikasi.
6. PostgreSQL sebagai database backend.
7. Horizontal Pod Autoscaler (HPA v2) untuk autoscaling.
8. CI/CD pipeline menggunakan GitHub Actions.
9. Monitoring stack menggunakan Prometheus dan Grafana.

## 7. Implementasi Kubernetes
Deployment aplikasi pada Kubernetes menggunakan beberapa resource utama:
1. Namespace – memisahkan resource aplikasi dari workload lain.
2. Deployment – mengatur lifecycle pod dan rolling update.
3. Service (LoadBalancer & ClusterIP) – mengekspos aplikasi dan monitoring.
4. Secret – menyimpan kredensial database dan monitoring.
5. PostgreSQL Deployment & Service – sebagai database aplikasi.

Pendekatan ini memastikan aplikasi mudah dikelola, aman, dan scalable.

Pendekatan ini memastikan aplikasi mudah dikelola, aman, dan scalable.

## 8. Implementasi Horizontal Pod Autoscaler
Horizontal Pod Autoscaler digunakan untuk menyesuaikan jumlah pod secara otomatis

berdasarkan metrik berikut:
1. CPU utilization
2. Memory utilization
3. Custom metrics dari Prometheus (request rate, latency, error rate)

HPA dikonfigurasi menggunakan API autoscaling/v2 dengan batas minimum dan maksimum replica. Kubernetes akan menambah atau mengurangi jumlah pod secara otomatis sesuai beban aplikasi.

## 9. Implementasi CI/CD
CI/CD diimplementasikan menggunakan GitHub Actions melalui workflow .github/workflows/ci.yml dan `deploy.yml`.

Pipeline berjalan secara otomatis ketika terjadi push ke branch main dengan alur:
1. Checkout source code.
2. Install dependencies
3. Build Docker image
4. Push image ke container registry
5. Deploy atau update image pada Kubernetes Deployment
6. Melakukan rollout dan verifikasi deployment

Dengan pipeline ini, setiap perubahan kode dapat langsung diterapkan ke cluster Kubernetes secara konsisten.

## 10. Implementasi Monitoring
Monitoring digunakan untuk memantau performa aplikasi dan resource Kubernetes.

Monitoring stack yang digunakan:
1. Prometheus untuk pengumpulan metrics aplikasi dan cluster.
  * Prometheus untuk pengumpulan metrics aplikasi dan cluster.
  * Request rate
  * Error rate
  * HPA scaling activity
2. Grafana untuk visualisasi metrics seperti:

Monitoring ini memastikan aplikasi tetap stabil dan performanya terpantau dengan baik.

## 10. Repository dan Referensi
Repository GitHub:  
https://github.com/AlexandraQWZ/Fantastic_Four

Docker Hub Image:  
https://hub.docker.com/r/username/fantastic_four

Referensi:
1. Dokumentasi Kubernetes
2. Dokumentasi Docker
3. Dokumentasi GitHub Actions
4. Dokumentasi Prometheus dan Grafana

## 12. Video Penjelasan Implementasi
Video penjelasan implementasi Kubernetes dan aplikasi:  
[Link Video Deployment Kubernetes]

Video penjelasan implementasi HPA, CI/CD, dan Monitoring:  
[Link Video HPA, CI/CD, dan Monitoring]

## 13. Penutup
Melalui proyek ini, kelompok Fantastic Four berhasil mengimplementasikan aplikasi backend berbasis Kubernetes dengan dukungan autoscaling, CI/CD automation, serta sistem monitoring. Proyek ini mencerminkan penerapan konsep DevOps dan Cloud Native Application yang scalable, reliable, dan mudah dikelola.