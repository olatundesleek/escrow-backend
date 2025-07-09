const generateCounterpartyEscrowEmail = (
  creatorFirstName,
  counterpartyFirstName,
  escrowId,
  amount,
  createdAt,
  creatorRole,
  description,
  terms
) => {
  const link = `${process.env.WEBLINK}dashboard/escrows/${escrowId}`;
  const userRoleDescription = creatorRole === "buyer" ? "seller" : "buyer";
  const counterpartyRoleDescription =
    creatorRole === "buyer" ? "buyer" : "seller";
  const formattedTerms = terms
    .map(
      (term, index) => `
<li>${index + 1}. ${term}</li>
`
    )
    .join("");
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
        color:rgb(0, 0, 0);
        font-size: 24px;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.15;
      }
      strong {
        color: #333;
      }
      ul {
        padding-left: 20px;
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
        margin-top: 5px;
      }
      .cta-button {
        display: inline-block;
        background-color: #007bff;
        color: #ffffff !important;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 20px;
        cursor: pointer;
      }
      .cta-button:hover {
        background-color: #0056b3;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        text-align: center;
        color: #777;
      }
    </style>
  </head>
  <body>
    <h1>Escrow Transaction Received - Confirmation Needed</h1>
    <p>Dear ${counterpartyFirstName},</p>

    <p>
      <strong>${creatorFirstName}</strong> has initiated an escrow transaction and
      listed you as the ${userRoleDescription}.
    </p>

    <div class="details-list">
      <p>
        <strong>Escrow Process:</strong> Funds are securely held in escrow until
        both parties fulfill their obligations. Once confirmed, the funds will
        be released accordingly.
      </p>
    </div>

    <div class="details-list">
      <p><strong>Trade Overview:</strong></p>
      <p>${description}</p>
    </div>

    <div class="details-list">
      <p><strong>Trade Details:</strong></p>
      <ul>
        <li><strong>Trade ID:</strong> ${escrowId}</li>
        <li><strong>Amount:</strong> ₦${amount}</li>
        <li>
          <strong>Created At:</strong> ${new Date(createdAt).toLocaleString()}
        </li>
      </ul>
    </div>

    <div class="details-list">
      <p><strong>Terms of the Transaction:</strong></p>
      <ul>
        ${formattedTerms}
      </ul>
    </div>
 <p>
      To continue with this transaction, please confirm your participation by
      clicking the button below:
</p>
<a target="_blank" href="http://${link}" class="cta-button">View Trade</a>
 <p>
      If you have any questions or concerns, don’t hesitate to contact our
      support team.
    </p>

    <div class="footer">
      <p>Best regards,</p>
      <p>The Escrow Team</p>
    </div>
  </body>
</html>
`;
};
module.exports = generateCounterpartyEscrowEmail;
