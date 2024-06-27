import { useState } from "react";
import { CreatorGrid, CreatorGridItem } from "../src/CreatorGrid";

export const exampleCreatorGrid = () => {
  const [selected, setSelected] = useState<any>(null);

  if (selected) {
    return (
      <div>
        <div>Selected: {selected.id}</div>
        <div onClick={() => setSelected(null)}>Clear</div>
      </div>
    );
  }

  return (
    <CreatorGrid
      label="grid"
      items={[
        {
          id: "1",
          title: "Title 1",
          description: "Description 1",
          icon: "Icon 1",
          onClick: () => setSelected({ id: "1" }),
        },
        {
          id: "2",
          title: "Title 2",
          description: "Description 2",
          icon: "Icon 2",
          onClick: () => setSelected({ id: "2" }),
        },
        {
          id: "3",
          title: "Title 3",
          description: "Description 3",
          icon: "Icon 3",
          onClick: () => setSelected({ id: "3" }),
        },
        {
          id: "4",
          title: "Title 4",
          description: "Description 4",
          icon: "Icon 4",
          onClick: () => setSelected({ id: "4" }),
        },
        {
          id: "5",
          title: "Title 5",
          description: "Description 5",
          icon: "Icon 5",
          onClick: () => setSelected({ id: "5" }),
        },
        {
          id: "6",
          title: "Title 6",
          description: "Description 6",
          icon: "Icon 6",
          onClick: () => setSelected({ id: "6" }),
        },
        {
          id: "7",
          title: "Title 7",
          description: "Description 7",
          icon: "Icon 7",
          onClick: () => setSelected({ id: "7" }),
        },
        {
          id: "8",
          title: "Title 8",
          description: "Description 8",
          icon: "Icon 8",
          onClick: () => setSelected({ id: "8" }),
        },
        {
          id: "9",
          title: "Title 9",
          description: "Description 9",
          icon: "Icon 9",
          onClick: () => setSelected({ id: "9" }),
        },
      ]}
    />
  );
};
