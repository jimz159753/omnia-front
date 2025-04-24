import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { StyledGrid } from "./Header.styles";

const Header = () => (
  <StyledGrid>
    <Image src={OmniaTitle} alt="Omnia" height={40} />
  </StyledGrid>
);

export default Header;
