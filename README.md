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
      "error": "Error creating escrow",
      "message": "Internal server error"
    }
    ```

---

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
  - Error (404):
    ```json
    {
      "message": "No escrows found for this user"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error retrieving escrows",
      "error": "Internal server error"
    }
    ```

---

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
      "error": "Internal server error"
    }
    ```

---

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
  - Error (400):
    ```json
    {
      "message": "Validation error",
      "details": ["Error details here"]
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
      "message": "Error updating escrow",
      "error": "Internal server error"
    }
    ```

---

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
      "message": "Error accepting escrow",
      "error": "Internal server error"
    }
    ```

---

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
      "success": false,
      "message": "Error rejecting escrow",
      "error": "Internal server error"
    }
    ```

---

#### Complete Trade

- **Endpoint**: `POST /api/escrow/complete`
- **Description**: Mark an escrow trade as complete. Requires authentication (both parties or authorized user per business rules).
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "escrowId": "64e1a7c2f1b2a2b3c4d5e6f7",
    "confirmationNotes": "Buyer confirmed delivery and released funds",
    "evidence": ["https://example.com/proof1.jpg"] // optional
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Trade completed successfully",
      "escrow": {
        "_id": "64e1a7c2f1b2a2b3c4d5e6f7",
        "status": "completed",
        "completedAt": "2025-10-13T12:34:56.789Z",
        "amount": 5000,
        "creator": { "username": "seller" },
        "counterparty": { "username": "buyer" }
        // ...other escrow fields...
      }
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "Validation error",
      "details": ["\"escrowId\" is required"]
    }
    ```
  - Error (401):
    ```json
    {
      "success": false,
      "message": "Unauthorized"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error completing trade",
      "error": "Internal server error"
    }
    ```

---

### Dispute

#### Create a Dispute

- **Endpoint**: `POST /api/dispute-create`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "escrowId": "12345",
    "reason": "The terms of the agreement were not fulfilled",
    "files": "https://example.com/evidence.jpg"
  }
  ```
- **Response**:
  - Success (201):
    ```json
    {
      "success": true,
      "message": "Dispute created successfully",
      "dispute": {
        "_id": "disputeId",
        "escrowId": "12345",
        "reason": "The terms of the agreement were not fulfilled",
        "files": "https://example.com/evidence.jpg",
        "status": "Pending"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "success": false,
      "message": "\"escrowId\" is required"
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "error": "Error creating dispute",
      "message": "Internal server error"
    }
    ```

---

#### Close a Dispute

- **Endpoint**: `POST /api/dispute-close`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "disputeId": "dispute123"
  }
  ```
- **Response**:
  - Not implemented yet:
    ```json
    {
      "success": false,
      "message": "Not implemented yet"
    }
    ```

---

#### Get All Disputes for a User

- **Endpoint**: `GET /api/disputes`
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Not implemented yet:
    ```json
    {
      "success": false,
      "message": "Not implemented yet"
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

#### Add Bank Details

- **Endpoint**: `POST /api/wallet/add-bank`
- **Description**: Add bank details to the authenticated user's wallet.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "bankCode": "058",
    "accountNumber": "1234567890"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "statusCode": 200,
      "success": true,
      "message": "Bank details added successfully",
      "bankDetails": {
        "bankCode": "058",
        "accountNumber": "1234567890",
        "bankName": "GTBank"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "statusCode": 400,
      "success": false,
      "message": "Account number must be exactly 10 digits"
    }
    ```
  - Error (500):
    ```json
    {
      "statusCode": 500,
      "success": false,
      "error": "An error occurred",
      "message": "Internal server error"
    }
    ```

---

#### Resolve Bank Details

- **Endpoint**: `POST /api/wallet/resolve-bank`
- **Description**: Resolve and verify bank account details.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "bankCode": "058",
    "accountNumber": "1234567890"
  }
  ```
- **Response**:
  - Success (200):
    ```json
    {
      "statusCode": 200,
      "success": true,
      "message": "Bank account resolved successfully",
      "accountInfo": {
        "accountName": "John Doe",
        "bankCode": "058",
        "accountNumber": "1234567890"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "statusCode": 400,
      "success": false,
      "message": "Account number must be exactly 10 digits"
    }
    ```
  - Error (500):
    ```json
    {
      "statusCode": 500,
      "success": false,
      "message": "Internal server error"
    }
    ```

---

### Profile

#### Get Profile Details

- **Endpoint**: `GET /api/profile`
- **Description**: Retrieve the authenticated user's profile details.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "Profile details fetched successfully",
      "user": {
        "_id": "userId",
        "firstname": "John",
        "lastname": "Doe",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "profilePicture": "https://cloudinary.com/image.jpg",
        "phone": "+1234567890",
        "streetAddress": "123 Main St",
        "city": "Lagos",
        "state": "Lagos",
        "zip": "100001",
        "country": "Nigeria",
        "postalCode": "100001"
      }
    }
    ```
  - Error (500):
    ```json
    {
      "success": false,
      "message": "Error fetching profile details",
      "error": "Internal server error"
    }
    ```

---

#### Update Profile

- **Endpoint**: `PUT /api/profile`
- **Description**: Update the authenticated user's profile details. Supports profile picture upload.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Request Body** (as JSON or multipart/form-data for profilePicture):
  ```json
  {
    "profilePicture": "https://cloudinary.com/image.jpg",
    "phone": "+1234567890",
    "streetAddress": "123 Main St",
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
        "_id": "userId",
        "firstname": "John",
        "lastname": "Doe",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "profilePicture": "https://cloudinary.com/image.jpg",
        "phone": "+1234567890",
        "streetAddress": "123 Main St",
        "city": "Lagos",
        "state": "Lagos",
        "zip": "100001",
        "country": "Nigeria",
        "postalCode": "100001"
      }
    }
    ```
  - Error (400):
    ```json
    {
      "message": "Validation error"
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
      "message": "Error updating profile",
      "error": "Internal server error"
    }
    ```

---

#### Check Authentication

- **Endpoint**: `GET /api/me`
- **Description**: Confirm if a user is authenticated.
- **Headers**:  
  `Authorization: Bearer <token>`
- **Response**:
  - Success (200):
    ```json
    {
      "success": true,
      "message": "User is authenticated",
      "authenticated": true
    }
    ```
  - Error (500):
    ```json
    {
      "message": "Error checking authentication",
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
