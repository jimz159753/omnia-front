"use client";
import React from "react";
import { useTheme } from "@mui/material";
import CardValue from "../ui/CardValue";
import { values } from "@/constants";
import { getValuesStyles } from "./Values.styles";
import { useSafeMediaQuery } from "@/hooks/useMediaQuery";

const Values = () => {
  const theme = useTheme();
  const { mounted, isMatch: isMobile } = useSafeMediaQuery(
    theme.breakpoints.down("md")
  );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "60px",
          justifyContent: "center",
          alignItems: "center",
          padding: "100px 20px",
          backgroundColor: "#fafafa",
        }}
      >
        {values.map((value) => (
          <CardValue
            key={value.id}
            title={value.title}
            image={value.image}
            description={value.description}
            styles={getValuesStyles(theme, false)}
          />
        ))}
      </section>
    );
  }

  const styles = getValuesStyles(theme, isMobile);

  return (
    <section style={styles.container}>
      {values.map((value) => (
        <CardValue
          key={value.id}
          title={value.title}
          image={value.image}
          description={value.description}
          styles={styles}
        />
      ))}
    </section>
  );
};

export default Values;
