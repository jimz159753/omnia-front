import Image from "next/image";
interface CustomAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export const CustomAvatar = ({ src, alt, className }: CustomAvatarProps) => (
  <Image alt={alt} src={src} className={className} width={100} height={100} />
);
