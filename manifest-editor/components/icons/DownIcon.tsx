export const DownIcon: React.FC<{
         rotate?: number;
       }> = ({ rotate = 0 }) => (
         <svg
           version="1.2"
           xmlns="http://www.w3.org/2000/svg"
           overflow="visible"
           preserveAspectRatio="none"
           viewBox="0 0 24 24"
           width="20"
           height="20"
         >
           <g>
             <path
               d="M7 10l5 5 5-5z"
               style={{ fill: "rgba(0, 0, 0, 0.6)", transform: `rotate(${rotate}deg)` }}
               vectorEffect="non-scaling-stroke"
             />
           </g>
         </svg>
       );
