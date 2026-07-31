FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup -g 1001 -S dms && adduser -S dms -u 1001 -G dms
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src/ ./src/
COPY --from=frontend-build /app/frontend/dist ./frontend-dist/
RUN mkdir -p uploads && chown -R dms:dms /app
USER dms
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1
CMD ["node", "src/server.js"]
