import React from "react";
import Image, { StaticImageData } from "next/image";

interface CardValueProps {
  title: string;
  image: StaticImageData;
  description: string;
  styles: {
    card: React.CSSProperties;
    image: React.CSSProperties;
    title: React.CSSProperties;
    description: React.CSSProperties;
  };
}

const CardValue = ({ title, image, description, styles }: CardValueProps) => {
  return (
    <div style={styles.card}>
      <Image
        src={image}
        alt={title}
        width={110}
        height={110}
        unoptimized
        style={styles.image}
      />
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.description}>{description}</p>
    </div>
  );
};

export default CardValue;
