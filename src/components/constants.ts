import React from "react";

export enum Variant {
  filled = "filled",
  outlined = "outlined",
  standard = "standard",
  contained = "contained",
}

export interface IUserInfo {
  name: string;
  email: string;
  imgSrc: string;
}

export interface IMenuItem {
  title: string;
  icon: React.ReactNode;
}
