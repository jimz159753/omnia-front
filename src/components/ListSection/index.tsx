import React from "react";
import ItemSection from "./ItemSection";
import { IMenuItem } from "@/constants";

interface ListSectionProps {
  items: IMenuItem[];
}

const ListSection = ({ items }: ListSectionProps) => {
  return (
    <ul className="flex-1">
      {items.map((item, index) => (
        <ItemSection key={index} icon={item.icon} title={item.title} />
      ))}
    </ul>
  );
};

export default ListSection;
