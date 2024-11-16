# Step 1: Build the NestJS app
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . ./

# Build the app
RUN npm run build

# Step 2: Run the NestJS app
FROM node:18

WORKDIR /app

# Install production dependencies
COPY --from=build /app /app

RUN npm install --only=production

# Expose port 3000
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
