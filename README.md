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
  - [Profile](#profile)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

The Escrow App is a robust web application designed to facilitate secure transactions between parties using an escrow service. It provides comprehensive features for user authentication, escrow management, payment processing, dispute resolution, wallet management, and admin controls. The platform supports two-factor authentication (2FA) for enhanced security and offers a user dashboard for tracking all activities.

## Features

- **User Authentication**: Registration, login, email verification, password reset, and logout.
- **Escrow Management**: Create, update, retrieve, accept, and reject escrow transactions.
- **Payment Processing**: Initiate payments, confirm transactions, and handle payment status via webhooks.
- **Dispute Management**: File, resolve, and close disputes for escrow transactions.
- **Wallet Management**: View wallet balance and add funds.
- **Transaction Tracking**: View all transactions and details by reference.
- **User Dashboard**: Overview of user activity, escrows, transactions, disputes, and wallet.
- **Admin Controls**: Manage users, escrows, transactions, payment settings, and dashboard analytics.
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
│   ├── walletRoutes.js
│   └── webhookRoutes.js
├── models
│   ├── Dispute.js
│   ├── Escrow.js
│   ├── SiteSettings.js
│   ├── Transaction.js
│   ├── User.js
│   └── Wallet.js
├── middleware
│   ├── authMiddleware.js
│   └── upload.js
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
├── config
│   └── cloudinary.js
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
- **Headers**:  
  `Authorization: Bearer <token>`
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
        /* updated settings object */
      }
    }
    ```
  - Error (400/500):  
    See error format below.

#### Enable Maintenance Mode

- **Endpoint**: `PUT /api/settings/maintenance`
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
  - Error (404/500):  
    See error format below.

---

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
    "phone": "+234647367637",
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
    See error format below.

#### Login a User

- **Endpoint**: `POST /api/auth/login`
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
  - Error (400/404/403):  
    See error format below.

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
    See error format below.

#### Resend Verification Email

- **Endpoint**: `POST /api/auth/send-verification-email`
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
  - Error (400/404):  
    See error format below.

#### Reset Password

- **Endpoint**: `POST /api/auth/reset-password`
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
  - Error (400/500):  
    See error format below.

#### Confirm Reset Token

- **Endpoint**: `GET /api/auth/confirm-reset-token/:token`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Token is valid"
    }
    ```
  - Error (400/500):  
    See error format below.

#### Change Password

- **Endpoint**: `POST /api/auth/change-password`
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
  - Error (400/401/404/500):  
    See error format below.

#### Verify a Logged In User

- **Endpoint**: `GET /api/me`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "message": "User is authenticated",
      "authenticated": true
    }
    ```
  - Error (400/500):  
    See error format below.

---

### Escrow

#### Create a New Escrow

- **Endpoint**: `POST /api/escrow`
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

#### Get All Escrows for User

- **Endpoint**: `GET /api/escrows`
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

#### Get Escrow Details

- **Endpoint**: `GET /api/escrow/:id`
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

#### Update an Escrow

- **Endpoint**: `PUT /api/escrow/:id`
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

#### Accept an Escrow

- **Endpoint**: `POST /api/acceptescrow`
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

#### Reject an Escrow

- **Endpoint**: `POST /api/rejectescrow`
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

### Payment

#### Initiate a Payment

- **Endpoint**: `POST /api/pay`
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
        "reference": "PAY-123456789",
        "amount": 5000,
        "currency": "USD",
        "status": "pending",
        "paymentUrl": "https://paystack.com/pay/abc123"
      }
    }
    ```
  - Error (400/500):  
    See error format below.

#### Confirm a Payment

- **Endpoint**: `GET /api/confirm-payment/:reference`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "confirmation": {
        "status": "success",
        "reference": "PAY-123456789",
        "amount": 5000,
        "currency": "USD"
      }
    }
    ```
  - Error (500):  
    See error format below.

---

### Dispute

#### File a Dispute

- **Endpoint**: `POST /api/dispute/file`
- **Headers**:  
  `Authorization: Bearer <token>`
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
      "success": true,
      "message": "Dispute created successfully",
      "dispute": {
        "id": "dispute123",
        "status": "Pending"
      }
    }
    ```
  - Error (400/500):  
    See error format below.

#### Get Dispute Details

- **Endpoint**: `GET /api/dispute/:id`
- **Headers**:  
  `Authorization: Bearer <token>`
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
    See error format below.

#### Resolve a Dispute

- **Endpoint**: `PUT /api/dispute/resolve/:id`
- **Headers**:  
  `Authorization: Bearer <token>`
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
    See error format below.

---

### User Dashboard & Profile

#### Get User Dashboard

- **Endpoint**: `GET /api/dashboard`
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
  - Error (404/500):  
    See error format below.

#### Get Profile Details

- **Endpoint**: `GET /api/profile`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Profile details fetched successfully",
      "user": {
        /* user profile object */
      }
    }
    ```
  - Error (500):  
    See error format below.

#### Update Profile

- **Endpoint**: `PUT /api/profile`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body** (example):
  ```json
  {
    "profilePicture": "https://cloudinary.com/image.jpg",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "zip": "100001",
    "country": "Nigeria",
    "postalCode": "100001"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Profile updated successfully",
      "data": {
        /* updated user profile object */
      }
    }
    ```
  - Error (400/404/500):  
    See error format below.

---

### Transaction

#### Get All Transactions for User

- **Endpoint**: `GET /api/transactions`
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
    See error format below.

#### Get Transaction by Reference

- **Endpoint**: `GET /api/transaction/:reference`
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
  - Error (400/401/500):  
    See error format below.

---

### Wallet

#### Get Wallet Details

- **Endpoint**: `GET /api/wallet`
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
    See error format below.

#### Add Funds to Wallet

- **Endpoint**: `PUT /api/wallet/add-funds`
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
