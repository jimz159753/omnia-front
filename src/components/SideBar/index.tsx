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
    <div className="w-32 bg-white h-screen sticky top-0 flex flex-col items-center gap-4 pt-11">
      <button
        onClick={() => setIsDialogOpen((prev) => !prev)}
        className="bg-brand-500 text-white rounded-md font-bold text-2xl w-12 h-12 flex items-center justify-center hover:bg-brand-600 transition-colors"
      >
        <FiPlus className="w-6 h-6" />
      </button>
      <ListSection items={items} />
    </div>
  );
};

export default SideBar;
