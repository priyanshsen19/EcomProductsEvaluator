FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_PRODUCTS_API=http://localhost:4000
ARG VITE_SEGMENTS_API=http://localhost:5050
ENV VITE_PRODUCTS_API=$VITE_PRODUCTS_API
ENV VITE_SEGMENTS_API=$VITE_SEGMENTS_API
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
