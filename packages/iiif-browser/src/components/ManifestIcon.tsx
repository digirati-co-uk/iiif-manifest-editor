import { useThumbnail } from "react-iiif-vault";

export function ManifestIcon() {
  const thumbnail = useThumbnail({ width: 256, height: 256 }, false);

  if (thumbnail) {
    return <img src={thumbnail.id} alt="" />;
  }

  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g id="Artboard-Copy-5" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <rect id="Rectangle" x="0" y="0" width="24" height="24"></rect>
        <g id="Group" transform="translate(6.000000, 4.000000)">
          <rect id="Rectangle" fill="#717171" x="2" y="7" width="8" height="6"></rect>
          <path
            d="M2.98125,11.8125 L9.01875,11.8125 L9.01875,10.6875 L2.98125,10.6875 L2.98125,11.8125 Z M2.98125,8.625 L9.01875,8.625 L9.01875,7.5 L2.98125,7.5 L2.98125,8.625 Z M1.125,15 C0.825,15 0.5625,14.8875 0.3375,14.6625 C0.1125,14.4375 0,14.175 0,13.875 L0,1.125 C0,0.825 0.1125,0.5625 0.3375,0.3375 C0.5625,0.1125 0.825,0 1.125,0 L7.89375,0 L12,4.10625 L12,13.875 C12,14.175 11.8875,14.4375 11.6625,14.6625 C11.4375,14.8875 11.175,15 10.875,15 L1.125,15 Z M7.33125,4.6125 L10.875,4.6125 L7.33125,1.125 L7.33125,4.6125 Z"
            id="Shape"
            fill="#AAAAAA"
            fillRule="nonzero"
          ></path>
        </g>
      </g>
    </svg>
  );
}
