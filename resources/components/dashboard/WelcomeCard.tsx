
import { Card } from '../../../resources/components/chart/card'

function WelcomeCard() {
    const now = new Date();
    const hour = now.getHours();

    let greeting = "";
    let message = ""
    let image1;
    
   if (hour >= 5 && hour < 12) {
    image1='/assets/sample2.jpg';
    greeting = "Good Morning";
    message = "Every invoice you send is a step closer to your goals. Start strong—today is your profit day.";
  } else if (hour >= 12 && hour < 17) {
    image1='/assets/sample2.jpg';
    greeting = "Good Afternoon";
    message = "Keep pushing—each task checked off brings more clarity and cash flow.";
  } else if (hour >= 17 && hour < 21) {
    image1='/assets/sample2.jpg';
    greeting = "Good Evening";
    message = "Greatness isn’t about when you start—it's about finishing with intent.";
  } else if (hour >= 21 || hour < 0) {
    image1='/assets/sample2.jpg';
    greeting = "Good Night";
    message = "Late-night focus is the entrepreneur’s secret weapon.";
  } else {
    image1='/assets/sample2.jpg';
    greeting = "Hello";
    message = "Working in silence while the world sleeps—this is what future legends do.";
  }

  return (
    <Card className="w-full p-0 overflow-hidden md:h-[30vh] lg:h-full rounded-lg relative ">
      <img src={image1} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center h-full bg-black/70" />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center flex flex-col gap-5 space-y-1">
          <p className="text-xl">{greeting}, Demo</p>
          <p className="text-md px-4">{message}</p>
        </div>
      </div>
    </Card>
  )
}

export default WelcomeCard