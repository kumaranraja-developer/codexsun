import { useState } from 'react';
import Button from "../../components/button/Button";

type PlanType = {
  plan: string;
  price: string;
  features: string[];
  path: string;
  style: { text: string; price: string; bg: string }[];
};

function Plan() {
  const [plans] = useState<PlanType[]>([
    {
      plan: 'Silver',
      price: '$39',
      features: ['1 User', '3 Projects', 'Download Prototypes', '1 Year Repair Coverage', 'Monthly Reports', '7/24 Support'],
      path: '/silver',
      style: [{ text: '#000', price: '#118b57', bg: 'white' }],
    },
    {
      plan: 'Gold',
      price: '$49',
      features: ['3 User', '10 Projects', 'Download Prototypes', '1 Year Repair Coverage', 'Monthly Reports', '7/24 Support' ],
      path: '/gold',
      style: [{ text: '#fff', price: '#fff', bg: '#118b57' }],
    },
    {
      plan: 'Platinum',
      price: '$59',
      features: ['1 User', '20 Projects', 'Download Prototypes', '1 Year Repair Coverage', 'Monthly Reports', '7/24 Support' ],
      path: '/platinum',
      style: [{ text: '#000', price: '#118b57', bg: 'white' }],
    },
  ]);

  return (
    <section className='lg:px-[12%] mb-20 px-5'>
      <div className='text-xl text-center font-bold my-4 md:text-3xl'>Plan & Pricing</div>
      <div className='text-center mt-8 md:w-[70%] block mx-auto'>
        Plan & Pricing Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum omnis veniam nihil assumenda quas pariatur commodi accusantium alias inventore.
      </div>

      {/* Plan Card */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-10'>
        {plans.map((item, index) => (
          <div
            key={index}
            className='border border-gray-500 text-center flex flex-col gap-5 py-10 rounded-md'
            style={{ background: item.style[0].bg, color: item.style[0].text }}>
            <div className='text-3xl font-bold uppercase'>{item.plan}</div>
            <div className='font-semibold text-6xl' style={{ color: item.style[0].price }}>
              {item.price}
            </div>
            <span className='text-xl mb-5'>per month</span>
            {item.features.map((feature, idx) => (
              <div key={idx}>{feature}</div>
            ))}
            <div className='flex justify-center mt-5'>
              <Button
                  label='Get Started'
                  path='/about'
                  className={`bg-transparent px-10 rounded-sm uppercase font-semibold py-4 duration-500 text-xl border ${index % 2 !== 0 ? 'hover:bg-gray-50 hover:text-black' : 'hover:border-[#118b57] hover:text-[#118b57]'}`}
                  children={undefined}              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Plan;
