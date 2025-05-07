"use client";
import { login } from "@/api/services";
import { Box, Button, FormControl, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(data.entries());
    const token = await login(values.email as string, values.password as string);
    localStorage.setItem('token', token);
    Cookies.set('token', token);
    push('/dashboard');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <FormControl component="form" onSubmit={handleSubmit} sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '300px',
        padding: 4,
      }}>
        <TextField
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button sx={{
          width: '100%',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#000',
          },
        }} type="submit">Login</Button>
      </FormControl>
    </Box>
  );
};

export default Login;
