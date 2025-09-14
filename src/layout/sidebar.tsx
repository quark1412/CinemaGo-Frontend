"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [activeLink, setActiveLink] = useState<string>("dashboard");
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const links = [
    {
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          height={20}
          width={20}
        >
          <path
            fill={activeLink === "dashboard" ? "#fff" : "#000"}
            d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"
          />
        </svg>
      ),
      href: "/",
    },
    {
      label: "Movies",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={20}
          width={20}
          viewBox="0 0 640 640"
        >
          <path
            fill={activeLink === "theaters" ? "#fff" : "#000"}
            d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM144 432L144 464C144 472.8 151.2 480 160 480L192 480C200.8 480 208 472.8 208 464L208 432C208 423.2 200.8 416 192 416L160 416C151.2 416 144 423.2 144 432zM448 416C439.2 416 432 423.2 432 432L432 464C432 472.8 439.2 480 448 480L480 480C488.8 480 496 472.8 496 464L496 432C496 423.2 488.8 416 480 416L448 416zM144 304L144 336C144 344.8 151.2 352 160 352L192 352C200.8 352 208 344.8 208 336L208 304C208 295.2 200.8 288 192 288L160 288C151.2 288 144 295.2 144 304zM448 288C439.2 288 432 295.2 432 304L432 336C432 344.8 439.2 352 448 352L480 352C488.8 352 496 344.8 496 336L496 304C496 295.2 488.8 288 480 288L448 288zM144 176L144 208C144 216.8 151.2 224 160 224L192 224C200.8 224 208 216.8 208 208L208 176C208 167.2 200.8 160 192 160L160 160C151.2 160 144 167.2 144 176zM448 160C439.2 160 432 167.2 432 176L432 208C432 216.8 439.2 224 448 224L480 224C488.8 224 496 216.8 496 208L496 176C496 167.2 488.8 160 480 160L448 160z"
          />
        </svg>
      ),
      href: "/movies",
    },
    {
      label: "Theaters",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
          height={20}
          width={20}
        >
          <path
            fill={activeLink === "theaters" ? "#fff" : "#000"}
            d="M-5 118L23.5 279.7c14 79.5 76.3 141.8 155.8 155.8l12.7 2.2c-16.5-28.6-27.1-60.7-30.6-94.5l-24.1 4.3c-9.7 1.7-18.8-5.8-16.9-15.5 4.8-24.7 19.1-46.6 39.7-60.9l0-74.6c-1.4 .8-3 1.3-4.7 1.6l-63 11.1c-8.7 1.5-17.3-4.4-15.9-13.1 3.1-19.6 18.4-36 39.1-39.7 17.2-3 33.9 3.5 44.6 15.8l0-22.7c0-22.5 6.9-52.4 32.3-73.4 26-21.5 67.7-43.9 124.9-54.2-30.5-16.3-86.3-32-163.8-18.4-80.3 14.2-128 50.1-150.1 76.1-9 10.5-10.8 24.9-8.4 38.5zM208 138.7l0 174.8c0 80.7 50.5 152.9 126.4 180.4L362.1 504c14.1 5.1 29.6 5.1 43.7 0L433.6 494C509.5 466.4 560 394.3 560 313.5l0-174.8c0-6.9-2.1-13.8-7-18.6-22.6-22.5-78.2-56-169-56s-146.4 33.6-169 56c-4.9 4.9-7 11.7-7 18.6zm66.1 187.1c-1.4-7 7-11 12.7-6.6 26.9 20.6 60.6 32.9 97.2 32.9s70.2-12.3 97.2-32.9c5.7-4.4 14.1-.4 12.7 6.6-10.1 51.4-55.5 90.3-109.9 90.3s-99.8-38.8-109.9-90.3zm.5-101.5C281.2 205.5 299 192 320 192s38.9 13.5 45.4 32.3c2.9 8.4-4.5 15.7-13.4 15.7l-64 0c-8.8 0-16.3-7.4-13.4-15.7zM480 240l-64 0c-8.8 0-16.3-7.4-13.4-15.7 6.5-18.8 24.4-32.3 45.4-32.3s38.9 13.5 45.4 32.3c2.9 8.4-4.5 15.7-13.4 15.7z"
          />
        </svg>
      ),
      href: "/theaters",
    },
    {
      label: "Showtimes",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          height={20}
          width={20}
          className=""
        >
          <path
            fill={activeLink === "showtimes" ? "#fff" : "#000"}
            d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"
          />
        </svg>
      ),
      href: "/showtimes",
    },
  ];
  return (
    <div
      className={`h-screen bg-white p-6 flex flex-col gap-10 transition-all duration-300 ${
        isOpen ? "w-auto min-w-52" : "w-16"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 -ml-1">
          <Image src="/logo.svg" alt="logo" width={60} height={60} />
        </div>
        {isOpen && <p className="text-2xl font-bold font-mono">Cinemago</p>}
      </div>
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.label}
            className={`flex items-center gap-2 p-4 rounded-md ${
              isOpen ? "w-auto" : "w-12 h-12 justify-center"
            } ${
              activeLink === link.label.toLowerCase()
                ? "bg-[#6f1fff]"
                : "hover:bg-[#6f1fff]/15"
            }`}
            onClick={() => setActiveLink(link.label.toLowerCase())}
          >
            <div className="flex-shrink-0">{link.icon}</div>
            {isOpen && (
              <p
                className={`text-sm font-mono font-medium ${
                  activeLink === link.label.toLowerCase()
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {link.label}
              </p>
            )}
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Image src="/logo.svg" alt="logo" width={20} height={20} />
        <div
          className="cursor-pointer hover:bg-[#6f1fff]/15 p-4 rounded-full transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            viewBox="6 6 24 24"
            fill="currentColor"
            width="20"
            height="20"
            aria-hidden="true"
            overflow="visible"
          >
            <path d="M10 13.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75zM10 16.25a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75zM10.75 18.5a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-2z"></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 8a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V11a3 3 0 0 0-3-3H9zm6 3a.5.5 0 0 0-.5-.5H9a.5.5 0 0 0-.5.5v14a.5.5 0 0 0 .5.5h5.5a.5.5 0 0 0 .5-.5V11zm3-.5a.5.5 0 0 0-.5.5v14a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V11a.5.5 0 0 0-.5-.5h-9z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
