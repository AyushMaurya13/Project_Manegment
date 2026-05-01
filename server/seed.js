const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ethira.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@ethira.com',
      password: 'member123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@ethira.com',
      password: 'member123',
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'Ethira Dashboard Redesign',
      description: 'Redesign the main dashboard with new analytics widgets and improved UX.',
      owner: admin._id,
      members: [member1._id, member2._id],
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      color: '#6366f1',
    });

    const project2 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile app for project management on the go.',
      owner: admin._id,
      members: [member1._id],
      status: 'active',
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      color: '#0ea5e9',
    });

    const project3 = await Project.create({
      title: 'API Documentation',
      description: 'Create comprehensive API docs using Swagger/OpenAPI specification.',
      owner: admin._id,
      members: [member2._id],
      status: 'on-hold',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      color: '#8b5cf6',
    });

    console.log('Created projects');

    // Create tasks
    const tasks = [
      { title: 'Design new stat cards', description: 'Create wireframes for the stat cards with charts', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'done', priority: 'high', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { title: 'Implement dark mode toggle', description: 'Add theme switching with localStorage persistence', project: project1._id, assignedTo: member2._id, createdBy: admin._id, status: 'in-progress', priority: 'medium', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { title: 'Create notification system', description: 'Real-time notifications for task updates', project: project1._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'high', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { title: 'Setup React Native project', description: 'Initialize the RN project with navigation', project: project2._id, assignedTo: member1._id, createdBy: admin._id, status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Design login screen', description: 'Mobile-first login UI with biometric auth', project: project2._id, assignedTo: member1._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      { title: 'Write auth endpoints docs', description: 'Document login, register, and token refresh', project: project3._id, assignedTo: member2._id, createdBy: admin._id, status: 'todo', priority: 'low', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { title: 'Add Swagger UI integration', description: 'Integrate swagger-ui-express for interactive docs', project: project3._id, assignedTo: member2._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks');

    console.log('\n✅ Seed complete!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin:  admin@ethira.com / admin123');
    console.log('   Member: alice@ethira.com / member123');
    console.log('   Member: bob@ethira.com   / member123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
