import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", props.className)}
      {...props}
    >
      <path
        d="M25 12.5H87.5V50C87.5 63.8071 76.3071 75 62.5 75H50L25 93.75V75H25C18.3696 75 12.5 69.1304 12.5 62.5V25C12.5 18.3696 18.3696 12.5 25 12.5Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M25 12.5H87.5V50C87.5 63.8071 76.3071 75 62.5 75H50L25 93.75V75H25C18.3696 75 12.5 69.1304 12.5 62.5V25C12.5 18.3696 18.3696 12.5 25 12.5Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37.5 37.5H62.5"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37.5 50H50"
        stroke="currentColor"
        strokeOpacity="0.8"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
