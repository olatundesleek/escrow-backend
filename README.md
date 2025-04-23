# Escrow App

## Overview

The Escrow App is a web application designed to facilitate secure transactions between parties using an escrow service. It provides functionalities for user authentication, escrow management, payment processing, and dispute resolution.

## Features

- **User Authentication**: Registration, login, email verification, and logout.
- **Escrow Management**: Create, update, retrieve, and accept escrow transactions.
- **Payment Processing**: Initiate payments, confirm transactions, and check payment statuses.
- **Dispute Management**: File and resolve disputes for escrow transactions.
- **Two-Factor Authentication (2FA)**: Enable 2FA for enhanced account security.

## Directory Structure

```
escrow-app
├── controllers
│   ├── authController.js
│   ├── escrowController.js
│   ├── paymentController.js
│   └── disputeController.js
├── routes
│   ├── authRoutes.js
│   ├── escrowRoutes.js
│   ├── paymentRoutes.js
│   └── disputeRoutes.js
├── models
│   ├── User.js
│   ├── Escrow.js
│   ├── Dispute.js
│   └── transaction.js
├── middleware
│   └── authMiddleware.js
├── services
│   ├── userServices.js
│   └── escrowServices.js
├── utils
│   └── paymentGateway.js
├── Email
│   ├── email.js
│   └── templates
│       └── userregisteration.js
├── app.js
├── server.js
└── README.md
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd escrow-app
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. Access the application at `http://localhost:3000`.

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

- `PORT`: The port on which the server will run (default: 3000).
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT token generation.
- `GMAIL_USER`: Gmail account for sending emails (production).
- `GMAIL_PASS`: Gmail app password (production).
- `NODE_ENV`: Set to `development` or `production`.
- `WEBLINK`: Base URL for email verification links.

## API Endpoints

### Authentication

#### Register a New User

- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "success": true,
      "message": "User registered successfully. Verification email sent."
    }
    ```
  - Error (400/409):
    ```json
    {
      "success": false,
      "message": "Validation error or Email/Username already in use"
    }
    ```

#### Login a User

- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Login successful"
    }
    ```
  - Error (401/403):
    ```json
    {
      "success": false,
      "message": "Invalid credentials or account not verified"
    }
    ```

#### Logout a User

- **Endpoint**: `POST /api/auth/logout`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```

#### Verify Email

- **Endpoint**: `GET /api/auth/verify-email/:token`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Email verified successfully"
    }
    ```
  - Error (400/404):
    ```json
    {
      "success": false,
      "message": "Invalid or expired verification token"
    }
    ```

---

### Escrow

#### Create a New Escrow

- **Endpoint**: `POST /api/escrow`
- **Request Body**:
  ```json
  {
    "creatorRole": "buyer",
    "counterpartyEmail": "seller@example.com",
    "amount": 5000,
    "description": "Payment for services",
    "terms": ["Deliver project files", "Provide support for 30 days"]
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "message": "Escrow created successfully",
      "escrow": {
        "id": "12345",
        "creatorRole": "buyer",
        "amount": 5000,
        "status": "pending"
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "message": "Validation error or Internal server error"
    }
    ```

#### Accept an Escrow

- **Endpoint**: `POST /api/acceptescrow`
- **Request Body**:
  ```json
  {
    "escrowId": "12345"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Escrow accepted successfully",
      "escrow": {
        "id": "12345",
        "status": "active"
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "message": "Validation error or Internal server error"
    }
    ```

#### Get Escrow Details

- **Endpoint**: `GET /api/escrow/:id`
- **Response**:
  - Success (200):
    ```json
    {
      "escrow": {
        "id": "12345",
        "creatorRole": "buyer",
        "amount": 5000,
        "status": "active"
      }
    }
    ```
  - Error (404/500):
    ```json
    {
      "message": "Escrow not found or Internal server error"
    }
    ```

#### Update an Escrow

- **Endpoint**: `PUT /api/escrow/:id`
- **Request Body**:
  ```json
  {
    "amount": 6000,
    "status": "completed"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Escrow updated successfully",
      "escrow": {
        "id": "12345",
        "amount": 6000,
        "status": "completed"
      }
    }
    ```
  - Error (404/500):
    ```json
    {
      "message": "Escrow not found or Internal server error"
    }
    ```

---

### Payment

#### Initiate a Payment

- **Endpoint**: `POST /api/payment/initiate`
- **Request Body**:
  ```json
  {
    "amount": 5000,
    "currency": "USD",
    "userId": "12345"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "paymentDetails": {
        "id": "payment123",
        "status": "pending"
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "success": false,
      "message": "Validation error or Internal server error"
    }
    ```

#### Confirm a Payment

- **Endpoint**: `POST /api/payment/confirm`
- **Request Body**:
  ```json
  {
    "paymentId": "payment123"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "confirmation": {
        "status": "success"
      }
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

#### Check Payment Status

- **Endpoint**: `GET /api/payment/status/:paymentId`
- **Response**:
  - Success (200):
    ```json
    {
      "status": "success"
    }
    ```
  - Error (404/500):
    ```json
    {
      "message": "Payment not found or Internal server error"
    }
    ```

---

### Dispute

#### File a Dispute

- **Endpoint**: `POST /api/dispute/file`
- **Request Body**:
  ```json
  {
    "escrowId": "12345",
    "reason": "The terms of the agreement were not fulfilled"
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "message": "Dispute filed successfully",
      "dispute": {
        "id": "dispute123",
        "status": "Pending"
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "message": "Validation error or Internal server error"
    }
    ```

#### Get Dispute Details

- **Endpoint**: `GET /api/dispute/:id`
- **Response**:
  - Success (200):
    ```json
    {
      "dispute": {
        "id": "dispute123",
        "status": "Pending",
        "reason": "The terms of the agreement were not fulfilled"
      }
    }
    ```
  - Error (404/500):
    ```json
    {
      "message": "Dispute not found or Internal server error"
    }
    ```

#### Resolve a Dispute

- **Endpoint**: `PUT /api/dispute/resolve/:id`
- **Request Body**:
  ```json
  {
    "resolution": "Refund issued to buyer"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Dispute resolved successfully",
      "dispute": {
        "id": "dispute123",
        "status": "Resolved"
      }
    }
    ```
  - Error (404/500):
    ```json
    {
      "message": "Dispute not found or Internal server error"
    }
    ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License.

## Acknowledgments

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: Database for storing application data.
- **Joi**: Data validation library.
- **Nodemailer**: Email sending service.
