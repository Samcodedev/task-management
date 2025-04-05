# Task Management API Documentation

A robust REST API for managing tasks, groups, and user assignments built with Node.js, Express, and MongoDB.

## Table of Contents
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Groups](#groups)
- [Admin](#admin)
- [Tasks](#tasks)

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with the following variables:
### Server Configuration
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token
```
### Email Configuration
```
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM_NAME=your_app_name
MAIL_FROM_ADDRESS=your_email_address
```

4. Start the server
```bash
npm start
```

## Authentication

### Register a New User
```http
POST /api/v1/user/register
Content-Type: application/json
```
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "userName": "johndoe",
  "email": "user@example.com",
  "phoneNumber": "+2345678900",
  "password": "password123"
}
```

### Login
```http
POST /api/v1/user/login
Content-Type: application/json
```
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Verify Account
```http
POST /api/v1/user/verify
Content-Type: application/json
```
```json
{
  "email": "user@example.com",
  "otp": "12345"
}
```

### Get User Profile
```http
GET /api/v1/user/getUser
Authorization: Bearer your_jwt_token
```

### Forgot Password
```http
POST /api/v1/user/forgotPassword
Content-Type: application/json
```
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/v1/user/resetPassword
Content-Type: application/json
```
```json
{
  "token": "reset_token",
  "newPassword": "newPassword123"
}
```

### Resend OTP
```http
POST /api/v1/user/resend-otp
Content-Type: application/json
```
```json
{
  "email": "user@example.com"
}
```

## Groups

### Create New Group
```http
POST /api/v1/group/register
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "groupName": "Marketing Team",
  "description": "Group for marketing team members"
}
```

### Update Group
```http
PUT /api/v1/group/:groupId
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "groupName": "Updated Group Name",
  "description": "Updated group description"
}
```

## Admin

### Set Member Role
```http
POST /api/v1/admin/role/:groupId
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "memberId": "user_id",
  "role": "admin" // Options: "admin", "manager", "member"
}
```

### Add Group Member
```http
POST /api/v1/admin/add/:groupId
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "newMemberId": "user_id",
  "role": "member" // Options: "admin", "manager", "member"
}
```

### Remove Group Member
```http
PUT /api/v1/add/remove/:groupId
Authorization: Bearer your_jwt_token
```
```json
{
  "memberId": "user_id",
}
```

## Tasks

### Create a New Task
```http
POST /api/v1/task/create/:groupId
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "title": "Task Title",
  "description": "Task Description",
  "priority": "high", // Options: "high", "low", "urgent"
  "status": "pending", // Options: "pending", "in-progress", "completed", "on-hold"
  "tasksList": ["task1", "task2"],
  "dueDate": "2024-03-20",
  "assignedTo": ["user_id1", "user_id2"],
  "supervisor": "supervisor_id"
}
```

### Update a Task
```http
PUT /api/v1/task/update/:taskId
Authorization: Bearer your_jwt_token
Content-Type: application/json
```
```json
{
  "title": "Updated Title",
  "status": "in-progress",
  "priority": "urgent"
}
```

## Error Responses

All endpoints may return the following error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```