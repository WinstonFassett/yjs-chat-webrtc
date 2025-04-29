# --- Frontend build ---
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
ARG VITE_SIGNALING_SERVERS=ws://localhost:4444
ENV VITE_SIGNALING_SERVERS=$VITE_SIGNALING_SERVERS
RUN npm install && npm run build

FROM node:18-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
