import { LazyLoadComponent } from "react-lazy-load-image-component";
import { useThumbnail } from "react-iiif-vault";

export function LazyCanvasThumbnail() {
  const thumbnail = useThumbnail({ height: 120, width: 120 }, false);
  // const ref = useRef<HTMLDivElement>(null);
  // Save this for later.
  // useLayoutEffect(() => {
  //   if (ref.current) {
  //     const rect = ref.current.getBoundingClientRect();
  //     console.log("LazyCanvasThumbnail", { width: rect.width, height: rect.height });
  //   }
  // }, []);

  return (
    <LazyLoadComponent>
      <img src={thumbnail?.id} alt="" />
    </LazyLoadComponent>
  );
}
