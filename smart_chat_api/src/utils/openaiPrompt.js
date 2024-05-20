function getPrompt(conversation) {
  const prompt = `Generate a purchase order from the conversation, analyze the details in the conversation and fill up the
values in our standard json format as follows: {
  "order_id": string
  "buyer": {
    "name": string,
    "phone": string
  },
  "seller": {
    "name": string,
    "phone": string
  },
  "items": [
    {
      "name": string,
      "quantity": number,
      "price_per_unit": number,
      "total_price": number, 
    }
  ],
  "total_amount": number,
  "discount_percentage": number,
  "amount_after_discount": number,
  "order_date": date,
}
. Make sure to gather all the details from the conversation as required in JSON ,
 if any values is missing from the conversation leave it empty don't fill any values by your own . 
 Try to fill the JSON by analyzing the chat. The actual conversation is -${conversation}.`;
  return prompt;
}

module.exports = getPrompt;
