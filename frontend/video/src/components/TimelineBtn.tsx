import FrwdIcon from "../assets/icons/forward-solid.svg";
import BackIcon from "../assets/icons/rewind-solid.svg";

type Direction = "back" | "forward" ;

interface TimelineBtn {
  direction: Direction;
}

// Function to make the media forward or backwards 
export default function TimelineBtn({direction}: TimelineBtn) {
  const isBack = direction === "back";
  const icon = isBack ? BackIcon : FrwdIcon;
  const iconPosition = isBack ? "-translate-x-px" : "translate-x-px";

  return (
    <button 
      className="flex h-12 w-20 items-center justify-center rounded-xl bg-white shadow-xl border-2 border-btn-border"
      type="button"
    >
      <img className={` ${iconPosition}`} src={icon} alt="" aria-hidden="true"/>
    </button>
  );
}
