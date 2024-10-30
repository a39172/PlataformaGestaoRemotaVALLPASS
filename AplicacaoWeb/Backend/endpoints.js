const express = require("express");
const router = express.Router();
const { makePatchRequest } = require("./makePatchRequest");

const handleUpdate = (req, res) => {
  const data = req.body.data;
  const command = req.params.command;
  const entity = req.params.entity;

  if (data[0][command.concat("_info")]["@value"] === "OK") {
    const entityId = data[0].id;
    var payload = {};
    var attribute;

    if (entity == "pole") {
      payload = {
        value: command == "on" ? "ON" : "OFF",
        type: "Property",
      };
      attribute = "deviceState";
    } else if (entity == "luminaire") {
      payload = {
        value: command == "on" ? "ON" : "OFF",
        type: "Property",
      };
      attribute = "powerState";
    }

    makePatchRequest(entityId, attribute, payload);
  }
};

router.post("/context-update/:entity/:command", (req, res) => {
  handleUpdate(req, res);
});

router.post("/subscriptions/Pole/:pole", (req, res) => {
  const io = req.app.get("io");
  const data = req.body.data;
  io.in(req.params.pole).emit("update", data[0]);
});

module.exports = router;
