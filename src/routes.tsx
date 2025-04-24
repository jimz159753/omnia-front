import { useContext } from "react";
import { TabContext } from "./app/page";
import Clients from "./Pages/Clients";
import { TabNames } from "./components/constants";
import Events from "./Pages/Events";
import Analytics from "./Pages/Analytics";
import Vouchers from "./Pages/Vouchers";
import Discounts from "./Pages/Discounts";

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
