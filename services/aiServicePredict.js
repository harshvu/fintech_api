const axios = require("axios");

const sendToAIPredictModel = async (data) => {
  const response = await axios.post("http://147.93.27.17:8001/predict", data); // Replace with your host IP
  return response.data;
};

module.exports = { sendToAIPredictModel };
