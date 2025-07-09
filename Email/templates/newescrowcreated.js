const generateCreateEscrowEmail = (
  creatorFirstName,
  escrowId,
  amount,
  createdAt,
  creatorRole,
  description
) => {
  const userRoleDescription = creatorRole === "buyer" ? "buyer" : "seller";
  const counterpartyRoleDescription =
    creatorRole === "buyer" ? "the seller" : "the buyer";

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          h1 {
            color: #9af039;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
          }
          strong {
            color: #333;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            font-size: 16px;
            margin: 5px 0;
          }
          .details-list {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            text-align: center;
            color: #777;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <h1>New Trade Created</h1>
        <p>Dear ${creatorFirstName},</p>
        <p>We are pleased to inform you that a new Trade has been successfully created for your transaction.</p>
        
        <div class="details-list">
          <p><strong>Your Role:</strong> As the ${userRoleDescription}, you are responsible for fulfilling the terms of the agreement on your side of the transaction.</p>
          <p><strong>Counterparty Role:</strong> The other party in this transaction is ${counterpartyRoleDescription}.</p>
          <p><strong>Trade Process:</strong> Funds are securely held until both parties confirm the terms have been fulfilled. Once confirmed, funds will be released appropriately.</p>
        </div>

        <div class="details-list">
          <p><strong>What this Trade is about:</strong></p>
          <p>${description}</p>
        </div>

        <div class="details-list">
          <p><strong>Trade Details:</strong></p>
          <ul>
            <li><strong>Trade ID:</strong> ${escrowId}</li>
            <li><strong>Amount:</strong> ₦${amount}</li>
            <li><strong>Created At:</strong> ${new Date(
              createdAt
            ).toLocaleString()}</li>
          </ul>
        </div>

        <p>If you have any questions or need further assistance, please feel free to contact us.</p>
        <p>Thank you for using our service!</p>

        <div class="footer">
          <p>Best regards,</p>
          <p>The Escrow Team</p>
        </div>
      </body>
    </html>
  `;
};

module.exports = generateCreateEscrowEmail;
