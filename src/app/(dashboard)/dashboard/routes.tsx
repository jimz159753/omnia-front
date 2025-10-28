import { useContext } from "react";
import Sales from "./sales";
import Events from "./events";
import Analytics from "./analytics";
import Vouchers from "./vouchers";
import Discounts from "./discounts";
import { TabContext } from "@/contexts/TabContext";
import { TabNames } from "@/constants";

export const Routes = () => {
  const { activeTab } = useContext(TabContext);

  switch (activeTab) {
    case TabNames.Analytics:
      return <Analytics />;
    case TabNames.Sales:
      return <Sales />;
    case TabNames.Events:
      return <Events />;
    case TabNames.Vouchers:
      return <Vouchers />;
    case TabNames.Discounts:
      return <Discounts />;
    default:
      return <div>Not found</div>;
  }
};
