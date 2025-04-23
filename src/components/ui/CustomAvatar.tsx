import { Avatar } from "@mui/material";

interface CustomAvatarProps {
  src: string;
  alt: string;
  sx?: object;
}

export const CustomAvatar = ({ src, alt, sx }: CustomAvatarProps) => <Avatar alt={alt} src={src} sx={sx}  />

