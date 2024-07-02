import CustomDashboardCard from "@/components/CustomDashboardCard";

const cards = [
  {
    title: "Article Summarizer",
    description: "Summarize Your article using the power of AI",
    link: "/summarize",
    color: "#f9dcc4",
  },
  {
    title: "Article Extractor",
    description: "Extract Your article using the power of AI",
    link: "/extractor",
    color: "#fec89a",
  },
];

const Dashboard = () => {
  return (
    <div className="w-full bg-[#353935] p-2 rounded-lg mx-auto my-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <CustomDashboardCard
          key={card.title}
          title={card.title}
          description={card.description}
          link={card.link}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default Dashboard;
