import Hero from "@/app/(root)/Hero";
import Services from "@/app/(root)/Services";
import About from "@/app/(root)/About";
import Space from "@/app/(root)/Space";
import Values from "@/app/(root)/Values";
import Calendar from "@/components/Calendar";

export default function Home() {
  return (
    <>
      <Hero />
      <Values />
      <Services />
      <Space />
      <About />
      <Calendar />
    </>
  );
}
