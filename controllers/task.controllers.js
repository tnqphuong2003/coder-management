const { sendResponse, AppError } = require("../helpers/utils.js");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const taskController = {};

taskController.createTask = async (req, res, next) => {
  const { name, description, status } = req.body;

  const statusEnum = ["pending", "working", "review", "done", "archive"];

  try {
    if (!name) {
      throw new AppError(401, "Missing body info", "Create Task Error");
    }

    if (status && !statusEnum.includes(status)) {
      throw new AppError(401, "Status is invalid", "Create Task Error");
    }

    const taskFound = await Task.findOne({ name: name });
    if (taskFound) {
      throw new AppError(401, "Task already exists", "Create Task Error");
    }

    const info = {
      name: name,
      description: description,
      status: status,
    };
    if (!info) throw new AppError(402, "Bad Request", "Create Task Error");

    const created = await Task.create(info);
    sendResponse(
      res,
      200,
      true,
      { data: created },
      null,
      "Create Task Success"
    );
  } catch (err) {
    next(err);
  }
};

taskController.getTaskById = async (req, res, next) => {
  let targetId = req.params.id;
  console.log(targetId);
  try {
    if (!targetId) {
      throw new AppError(401, "Id is not null", "Get Task Error");
    }

    if (!mongoose.isValidObjectId(targetId)) {
      throw new AppError(401, "Id type is invalid", "Get Task Error");
    }

    //mongoose query
    const task = await Task.findById(targetId);
    console.log(task);

    sendResponse(res, 200, true, { data: task }, null, "Found task success");
  } catch (err) {
    next(err);
  }
};

taskController.getTasks = async (req, res, next) => {
  const filter = {};
  const allowedFilter = [
    "name",
    "status",
    "createdAt",
    "updatedAt",
    "page",
    "limit",
  ];

  try {
    let { page, limit, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filterKeys = Object.keys(filterQuery);
    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });

    let offset = limit * (page - 1);

    //mongoose query
    const listOfFound = await Task.find(filter);

    let result = [];

    if (filterKeys.length) {
      const options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter((task) => {
              let temp;
              if (condition === "createdAt" || condition === "updatedAt") {
                const taskDate = new Date(task[condition]).toLocaleDateString(
                  [],
                  options
                );
                const filterDate = new Date(
                  filterQuery[condition]
                ).toLocaleDateString([], options);

                temp = taskDate === filterDate;
              } else {
                temp = task[condition] === filterQuery[condition];
              }
              return temp;
            })
          : listOfFound.filter((task) => {
              let temp;

              if (condition === "createdAt" || condition === "updatedAt") {
                const taskDate = new Date(task[condition]).toLocaleDateString(
                  [],
                  options
                );
                const filterDate = new Date(
                  filterQuery[condition]
                ).toLocaleDateString([], options);

                temp = taskDate === filterDate;
              } else {
                temp = task[condition] === filterQuery[condition];
              }
              return temp;
            });
      });
    } else {
      result = listOfFound;
    }
    //then select number of result by offset
    result = result.slice(offset, offset + limit);
    let dataResult = {
      tasks: result,
      total: result.length,
      page: page,
    };

    sendResponse(
      res,
      200,
      true,
      { data: dataResult },
      null,
      "Found list of tasks success"
    );
  } catch (err) {
    next(err);
  }
};

/*
taskController.assignTask = async (req, res, next) => {
  //in real project you will getting info from req
  const targetId = req.params.id;
  const { assignee } = req.body;
  try {
    if (!targetId) {
      throw new AppError(401, "Id is not null", "Assign Task Error");
    }

    if (!mongoose.isValidObjectId(targetId)) {
      throw new AppError(401, "Id type is invalid", "Assign Task Error");
    }

    let found = await Task.findById(targetId);
    if (!found) {
      throw new AppError(401, "Task does not exists", "Assign Task Error");
    }
    console.log(assignee);
    if (assignee) {
      if (!mongoose.isValidObjectId(assignee)) {
        throw new AppError(401, "User id type is invalid", "Assign Task Error");
      }
      const refFound = await User.findById(assignee);
      if (!refFound) {
        throw new AppError(401, "User does not exists", "Assign Task Error");
      }
      found.assignee = assignee;
    } else {
      found.assignee = null;
    }

    //mongoose query
    found = await found.save();
    sendResponse(
      res,
      200,
      true,
      { data: found },
      null,
      assignee ? " Assign task success" : "Unassign task success"
    );
  } catch (err) {
    next(err);
  }
};
*/

taskController.updateTask = async (req, res, next) => {
  //in real project you will getting info from req
  const targetId = req.params.id;
  const updateInfo = req.body;
  const allowUpdate = ["name", "description", "status", "assignee"];
  const statusEnum = ["pending", "working", "review", "done", "archive"];

  try {
    if (!targetId) {
      throw new AppError(401, "Id is not null", "Get Task Error");
    }

    if (!mongoose.isValidObjectId(targetId)) {
      throw new AppError(401, "Id type is invalid", "Get Task Error");
    }

    //mongoose query
    const task = await Task.findById(targetId);
    if (!task) {
      throw new AppError(401, "Task does not exists", "Update Task Error");
    }

    const updateKeys = Object.keys(updateInfo);
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));
    if (notAllow.length) {
      throw new AppError(401, "`Update field not allow", "Update Task Error");
    }

    if (updateInfo.name) {
      const taskFound = await Task.findOne({ name: updateInfo["name"] });
      if (taskFound) {
        throw new AppError(
          401,
          "Task name already exists",
          "Update Task Error"
        );
      }
    }

    if (updateInfo.assignee) {
      if (!mongoose.isValidObjectId(updateInfo["assignee"])) {
        throw new AppError(401, "UserId type is invalid", "Update Task Error");
      }

      const refFound = await User.findById(updateInfo["assignee"]);
      if (!refFound) {
        throw new AppError(401, "User does not exists", "Update Task Error");
      }
    }

    if (updateInfo.status) {
      if (!statusEnum.includes(updateInfo.status)) {
        throw new AppError(401, "Status is invalid", "Update Task Error");
      }

      if (task.status === "done") {
        updateInfo.status = "done";
      }
    }

    const options = { new: true };
    const updated = await Task.findByIdAndUpdate(targetId, updateInfo, options);

    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Update task success"
    );
  } catch (err) {
    next(err);
  }
};

taskController.deleteTask = async (req, res, next) => {
  const targetId = req.params.id;

  try {
    if (!targetId) {
      const exception = new Error(`Id is not null`);
      exception.statusCode = 401;
      throw exception;
    }

    if (!mongoose.isValidObjectId(targetId)) {
      const exception = new Error(`Id type is invalid`);
      exception.statusCode = 401;
      throw exception;
    }

    const options = { new: true };

    const deleted = await Task.findByIdAndUpdate(
      targetId,
      { isDeleted: true },
      options
    );
    sendResponse(
      res,
      200,
      true,
      { data: deleted },
      null,
      "Delete user success"
    );
  } catch (err) {
    next(err);
  }
};

//export
module.exports = taskController;
