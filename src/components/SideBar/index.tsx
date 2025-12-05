import ListSection from "../ListSection";
import { IMenuItem } from "@/constants";

interface SideBarProps {
  items: IMenuItem[];
}

const SideBar = ({ items }: SideBarProps) => {
  return (
    <div className="w-32 bg-white shadow-lg h-screen sticky top-0 flex flex-col items-center gap-4 mt-16">
      <button className="bg-brand-500 text-white px-4 py-2 rounded-md font-bold text-2xl w-12 h-12 flex items-center justify-center">
        +
      </button>
      <ListSection items={items} />
    </div>
  );
};

export default SideBar;
