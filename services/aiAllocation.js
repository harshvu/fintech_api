// const axios = require("axios");

// const AI_ALLOCATION_URL = "http://147.93.27.17:8000/categorisation_and_allocation";

// const sendToAIAllocationModel = async (payload) => {
//   const response = await axios.post(AI_ALLOCATION_URL, payload, {
//     headers: { "Content-Type": "application/json" },
//     timeout: 60000
//   });

//   return response.data;
// };

// module.exports = { sendToAIAllocationModel };
const axios = require("axios");

const AI_ALLOCATION_URL = "http://147.93.27.17:8000/categorisation_and_allocation";
const AI_BATCH_INIT_URL = "http://147.93.27.17:8003/api/initialize/batch";
const AI_ANALYZE_BATCH_URL = "http://147.93.27.17:8003/api/analyze/batch";

const sendToAIAllocationModel = async (payload) => {
  const res = await axios.post(AI_ALLOCATION_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000
  });
  return res.data;
};

const sendBatchToInitializeAI = async (payload) => {
  const res = await axios.post(AI_BATCH_INIT_URL, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 60000
  });
  return res.data;
};
const callBatchAnalyzeAI = async (userIds = []) => {
  const response = await axios.post(AI_ANALYZE_BATCH_URL, {
    user_ids: userIds
  });

  return response.data;
};
module.exports = {
  sendToAIAllocationModel,
  sendBatchToInitializeAI,
  callBatchAnalyzeAI 
};

