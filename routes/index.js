const { sendResponse, AppError } = require("../helpers/utils.js");
var express = require("express");
var router = express.Router();

const userAPI = require("./users.api");
router.use("/users", userAPI);

const taskAPI = require("./tasks.api");
router.use("/tasks", taskAPI);

router.get("/management/:test", async (req, res, next) => {
  const { test } = req.params;
  try {
    //turn on to test error handling
    if (test === "error") {
      throw new AppError(401, "Access denied", "Authentication Error");
    } else {
      sendResponse(
        res,
        200,
        true,
        { data: "management" },
        null,
        "management success"
      );
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
