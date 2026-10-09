import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { api } from './api.js';
import BottomNav from './components/BottomNav.jsx';
import PostActions from './components/PostActions.jsx';
 
/* ---------- Small shared pieces ---------- */
function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  return user?.avatar ? (
    <img className="av" style={style} src={user.avatar} alt="" />
  ) : (
    <span className="av" style={style}>{(user?.username || '?')[0].toUpperCase()}</span>
  );
}
 
/* ---------- Auth page ---------- */
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
 
  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/' + mode, { method: 'POST', body: form });
      localStorage.setItem('token', data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
  }
 
  return (
    <div className="auth">
      <h1 className="logo big">
        <img src="/logo.svg" alt="" className="logo-img big" />
        circle
      </h1>
      <p className="tagline">Share photos, videos and short posts with people you follow.</p>
      <form onSubmit={submit} className="card auth-form">
        {mode === 'register' && (
          <input placeholder="Username" value={form.username} onChange={set('username')} required minLength={3} />
        )}
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={set('password')} required minLength={6} />
        {error && <p className="error">{error}</p>}
        <button className="btn primary">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}
 
/* ---------- Post card ---------- */
function PostCard({ post, me, onChange, onDelete }) {
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);
  const liked = post.likes.includes(me._id);
 
  const like = async () => onChange(await api(`/posts/${post._id}/like`, { method: 'POST' }));
  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    onChange(await api(`/posts/${post._id}/comments`, { method: 'POST', body: { text: comment } }));
    setComment('');
  }
 
  return (
    <article className="card post">
      <header>
        <Avatar user={post.author} size={36} />
        <div>
          <Link to={`/u/${post.author.username}`} className="author">{post.author.username}</Link>
          <time>{new Date(post.createdAt).toLocaleString()}</time>
        </div>
        {post.author._id === me._id && (
          <button className="link danger" onClick={() => onDelete(post._id)}>Delete</button>
        )}
      </header>
 
      {post.media?.url && post.media.type === 'image' && <img className="media" src={post.media.url} alt="" />}
      {post.media?.url && post.media.type === 'video' && (
        <video className="media" src={post.media.url} controls preload="metadata" />
      )}
      {post.text && <p className="text">{post.text}</p>}
 
      <PostActions
        liked={liked}
        likeCount={post.likes.length}
        commentCount={post.comments.length}
        onLike={like}
        onComment={() => setOpen(!open)}
      />
 
      {open && (
        <div className="comments">
          {post.comments.map((c) => (
            <p key={c._id}>
              <Link to={`/u/${c.user.username}`}><b>{c.user.username}</b></Link> {c.text}
            </p>
          ))}
          <form onSubmit={addComment} className="row">
            <input placeholder="Write a comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} />
            <button className="btn small primary">Send</button>
          </form>
        </div>
      )}
    </article>
  );
}
 
function PostList({ posts, setPosts, me, empty }) {
  const replace = (p) => setPosts(posts.map((x) => (x._id === p._id ? p : x)));
  async function remove(id) {
    await api('/posts/' + id, { method: 'DELETE' });
    setPosts(posts.filter((p) => p._id !== id));
  }
  if (!posts.length) return <p className="empty">{empty}</p>;
  return posts.map((p) => <PostCard key={p._id} post={p} me={me} onChange={replace} onDelete={remove} />);
}
 
/* ---------- Compose box (photo/video upload) ---------- */
function Compose({ onPosted }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
 
  function pick(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }
  const clearFile = () => { setFile(null); setPreview(''); };
 
  async function create(e) {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setError(''); setBusy(true);
    try {
      const fd = new FormData();
      fd.append('text', text);
      if (file) fd.append('media', file);
      const post = await api('/posts', { method: 'POST', body: fd });
      setText(''); clearFile();
      onPosted(post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
 
  return (
    <form onSubmit={create} className="card compose">
      <textarea placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={3} />
      {preview && (
        <div className="preview">
          {file.type.startsWith('video/') ? <video src={preview} controls /> : <img src={preview} alt="" />}
          <button type="button" className="btn small" onClick={clearFile}>Remove</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <div className="row between">
        <label className="btn small">
          Add photo or video
          <input type="file" accept="image/*,video/*" hidden onChange={pick} />
        </label>
        <div className="row">
          <span className="count">{text.length}/500</span>
          <button className="btn primary" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
        </div>
      </div>
    </form>
  );
}
 
/* ---------- Feed ---------- */
function Feed({ me }) {
  const [posts, setPosts] = useState([]);
  useEffect(() => { api('/posts').then(setPosts); }, []);
 
  return (
    <>
      <Compose onPosted={(post) => setPosts([post, ...posts])} />
      <PostList posts={posts} setPosts={setPosts} me={me} empty="Nothing here yet. Write a post or follow someone to fill your feed." />
    </>
  );
}
 
/* ---------- Create post page (bottom nav "+") ---------- */
function CreatePage() {
  const navigate = useNavigate();
  return (
    <>
      <h2>New post</h2>
      <Compose onPosted={() => navigate('/')} />
    </>
  );
}
 
/* ---------- Search people ---------- */
function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
 
  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) return setResults([]);
      api('/users/search?q=' + encodeURIComponent(q)).then(setResults).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
 
  return (
    <>
      <input className="search" placeholder="Search people by username" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {q.trim() && !results.length && <p className="empty">No one found.</p>}
      {results.map((u) => (
        <Link key={u._id} to={`/u/${u.username}`} className="card row person">
          <Avatar user={u} size={44} />
          <div>
            <b>{u.username}</b> {u.isPrivate && <span className="badge">Private</span>}
            <div className="muted">{u.name}</div>
          </div>
        </Link>
      ))}
    </>
  );
}
 
/* ---------- Follow requests ---------- */
function Requests({ onCount }) {
  const [list, setList] = useState([]);
  useEffect(() => { api('/users/me/requests').then((r) => { setList(r); onCount(r.length); }); }, []);
 
  async function answer(id, action) {
    await api(`/users/requests/${id}/${action}`, { method: 'POST' });
    const next = list.filter((u) => u._id !== id);
    setList(next); onCount(next.length);
  }
 
  return (
    <>
      <h2>Follow requests</h2>
      {!list.length && <p className="empty">No pending requests.</p>}
      {list.map((u) => (
        <div key={u._id} className="card row person">
          <Avatar user={u} size={44} />
          <Link to={`/u/${u.username}`} className="grow"><b>{u.username}</b><div className="muted">{u.name}</div></Link>
          <button className="btn small primary" onClick={() => answer(u._id, 'accept')}>Accept</button>
          <button className="btn small" onClick={() => answer(u._id, 'reject')}>Decline</button>
        </div>
      ))}
    </>
  );
}
 
/* ---------- Settings: edit profile, picture, privacy ---------- */
function Settings({ me, setMe }) {
  const [name, setName] = useState(me.name || '');
  const [bio, setBio] = useState(me.bio || '');
  const [isPrivate, setIsPrivate] = useState(!!me.isPrivate);
  const [msg, setMsg] = useState('');
 
  async function save(e) {
    e.preventDefault();
    try {
      const r = await api('/users/me', { method: 'PUT', body: { name, bio, isPrivate } });
      setMe({ ...me, ...r });
      setMsg('Saved');
    } catch (err) { setMsg(err.message); }
  }
  async function changeAvatar(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const fd = new FormData();
      fd.append('avatar', f);
      const r = await api('/users/me/avatar', { method: 'POST', body: fd });
      setMe({ ...me, avatar: r.avatar });
      setMsg('Profile picture updated');
    } catch (err) { setMsg(err.message); }
  }
 
  return (
    <form className="card settings" onSubmit={save}>
      <h2>Edit profile</h2>
      <div className="row">
        <Avatar user={me} size={72} />
        <label className="btn small">
          Change photo
          <input type="file" accept="image/*" hidden onChange={changeAvatar} />
        </label>
      </div>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} /></label>
      <label>Bio<textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} /></label>
      <label className="row toggle">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
        <span>
          <b>Private account</b>
          <span className="muted"> Only approved followers can see your posts. New followers need your approval.</span>
        </span>
      </label>
      <div className="row">
        <button className="btn primary">Save changes</button>
        {msg && <span className="muted">{msg}</span>}
      </div>
    </form>
  );
}
 
/* ---------- Profile ---------- */
function Profile({ me }) {
  const { username } = useParams();
  const [p, setP] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
 
  async function load() {
    try {
      const prof = await api('/users/' + username);
      setP(prof);
      setPosts(prof.canView ? await api('/posts/user/' + prof._id) : []);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { setError(''); setP(null); load(); }, [username]);
 
  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="empty">Loading…</p>;
 
  const label = { none: 'Follow', requested: 'Requested', following: 'Unfollow' }[p.relation];
  async function follow() {
    await api(`/users/${p._id}/follow`, { method: 'POST' });
    load();
  }
 
  return (
    <>
      <section className="card profile">
        <Avatar user={p} size={84} />
        <div className="grow">
          <h2>{p.name || p.username} {p.isPrivate && <span className="badge">Private</span>}</h2>
          <div className="muted">@{p.username}</div>
          <p className="stats">
            <b>{posts.length}</b> posts · <b>{p.followersCount}</b> followers · <b>{p.followingCount}</b> following
          </p>
          <p>{p.bio}</p>
        </div>
        {p.relation === 'self' ? (
          <Link to="/settings" className="btn">Edit profile</Link>
        ) : (
          <button className={'btn' + (p.relation === 'none' ? ' primary' : '')} onClick={follow}>{label}</button>
        )}
      </section>
      {p.canView ? (
        <PostList posts={posts} setPosts={setPosts} me={me} empty="No posts yet." />
      ) : (
        <p className="card lock">This account is private. Follow to see their photos and videos.</p>
      )}
    </>
  );
}
 
/* ---------- App shell ---------- */
export default function App() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [reqCount, setReqCount] = useState(0);
  const navigate = useNavigate();
 
  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api('/auth/me').then(setMe).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (me) api('/users/me/requests').then((r) => setReqCount(r.length)).catch(() => {});
  }, [me?._id]);
 
  const logout = () => { localStorage.removeItem('token'); setMe(null); navigate('/'); };
  if (!ready) return null;
  if (!me) return <AuthPage onAuth={(u) => { setMe(u); navigate('/'); }} />;
 
  return (
    <>
      <nav className="nav">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="" className="logo-img" />
          circle
        </Link>
        <div className="row links">
          {/* Feed, Search, Post, Profile ab niche bottom bar mein hain */}
          <NavLink to="/requests">Requests{reqCount > 0 && <span className="pill">{reqCount}</span>}</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <button className="link" onClick={logout}>Log out</button>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Feed me={me} />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/requests" element={<Requests onCount={setReqCount} />} />
          <Route path="/settings" element={<Settings me={me} setMe={setMe} />} />
          <Route path="/u/:username" element={<Profile me={me} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <BottomNav username={me.username} />
    </>
  );
}