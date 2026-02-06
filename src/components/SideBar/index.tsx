import ListSection from "../ListSection";
import { IMenuItem } from "@/constants";
import { FiPlus } from "react-icons/fi";
import { Dispatch, SetStateAction } from "react";

interface SideBarProps {
  items: IMenuItem[];
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const SideBar = ({ items, setIsDialogOpen }: SideBarProps) => {
  return (
    <div className="w-28 bg-omnia-light h-screen sticky top-0 flex flex-col items-center gap-6 pt-6 border-r border-omnia-navy/10 shadow-xl">
      {/* Add Button */}
      <button
        onClick={() => setIsDialogOpen((prev) => !prev)}
        className="group relative bg-omnia-blue text-white rounded-xl font-bold text-2xl w-12 h-12 flex items-center justify-center hover:bg-omnia-blue/90 transition-all duration-300 shadow-lg shadow-omnia-blue/30 hover:shadow-omnia-blue/50 hover:scale-105"
      >
        <FiPlus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
      
      {/* Divider */}
      <div className="w-12 h-px bg-omnia-navy/10" />
      
      {/* Navigation Items */}
      <ListSection items={items} />
    </div>
  );
};

export default SideBar;
