import { ReactNode } from "react";
import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";

interface Props {
  activePath: string;
  pages: string[];
  children: ReactNode;
}

const SwipeNavigator = ({ activePath, pages, children }: Props) => {
  const navigate = useNavigate();

  const idx = pages.indexOf(activePath);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (idx < pages.length - 1) navigate(pages[idx + 1]);
    },
    onSwipedRight: () => {
      if (idx > 0) navigate(pages[idx - 1]);
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
    delta: 50,
  });

  return (
    <div {...handlers} className="w-full h-full overflow-y-auto">
      {children}
    </div>
  );
};

export default SwipeNavigator;
