import { useContext } from "react";
import Clients from "./clients";
import Events from "./events";
import Analytics from "./analytics";
import Vouchers from "./vouchers";
import Discounts from "./discounts";
import { TabContext } from "./layout";
import { TabNames } from "@/constants";
export const Routes = () => {
  const { activeTab } = useContext(TabContext);

  switch (activeTab) {
    case TabNames.Clients:
      return <Clients />;
    case TabNames.Events:
      return <Events />;
    case TabNames.Analytics:
      return <Analytics />;
    case TabNames.Vouchers:
      return <Vouchers />;
    case TabNames.Discounts:
      return <Discounts />;
    default:
      return <div>Not found</div>;
  }
};
