import HomePage from "@/components/HomePage";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Hero from "@/components/home/Hero";


export default function Home() {
  return (
    <div>
      <Navbar />
       <Hero />
      <HomePage />
    </div>
  );
}
