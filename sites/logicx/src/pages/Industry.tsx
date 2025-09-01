
function Industry() {
  return (
     <div className='w-full'>
      <div className='px-5 lg:px-[12%] flex flex-col lg:flex-row-reverse gap-y-5 gap-x-15'>
        <div className='flex w-[100%] justify-center items-center'>
          <img src={'/assets/svg/home-hero.svg'} className='w-[70%] block mx-auto lg:w-full' alt='img' />
        </div>
        <div className='gap-4 flex flex-col lg:justify-center w-[100%]'>
            <div>
              <div className='text-xl md:text-3xl font-bold text-start' >ERP Solutions by Industry</div>
              <div className='my-4 text-lg'>We provide industry-specific ERP deployments:</div>
            </div>
            <ul className="list-disc pl-10 flex flex-col gap-2">
                <li><span className='font-bold'>Textile & Garment:</span> Track orders, production, and inventory across units.</li>
                <li><span className='font-bold'>Retail & POS:</span> Real-time stock, billing, and customer insights.</li>
                <li><span className='font-bold'>Manufacturing:</span> Manage BOM, work orders, and production timelines.</li>
                <li><span className='font-bold'>Services:</span> CRM, ticketing, and billing for IT & service-based companies.</li>
            </ul>
        </div>
      </div>
     </div>
  )
}

export default Industry