import { useState } from "react";
import GlobalSearch from "../../components/input/search-box";
import Timeline from "../../components/timeline/timeline";
import { useNavigate, useParams } from "react-router-dom";
import { LinkAgroBlogs } from "../../../sites/linkagro/src/pages/Blog";

const recentPosts = [
  {
    title: "10 Tips for Writing Clean React Code",
    author: "Jane Smith",
    date: "July 30, 2025",
    thumbnail: "/assets/tomato-3919426_1280.jpg",
  },
  // Add more recent post objects here...
];

const initialComments = [
  {
    date: "2025-08-04",
    title: "User signed up",
    description: "Muthu created an account using email.",
    user: { name: "Muthu", initial: "M" },
    icon: <span>🎉</span>,
  },
  {
    date: "2025-08-04",
    title: "Profile updated",
    description: "Changed profile picture and bio.",
    user: { name: "Muthu", avatar: "/images/muthu.jpg" },
    icon: <span>📝</span>,
  },
  {
    date: "2025-08-03",
    title: "Password changed",
    description: "User updated password for security.",
    user: { name: "Muthu", initial: "M" },
    icon: <span>🔒</span>,
  },
  {
    date: "2025-08-01",
    title: "Email verified",
    description: "User clicked verification link.",
    user: { name: "Muthu", initial: "M" },
    icon: <span>✅</span>,
  },
];

function BlogLayout1() {
  const navigate=useNavigate()
  const { id } = useParams();
  const post = LinkAgroBlogs.find((p) => p.id === Number(id));
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const recentBlogs = LinkAgroBlogs.filter((p) => p.id !== Number(id));
  if (!post) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Blog not found ❌</h1>
      </div>
    );
  }
  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const newEntry = {
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      title: "New Comment",
      description: newComment,
      user: { name: "Muthu", initial: "M" },
      icon: <span>💬</span>,
    };
    setComments([newEntry, ...comments]);
    setNewComment("");
  };

  const handleBlog = (id: number) => {
    navigate(`/blog/${id}`);
  };
  return (
    <div>
      {/* Banner */}
      {/* <div className="relative h-[50vh] md:h-[70vh] w-full">
        <img
          src={post.coverImage}
          alt="Sample"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="md:w-2/3 px-5 lg:px-[10%] text-white space-y-4">
            <h1 className="text-2xl lg:text-4xl font-bold">Blogs</h1>
            <p className="text-sm sm:text-md lg:text-lg text-justify">
              Explore insightful articles, practical tips, and fresh
              perspectives.
            </p>
          </div>
        </div>
      </div> */}

      {/* Content */}
      <div className="grid lg:grid-cols-[70%_30%] gap-8 mt-25 px-5 md:px-[10%]">
        <div>
          <img
            src={post.PostImage}
            alt="Blog Cover"
            className="rounded-xl w-full object-cover"
          />

          {/* Author */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">
            <img
              src={post.author.avatar}
              className="rounded-full w-8 h-8 object-cover"
              alt="Author"
            />
            <p className="font-semibold text-black">{post.author.name}</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 border rounded-full bg-primary"></span>
              <p>{post.date}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight my-3">
            {post.title}
          </h1>

          {/* Tags & Category */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
            <p className="font-medium">Category:</p>
            <span className="px-3 py-1 bg-foreground/10 rounded-full">
              {post.category}
            </span>
            <p className="font-medium ml-4">Tags:</p>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-foreground/10 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Content HTML */}
          <div
            className="
              [&>h2]:text-4xl [&>h2]:font-bold [&>h2]:mt-4 [&>h2]:mb-2 [&>h2]:text-foreground/80
              [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-2 [&>h3]:text-foreground/80
              [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-2 [&>h4]:mb-1 [&>h4]:text-foreground/80
              [&>p]:text-sm [&>p]:leading-relaxed [&>p]:mb-3 [&>p]:text-foreground/80
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3
              [&>li]:text-sm [&>li]:leading-snug [&>li]:mb-1 [&>li]:text-foreground/80
              [&>strong]:text-foreground
            "
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {/* Comments */}

          {post.isComment && (
            <div className="mt-10 border-t pt-6 space-y-6">
              <h2 className="text-2xl font-semibold">Comments</h2>
              <Timeline items={comments} showCollapse isHeading={false} />
              <div className="mt-6 space-y-3">
                <textarea
                  className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={handleSubmit}
                  className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary/90 transition"
                >
                  Submit Comment
                </button>
              </div>
            </div>
          )}

          <div className="mb-20"></div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 h-full pr-1 pb-20 md:pb-0 lg:border-l lg:pl-5 border-ring/30">
          <GlobalSearch onSearchApi={""} onNavigate={() => {}} />
          <h2 className="text-xl font-semibold border-b pb-2">Recent Posts</h2>
          {recentBlogs.map((recent, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[30%_70%] gap-4 items-start cursor-pointer"
              onClick={()=>{handleBlog(recent.id)}}
            >
              <img
                src={recent.PostImage}
                alt="Thumbnail"
                className="rounded-md w-full h-full object-scale-down "
              />
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                  {recent.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <p className="font-medium">{recent.author.name}</p>
                  <span>•</span>
                  <p>{recent.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogLayout1;
