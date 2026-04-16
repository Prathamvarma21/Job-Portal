import { useMemo, useState } from "react";
import axios from "axios";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { POST_API_END_POINT } from "../../../utils/constant.js";

const PostComposer = ({ onPostCreated, compact = false }) => {
  const { user } = useSelector((store) => store.auth);
  const { allAdminJobs } = useSelector((store) => store.job);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [postType, setPostType] = useState("general");
  const [hiringTitle, setHiringTitle] = useState("");
  const [jobId, setJobId] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const imagePreview = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  if (!user) {
    return (
      <div className="bg-white border rounded-lg p-5 text-center text-gray-600">
        Log in to share skills, projects, hiring updates, and opportunities.
      </div>
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.error("Write something before posting");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("postType", postType);
    formData.append("hiringTitle", hiringTitle);
    formData.append("jobId", jobId);
    formData.append("applyUrl", applyUrl);
    if (file) formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(`${POST_API_END_POINT}/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setCaption("");
        setFile(null);
        setPostType("general");
        setHiringTitle("");
        setJobId("");
        setApplyUrl("");
        onPostCreated?.(res.data.post);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not share post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="bg-white border rounded-lg p-4 md:p-5">
      <div className="flex items-start gap-3">
        <img
          src={user?.profile?.profilePhoto || "https://ui-avatars.com/api/?background=0f766e&color=fff&name=User"}
          alt={user?.fullName}
          className="w-11 h-11 rounded-full object-cover border"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-950">{user.fullName}</p>
          <p className="text-sm text-gray-500">
            {user.role === "recruiter" ? "Share a hiring update" : "Share your work update"}
          </p>
        </div>
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={user.role === "recruiter" ? "Post a hiring announcement, company update, or vacancy..." : "Share a project, achievement, skill, or job-seeking update..."}
        className="mt-4 min-h-28 w-full resize-none rounded-md border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-slate-950"
      />

      {user.role === "recruiter" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="grid gap-2">
            <Label htmlFor={compact ? "dash-post-type" : "home-post-type"}>Post type</Label>
            <select
              id={compact ? "dash-post-type" : "home-post-type"}
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="general">Company update</option>
              <option value="hiring">Hiring post</option>
            </select>
          </div>
          {postType === "hiring" && (
            <div className="grid gap-2">
              <Label htmlFor={compact ? "dash-hiring-title" : "home-hiring-title"}>Hiring title</Label>
              <Input
                id={compact ? "dash-hiring-title" : "home-hiring-title"}
                value={hiringTitle}
                onChange={(e) => setHiringTitle(e.target.value)}
                placeholder="Frontend Developer needed"
              />
            </div>
          )}
          {postType === "hiring" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor={compact ? "dash-job" : "home-job"}>Link a posted job</Label>
                <select
                  id={compact ? "dash-job" : "home-job"}
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">No linked job</option>
                  {allAdminJobs?.map((job) => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={compact ? "dash-apply-url" : "home-apply-url"}>External apply link</Label>
                <Input
                  id={compact ? "dash-apply-url" : "home-apply-url"}
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://company.com/careers"
                />
              </div>
            </>
          )}
        </div>
      )}

      {imagePreview && (
        <img src={imagePreview} alt="Post preview" className="mt-4 max-h-80 w-full rounded-lg object-cover border" />
      )}

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <Label className="inline-flex items-center justify-center gap-2 border rounded-md h-10 px-3 cursor-pointer text-sm text-gray-700">
          <ImagePlus className="w-4 h-4" />
          Add image
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Label>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Share post
        </Button>
      </div>
    </form>
  );
};

export default PostComposer;
