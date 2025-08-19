import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export const metadata = {
  title: "Omnia",
  description: "Omnia",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  );
}
