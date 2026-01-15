# CMD ["npm", "start"]

# Gunakan Node.js versi LTS yang stabil
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Salin file konfigurasi package ke container
COPY package*.json ./

# Install dependencies tanpa devDependencies
RUN npm install --production

# Salin seluruh source code
COPY . .

# Expose port aplikasi
EXPOSE 3000

# Jalankan server
CMD ["node", "server.js"]
