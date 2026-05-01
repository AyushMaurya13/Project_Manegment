const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get tasks (admin: all or filtered, member: assigned only)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { project, status, priority, assignedTo } = req.query;
    let filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members can only see tasks assigned to them
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
// @access  Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('project').notEmpty().withMessage('Project is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify project exists
      const project = await Project.findById(req.body.project);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const task = await Task.create({
        ...req.body,
        createdBy: req.user._id,
      });

      const populated = await Task.findById(task._id)
        .populate('project', 'title color')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update a task (admin: full update, member: status only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role === 'member') {
      if (!task.assignedTo || !task.assignedTo.equals(req.user._id)) {
        return res
          .status(403)
          .json({ message: 'Not authorized to update this task' });
      }
      // Only allow status update for members
      const allowedFields = ['status'];
      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      req.body = updates;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'title color')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
