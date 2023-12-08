import React from "react";
import Link from "next/link";

const Header = () => (
  <header className="flex h-[65px] border-b-2 items-center w-full ">
    <nav className={"flex w-full mx-4 justify-between"}>
      <div>
        <p className="text-xl font-semibold">
          <Link href={"/"}> Tinker </Link>
        </p>
      </div>
    </nav>
  </header>
);

export default Header;
