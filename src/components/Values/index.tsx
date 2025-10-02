"use client";
import React from "react";
import { useTheme } from "@/hooks/useCustomMediaQuery";
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
        id="conocenos"
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
            styles={getValuesStyles(null, false)}
          />
        ))}
      </section>
    );
  }

  const styles = getValuesStyles(null, isMobile);

  return (
    <section id="conocenos" style={styles.container}>
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
