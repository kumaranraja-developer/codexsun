import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import Button from '../../../../resources/components/button/Button';
import Footer from '../../../../resources/components/footer/Footer';

interface Article {
  id: number;
  image: string;
  vname: string;
  body: string;
  user_name: string;
  created_at: string;
  category_name: string;
  tag_name:string;
}

function BlogInfo() {
  const {id}=useParams();
 const [article, setArticle] = useState<Article | null>(null);
 const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  const [loading, setLoading] = useState(true);

 useEffect(() => {
  axios.get('https://cloud.aaranassociates.com/api/v1/blog')
    .then(res => {
      const all = res.data;
      const found = all.find((item: Article) => item.id === Number(id));
      setArticle(found);
      setRecentArticles(all);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching blog:", err);
      setLoading(false);
    });
}, [id]);


  if (loading) return <div className="p-10 text-xl">Loading...</div>;
  if (!article) return <div className="p-10 text-xl">Article not found.</div>;
  
  return (
    <section>
      <div className="px-5 lg:px-[12%] flex flex-col lg:flex-row lg:items-center gap-y-3 justify-between bg-[#e4e4e7] py-8">
        <h1 className="text-2xl">{article.vname}</h1>
        <nav aria-label="breadcrumb" className="flex items-center">
          <ol className="flex items-center space-x-2 text-gray-500">
            <li>
              <a href="/" className="text-blue-500 hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/blog" className="text-blue-500 hover:underline">
                / Blog
              </a>
            </li>
            <li aria-current="page" >
              <span>/ {article.vname}</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="lg:px-[12%] px-5 flex flex-col md:flex-row">
        <div className="flex flex-col gap-y-6 gap-3 lg:grid-cols-4 md:w-[70%] md:pr-5 mt-5">
          <div className="flex pt-20 flex-col gap-3 md:pr-3 mt-8 sm:mt-0">
            <img src={article.image} alt={article.vname} />
            <div className="my-3 text-sm text-gray-600">
              By <span className="underline text-[#027abb] cursor-pointer">{article.user_name}</span> Posted on{' '}
              <span className="underline text-[#027abb] cursor-pointer">{format(new Date(article.created_at), 'MMMM d, yyyy')}</span> Posted in{' '}
              <span className="underline text-[#027abb] cursor-pointer">{article.category_name}</span>{' '}
              <span className="underline text-[#027abb] cursor-pointer">No comment</span>
            </div>

            <div className="text-md text-gray-600">
              {article.body}
            </div>
          </div>
          <hr />
          <div className='flex justify-between'>
            <Button path="#" label="Prev" children={undefined} />
            <Button path="#" label="Next" children={undefined} />
          </div>
          <hr />

          <div className='flex flex-col gap-5 pb-5'>
            <div className='text-xl font-semibold'>Leave a Reply</div>
            <div>Your email address will not be published. Required fields are marked *</div>
            <label htmlFor="">Comment *</label>
            <textarea className='border border-gray-200 h-[200px] p-2 rounded-md' />

            <div className='flex flex-col gap-5'>
              <label htmlFor="">Name *</label>
              <input className='border border-gray-200 p-2 rounded-md' type="text" />
            </div>

            <div className='flex flex-col gap-5'>
              <label htmlFor="">Email *</label>
              <input className='border border-gray-200 p-2 rounded-md' type="text" />
            </div>

            <div className='flex flex-col gap-5'>
              <label htmlFor="">Website</label>
              <input className='border border-gray-200 p-2 rounded-md' type="text" />
            </div>

            <div className='flex gap-2'>
              <input id='save-info' type="checkbox" className='w-5 h-5' />
              <label htmlFor='save-info'>
                Save my name, email, and website in this browser for the next time I comment.
              </label>
            </div>

            <Button label="Post Comment" className="bg-[#027abb] w-max px-6 rounded-md text-gray-50" path={''}
                    children={undefined} />
          </div>
          <hr className='mt-2 '/>

        </div>

        {/* Right side Section */}
        <div className="my-20 md:p-5 md:pl-15 md:border-l md:w-[30%] border-gray-200">
          <input
            className="p-3 border w-full border-gray-400"
            placeholder="Search ..."
          />
          <div className="font-semibold text-2xl mt-4">Recent Posts</div>
          <hr className='mt-2 mb-4'/>
           {
            recentArticles.map((item, index) => (
              <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                <Link to={`/bloginfo/${item.id}`}>{item.vname}</Link>
              </div>
            ))
          }


          <div className="mt-15">
            <div className="font-semibold text-2xl mt-4">Categories</div>
            <hr className='mt-2 mb-4'/>
             {
              [...new Set(recentArticles.map(item => item.category_name))].map((category, index) => (
                <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                  <a href="#">{category}</a>
                </div>
              ))
            }

          </div>

          <div className="mt-15">
            <div className="font-semibold text-2xl mt-4">Tags</div>
          <hr className='mt-2 mb-4'/>
             {
              [...new Set(recentArticles.map(item => item.tag_name))].map((tag, index) => (
                <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                  <a href="#">{tag}</a>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <Footer
            aboutLinks={[
              { label: "Our Company", path: "/contactus" },
              { label: "Brand Assets", path: "/contactus" },
              { label: "Contact Us", path: "/contactus" },
              { label: "Jobs", path: "/contactus" },
              { label: "Events", path: "/contactus" },
              { label: "Blog", path: "/payment" },
              { label: "Customers", path: "/payment" },
              { label: "Level Privacy", path: "/payment" },
            ]}
            servicesLinks={[
              { label: "Support", path: "/payment" },
              { label: "Become a Partner", path: "/payment" },
              { label: "Web Service", path: "/payment" },
              { label: "Software", path: "/payment" },
              { label: "FAQ", path: "/FAQ" },
            ]}
            policyLinks={[
              { label: "Terms of Use", path: "/termsofuse" },
              { label: "Security", path: "/security" },
              { label: "Privacy", path: "/privacy" },
            ]}
            contact={{
              phone: "9894244450",
              email: "support@techmedia.in",
            }}
            address={{
              company: "Tech Media",
              lines: [
                "436, Avinashi Road,",
                "Near CITU Office,",
                "Tiruppur, Tamil Nadu 641602",
              ],
              website: "www.techmedia.in",
              infoEmail: "info@techmedia.in",
            }}
            social={{
              whatsapp: "https://wa.me/9894244450",
              facebook: "https://facebook.com/techmedia",
              twitter: "https://twitter.com/techmedia",
              instagram: "https://instagram.com/techmedia",
            }}
            version="V 1.0.1"
          />
    </section>
  );
}

export default BlogInfo;
