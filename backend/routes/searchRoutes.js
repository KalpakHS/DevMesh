const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const WorkspaceFile = require('../models/WorkspaceFile');

router.get('/', protect, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(200).json({
        status: 'success',
        data: { projects: [], developers: [], tasks: [], files: [] }
      });
    }

    const regex = new RegExp(q, 'i');

    const [projects, developers, tasks, files] = await Promise.all([
      Project.find({ $or: [{ title: regex }, { description: regex }] }).limit(5),
      User.find({ $or: [{ name: regex }, { skills: regex }] }).limit(5),
      Task.find({ $or: [{ title: regex }, { description: regex }] }).limit(5),
      WorkspaceFile.find({ name: regex }).limit(5),
    ]);

    res.status(200).json({
      status: 'success',
      data: { projects, developers, tasks, files }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
