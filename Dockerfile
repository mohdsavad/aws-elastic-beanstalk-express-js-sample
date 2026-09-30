# Match the Node 16 environment used for assessment testing.
FROM node:16.20.2-bullseye

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies from the committed lockfile.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy only the application source needed at runtime.
COPY app.js home.js ./

# Run the application as the image's non-root user.
USER node

# Document the application port; publishing is configured at runtime.
EXPOSE 8080

CMD ["node", "app.js"]
