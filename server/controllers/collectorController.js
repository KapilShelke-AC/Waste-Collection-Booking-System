const Collector = require('../models/collectorModel');

exports.myTasks = async (req, res) => {
  try {
    const { status } = req.query;
    if (status && !['Assigned', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Assigned or Completed' });
    }
    const tasks = await Collector.tasksFor(req.user.id, status);
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.complete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    // ownership check: only a booking assigned to THIS collector is found
    const task = await Collector.findTask(id, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Task is already completed' });
    }
    if (task.status !== 'Assigned') {
      return res.status(400).json({ success: false, message: 'Only assigned tasks can be completed' });
    }
    await Collector.complete(id);
    res.json({ success: true, message: 'Task marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};