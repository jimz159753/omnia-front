import { Box, Typography } from "@mui/material";
import React from "react";
import { CustomAvatar } from "../ui/CustomAvatar";

interface ProfileCardProps {
  imgSrc: string;
    name: string;
    email: string;
}

export const ProfileCard = ({imgSrc, name, email}: ProfileCardProps) => {
  return (
    <Box sx={{ display: "flex", padding: '20px', gap: '20px' }}>
      <CustomAvatar
        src={imgSrc}
        alt="Omnia"
        sx={{ width: 60, height: 60 }}
      />
      <Box width='100%'>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{name}</Typography>
        <Typography variant="body2" sx={{ color: 'gray' }}>{email}</Typography>
      </Box>
    </Box>
  );
};
