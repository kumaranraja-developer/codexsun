import Announcement from "../../../resources/components/advertisment/Announcement";
import Chart from "../../../resources/components/chart/bar-chart";
import { NetIncomeChart } from "../../../resources/components/chart/NetProfitChart";
import AnalticsCard from "./AnalticsCard";
import WelcomeCard from "./WelcomeCard";
function Dashboard() {
  const chartData = [
    { month: "January", year: 2024, received: 180, payable: 90 },
    { month: "February", year: 2024, received: 200, payable: 110 },
    { month: "March", year: 2024, received: 170, payable: 95 },
    { month: "April", year: 2024, received: 220, payable: 100 },
    { month: "May", year: 2024, received: 240, payable: 130 },
    { month: "June", year: 2024, received: 210, payable: 120 },
    { month: "July", year: 2024, received: 250, payable: 140 },
    { month: "August", year: 2024, received: 260, payable: 150 },
    { month: "September", year: 2024, received: 230, payable: 110 },
    { month: "October", year: 2024, received: 280, payable: 160 },
    { month: "November", year: 2024, received: 290, payable: 170 },
    { month: "December", year: 2024, received: 300, payable: 180 },

    // 2025 (Jan - June)
    { month: "January", year: 2025, received: 186, payable: 80 },
    { month: "February", year: 2025, received: 305, payable: 200 },
    { month: "March", year: 2025, received: 73, payable: 190 },
    { month: "April", year: 2025, received: 209, payable: 130 },
    { month: "May", year: 2025, received: 214, payable: 140 },
    { month: "June", year: 2025, received: 400, payable: 200 },
  ];

  const chartConfig = {
    received: {
      label: "received",
      color: "#3b82f6", // resolved Tailwind color (blue-500)
    },
    payable: {
      label: "payable",
      color: "#ec4899", // resolved Tailwind color (pink-500)
    },
  };

  const NetIncomeDate = [
    { month: "January", value: 186 },
    { month: "February", value: 205 },
    { month: "March", value: -207 },
    { month: "April", value: 173 },
    { month: "May", value: -209 },
    { month: "June", value: 214 },
  ];
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3 h-max-[350px] overflow-hidden">
        <WelcomeCard />
        <Chart
          data={chartData}
          config={chartConfig}
          title="Cash Flow"
          description="Tracks all business expenditures."
        />

        <NetIncomeChart
          title="Net Income"
          description="Jan - Jun 2024"
          data={NetIncomeDate}
          dataKey="value"
          labelKey="month"
          footerInfo="Summarized visitor flow for last 6 months"
          trend="Up by 5.2%"
        />
      </div>
      <div>
        <AnalticsCard />
      </div>
      <Announcement
        id="update-june-2025"
        title="🚀 New Dashboard Launched!"
        description="We’ve introduced major improvements and features. Check it out now!"
      />
    </div>
  );
}

export default Dashboard;
