# Project Mark Knowledge Base API

A knowledge base API built with Express, TypeScript, and Redis. This API provides a structured way to manage and version knowledge base topics, resources, and user access.

## Project Overview

The Knowledge Base API is designed to handle versioned content management with the following key features:

- Topic versioning system
- Resource management
- User role-based access control
- Redis-based data storage
- RESTful API architecture

### Business Rules

1. **Topic Versioning**

   - Each topic update creates a new version
   - Previous versions are preserved for history
   - Version numbers are sequential and auto-incremented
   - Each version maintains its own metadata (creation date, ...)

2. **Resource Management**

   - Resources are linked to specific topic versions
   - Multiple resources can be associated with a topic
   - Resources can be of different types (video, article, pdf)

3. **User Access Control**
   - Three user roles: Admin, Editor, Viewer
   - Admins have full system access
   - Editors can create and modify content
   - Viewers have read-only access

## Prerequisites

- Node.js (v18 or higher)
- Redis server
- Docker and Docker Compose (for containerized setup)
- npm or yarn

## Setup Instructions

### Option 1: Docker Setup (Recommended)

1. Clone the repository:

```bash
git clone [repository-url]
cd project-mark-knowledge-base-api
```

2. Start the services using Docker Compose:

```bash
docker-compose up -d
```

This will start:

- API server on port 3000
- Redis server on port 6379
- Redis Commander (UI) on port 8081
- Redis Insight (UI) on port 5540

### Option 2: Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

3. Start Redis server:

```bash
# If using Docker
docker run --name redis -p 6379:6379 -d redis

# Or start your local Redis server
```

4. Run the development server:

```bash
npm run start:dev
```

## Available Scripts

- `npm start` - Start the production server
- `npm run start:dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript project
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with initial data

## API Endpoints

### Authentication

All endpoints are protected, and you need to pass a simple header:  
`user-id`

Is the ID of one existent user. To create the first user you don't need this header, only for the next one and need to be with the role admin

### Topics

- `POST /v1/topics` - Create a new topic
- `GET /v1/topics` - Get all topics
- `GET /v1/topics/:id` - Get topic by ID
- `PATCH /v1/topics/:id` - Update topic (creates new version)
- `DELETE /v1/topics/:id` - Delete topic
- `GET /v1/topics/:id/tree` - Get the topic and subtopics in a tree format

### Users

- `POST /v1/users` - Create a new user
- `GET /v1/users` - Get all users
- `GET /v1/users/:id` - Get user by ID
- `PUT /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user

## Project Structure

```
src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── models/         # Data models
├── repositories/   # Data access layer
├── routes/         # API routes
├── services/       # Business logic
```

## Improvements To Be Done

1. **Code Quality**

   - [ ] Split part of the logic into separate methods (buildTree,findShortestPath, ..) and add unit tests on them.
   - [ ]Tests on repository and service layer.
   - [ ] Optimize database queries
   - [ ] Add pagination for list endpoints
   - [ ] Implement search functionality
