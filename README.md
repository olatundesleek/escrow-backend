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
  - [Transaction](#transaction)
  - [Wallet](#wallet)
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
│   ├── siteController.js
│   └── walletController.js
├── routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── disputeRoutes.js
│   ├── escrowRoutes.js
│   ├── paymentRoutes.js
│   ├── profileRoutes.js
│   ├── siteRoutes.js
│   ├── transactionRoutes.js
│   └── walletRoutes.js
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
│   ├── userServices.js
│   └── walletServices.js
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
    { "message": "Site settings not found" }
    ```
  - Error (500):
    ```json
    {
      "message": "Error fetching site settings",
      "error": "Internal server error"
    }
    ```

#### Update Site Settings

- **Endpoint**: `PUT /api/settings`
- **Description**: Update the site settings. Requires admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**: (as JSON or multipart/form-data for logo upload)
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
        /* updated settings object */
      }
    }
    ```
  - Error (400):
    ```json
    { "message": "Validation error: [specific validation error message]" }
    ```
  - Error (500):
    ```json
    {
      "message": "Error updating site settings",
      "error": "Internal server error"
    }
    ```

#### Enable Maintenance Mode

- **Endpoint**: `PUT /api/settings/maintenance`
- **Description**: Enable or disable maintenance mode for the site. Requires admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
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
      "maintenanceMode": {
        "enabled": true,
        "message": "The site is under maintenance. Please check back later."
      }
    }
    ```
  - Error (404):
    ```json
    { "message": "Site settings not found" }
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

- **Endpoint**: `POST /api/auth/reset-password`
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

#### Change Password

- **Endpoint**: `POST /api/auth/change-password`
- **Description**: Change the password for the currently authenticated user. Requires authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456",
    "confirmNewPassword": "newpassword456"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Password changed successfully"
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
  - Error (401):
    ```json
    {
      "success": false,
      "message": "Current password is incorrect"
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
      "message": "Failed to change password"
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
    "escrowfeepayment": "buyer",
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
        /* escrow object */
      }
    }
    ```
  - Error (400/500):  
    See error format below.

---

#### Get All Escrows for User

- **Endpoint**: `GET /api/escrow`
- **Description**: Retrieve all escrows associated with the authenticated user.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
  - `status` (optional): Filter by status (e.g., "pending", "active", "completed", "disputed", "all")
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Escrows retrieved successfully",
      "escrows": [
        /* array of escrow objects */
      ]
    }
    ```
  - Error (404/500):  
    See error format below.

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
      "message": "Escrow details retrieved successfully",
      "escrow": {
        /* escrow object */
      }
    }
    ```
  - Error (400/404/500):  
    See error format below.

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
        /* updated escrow object */
      }
    }
    ```
  - Error (400/404/500):  
    See error format below.

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
        /* escrow object */
      }
    }
    ```
  - Error (400/500):  
    See error format below.

---

#### Reject an Escrow

- **Endpoint**: `POST /api/rejectescrow`
- **Description**: Reject an escrow invitation as the counterparty.
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
      "success": true,
      "message": "Escrow Rejected Successfully",
      "escrow": {
        /* escrow object */
      }
    }
    ```
  - Error (400/500):  
    See error format below.

---

**Error Format Example**:

```json
{
  "message": "Validation error",
  "details": ["Error details here"]
}
```

or

```json
{
  "success": false,
  "message": "Error message",
  "error": "Internal server error"
}
```

---

### Payment

#### Initiate a Payment

- **Endpoint**: `POST /api/pay`
- **Description**: Initiate a payment for an escrow.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "escrowId": "64e1a7c2f1b2a2b3c4d5e6f7",
    "method": "wallet"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "paymentDetails": {
        /* payment details */
      }
    }
    ```
  - Error (400/500):
    ```json
    {
      "success": false,
      "message": "Validation error" // or error message
    }
    ```

---

#### Confirm a Payment

- **Endpoint**: `GET /api/confirm-payment/:reference`
- **Description**: Confirm a payment using the payment reference.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "confirmation": { "status": "success" }
    }
    ```
  - Error (500):
    ```json
    { "success": false, "message": "Internal server error" }
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
        /* dashboard data */
      }
    }
    ```
  - Error (400):
    ```json
    { "success": false, "message": "Validation error" }
    ```
  - Error (500):
    ```json
    { "message": "Error fetching dashboard details", "error": "Error message" }
    ```

---

#### Get All Escrows (Admin)

- **Endpoint**: `GET /api/admin/escrows`
- **Description**: Retrieve all escrows with optional filters. Requires admin authentication.
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
        /* escrows and pagination */
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

#### Get Escrow Details (Admin)

- **Endpoint**: `GET /api/admin/escrow/:id`
- **Description**: Retrieve details for a specific escrow by ID. Requires admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Escrow details retrieved successfully",
      "escrow": {
        /* escrow data */
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
      "message": "Error retrieving escrow details",
      "error": "Error message"
    }
    ```

---

#### Get All Transactions (Admin)

- **Endpoint**: `GET /api/admin/transactions`
- **Description**: Retrieve all transactions with pagination. Requires admin authentication.
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
        /* transaction data */
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
- **Description**: Retrieve all users with pagination. Requires admin authentication.
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
        /* user data */
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
- **Description**: Retrieve details for a single user by username. Requires admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User details fetched successfully",
      "userDetails": {
        /* user data */
      }
    }
    ```
  - Error (400):
    ```json
    { "success": false, "message": "Validation error" }
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

#### Perform User Action (Admin)

- **Endpoint**: `POST /api/admin/user-action`
- **Description**: Perform an action (`activate`, `suspend`, `delete`) on a user. Requires admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "action": "activate"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User activated successfully"
    }
    ```
  - Error (400):
    ```json
    { "success": false, "message": "Validation error" }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error performing user action",
      "error": "Error message"
    }
    ```

---

#### Update Payment Settings (Admin)

- **Endpoint**: `PUT /api/admin/escrowpaymentsetting`
- **Description**: Update escrow payment settings (fee, merchant, currency). Requires super admin authentication.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "fee": 100,
    "merchant": "Paystack",
    "currency": "USD"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Payment settings updated successfully",
      "data": {
        /* updated payment settings */
      }
    }
    ```
  - Error (400):
    ```json
    { "success": false, "message": "Validation error" }
    ```
  - Error (403):
    ```json
    {
      "success": false,
      "message": "Only super admins can update payment settings"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error updating payment settings",
      "error": "Error message"
    }
    ```

---

### Transaction

#### Get All Transactions for User

- **Endpoint**: `GET /api/transactions`
- **Description**: Retrieve all transactions for the authenticated user.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 10)
  - `status` (optional): Filter by status (e.g., "pending", "completed", "failed", "all")
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "txnId1",
          "reference": "TXN-123456",
          "amount": 5000,
          "type": "payment",
          "status": "completed",
          "createdAt": "2024-07-16T12:00:00.000Z"
        }
        // ...more transactions
      ]
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Internal server error"
    }
    ```

---

#### Get Transaction by Reference

- **Endpoint**: `GET /api/transaction/:reference`
- **Description**: Retrieve a specific transaction by its reference for the authenticated user.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "transaction": {
        "_id": "txnId1",
        "reference": "TXN-123456",
        "amount": 5000,
        "type": "payment",
        "status": "completed",
        "createdAt": "2024-07-16T12:00:00.000Z"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "message": "Validation error",
      "details": ["Reference is required"]
    }
    ```
  - Error (401):
    ```json
    {
      "message": "Unauthorized"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

---

### Wallet

#### Get Wallet Details

- **Endpoint**: `GET /api/wallet`
- **Description**: Retrieve wallet details for the authenticated user.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "statusCode": 200,
      "success": true,
      "walletDetails": {
        "balance": 10000,
        "currency": "USD",
        "locked": 2000,
        "available": 8000
      },
      "message": "Wallet details fetched successfully"
    }
    ```
  - Error (500):
    ```json
    {
      "statusCode": 500,
      "success": false,
      "error": "Internal server error"
    }
    ```

---

#### Add Funds to Wallet

- **Endpoint**: `PUT /api/wallet/add-funds`
- **Description**: Add funds to the authenticated user's wallet.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "amount": 5000
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "statusCode": 200,
      "success": true,
      "addFundsResponse": {
        "balance": 15000,
        "currency": "USD"
      },
      "message": "Add Funds Process initiated successfully"
    }
    ```
  - Error (400):
    ```json
    {
      "error": "\"amount\" must be a positive number"
    }
    ```
  - Error (500):
    ```json
    {
      "error": "Internal server error"
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
