/* eslint-disable @next/next/no-img-element */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
const cart = vi.hoisted(() => ({
  cartItems: [{ id: "507f1f77bcf86cd799439011", name: "Shared cart treat", price: 5, qty: 2, stock: 8, image: "/images/chocolateBrownie.png" }],
  subtotal: 10, loading: false, hydrated: true, updateQty: vi.fn(), removeItem: vi.fn(),
}));
vi.mock("@/components/context/CartContext", () => ({ useCart: () => cart }));
vi.mock("next/image", () => ({ default: ({ src, alt, fill: _fill, unoptimized: _unoptimized, ...props }) => <img src={src} alt={alt} {...props} /> }));
import ShoppingCart from "@/components/cart/ShoppingCart";

describe("cart page", () => {
  it("shows the shared cart and sends quantity and removal actions to it", () => {
    render(<ShoppingCart />);
    expect(screen.getByText("Shared cart treat")).toBeInTheDocument();
    expect(screen.queryByText("Classic Vanilla")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("spinbutton", { name: /quantity/i }), { target: { value: "3" } });
    expect(cart.updateQty).toHaveBeenCalledWith(cart.cartItems[0].id, 3);
    fireEvent.click(screen.getByRole("button", { name: /remove shared cart treat/i }));
    expect(cart.removeItem).toHaveBeenCalledWith(cart.cartItems[0].id);
  });
});



