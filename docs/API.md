# API Documentation

## Overview

The Food Tracker API provides endpoints for user authentication, meal tracking, food database management, and AI-powered nutrition coaching. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT tokens stored in HttpOnly cookies. After successful login, the token is automatically set in the cookie and sent with subsequent requests.

## API Endpoints

### Authentication Routes

Base path: `/api/auth`

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string (required, valid email)",
    "password": "string (required, min 6 characters)",
    "name": "string (optional)",
    "age": "number (optional)",
    "gender": "string (optional, 'Male' | 'Female' | 'Other')"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "integer",
      "email": "string",
      "name": "string",
      "daily_calorie_goal": "integer",
      "created_at": "timestamp"
    }
  }
  ```
- **Description**: Creates a new user account

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "user": {
      "id": "integer",
      "email": "string",
      "name": "string",
      "daily_calorie_goal": "integer"
    }
  }
  ```
- **Description**: Authenticates user and sets JWT token in cookie

#### Logout User
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**: None
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- **Description**: Invalidates user session by clearing JWT cookie

### Meal Routes

Base path: `/api/meals`

#### Search Foods
- **URL**: `/api/meals/foods/search`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `q`: Search query string (required)
- **Response**:
  ```json
  {
    "success": true,
    "foods": [
      {
        "id": "integer",
        "name": "string",
        "calories": "integer",
        "protein": "number",
        "carbs": "number",
        "fat": "number",
        "serving_size": "string",
        "created_by": "integer",
        "is_public": "boolean",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Description**: Search foods by name

#### Log Meal
- **URL**: `/api/meals`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "meal_type": "string (required, 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack')",
    "log_date": "string (optional, format: YYYY-MM-DD)",
    "time": "string (optional, format: HH:MM)",
    "notes": "string (optional)",
    "items": [
      {
        "food_id": "integer (optional)",
        "quantity": "number (required)",
        "custom_calories": "integer (optional)",
        "custom_protein": "number (optional)",
        "custom_carbs": "number (optional)",
        "custom_fat": "number (optional)"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Meal logged successfully",
    "meal": {
      "id": "integer",
      "user_id": "integer",
      "meal_type": "string",
      "log_date": "string",
      "time": "string",
      "notes": "string",
      "created_at": "timestamp"
    }
  }
  ```
- **Description**: Log a new meal with food items

#### Get Meals
- **URL**: `/api/meals`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `date`: Date string (optional, format: YYYY-MM-DD)
- **Response**:
  ```json
  {
    "success": true,
    "meals": [
      {
        "id": "integer",
        "user_id": "integer",
        "meal_type": "string",
        "log_date": "string",
        "time": "string",
        "notes": "string",
        "created_at": "timestamp",
        "items": [
          {
            "id": "integer",
            "meal_log_id": "integer",
            "food_id": "integer",
            "quantity": "number",
            "custom_calories": "integer",
            "custom_protein": "number",
            "custom_carbs": "number",
            "custom_fat": "number",
            "created_at": "timestamp"
          }
        ]
      }
    ]
  }
  ```
- **Description**: Get meals for current date or specified date

#### Get Daily Summary
- **URL**: `/api/meals/summary`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `date`: Date string (optional, format: YYYY-MM-DD)
- **Response**:
  ```json
  {
    "success": true,
    "date": "string",
    "summary": {
      "total_calories": "integer",
      "total_protein": "number",
      "total_carbs": "number",
      "total_fat": "number",
      "meal_count": "integer"
    },
    "goal": {
      "daily_calorie_goal": "integer"
    }
  }
  ```
- **Description**: Get nutritional summary for a specific date

#### Get Weekly Summary
- **URL**: `/api/meals/weekly`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**: None
- **Response**:
  ```json
  {
    "success": true,
    "weekly_summary": [
      {
        "date": "string",
        "date_label": "string",
        "total_calories": "number"
      }
    ]
  }
  ```
- **Description**: Get calorie consumption summary for the last 7 days

#### Get Meal History
- **URL**: `/api/meals/history`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `startDate`: Date string (optional)
  - `endDate`: Date string (optional)
  - `limit`: Integer (optional, default: 50)
  - `offset`: Integer (optional, default: 0)
- **Response**:
  ```json
  {
    "success": true,
    "history": [
      {
        "id": "integer",
        "user_id": "integer",
        "meal_type": "string",
        "log_date": "string",
        "time": "string",
        "notes": "string",
        "created_at": "timestamp",
        "items": [
          {
            "id": "integer",
            "meal_log_id": "integer",
            "food_id": "integer",
            "quantity": "number",
            "custom_calories": "integer",
            "custom_protein": "number",
            "custom_carbs": "number",
            "custom_fat": "number",
            "created_at": "timestamp"
          }
        ]
      }
    ],
    "pagination": {
      "limit": "integer",
      "offset": "integer"
    }
  }
  ```
- **Description**: Get paginated meal history

#### Delete Meal
- **URL**: `/api/meals/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **Path Parameters**:
  - `id`: Meal log ID (required)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Meal deleted successfully"
  }
  ```
- **Description**: Delete a specific meal log

#### Get Macro Breakdown
- **URL**: `/api/meals/macro-breakdown`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**:
  - `date`: Date string (optional, format: YYYY-MM-DD)
- **Response**:
  ```json
  {
    "success": true,
    "date": "string",
    "macros": {
      "protein": "number",
      "carbs": "number",
      "fat": "number"
    }
  }
  ```
- **Description**: Get macronutrient breakdown for a specific date

#### Get Calorie Trend
- **URL**: `/api/meals/calorie-trend`
- **Method**: `GET`
- **Authentication**: Required
- **Query Parameters**: None
- **Response**:
  ```json
  {
    "success": true,
    "trend": [
      {
        "date_label": "string",
        "log_date": "string",
        "total_calories": "number"
      }
    ]
  }
  ```
- **Description**: Get calorie consumption trend for the last 7 days

### User Routes

Base path: `/api/users`

#### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Request Body**: None
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "email": "string",
      "name": "string",
      "age": "integer",
      "gender": "string",
      "height": "number",
      "weight": "number",
      "activity_level": "string",
      "daily_calorie_goal": "integer",
      "protein_goal": "number",
      "carb_goal": "number",
      "fat_goal": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "diet_type": "string",
      "allergies": "array of strings",
      "food_preferences": "array of strings",
      "food_dislikes": "array of strings"
    }
  }
  ```
- **Description**: Get authenticated user's profile information

#### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "age": "number (optional)",
    "gender": "string (optional, 'Male' | 'Female' | 'Other')",
    "height": "number (optional)",
    "weight": "number (optional)",
    "daily_calorie_goal": "number (optional)",
    "protein_goal": "number (optional)",
    "carb_goal": "number (optional)",
    "fat_goal": "number (optional)",
    "diet_type": "string (optional, 'vegetarian' | 'vegan' | 'non-veg' | 'keto' | 'paleo')",
    "allergies": "array of strings (optional)",
    "food_preferences": "array of strings (optional)",
    "food_dislikes": "array of strings (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "email": "string",
      "name": "string",
      "daily_calorie_goal": "integer",
      "protein_goal": "number",
      "carb_goal": "number",
      "fat_goal": "number"
    }
  }
  ```
- **Description**: Update authenticated user's profile information

### AI Routes

Base path: `/api/ai`

#### Chat with Nutrition Coach
- **URL**: `/api/ai/chat`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "message": "string (required)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reply": "string",
    "metadata": {
      "calories_consumed": "integer"
    }
  }
  ```
- **Description**: Chat with AI-powered nutrition coach

#### Log Food with Natural Language
- **URL**: `/api/ai/log-natural`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "message": "string (required)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "extracted_data": "string (JSON formatted data)"
  }
  ```
- **Description**: Extract food items from natural language description

## Error Responses

All endpoints return appropriate HTTP status codes and JSON error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input or validation errors
- `401`: Unauthorized - Authentication required or invalid token
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side errors

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider implementing rate limiting to prevent abuse.

## CORS Policy

The API allows cross-origin requests from any origin for development purposes. In production, this should be configured to only allow specific trusted origins.