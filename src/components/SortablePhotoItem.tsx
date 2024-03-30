import { useSortable } from "@dnd-kit/sortable";
import { HTMLAttributes } from "react";
import PhotoItem from "./PhotoItem";

type Thumb = {
  id: string;
  url: string;
};

type Props = {
  item: Thumb;
  onClick?: () => void;
} & HTMLAttributes<HTMLDivElement>;

const SortablePhotoItem = ({ item, onClick, ...props }: Props) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
  });

  const styles = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: transition || undefined,
  };

  return (
    <PhotoItem
      item={item}
      ref={setNodeRef}
      isDragging={isDragging}
      onClick={onClick}
      style={styles}
      {...props}
      {...attributes}
      {...listeners}
    />
  );
};

export default SortablePhotoItem;
