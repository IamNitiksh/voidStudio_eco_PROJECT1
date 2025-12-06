import { useRating } from "6pp";
import { FaRegStar, FaStar } from "react-icons/fa6";

const RatingsComponent = ({ value = 0 }: { value: number }) => {
  const { Ratings } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value,
    // Custom styles passed to the hook:
    styles: {
      fontSize: "1.75rem",
      color: "coral",
      justifyContent: "flex-start",
      gap: "1px",
    },
  });

  return (
    <div className="flex items-center">
        <Ratings />
    </div>
  );
};

export default RatingsComponent;