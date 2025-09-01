interface PortfolioContactProps {
  mapSrc: string;
}

function PortfolioContact({ mapSrc }: PortfolioContactProps) {
  return (
    <div className="">
      <h1 className="text-5xl font-bold py-10 text-center text-foreground">
        Have Any Questions?
      </h1>

      {/* Map + Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-12">
        <div className="flex items-center">
          <iframe
            src={mapSrc}
            width="600"
            height="450"
            aria-label="location"
            loading="lazy"
            className="w-full rounded-lg shadow-lg"
          > <span className="sr-only">location</span></iframe>
        </div>

        <div className="border border-ring/30 bg-background rounded-lg p-5 shadow-2xl">
          <form className="flex flex-col space-y-4 border border-ring/30 rounded-lg p-5">
            <div>
              <label htmlFor="name" className="text-foreground text-lg">
                Name
              </label>
              <input
                type="text"
                name="name"
                aria-label="Name"
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-foreground text-lg">
                Email
              </label>
              <input
                type="email"
                name="email"
                aria-label="Email"
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-foreground text-lg">
                Message
              </label>
              <textarea
                name="message"
                required
                aria-label="Message"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
                rows={5}
              />
            </div>
            <button
              type="button"
              aria-label="submit"
              className="bg-primary hover:bg-hover text-create-foreground py-2 px-6 rounded-md font-semibold cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PortfolioContact;
