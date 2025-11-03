# Gunakan Node.js versi terbaru LTS
FROM node:18-alpine

# Tentukan working directory
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Build aplikasi (kalau ada proses build)
RUN npm run build

# Buka port default (sesuaikan dengan aplikasi)
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
