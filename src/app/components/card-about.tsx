import { IService } from "@/constants";
import React from "react";

const CardAbout = ({ service }: { service: IService }) => (
  <div
    className="card-about"
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "30px",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2
        style={{
          fontSize: "40px",
          fontWeight: "normal",
          color: "#B09172",
          margin: "0px",
          fontFamily: "var(--font-lora-italic)",
        }}
      >
        {service.label}
      </h2>

      <p
        style={{
          fontSize: "16px",
          fontFamily: "var(--font-cabinet-grotesk)",
        }}
      >
        {service.description}
      </p>
    </div>
    <div
      style={{
        height: "0.5px",
        backgroundColor: "black",
        width: "100%",
      }}
    />
  </div>
);

export default CardAbout;
