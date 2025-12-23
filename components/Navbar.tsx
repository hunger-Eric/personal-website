import { NavbarCentered } from "./NavbarCenteredDesktop";
import NavbarCenteredMobile from "./NavbarCenteredMobile";

export default function Navbar() {
  return (
    <>
      <NavbarCenteredMobile />
      <NavbarCentered />
    </>
  );
}
