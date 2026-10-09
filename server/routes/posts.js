const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const populate = (q) =>
  q.populate('author', 'username name avatar').populate('comments.user', 'username avatar');

// Can this user see the author's content?
async function canAccess(viewerId, authorId) {
  const author = await User.findById(authorId);
  if (!author) return false;
  if (!author.isPrivate || author._id.toString() === viewerId) return true;
  return author.followers.some((f) => f.toString() === viewerId);
}

// Feed: my posts + posts from people I follow
router.get('/', auth, async (req, res) => {
  const me = await User.findById(req.userId);
  res.json(
    await populate(
      Post.find({ author: { $in: [...me.following, me._id] } }).sort({ createdAt: -1 }).limit(100)
    )
  );
});

// One user's posts (blocked for private accounts you don't follow)
router.get('/user/:id', auth, async (req, res) => {
  if (!(await canAccess(req.userId, req.params.id)))
    return res.status(403).json({ message: 'This account is private' });
  res.json(await populate(Post.find({ author: req.params.id }).sort({ createdAt: -1 })));
});

// Create post with optional photo / video
router.post('/', auth, upload.single('media'), async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text && !req.file) return res.status(400).json({ message: 'Add some text or a photo/video' });
  const post = await Post.create({
    author: req.userId,
    text,
    media: req.file
      ? {
          url: '/uploads/' + req.file.filename,
          type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
        }
      : undefined,
  });
  res.status(201).json(await populate(Post.findById(post._id)));
});

router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.userId)
    return res.status(403).json({ message: 'Not your post' });
  if (post.media && post.media.url)
    fs.unlink(path.join(__dirname, '..', post.media.url), () => {});
  await post.deleteOne();
  res.json({ deleted: true });
});

router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (!(await canAccess(req.userId, post.author)))
    return res.status(403).json({ message: 'This account is private' });
  const liked = post.likes.some((l) => l.toString() === req.userId);
  if (liked) post.likes.pull(req.userId);
  else post.likes.push(req.userId);
  await post.save();
  res.json(await populate(Post.findById(post._id)));
});

router.post('/:id/comments', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (!(await canAccess(req.userId, post.author)))
    return res.status(403).json({ message: 'This account is private' });
  post.comments.push({ user: req.userId, text });
  await post.save();
  res.status(201).json(await populate(Post.findById(post._id)));
});

module.exports = router;
