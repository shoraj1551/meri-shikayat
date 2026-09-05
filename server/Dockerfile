# Build from the repository root: docker build -f server/Dockerfile .
FROM node:24.19.0-bookworm-slim AS dependencies
WORKDIR /app
RUN npm install --global npm@11.11.0
COPY package.json package-lock.json .npmrc ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY scripts/check-toolchain.cjs ./scripts/check-toolchain.cjs
RUN npm ci --workspace server --include-workspace-root --omit=dev --no-audit --no-fund

FROM node:24.19.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies --chown=node:node /app /app
COPY --chown=node:node server/src ./server/src
WORKDIR /app/server
RUN mkdir -p uploads && chown node:node uploads
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/v1/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
# Production listener is addressed separately by story B03.
CMD ["node", "src/index.js"]
