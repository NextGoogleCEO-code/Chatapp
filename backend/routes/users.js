import express from 'express';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/users?search=query
// Search users by username. Excludes the requesting user from results.
router.get('/', async (req, res) => {
  const { search } = req.query;

  if (!search || search.trim().length < 1) {
    return res.json([]);
  }

  try {
    const users = await User.find({
      username: { $regex: search.trim(), $options: 'i' },
      _id: { $ne: req.user.id }
    })
      .select('_id username')
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});

export default router;
