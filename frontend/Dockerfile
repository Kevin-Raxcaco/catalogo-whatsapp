# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .

# Vite lee variables de entorno en build-time via import.meta.env
ARG VITE_PB_URL
ARG VITE_ATOM_CLIENTS_URL
ARG VITE_ATOM_WEBHOOK_URL
ARG VITE_ATOM_WEBHOOK_TOKEN
ENV VITE_PB_URL=$VITE_PB_URL
ENV VITE_ATOM_CLIENTS_URL=$VITE_ATOM_CLIENTS_URL
ENV VITE_ATOM_WEBHOOK_URL=$VITE_ATOM_WEBHOOK_URL
ENV VITE_ATOM_WEBHOOK_TOKEN=$VITE_ATOM_WEBHOOK_TOKEN

RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
