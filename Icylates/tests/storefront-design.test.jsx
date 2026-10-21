import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({ default: (props) => React.createElement("img", props) }));
vi.mock("next/link", () => ({ default: ({children, ...props}) => <a {...props}>{children}</a> }));

import HeroSection from "@/components/home/HeroSection";
import Explore from "@/components/home/Explore";
import SummerSpecial from "@/components/home/SummerSpecial";

describe("Figma storefront sections", () => {
  it("uses the inspected hero artwork and accessible copy", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", {name:/discover sweet delights/i})).toBeInTheDocument();
    expect(screen.getByAltText("Colorful handcrafted ice cream cone")).toHaveAttribute("src", "/images/heroIceCream.png");
  });

  it("uses permanent local Figma artwork for image-led sections", () => {
    const {unmount}=render(<Explore />);
    expect(screen.getByAltText("Customer enjoying a blue ice cream cone")).toHaveAttribute("src", "/images/figma/relive-classics.png");
    unmount();
    render(<SummerSpecial />);
    expect(screen.getByAltText("Chocolate sundae summer special")).toHaveAttribute("src", "/images/figma/summer-sundae.png");
  });
});
