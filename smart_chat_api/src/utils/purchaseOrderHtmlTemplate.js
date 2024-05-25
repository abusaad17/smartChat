function generatePurchaseOrderHTML(result) {
  const totalAmount = result.items.reduce(
    (total, item) => total + item.total_price,
    0
  );
  const date = new Date();
  const discountedPrice = totalAmount * (1 - result.discount_percentage / 100);
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purchase Order</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f7f7;">
      <div class="container" style="max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; border-radius: 10px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div class="header" style="margin-bottom: 20px;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 10px; text-align: center;">Purchase Order</h1>
          <h2 style="color: #555; font-size: 20px; margin-bottom: 15px; text-align: center;">Order ID: EC24_001 </h2>
        </div>
        <div class="info" style="margin-bottom: 20px;">
          <h3 style="color: #666; font-size: 18px; margin-bottom: 10px;">Buyer Information:</h3>
          <p style="color: #777; font-size: 16px; margin-bottom: 5px;"><strong>Name:</strong> ${
            result.buyer.name
          }</p>
        </div>
        <div class="info" style="margin-bottom: 20px;">
          <h3 style="color: #666; font-size: 18px; margin-bottom: 10px;">Seller Information:</h3>
          <p style="color: #777; font-size: 16px; margin-bottom: 5px;"><strong>Name:</strong> ${
            result.seller.name
          }</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #ddd;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f5f5f5; font-weight: bold; color: #333;">Item</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f5f5f5; font-weight: bold; color: #333;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f5f5f5; font-weight: bold; color: #333;">Price Per Unit</th>
              <th style="border: 1px solid #ddd; padding: 10px; background-color: #f5f5f5; font-weight: bold; color: #333;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${result.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px; color: #777;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 10px; color: #777;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 10px; color: #777;">${item.price_per_unit}</td>
                <td style="border: 1px solid #ddd; padding: 10px; color: #777;">${item.total_price}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="total" style="margin-top: 20px; text-align: right; border-top: 2px solid #ddd; padding-top: 10px;">
          <p style="color: #777; font-size: 18px; margin: 8px 0;"><strong>Total Amount:</strong> ${totalAmount}</p>
          <p style="color: #777; font-size: 18px; margin: 8px 0;"><strong>Discount Percentage:</strong> ${
            result.discount_percentage
          }%</p>
          <p style="color: #777; font-size: 18px; margin: 8px 0;"><strong>Amount After Discount:</strong> ${discountedPrice}</p>
          <p style="color: #777; font-size: 18px; margin: 8px 0;"><strong>Order Date:</strong> ${date.toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )}</p>
        </div>
      </div>
    </body>
    </html>     
    `;

  return htmlTemplate;
}

module.exports = generatePurchaseOrderHTML;
