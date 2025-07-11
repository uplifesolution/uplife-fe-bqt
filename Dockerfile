# ----- BUILD STAGE -----
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --force && npm run build -- --configuration production --project uplife-bqt
# ----- NGINX STAGE -----

FROM nginx:alpine
COPY --from=builder /app/dist/uplife-bqt/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
