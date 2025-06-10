const axios = require("axios");

const sendToAIModel = async ({ ticker, user_id }) => {
  const payload = {
    ticker,
    user_id,
    days_back: 60,
    include_extended_features: true,
    custom_parameters: {
      additionalProp1: {}
    }
  };

  const response = await axios.post("http://192.168.1.30:8001/train", payload);
  return response.data;
};

module.exports = { sendToAIModel };
