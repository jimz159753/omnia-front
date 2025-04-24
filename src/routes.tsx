import { useContext } from "react";
import { TabContext } from "./app/page";
import Clients from "./Pages/Clients";
import { TabNames } from "./components/constants";

export const Routes = () => {
  const { activeTab } = useContext(TabContext);

  switch (activeTab) {
    case TabNames.Clients:
      return <Clients />;
    case TabNames.Events:
      return <div>Events</div>;
    case TabNames.Analytics:
      return <div>Analytics</div>;
    case TabNames.Vouchers:
      return <div>Vouchers</div>;
    case TabNames.Discounts:
      return <div>Discounts</div>;
    default:
      return <div>Not found</div>;
  }
};
