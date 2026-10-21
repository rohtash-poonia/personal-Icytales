import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

describe("shared form controls", () => {
  it("prevents a second submission while an action is loading", () => {
    const click = vi.fn();
    render(<Button loading onClick={click}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it("associates field errors with the input for assistive technology", () => {
    render(<Input name="email" label="Email" error="Enter a valid email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email");
  });

  it("passes the input ref through to the actual form element", () => {
    const ref = React.createRef();
    render(<Input ref={ref} name="name" label="Name" />);
    expect(ref.current).toBe(screen.getByLabelText("Name"));
  });
});
