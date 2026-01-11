const Alert = require("../models/Alert");

exports.getAlerts = async (req, res) => {
  res.json(await Alert.find({ userId: req.user.id }));
};

exports.createAlert = async (req, res) => {
  res.json(await Alert.create({ ...req.body, userId: req.user.id }));
};

exports.updateAlert = async (req, res) => {
  res.json(await Alert.findByIdAndUpdate(req.params.id, req.body));
};

exports.deleteAlert = async (req, res) => {
  await Alert.findByIdAndDelete(req.params.id);
  res.json({ message: "Alert deleted" });
};
