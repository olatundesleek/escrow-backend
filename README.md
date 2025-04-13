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

- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login an existing user.
- `POST /api/auth/logout` - Logout the current user.
- `GET /api/auth/verify-email/:token` - Verify user email.

### Escrow

- `POST /api/escrow` - Create a new escrow transaction.
- `POST /api/acceptescrow` - Accept an escrow invitation.
- `GET /api/escrow/:id` - Retrieve escrow details by ID.
- `PUT /api/escrow/:id` - Update an existing escrow transaction.

### Payment

- `POST /api/payment/initiate` - Initiate a payment.
- `POST /api/payment/confirm` - Confirm a payment.
- `GET /api/payment/status/:paymentId` - Check payment status.

### Dispute

- `POST /api/dispute/file` - File a new dispute.
- `GET /api/dispute/:id` - Retrieve dispute details by ID.
- `PUT /api/dispute/resolve/:id` - Resolve a dispute.

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
