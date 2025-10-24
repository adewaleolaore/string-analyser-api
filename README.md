# String Analyzer API

A RESTful API service that analyzes strings and stores their computed properties including length, palindrome status, character frequency, and more.

## Features

- Analyze string properties (length, palindrome, word count, etc.)
- SHA-256 based unique identification
- Filtering capabilities
- Natural language query support
- In-memory storage

## API Endpoints

### 1. Create/Analyze String
    http
POST /strings
Content-Type: application/json

{
  "value": "string to analyze"
}