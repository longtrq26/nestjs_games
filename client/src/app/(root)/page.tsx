import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gamepad2, Grid3X3 } from "lucide-react";
import Link from "next/link";
import React from "react";

const games = [
  {
    title: "Tic Tac Toe",
    description:
      "Play the classic paper-and-pencil game against a friend. Simple yet endlessly engaging.",
    href: "/tic-tac-toe",
    icon: (
      <Grid3X3 className="h-8 w-8 text-gray-500 group-hover:text-black transition-colors duration-300" />
    ),
  },
  {
    title: "Line 98",
    description:
      "Strategize to arrange balls of the same color into lines and score big points.",
    href: "/line98",
    icon: (
      <Gamepad2 className="h-8 w-8 text-gray-500 group-hover:text-black transition-colors duration-300" />
    ),
  },
];

const HomePage = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gradient-to-br py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Welcome to Your Game Hub!
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Dive into a collection of classic games. Challenge yourself or enjoy
          with friends!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-5xl px-2">
        {games.map((game) => (
          <Link key={game.href} href={game.href} passHref>
            <Card className="group flex flex-col h-full border border-gray-200 rounded-xl shadow-md transition-transform duration-300 hover:shadow-xl hover:scale-[1.03] cursor-pointer">
              <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-black">
                  {game.title}
                </CardTitle>
                {game.icon}
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-0">
                <CardDescription className="text-md text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                  {game.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-20 text-gray-500 text-center">
        <p className="italic">More exciting games are on their way</p>
      </div>
    </div>
  );
};

export default HomePage;
