import { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import PostComposer from "./PostComposer";
import { POST_API_END_POINT } from "../../../utils/constant.js";

const getApplyTarget = (post) => {
  if (post?.job?._id) return `/description/${post.job._id}`;
  return post?.applyUrl || "";
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useSelector((store) => store.auth);
  const applyTarget = getApplyTarget(post);
  const isInternalApply = applyTarget.startsWith("/description/");
  const canDelete = user?._id && post?.author?._id === user._id;

  return (
    <article className="bg-white border rounded-lg overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <img
            src={post?.author?.profile?.profilePhoto || `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(post?.author?.fullName || "User")}`}
            alt={post?.author?.fullName}
            className="w-11 h-11 rounded-full object-cover border"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h3 className="font-semibold text-gray-950 truncate">{post?.author?.fullName}</h3>
              <Badge variant="outline" className="w-fit capitalize">{post?.author?.role}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onDelete(post._id)}
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {post.postType === "hiring" && (
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3">
            <div className="flex items-center gap-2 text-teal-800 font-semibold">
              <Briefcase className="w-4 h-4" />
              {post.hiringTitle || post?.job?.title || "Hiring now"}
            </div>
            {post?.job && (
              <p className="text-sm text-teal-900 mt-1">
                {post.job.company?.name} · {post.job.location} · {post.job.jobType}
              </p>
            )}
          </div>
        )}

        <p className="mt-4 text-gray-700 whitespace-pre-line break-words">{post.caption}</p>

        {post.image && (
          <img src={post.image} alt="Shared post" className="mt-4 w-full max-h-[520px] rounded-lg object-cover border" />
        )}

        {post.postType === "hiring" && applyTarget && (
          <div className="mt-4">
            {isInternalApply ? (
              <Link to={applyTarget}>
                <Button className="w-full sm:w-auto">Apply now</Button>
              </Link>
            ) : (
              <a href={applyTarget} target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto">
                  Apply now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

const SocialFeed = ({ showComposer = true, compact = false }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${POST_API_END_POINT}/get`, { withCredentials: true });
        if (res.data.success) {
          setPosts(res.data.posts);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = (post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
  };

  const deletePost = async (postId) => {
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`${POST_API_END_POINT}/${postId}`, { withCredentials: true });
      if (res.data.success) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete post");
    }
  };

  return (
    <section className={compact ? "space-y-4" : "max-w-3xl mx-auto px-4 md:px-8 my-16 space-y-4"}>
      <div>
        <p className="text-sm font-semibold text-teal-700">Community feed</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-950">Updates from candidates and recruiters</h2>
      </div>

      {showComposer && <PostComposer onPostCreated={addPost} compact={compact} />}

      {loading ? (
        <div className="bg-white border rounded-lg p-6 flex items-center justify-center text-gray-600">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading posts
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
          No posts yet. Share the first update.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={deletePost} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SocialFeed;
