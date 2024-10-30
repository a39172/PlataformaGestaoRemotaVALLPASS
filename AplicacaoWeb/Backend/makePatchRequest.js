require("dotenv").config();

const axios = require("axios");

const makePatchRequest = (entityId, attribute, payload) => {
  const headers = {
    "Content-Type": "application/json",
    Link: `${process.env.CONTEXT_URL}; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
    "NGSILD-Tenant": `${process.env.NGSILD_Tenant}`,
  };

  return axios
    .patch(
      `http://orion:1026/ngsi-ld/v1/entities/${entityId}/attrs/${attribute}`,
      payload,
      {
        headers,
      }
    )
    .then((response) => {
      console.log("Patch request successful");
    })
    .catch((error) => {
      console.error("Error in patch request:", error);
    });
};

module.exports = { makePatchRequest };
