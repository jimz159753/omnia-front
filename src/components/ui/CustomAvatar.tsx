import Image from "next/image";
interface CustomAvatarProps {
  src: string;
  alt: string;
  sx?: object;
}

export const CustomAvatar = ({ src, alt, sx }: CustomAvatarProps) => (
  <Image alt={alt} src={src} style={sx} />
);
