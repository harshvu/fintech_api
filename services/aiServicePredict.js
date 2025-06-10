const axios = require("axios");

const sendToAIPredictModel = async (data) => {
  const response = await axios.post("http://192.168.1.30:8001/predict", data); // Replace with your host IP
  return response.data;
};

module.exports = { sendToAIPredictModel };
