FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_WS_URL=/ws
ARG VITE_ENABLE_AI_CHAT=true
ARG VITE_ENABLE_VECTOR_SEARCH=true
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_ENABLE_AI_CHAT=$VITE_ENABLE_AI_CHAT
ENV VITE_ENABLE_VECTOR_SEARCH=$VITE_ENABLE_VECTOR_SEARCH

RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80