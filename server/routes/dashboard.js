const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let taskFilter = {};
    let projectFilter = {};

    if (!isAdmin) {
      taskFilter.assignedTo = req.user._id;
      projectFilter = {
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      };
    }

    // Total counts
    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const todoTasks = await Task.countDocuments({ ...taskFilter, status: 'todo' });
    const inProgressTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'in-progress',
    });
    const doneTasks = await Task.countDocuments({ ...taskFilter, status: 'done' });

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    });

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'title color')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .limit(5);

    // Tasks by priority
    const highPriority = await Task.countDocuments({
      ...taskFilter,
      priority: 'high',
      status: { $ne: 'done' },
    });
    const mediumPriority = await Task.countDocuments({
      ...taskFilter,
      priority: 'medium',
      status: { $ne: 'done' },
    });
    const lowPriority = await Task.countDocuments({
      ...taskFilter,
      priority: 'low',
      status: { $ne: 'done' },
    });

    res.json({
      totalProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      recentTasks,
      priorityBreakdown: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
