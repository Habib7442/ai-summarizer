import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

interface DashboardCard {
  title: string;
  description: string;
  link: string;
  color: string;
}

const CustomDashboardCard = ({
  title,
  description,
  link,
  color,
}: DashboardCard) => {
  return (
    <Card
      className={`w-[300px] h-[210px] shadow-lg rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105`}
      style={{backgroundColor: `${color}`}}
    >
      <CardHeader className="bg-opacity-75 p-4 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4">
        <Link href={link}>
          <Button
            variant="outline"
            className="w-full border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
          >
            Explore
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CustomDashboardCard;
