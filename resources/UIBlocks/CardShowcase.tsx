function CardShowcase({ items }) {
  return (
    <div className="">
      {items.map((item, index) => (
        <div
          key={index}
          className={`grid mt-5 md:grid-cols-2 gap-5 md:gap-10 items-center ${
            index % 2 === 0 ? "lg:grid-flow-col-dense" : ""
          }`}
        >
          {/* Image */}
          <div
            className={`flex justify-center items-center ${
              index % 2 === 0 ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <img
              src={item.image}
              className="w-full object-contain"
              alt={item.title}
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div
            className={`flex flex-col justify-center gap-6 ${
              index % 2 === 0 ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {/* Title */}
            <h1 className="text-xl md:text-2xl my-3 font-bold">{item.title}</h1>

            {/* Optional Description */}
            {item.description && (
              <p className="text-gray-700">{item.description}</p>
            )}

            {/* Optional List */}
            {item.services && item.services.length > 0 && (
              <ul className="list-disc pl-5 flex flex-col gap-2">
                {item.services.map((service, i) => (
                  <li key={i}>
                    <span className="font-bold">{service.heading}:</span>{" "}
                    {service.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardShowcase;
