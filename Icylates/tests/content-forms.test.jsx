/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ submitContact: vi.fn(), subscribeNewsletter: vi.fn() }));
vi.mock("@/lib/api", () => api);
vi.mock("next/image", () => ({ default: (props) => { const clean = { ...props }; delete clean.unoptimized; delete clean.priority; delete clean.fill; delete clean.fallbackSrc; return <img {...clean} />; } }));
import GetInTouch from "@/components/contact/GetInTouch";
import SignUp from "@/components/home/SignUp";

beforeEach(() => {
  api.submitContact.mockResolvedValue({ message: "Your message has been received." });
  api.subscribeNewsletter.mockResolvedValue({ subscribed: true, message: "Subscription saved." });
});

describe("persisted public forms", () => {
  it("submits the complete contact payload and clears only after success", async () => {
    render(<GetInTouch />);
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Asha" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Rao" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "asha@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "+91 99999 00000" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Please share delivery availability." } });
    fireEvent.click(screen.getByRole("button", { name: /submit now/i }));
    await waitFor(() => expect(api.submitContact).toHaveBeenCalledWith({
      firstName: "Asha", lastName: "Rao", email: "asha@example.com", phone: "+91 99999 00000", message: "Please share delivery availability.",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent("received");
    expect(screen.getByLabelText("First Name")).toHaveValue("");
  });

  it("requires newsletter consent and sends normalized form intent", async () => {
    render(<SignUp />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "news@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("privacy policy");
    expect(api.subscribeNewsletter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));
    await waitFor(() => expect(api.subscribeNewsletter).toHaveBeenCalledWith({ email: "news@example.com", consent: true }));
    expect(await screen.findByRole("status")).toHaveTextContent("saved");
  });
});


