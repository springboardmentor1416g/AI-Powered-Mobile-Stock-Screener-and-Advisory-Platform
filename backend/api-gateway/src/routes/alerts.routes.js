const express = require("express");
const router = express.Router();
const Alert = require("../models/AlertSubscription");

router.get("/", async (req, res) => {
  res.json(await Alert.find({ user_id: req.user.id }));
});

router.post("/", async (req, res) => {
  res.json(await Alert.create({ ...req.body, user_id: req.user.id }));
});

router.patch("/:id", async (req, res) => {
  res.json(await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete("/:id", async (req, res) => {
  await Alert.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
