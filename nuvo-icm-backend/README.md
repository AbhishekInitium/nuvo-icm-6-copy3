
# NUVO ICM Backend

A Node.js + Express backend project connected to MongoDB.

## Project Structure

```
/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── models/         # Database models
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility functions
├── .env            # Environment variables
├── .gitignore      # Git ignore file
├── index.js        # Main application entry
└── package.json    # Project metadata and dependencies
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (if applicable)
   - Update MongoDB connection string in `.env`

3. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

4. The server will be running at http://localhost:3000

## API Endpoints

- `GET /`: Welcome message
- `GET /api/health`: Health check endpoint

## Database

This project connects to MongoDB database named `NUVO_ICM_2`.
