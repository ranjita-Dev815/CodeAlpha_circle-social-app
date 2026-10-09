const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const same = (a, b) => a.toString() === b.toString();

async function addFollower(targetId, followerId) {
  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: followerId } });
  await User.findByIdAndUpdate(followerId, { $addToSet: { following: targetId } });
}

// Search users by username
router.get('/search', auth, async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const users = await User.find({ username: new RegExp(escaped, 'i') })
    .select('username name avatar isPrivate')
    .limit(20);
  res.json(users);
});

// Pending follow requests for me
router.get('/me/requests', auth, async (req, res) => {
  const me = await User.findById(req.userId).populate('followRequests', 'username name avatar');
  res.json(me.followRequests);
});

// Edit profile + privacy
router.put('/me', auth, async (req, res) => {
  const { name, bio, isPrivate } = req.body;
  const update = {};
  if (typeof name === 'string') update.name = name.slice(0, 50);
  if (typeof bio === 'string') update.bio = bio.slice(0, 160);
  if (typeof isPrivate === 'boolean') update.isPrivate = isPrivate;
  const user = await User.findByIdAndUpdate(req.userId, update, { new: true });

  // Going public approves all pending requests
  if (update.isPrivate === false && user.followRequests.length) {
    for (const id of user.followRequests) await addFollower(user._id, id);
    user.followRequests = [];
    await user.save();
  }
  res.json({ name: user.name, bio: user.bio, avatar: user.avatar, isPrivate: user.isPrivate });
});

// Profile picture
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith('image/'))
    return res.status(400).json({ message: 'Please choose an image' });
  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatar: '/uploads/' + req.file.filename },
    { new: true }
  );
  res.json({ avatar: user.avatar });
});

// Accept / decline a follow request
router.post('/requests/:id/accept', auth, async (req, res) => {
  const me = await User.findById(req.userId);
  if (!me.followRequests.some((r) => same(r, req.params.id)))
    return res.status(404).json({ message: 'Request not found' });
  me.followRequests.pull(req.params.id);
  await me.save();
  await addFollower(me._id, req.params.id);
  res.json({ ok: true });
});

router.post('/requests/:id/reject', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.userId, { $pull: { followRequests: req.params.id } });
  res.json({ ok: true });
});

// Follow / unfollow / request / cancel request
router.post('/:id/follow', auth, async (req, res) => {
  if (same(req.params.id, req.userId))
    return res.status(400).json({ message: "You can't follow yourself" });
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  if (target.followers.some((f) => same(f, req.userId))) {
    await User.findByIdAndUpdate(target._id, { $pull: { followers: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $pull: { following: target._id } });
    return res.json({ relation: 'none' });
  }
  if (target.followRequests.some((f) => same(f, req.userId))) {
    await User.findByIdAndUpdate(target._id, { $pull: { followRequests: req.userId } });
    return res.json({ relation: 'none' });
  }
  if (target.isPrivate) {
    await User.findByIdAndUpdate(target._id, { $addToSet: { followRequests: req.userId } });
    return res.json({ relation: 'requested' });
  }
  await addFollower(target._id, req.userId);
  res.json({ relation: 'following' });
});

// Public profile by username (keep last: it matches any single segment)
router.get('/:username', auth, async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select('-password -email');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isSelf = same(user._id, req.userId);
  const following = user.followers.some((f) => same(f, req.userId));
  const requested = user.followRequests.some((f) => same(f, req.userId));

  res.json({
    _id: user._id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    avatar: user.avatar,
    isPrivate: user.isPrivate,
    createdAt: user.createdAt,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    relation: isSelf ? 'self' : following ? 'following' : requested ? 'requested' : 'none',
    canView: !user.isPrivate || isSelf || following,
  });
});

module.exports = router;
