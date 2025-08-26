"use client";
import Image from "next/image";
import OmniaTitle from "@/assets/images/omnia_title.png";
import { StyledGrid } from "./Header.styles";
import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <StyledGrid>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Image src={OmniaTitle} alt="Omnia" height={40} />

        {user && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Welcome, {user.email}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                borderColor: "#000",
                color: "#000",
                "&:hover": {
                  borderColor: "#000",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>
    </StyledGrid>
  );
};

export default Header;
