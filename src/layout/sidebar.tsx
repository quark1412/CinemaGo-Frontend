"use client";

import { PROJECT_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const links = [
    {
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={20}
          width={20}
          viewBox="0 0 640 640"
        >
          <path
            className={
              isLinkActive("/")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
            d="M544.4 304L368.4 304C350.7 304 336.4 289.7 336.4 272L336.4 96C336.4 78.3 350.8 63.8 368.3 66.1C475.3 80.3 560.1 165.1 574.3 272.1C576.6 289.6 562.1 304 544.4 304zM254.6 101.2C272.7 97.4 288.4 112.2 288.4 130.7L288.4 328C288.4 333.6 290.4 339 293.9 343.3L426 502.7C437.7 516.8 435.2 538.1 419.1 546.8C385 565.4 345.9 576 304.4 576C171.9 576 64.4 468.5 64.4 336C64.4 220.5 145.9 124.1 254.6 101.2zM509.8 352L573.8 352C592.3 352 607.1 367.7 603.3 385.8C593.1 434.2 568.3 477.2 533.7 510C521.4 521.7 502.1 519.2 491.3 506.1L406.9 404.4C389.6 383.5 404.5 352 431.5 352L509.7 352z"
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
            className={
              isLinkActive("/movies")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
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
            className={
              isLinkActive("/theaters")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
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
        >
          <path
            className={
              isLinkActive("/showtimes")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
            d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"
          />
        </svg>
      ),
      href: "/showtimes",
    },
    {
      label: "Users",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={20}
          width={20}
          viewBox="0 0 640 640"
        >
          <path
            className={
              isLinkActive("/users")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
            d="M320 80C377.4 80 424 126.6 424 184C424 241.4 377.4 288 320 288C262.6 288 216 241.4 216 184C216 126.6 262.6 80 320 80zM96 152C135.8 152 168 184.2 168 224C168 263.8 135.8 296 96 296C56.2 296 24 263.8 24 224C24 184.2 56.2 152 96 152zM0 480C0 409.3 57.3 352 128 352C140.8 352 153.2 353.9 164.9 357.4C132 394.2 112 442.8 112 496L112 512C112 523.4 114.4 534.2 118.7 544L32 544C14.3 544 0 529.7 0 512L0 480zM521.3 544C525.6 534.2 528 523.4 528 512L528 496C528 442.8 508 394.2 475.1 357.4C486.8 353.9 499.2 352 512 352C582.7 352 640 409.3 640 480L640 512C640 529.7 625.7 544 608 544L521.3 544zM472 224C472 184.2 504.2 152 544 152C583.8 152 616 184.2 616 224C616 263.8 583.8 296 544 296C504.2 296 472 263.8 472 224zM160 496C160 407.6 231.6 336 320 336C408.4 336 480 407.6 480 496L480 512C480 529.7 465.7 544 448 544L192 544C174.3 544 160 529.7 160 512L160 496z"
          />
        </svg>
      ),
      href: "/users",
    },
    {
      label: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={20}
          width={20}
          viewBox="0 0 640 640"
        >
          <path
            className={
              isLinkActive("/settings")
                ? "fill-sidebar-primary-foreground"
                : "fill-sidebar-foreground"
            }
            d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"
          />
        </svg>
      ),
      href: "/settings",
    },
  ];
  return (
    <div
      className={`h-screen bg-sidebar border-r border-sidebar-border p-6 flex flex-col justify-between transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 -ml-1">
            <Image src="/logo.svg" alt="logo" width={60} height={60} />
          </div>
          <p
            className={`text-2xl font-bold text-sidebar-foreground transition-opacity duration-300 whitespace-nowrap ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {PROJECT_NAME}
          </p>
        </div>
        <div className="flex flex-col gap-1 transition-all duration-300 ease-in-out">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.label}
              className={`flex items-center gap-2 p-4 rounded-md ${
                isOpen ? "w-auto" : "w-12 h-12 justify-center"
              } ${
                isLinkActive(link.href)
                  ? "bg-sidebar-primary"
                  : "hover:bg-sidebar-accent"
              }`}
            >
              <div className="flex-shrink-0">{link.icon}</div>
              <p
                className={`text-sm font-medium transition-opacity duration-300 whitespace-nowrap ${
                  isOpen ? "opacity-100" : "opacity-0"
                } ${
                  isLinkActive(link.href)
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                }`}
              >
                {link.label}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <div
        className={`flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
          isOpen ? "flex-row w-auto" : "flex-col w-12 h-12"
        }`}
      >
        <Image src="/logo.svg" alt="logo" width={20} height={20} />
        <div
          className="cursor-pointer hover:bg-sidebar-accent p-4 rounded-full transition-all duration-300"
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
