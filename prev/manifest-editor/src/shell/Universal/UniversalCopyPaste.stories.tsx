import { useEffect } from "react";

export default { title: "Universal copy paste" };

export const Example = () => {
  return (
    <button
      onClick={() => {
        navigator.clipboard.read().then(async (r) => {
          console.log(r);
          for (const item of r) {
            for (const type of item.types) {
              console.log(type);
              const resource = await item.getType(type);
              console.log(resource);
              console.log(await resource.text());
            }
          }
        });
      }}
    >
      read
    </button>
  );
};
