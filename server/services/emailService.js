const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (email, order, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Your order #${order._id} is confirmed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #f7f7f7;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              padding: 40px 30px 30px;
              text-align: center;
              background: linear-gradient(135deg, #000000, #333333);
              color: white;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 10px;
              letter-spacing: -0.5px;
            }
            .subheader {
              font-size: 16px;
              opacity: 0.9;
              margin: 0;
            }
            .order-card {
              margin: -20px 30px 0;
              padding: 25px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.05);
              position: relative;
              z-index: 2;
            }
            .order-number {
              font-size: 18px;
              font-weight: 600;
              color: #333;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .order-number span {
              color: #666;
              font-weight: 400;
              font-size: 14px;
            }
            .divider {
              height: 1px;
              background: #f0f0f0;
              margin: 25px 0;
            }
            .product {
              display: flex;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #f5f5f5;
            }
            .product:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .product-image {
              width: 80px;
              height: 80px;
              border-radius: 8px;
              object-fit: cover;
              margin-right: 20px;
              background: #f9f9f9;
            }
            .product-details {
              flex: 1;
            }
            .product-name {
              font-weight: 600;
              margin: 0 0 5px;
              font-size: 16px;
            }
            .product-price {
              color: #666;
              font-size: 14px;
            }
            .product-total {
              font-weight: 600;
              text-align: right;
              min-width: 80px;
            }
            .summary-section {
              margin: 30px 0;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .summary-label {
              color: #666;
            }
            .summary-value {
              font-weight: 500;
            }
            .total-row {
              font-size: 18px;
              font-weight: 700;
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #f0f0f0;
            }
            .shipping-section {
              background: #fafafa;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 15px;
            }
            .shipping-address {
              line-height: 1.7;
            }
            .cta-button {
              display: block;
              text-align: center;
              background: #000000;
              color: white;
              text-decoration: none;
              padding: 16px;
              border-radius: 8px;
              font-weight: 600;
              margin: 30px 0;
              transition: all 0.2s ease;
            }
            .cta-button:hover {
              background: #333333;
            }
            .footer {
              text-align: center;
              padding: 30px;
              color: #999;
              font-size: 14px;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              margin: 0 10px;
              text-decoration: none;
            }
            @media (max-width: 480px) {
              .header {
                padding: 30px 20px;
              }
              .order-card {
                margin: -15px 20px 0;
                padding: 20px;
              }
              h1 {
                font-size: 24px;
              }
              .product {
                flex-direction: column;
              }
              .product-image {
                width: 100%;
                height: auto;
                margin-bottom: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              ${
                process.env.STORE_LOGO_URL
                  ? `<img src="${process.env.STORE_LOGO_URL}" class="logo" alt="${process.env.STORE_NAME}">`
                  : ""
              }
              <h1>Order Confirmed</h1>
              <p class="subheader">Thank you for your purchase!</p>
            </div>
            
            <div class="order-card">
              <div class="order-number">
                Order #${order._id}
                <span>${new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              
              <p>Hi ${
                order.shippingInfo.firstName
              }, we're getting your order ready to be shipped.</p>
              
              <div class="divider"></div>
              
              <h2 class="section-title">Your Items</h2>
              
              ${order.items
                .map(
                  (item) => `
                <div class="product">
                  <img src="${
                    item.productId?.images?.[0]?.url ||
                    "https://via.placeholder.com/80"
                  }" class="product-image" alt="${
                    item.productId?.name || "Product"
                  }">
                  <div class="product-details">
                    <h3 class="product-name">${
                      item.productId?.name || "Unknown Product"
                    }</h3>
                    <p class="product-price">$${item.price.toFixed(2)} × ${
                    item.quantity
                  }</p>
                  </div>
                  <div class="product-total">$${(
                    item.price * item.quantity
                  ).toFixed(2)}</div>
                </div>
              `
                )
                .join("")}
              
              <div class="summary-section">
                <div class="summary-row">
                  <span class="summary-label">Subtotal</span>
                  <span class="summary-value">$${order.subtotal.toFixed(
                    2
                  )}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Shipping</span>
                  <span class="summary-value">$${order.shipping.toFixed(
                    2
                  )}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Tax</span>
                  <span class="summary-value">$${order.tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total-row">
                  <span>Total</span>
                  <span>$${order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="shipping-section">
                <h2 class="section-title">Shipping Information</h2>
                <div class="shipping-address">
                  <p><strong>${order.shippingInfo.firstName} ${
        order.shippingInfo.lastName
      }</strong></p>
                  <p>${order.shippingInfo.address.street}</p>
                  <p>${order.shippingInfo.address.city}, ${
        order.shippingInfo.address.governorate
      }</p>
                  <p>${order.shippingInfo.address.postalCode}</p>
                  <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
                </div>
              </div>
              
              <a href="http://localhost:5173/trackOrder/${
                order._id
              }" class="cta-button">Track Your Order</a>
              
              <p style="text-align: center;">Need help? <a href="mailto:support@${
                process.env.STORE_DOMAIN
              }" style="color: #333; text-decoration: underline;">Contact our support team</a></p>
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${
        process.env.STORE_NAME
      }. All rights reserved.</p>
              <p>${process.env.STORE_ADDRESS || ""}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

module.exports = { sendOrderConfirmationEmail };
