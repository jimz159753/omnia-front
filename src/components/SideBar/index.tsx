import ListSection from "../ListSection";
import { IMenuItem } from "@/constants";
import { Dispatch, SetStateAction } from "react";

interface SideBarProps {
  items: IMenuItem[];
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const SideBar = ({ items, setIsDialogOpen }: SideBarProps) => {
  return (
    <div className="w-32 bg-white shadow-lg h-screen sticky top-0 flex flex-col items-center gap-4 pt-16">
      <button
        onClick={() => setIsDialogOpen((prev) => !prev)}
        className="bg-brand-500 text-white px-4 py-2 rounded-md font-bold text-2xl w-12 h-12 flex items-center justify-center hover:bg-brand-600 transition-colors"
      >
        +
      </button>
      <ListSection items={items} />
    </div>
  );
};

export default SideBar;
