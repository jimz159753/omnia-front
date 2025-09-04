import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Space from "@/components/Space";
import Footer from "@/components/Footer";
import Values from "@/components/Values";

export const metadata = {
  title: "Omnia",
  description: "Omnia",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Values />
      <Services />
      <Space />
      <About />
      <Footer />
    </>
  );
}
