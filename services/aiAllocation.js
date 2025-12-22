const axios = require("axios");

const AI_ALLOCATION_URL = "http://147.93.27.17:8000/categorisation_and_allocation";

const sendToAIAllocationModel = async (payload) => {
  const response = await axios.post(AI_ALLOCATION_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000
  });

  return response.data;
};

module.exports = { sendToAIAllocationModel };
