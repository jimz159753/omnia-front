import { ProfileCard } from "../ProfileCard";
import ListSection from "../ListSection";
import { IMenuItem, IUserInfo } from "@/constants";

interface SideBarProps {
  userInfo: IUserInfo;
  items: IMenuItem[];
}

const SideBar = ({ items, userInfo }: SideBarProps) => {
  const { name, email, imgSrc } = userInfo;
  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
      <ProfileCard name={name} imgSrc={imgSrc} email={email} />
      <ListSection items={items} />
    </div>
  );
};

export default SideBar;
