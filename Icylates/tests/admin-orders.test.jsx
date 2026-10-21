import React from "react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAdminOrders: vi.fn(), updateOrderStatus: vi.fn(), deleteOrder: vi.fn(), collectCash: vi.fn(),
}));
vi.mock("@/lib/api", () => api);
vi.mock("@/components/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "admin", role: "admin", name: "Admin" }, loading: false }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => "/admin/orders" }));
import AdminOrdersPage from "@/app/admin/orders/page";

const order = {
  _id: "507f1f77bcf86cd799439011", user: { name: "Customer" },
  totalPrice: 35, currency: "USD", paymentMethod: "cod", paymentStatus: "pending",
  orderStatus: "processing", createdAt: "2026-10-01T00:00:00.000Z",
};
beforeEach(() => {
  api.getAdminOrders.mockResolvedValue({ items: [order], pagination: { page: 1, pages: 1, total: 1, limit: 25 } });
  api.updateOrderStatus.mockResolvedValue({ ...order, orderStatus: "completed" });
  api.collectCash.mockResolvedValue({ ...order, paymentStatus: "paid" });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("admin order workflow", () => {
  it("renders the paginated API response and only supported status transitions", async () => {
    render(<AdminOrdersPage />);
    expect(await screen.findByText("Customer")).toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: /status/i });
    expect([...select.options].map(option => option.value)).toEqual(["pending", "processing", "completed", "cancelled"]);
    fireEvent.change(select, { target: { value: "completed" } });
    await waitFor(() => expect(api.updateOrderStatus).toHaveBeenCalledWith(order._id, "completed"));
  });

  it("shows a recoverable failure instead of an empty table when loading fails", async () => {
    api.getAdminOrders.mockRejectedValueOnce(new Error("API unavailable"));
    render(<AdminOrdersPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("API unavailable");
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(await screen.findByText("Customer")).toBeInTheDocument();
  });

  it("requires an explicit confirmation before recording cash as collected", async () => {
    render(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("button", { name: /cash collected/i }));
    await waitFor(() => expect(api.collectCash).toHaveBeenCalledWith(order._id));
    expect(window.confirm).toHaveBeenCalled();
  });
});
