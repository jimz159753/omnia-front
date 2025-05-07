"use client";
import { getToken } from "@/api/services";
import { Box, Button, FormControl, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { push } = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // console.log(email, password);
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const values = Object.fromEntries(data.entries());
    const token = await getToken(values.email as string, values.password as string);
    console.log('token', token);
    localStorage.setItem('token', token);
    push('/dashboard');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <FormControl component="form" onSubmit={handleSubmit}>
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
        <Button type="submit">Login</Button>
      </FormControl>
    </Box>
  );
};

export default Login;
