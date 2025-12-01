# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Complaints

#### Create Complaint
```http
POST /complaints
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (string, required)
- `description` (string, required)
- `category` (string, required)
- `priority` (string, optional)
- `location[address]` (string, optional)
- `location[city]` (string, optional)
- `images` (file[], optional)
- `videos` (file[], optional)
- `audio` (file[], optional)

#### Get All Complaints
```http
GET /complaints?status=pending&category=infrastructure&page=1&limit=10
```

**Query Parameters:**
- `status` (string, optional)
- `category` (string, optional)
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)

#### Get Single Complaint
```http
GET /complaints/:id
```

#### Update Complaint
```http
PUT /complaints/:id
```

#### Delete Complaint
```http
DELETE /complaints/:id
```

#### Add Comment
```http
POST /complaints/:id/comments
```

**Request Body:**
```json
{
  "text": "Comment text here"
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
