
import { useState } from 'react';

function FooterLink() {
  const [link]=useState([
    {link:"http://flipkart.com/",icon:'/assets/svg/facebook.svg'},
    {link:"http://flipkart.com/",icon:'/assets/svg/x.svg'},
    {link:"http://flipkart.com/",icon:'/assets/svg/pinterest.svg'},
    {link:"http://flipkart.com/",icon:'/assets/svg/youtube.svg'},
    {link:"http://flipkart.com/",icon:'/assets/svg/linkedin.svg'},
  ])
  return (
    <div className='flex justify-center gap-5 border-t border-gray-900'>
      {
        link.map((link,idx)=>(
           <a key={idx} target='_blank' href={link.link}>
            <img className='w-10 p-2 sm:w-20 sm:p-6' src={link.icon} alt='Facebook' />
          </a>
        ))
      }
    </div>
  );
}

export default FooterLink;
