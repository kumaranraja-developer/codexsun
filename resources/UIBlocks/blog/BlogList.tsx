import { useNavigate } from "react-router-dom";
import GlobalSearch from "../../components/input/search-box";
import { BlogPost } from "../../global/helpers/blog";



interface BlogListProps {
  blogs: BlogPost[];
}

function BlogList({ blogs }: BlogListProps) {
  const categories = [...new Set(blogs.map((blog) => blog.category))];
  const tags = [...new Set(blogs.flatMap((blog) => blog.tags))];
  const navigate = useNavigate();

  const handleBlog = (id: number) => {
    navigate(`/blog/${id}`);
  };

  return (
    <div className="">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] w-full">
        <img
          src="/assets/blogbg.webp"
          alt="Sample"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="md:w-2/3 px-5 lg:px-[10%] text-background space-y-4">
            <h1 className="text-2xl lg:text-6xl font-bold animate__animated animate__fadeIn animate__fast">
              Blogs
            </h1>
            <p className="text-sm sm:text-md text-background/80 lg:text-lg text-justify animate__animated animate__fadeIn animate__slow">
              Explore insightful articles, practical tips, and fresh
              perspectives on topics that matter — curated to inform, inspire,
              and ignite conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-[70%_30%] gap-5 px-5 md:px-[10%]">
        {/* Blog List */}
        <div className="space-y-5 py-20">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleBlog(blog.id)}
              className="grid grid-cols-[40%_60%] gap-5 p-3 border border-ring/30 rounded-md hover:shadow cursor-pointer transition"
            >
              <img
                src={blog.PostImage}
                alt={blog.title}
                className="object-scale-down w-full h-full"
              />
              <div className="flex flex-col justify-between pr-4">
                <div>
                  <h2 className="text-xl font-bold line-clamp-2">
                    {blog.title}
                  </h2>
                  <div
                    className="text-sm line-clamp-2 md:line-clamp-3 mt-1 text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: blog.description }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                  <span className="font-semibold">{blog.author.name}</span>
                  <span>{blog.date}</span>
                  <span className="bg-primary/10 px-2 rounded text-primary">
                    {blog.category}
                  </span>
                  {/* <span>👍 {blog.l}</span> */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:border-l py-20 lg:pl-5 border-ring/30">
          <hr className="lg:hidden border-ring/30" />
          <GlobalSearch
            onSearchApi={""}
            onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            }}
          />

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {categories.map((cat, idx) => (
                <li key={idx} className="hover:text-primary cursor-pointer">
                  • {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-muted px-2 py-1 rounded hover:bg-primary hover:text-white cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogList;
