# Escrow App

## Overview
The Escrow App is a web application designed to facilitate secure transactions between parties using an escrow service. It provides functionalities for user authentication, escrow management, payment processing, and dispute resolution.

## Features
- User authentication (registration, login, token verification)
- Escrow transaction management (create, update, retrieve)
- Payment processing (initiate payments, confirm transactions)
- Dispute management (file and resolve disputes)

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
│   └── Dispute.js
├── middleware
│   └── authMiddleware.js
├── utils
│   └── paymentGateway.js
├── app.js
├── server.js
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd escrow-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Access the application at `http://localhost:3000`.

## API Endpoints
- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Login an existing user

- **Escrow**
  - `POST /api/escrow` - Create a new escrow
  - `GET /api/escrow/:id` - Retrieve escrow details

- **Payment**
  - `POST /api/payment` - Initiate a payment
  - `GET /api/payment/status` - Check payment status

- **Dispute**
  - `POST /api/dispute` - File a new dispute
  - `GET /api/dispute/:id` - Retrieve dispute details

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.