# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Pass build arguments to Vite
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_ENABLE_AI_CHAT
ARG VITE_ENABLE_VECTOR_SEARCH

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_ENABLE_AI_CHAT=$VITE_ENABLE_AI_CHAT
ENV VITE_ENABLE_VECTOR_SEARCH=$VITE_ENABLE_VECTOR_SEARCH

RUN npm run build

# Run stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
