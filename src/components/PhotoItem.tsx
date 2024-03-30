import { CSSProperties, forwardRef, HTMLAttributes } from "react";
import { MdOutlineClose } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type Thumb = {
  id: string;
  url: string;
};

type Props = {
  onClick?: () => void;
  item: Thumb;
  style?: CSSProperties;
  isDragging?: boolean;
  ref?: React.Ref<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>;

const PhotoItem = forwardRef<HTMLDivElement, Props>(function Photo(
  { onClick, item, style, isDragging, ...props },
  ref
) {
  return (
    <div
      className={twMerge("relative", isDragging && "opacity-0")}
      style={style}
      ref={ref}
      {...props}
    >
      <img
        src={item.url}
        alt={item.id}
        className="h-32 object-cover aspect-square rounded-md"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute top-1 right-1 bg-white rounded-full p-1"
      >
        <MdOutlineClose size={16} />
      </button>
    </div>
  );
});

export default PhotoItem;
