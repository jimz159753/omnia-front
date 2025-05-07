import { ProfileCard } from "../ProfileCard";
import ListSection from "../ListSection";
import { IMenuItem, IUserInfo } from "../../constants";
import { StyledGrid } from "./SideBar.styles";

interface SideBarProps {
  userInfo: IUserInfo;
  items: IMenuItem[];
}

const SideBar = ({ items, userInfo }: SideBarProps) => {
  const { name, email, imgSrc } = userInfo;
  return (
    <StyledGrid size={2}>
      <ProfileCard name={name} imgSrc={imgSrc} email={email} />
      <ListSection items={items} />
    </StyledGrid>
  );
};

export default SideBar;
