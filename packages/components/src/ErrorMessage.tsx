import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ErrorMessageProps {
  children: React.ReactNode;
  small?: boolean;
  className?: string;
}

// export const ErrorMessage = styled.div<{ $small?: boolean }>`
//   border: 2px solid ${(props: any) => props.theme.color.danger || "red"};
//   width: 100%;
//   border-radius: 5px;
//   padding: ${(props: any) => props.theme.padding.small || "0.5rem"}
//     ${(props: any) => props.theme.padding.medium || "1rem"};
//   line-height: 1.9em;
//   display: flex;
//   align-items: center;
//   a {
//     color: ${(props: any) => props.theme.color.white || "white"};
//   }
//   ${(props) =>
//     props.$small &&
//     css`
//       font-size: 0.75em;
//       white-space: nowrap;
//       padding: ${props.theme.padding.xs || "0.25rem"} ${props.theme.padding.small || "0.5rem"};
//       line-height: 1.6em;
//       width: fit-content;
//     `}
// `;

export function ErrorMessage({ children, small = false, className }: ErrorMessageProps) {
  return (
    <div
      className={
        twMerge(
          'bg-red-500 text-white',
          'border-1 drop-shadow border-red-700 w-full rounded-md py-2 px-4 leading-[1.9em] flex items-center',
          'has-[a]:text-white',
          small && 'text-xs whitespace-nowrap py-1 px-2 leading-[1.6em] w-fit',
          className
        )
      }
    >
      {children}
    </div >
  );
};
