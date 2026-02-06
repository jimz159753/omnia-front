"use client";

import React from "react";
import ItemSection from "./ItemSection";
import { IMenuItem } from "@/constants";
import { useAuth } from "@/hooks/useAuth";

// Define menu items that are restricted for "user" role
const ADMIN_ONLY_ITEMS = ["Analytics"];

interface ListSectionProps {
  items: IMenuItem[];
}

const ListSection = ({ items }: ListSectionProps) => {
  const { user } = useAuth();
  
  // Check if user has admin role
  const isAdmin = user?.role === "admin";
  
  // Filter items based on user role
  const filteredItems = items.filter(
    (item) => isAdmin || !ADMIN_ONLY_ITEMS.includes(item.title)
  );

  return (
    <ul className="flex flex-col">
      {filteredItems.map((item, index) => (
        <ItemSection key={index} icon={item.icon} title={item.title} />
      ))}
    </ul>
  );
};

export default ListSection;
