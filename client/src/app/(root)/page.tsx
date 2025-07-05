import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Welcome to Your <span className="text-black">Game Hub!</span>
        </h1>
        <p className="text-xl text-gray-700">
          Dive into a collection of classic games. Challenge yourself or enjoy
          with friends!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <Link href="/tic-tac-toe" passHref>
          <Card className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 transform cursor-pointer group">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-black">
                Cờ Caro X O
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <CardDescription className="text-lg text-gray-600">
                Play the classic paper-and-pencil game against a friend. Simple
                yet endlessly engaging.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/line98" passHref>
          <Card className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 transform cursor-pointer group">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-3xl font-bold text-gray-900 group-hover:text-black">
                Line 98
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <CardDescription className="text-lg text-gray-600">
                Strategize to arrange balls of the same color into lines and
                score big points.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-20 text-gray-500 text-lg text-center">
        <p>More exciting games are on their way!</p>
      </div>
    </div>
  );
};

export default HomePage;
