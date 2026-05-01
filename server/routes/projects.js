const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (admin sees all, member sees assigned)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort('-createdAt');
    } else {
      projects = await Project.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort('-createdAt');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Members can only view projects they belong to
    if (
      req.user.role === 'member' &&
      !project.owner.equals(req.user._id) &&
      !project.members.some((m) => m._id.equals(req.user._id))
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const project = await Project.create({
        ...req.body,
        owner: req.user._id,
      });

      const populated = await Project.findById(project._id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

      res.status(201).json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project and its tasks
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and its tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Admin only
router.post(
  '/:id/members',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { userId } = req.body;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: 'User is already a member of this project' });
      }

      project.members.push(userId);
      await project.save();

      const populated = await Project.findById(project._id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

      res.json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Admin only
router.delete(
  '/:id/members/:userId',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      project.members = project.members.filter(
        (m) => m.toString() !== req.params.userId
      );
      await project.save();

      const populated = await Project.findById(project._id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

      res.json(populated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
