import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";

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
      <Services />
      <About />
    </div>
  );
}
