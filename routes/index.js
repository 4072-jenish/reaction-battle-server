const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Reaction Battle Server Running 🚀",
  });
});

module.exports = router;