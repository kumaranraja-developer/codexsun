
function StartingSection1() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4">
        Streamline Your
        <span className="emoji">💼</span> Business,
        <br />
        Unlock
        <span className="emoji">🔓</span> Your Growth!
      </h1>

      <p className="text-gray-600 text-base md:text-lg max-w-xl mb-8">
        Manage your budget, track expenses, invest wisely, and achieve your
        financial goals— all in one intuitive app with savings goals and
        investment tracking.
      </p>

      <button className="bg-gradient-to-r from-primary to-primary/40 text-white px-8 py-3 rounded-full shadow-[0_8px_15px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-300 cursor-pointer">
        Get Started
      </button>

      {/* Optional Background Blocks */}
      <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white/30 rounded-lg blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/20 rounded-lg blur-3xl"></div>
    </div>
  );
}

export default StartingSection1;
