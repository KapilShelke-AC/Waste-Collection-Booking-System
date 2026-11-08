const Message = require("../models/messageModel");

exports.save = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await Message.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Message sent. We will get back to you soon.",
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await Message.list(req.query.search);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const n = await Message.remove(req.params.id);
    if (!n)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
