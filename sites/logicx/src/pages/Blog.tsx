import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../../../../resources/components/button/Button';
interface Article {
  id: string;
  image: string;
  vname: string;
  category_name:string;
  created_at:string;
  body: string;
  user_name:string;
  tag_name:string;

}

function Blog() {


  const [articles,setArticles] = useState<Article[]>([
    
  ]);
  useEffect(()=>{
    axios.get('https://cloud.aaranassociates.com/api/v1/blog')
    .then(res=>setArticles(res.data))
    .catch(()=>"error")
  },[])
  
  return (
    <div>
      {/* Nav Menu */}
      <div className='px-5 lg:px-[12%] flex items-center justify-between bg-[#e4e4e7] py-8'>
        <h1 className='text-3xl'>Blog</h1>
        <nav aria-label='breadcrumb' className='flex items-center'>
          <ol className='flex items-center space-x-2 text-gray-500'>
            <li>
              <a
                href="/"
                className='text-blue-500 hover:underline'
              >
                Home
              </a>
            </li>
            <li aria-current='page'>
              <span>/ Blog</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Blog Section */}
      <section className='lg:px-[12%] px-5 flex flex-col gap-8 bg-[#f2f2f2]'>
        <div className='flex flex-col md:flex-row'>
          <div className='flex flex-col gap-y-6 gap-3 py-20 lg:grid-cols-4 md:w-[70%] md:pr-5 mt-5'>
            {articles.map((article, index) => (
              <div key={index} className='flex flex-col gap-3 md:pr-3 mt-8 sm:mt-0 border-b last:border-0'>
                <img src={article.image} alt='' />
                <div className='text-2xl lg:text-3xl font-semibold line-clamp-1 lg:line-clamp-2'>{article.vname}</div>
                <div className='my-3'>
                    By <span className='underline text-[#027abb] cursor-pointer'>{article.user_name}</span> Posted on <span className='underline text-[#027abb] cursor-pointer'>{format(new Date(article.created_at), 'MMMM d, yyyy')}</span> Posted in <span className='underline text-[#027abb] cursor-pointer'>{article.category_name}</span>  <span className='underline text-[#027abb] cursor-pointer'>No commend</span>
                </div>
                <div className='text-lg line-clamp-2 lg:line-clamp-1'>{article.body}</div>
                <div className='my-6'>
                    <Button label='Read More' path={`/bloginfo/${article.id}`} className='bg-gray-200 text-black'
                            children={undefined} />
                </div>
              </div>
            ))}
          </div>

           <div className="my-10  md:pt-20 md:p-5 md:pl-15 md:border-l md:mt-0 md:w-[30%] md:border-gray-200">
          <input
            className="p-3 border w-full border-gray-400"
            placeholder="Search ..."
          />
          <div className="font-semibold text-2xl mt-4">Recent Posts</div>
          <hr className='mt-2 mb-4'/>
           {
            articles.map((item, index) => (
              <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                <Link to={`/bloginfo/${item.id}`}>{item.vname}</Link>
              </div>
            ))
          }

          <div className="mt-15">
            <div className="font-semibold text-2xl mt-4">Categories</div>
            <hr className='mt-2 mb-4'/>
             {
              [...new Set(articles.map(item => item.category_name))].map((category, index) => (
                <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                  <a href="#">{category}</a>
                </div>
              ))
            }
          </div>

          <div className="my-15">
            <div className="font-semibold text-2xl mt-4">Tags</div>
          <hr className='mt-2 mb-4'/>
             {
              [...new Set(articles.map(item => item.tag_name))].map((tag, index) => (
                <div key={index} className="mt-2 underline text-[#2bb9eb] capitalize line-clamp-1">
                  <a href="#">{tag}</a>
                </div>
              ))
            }
          </div>
        </div>
        </div>
      </section>

      {/* <Footer /> */}
    </div>
  );
}

export default Blog;
