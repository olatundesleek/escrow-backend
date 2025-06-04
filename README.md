# Escrow App

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Site Settings](#site-settings)
  - [Authentication](#authentication)
  - [Escrow](#escrow)
  - [Payment](#payment)
  - [Dispute](#dispute)
  - [User Dashboard](#user-dashboard)
  - [Admin](#admin)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

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
escrow-backend
├── controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── disputeController.js
│   ├── escrowController.js
│   ├── paymentController.js
│   ├── profileController.js
│   └── siteController.js
├── routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── disputeRoutes.js
│   ├── escrowRoutes.js
│   ├── paymentRoutes.js
│   ├── profileRoutes.js
│   └── siteRoutes.js
├── models
│   ├── Dispute.js
│   ├── Escrow.js
│   ├── SiteSettings.js
│   ├── Transaction.js
│   ├── User.js
│   └── Wallet.js
├── middleware
│   └── authMiddleware.js
├── services
│   ├── adminServices.js
│   ├── escrowServices.js
│   ├── paymentGateway.js
│   ├── profileServices.js
│   └── userServices.js
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

---

## API Endpoints

### Site Settings

#### Get Site Settings

- **Endpoint**: `GET /api/site/info`
- **Description**: Fetch the current site settings.
- **Response**:
  - Success (200):
    ```json
    {
      "siteName": "Escrow App",
      "siteLogo": "https://example.com/logo.png",
      "siteDescription": "A secure escrow service platform.",
      "siteUrl": "https://example.com",
      "siteEmail": "support@example.com",
      "sitePhone": "+1234567890",
      "siteAddress": "123 Main Street, City, Country",
      "socialMediaLinks": {
        "facebook": "https://facebook.com/example",
        "twitter": "https://twitter.com/example",
        "instagram": "https://instagram.com/example"
      },
      "siteColors": {
        "primary": "#123456",
        "secondary": "#654321",
        "background": "#ffffff",
        "text_color": "#000000"
      },
      "maintenanceMode": {
        "enabled": false,
        "message": "The site is under maintenance. Please check back later."
      }
    }
    ```
  - Error (404):
    ```json
    {
      "message": "Site settings not found"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Error fetching site settings",
      "error": "Internal server error"
    }
    ```

#### Update Site Settings

- **Endpoint**: `PUT /api/site/settings`
- **Description**: Update the site settings.
- **Request Body**:
  ```json
  {
    "siteName": "New Escrow App",
    "siteLogo": "https://example.com/new-logo.png",
    "siteDescription": "An updated secure escrow service platform.",
    "siteUrl": "https://newexample.com",
    "siteEmail": "new-support@example.com",
    "sitePhone": "+9876543210",
    "siteAddress": "456 Another Street, City, Country",
    "socialMediaLinks": {
      "facebook": "https://facebook.com/newexample",
      "twitter": "https://twitter.com/newexample"
    },
    "siteColors": {
      "primary": "#abcdef",
      "secondary": "#fedcba",
      "background": "#f0f0f0",
      "text_color": "#333333"
    },
    "maintenanceMode": {
      "enabled": true,
      "message": "We are currently performing maintenance. Please check back soon."
    }
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Site settings updated successfully",
      "updatedSettings": {
        "siteName": "New Escrow App",
        "siteLogo": "https://example.com/new-logo.png",
        "siteDescription": "An updated secure escrow service platform.",
        "siteUrl": "https://newexample.com",
        "siteEmail": "new-support@example.com",
        "sitePhone": "+9876543210",
        "siteAddress": "456 Another Street, City, Country",
        "socialMediaLinks": {
          "facebook": "https://facebook.com/newexample",
          "twitter": "https://twitter.com/newexample"
        },
        "siteColors": {
          "primary": "#abcdef",
          "secondary": "#fedcba",
          "background": "#f0f0f0",
          "text_color": "#333333"
        },
        "maintenanceMode": {
          "enabled": true,
          "message": "We are currently performing maintenance. Please check back soon."
        }
      }
    }
    ```
  - Error (400):
    ```json
    {
      "message": "Validation error: [specific validation error message]"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Error updating site settings",
      "error": "Internal server error"
    }
    ```

#### Enable Maintenance Mode

- **Endpoint**: `PUT /api/site/maintenance`
- **Description**: Enable or disable maintenance mode for the site.
- **Request Body**:
  ```json
  {
    "enabled": true,
    "message": "The site is under maintenance. Please check back later."
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Maintenance mode updated successfully",
      "updatedSettings": {
        "maintenanceMode": {
          "enabled": true,
          "message": "The site is under maintenance. Please check back later."
        }
      }
    }
    ```
  - Error (404):
    ```json
    {
      "message": "Site settings not found"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Error updating maintenance mode",
      "error": "Internal server error"
    }
    ```

---

### Authentication

#### Register a New User

- **Endpoint**: `POST /api/auth/register`
- **Description**: Register a new user.
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
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (409):
    ```json
    {
      "success": false,
      "message": "Email or username already in use"
    }
    ```

---

#### Login a User

- **Endpoint**: `POST /api/auth/login`
- **Description**: Log in an existing user.
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "password123",
    "rememberme": true
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
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (404):
    ```json
    {
      "success": false,
      "message": "Invalid credentials"
    }
    ```
  - Error (403):
    ```json
    {
      "success": false,
      "message": "Account is not active. Please verify your email."
    }
    ```

---

#### Logout a User

- **Endpoint**: `POST /api/auth/logout`
- **Description**: Log out the currently authenticated user.
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```

---

#### Verify Email

- **Endpoint**: `GET /api/auth/verify-email/:token`
- **Description**: Verify a user's email using a token.
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Email verified successfully"
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Invalid or expired verification token"
    }
    ```
  - Error (404):
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```

---

#### Resend Verification Email

- **Endpoint**: `POST /api/auth/send-verification-email`
- **Description**: Resend the email verification link to a user.
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Verification email resent successfully"
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (404):
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Account is already verified"
    }
    ```

---

#### Reset Password

- **Endpoint**: `POST /api/auth/forgot-password`
- **Description**: Request a password reset email.
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "If an account with johndoe@example.com exists, you will receive a password reset email."
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Failed to process password reset request"
    }
    ```

    ---

#### Reset Password

- **Endpoint**: `POST /api/auth/reset-password`
- **Description**: change the existing forgotten password.
- **Request Body**:
  ```json
  {
    "token": "egi8739743hjehshdsd7987434",
    "password":"password",
    "confirmPassword":"password"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
     
      "message": "Password reset successfully"
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "could not reset password"
    }
    ```

---

#### verify a logged in user

- **Endpoint**: `GET /api/me`
- **Description**: Confirm if a user is authenticated.
- **Response**:
  - Success (200):
    ```json
    {
      "message": "User is authenticated",
      "authenticated": true
    }
    ```
  - Error (400):
    ```json
    {
      "message": "No token provided",
      "authenticated": false
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Failed to validate token"
    }
    ```

---

#### Confirm Reset Token

- **Endpoint**: `GET /api/auth/confirm-reset-token/:token`
- **Description**: Confirm the validity of a password reset token.
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Token is valid"
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Invalid or expired token"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Failed to validate token"
    }
    ```

---

### Escrow

#### Create a New Escrow

- **Endpoint**: `POST /api/escrow`
- **Description**: Create a new escrow transaction.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "creatorRole": "buyer",
    "counterpartyEmail": "seller@example.com",
    "amount": 5000,
    "category": "services",
    "escrowfeepayment": "creator",
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
        "_id": "12345",
        "creatorRole": "buyer",
        "counterpartyEmail": "seller@example.com",
        "amount": 5000,
        "category": "services",
        "escrowfeepayment": "creator",
        "description": "Payment for services",
        "terms": ["Deliver project files", "Provide support for 30 days"],
        "status": "pending"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "message": "Validation error",
      "details": ["Error details here"]
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Failed to create escrow: [error message]"
    }
    ```

---

#### Get All Escrows for User

- **Endpoint**: `GET /api/escrow`
- **Description**: Retrieve all escrows associated with the authenticated user.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "escrows": [
        {
          "_id": "12345",
          "creatorRole": "buyer",
          "amount": 5000,
          "status": "pending"
        }
        // ...more escrows
      ]
    }
    ```
  - Error (404):
    ```json
    {
      "message": "User not found"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Failed to retrieve all escrows: [error message]"
    }
    ```

---

#### Accept an Escrow

- **Endpoint**: `POST /api/acceptescrow`
- **Description**: Accept an escrow invitation as the counterparty.
- **Headers**:  
  `Authorization: Bearer <token>`
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
        "_id": "12345",
        "status": "active"
        // ...other escrow fields
      }
    }
    ```
  - Error (400):
    ```json
    {
      "message": "Validation error or Unauthorized: Your email does not match the counterparty email"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Failed to accept escrow: [error message]"
    }
    ```

---

#### Get Escrow Details

- **Endpoint**: `GET /api/escrow/:id`
- **Description**: Retrieve details of a specific escrow by its ID.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "escrow": {
        "_id": "12345",
        "creatorRole": "buyer",
        "counterpartyEmail": "seller@example.com",
        "amount": 5000,
        "category": "services",
        "escrowfeepayment": "creator",
        "description": "Payment for services",
        "terms": ["Deliver project files", "Provide support for 30 days"],
        "status": "active"
        // ...other escrow fields
      }
    }
    ```
  - Error (404):
    ```json
    {
      "message": "Escrow not found"
    }
    ```
  - Error (403):
    ```json
    {
      "message": "Unauthorized: You do not have permission to access this escrow"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Failed to retrieve escrow: [error message]"
    }
    ```

---

#### Update an Escrow

- **Endpoint**: `PUT /api/escrow/:id`
- **Description**: Update an existing escrow transaction.
- **Headers**:  
  `Authorization: Bearer <token>`
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
        "_id": "12345",
        "amount": 6000,
        "status": "completed"
        // ...other escrow fields
      }
    }
    ```
  - Error (404):
    ```json
    {
      "message": "Escrow not found"
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Failed to update escrow: [error message]"
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

---

### User Dashboard

#### Get User Dashboard

- **Endpoint**: `GET /api/dashboard`
- **Description**: Retrieve dashboard data for the authenticated user, including escrows, transactions, disputes, and wallet info.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "data": {
        "_id": "userId",
        "firstname": "John",
        "lastname": "Doe",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "escrows": [
          /* array of escrow objects */
        ],
        "transactions": [
          /* array of transaction objects */
        ],
        "disputes": [
          /* array of dispute objects */
        ],
        "wallet": {
          /* wallet object */
        }
      }
    }
    ```
  - Error (404):
    ```json
    {
      "success": false,
      "message": "User not found"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Failed to fetch user data"
    }
    ```

---

### Admin

#### Get Admin Dashboard

- **Endpoint**: `GET /api/admin/dashboard`
- **Description**: Retrieve admin dashboard statistics. Requires admin authentication and appropriate admin role.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Dashboard details fetched successfully",
      "dashboardDetails": {
        "success": true,
        "message": "Dashboard data fetched successfully",
        "data": {
          "totalUsers": 100,
          "totalDisputes": 5,
          "totalEscrows": 50,
          "escrowStatus": {
            "pending": 10,
            "active": 20,
            "completed": 15,
            "disputed": 5
          },
          "totalTransactions": 200,
          "wallet": {
            "totalAvailable": 10000,
            "totalLocked": 2000,
            "total": 12000
          }
        }
      }
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Error fetching dashboard details",
      "error": "Error message"
    }
    ```

---

#### Get All Escrows (Admin)

- **Endpoint**: `GET /api/admin/escrows`
- **Description**: Retrieve all escrows with optional filters. Requires admin authentication and appropriate admin role.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status` (optional): Filter by escrow status (`pending`, `active`, `completed`, `disputed`)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Escrow details fetched successfully",
      "escrowDetails": {
        "data": {
          "escrows": [
            {
              "_id": "escrowId",
              "creator": { /* user object */ },
              "counterparty": { /* user object */ },
              "amount": 5000,
              "status": "active"
              // ...other escrow fields
            }
            // ...more escrows
          ],
          "totalPages": 5,
          "currentPage": 1
        }
      }
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error fetching escrow details",
      "error": "Error message"
    }
    ```

---

#### Get All Transactions (Admin)

- **Endpoint**: `GET /api/admin/transactions`
- **Description**: Retrieve all transactions with pagination. Requires admin authentication and appropriate admin role.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Transaction details fetched successfully",
      "transactionDetails": {
        // ...transaction data
      }
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error fetching transaction details",
      "error": "Error message"
    }
    ```

---

#### Get All Users (Admin)

- **Endpoint**: `GET /api/admin/users`
- **Description**: Retrieve all users with pagination. Requires admin authentication and appropriate admin role.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User details fetched successfully",
      "userDetails": {
        // ...user data
      }
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error fetching user details",
      "error": "Error message"
    }
    ```

---

#### Get Single User (Admin)

- **Endpoint**: `GET /api/admin/user/:username`
- **Description**: Retrieve details for a single user by username. Requires admin authentication and appropriate admin role.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User details fetched successfully",
      "userDetails": {
        // ...user data
      }
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error fetching user details",
      "error": "Error message"
    }
    ```

---

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
