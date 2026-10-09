import { FaHeart, FaRegHeart, FaRegComment } from "react-icons/fa";
import "./theme.css";

// PostCard.jsx mein purane "Liked · 1" / "Comments · 1" buttons ki jagah ye lagao:
// <PostActions liked={liked} likeCount={likes} commentCount={comments}
//              onLike={handleLike} onComment={toggleComments} />
export default function PostActions({
  liked,
  likeCount = 0,
  commentCount = 0,
  onLike,
  onComment,
}) {
  return (
    <div className="post-actions">
      <button
        className={liked ? "action-btn liked" : "action-btn"}
        onClick={onLike}
        aria-label={liked ? "Unlike" : "Like"}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
        <span>{likeCount}</span>
      </button>

      <button className="action-btn" onClick={onComment} aria-label="Comments">
        <FaRegComment />
        <span>{commentCount}</span>
      </button>
    </div>
  );
}
