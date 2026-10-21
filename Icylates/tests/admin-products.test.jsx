import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next/image", () => ({ default: (props) => React.createElement("img", props) }));

import ProductModal from "@/components/admin/ProductModal";

const product = {
  _id: "507f1f77bcf86cd799439011",
  title: "Vanilla Dream",
  slug: "vanilla-dream",
  description: "Vanilla bean ice cream",
  price: 6.5,
  category: "Classic",
  flavor: "Vanilla",
  stock: 12,
  status: "active",
  images: [],
};

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn((file) => `blob:${file.name}`),
    revokeObjectURL: vi.fn(),
  });
});

describe("admin product editor", () => {
  it("previews multiple files locally and submits them with progress", async () => {
    const onSave = vi.fn(async (_payload, _files, onProgress) => onProgress(64));
    render(<ProductModal product={product} onClose={vi.fn()} onSave={onSave} />);
    const files = [
      new File(["one"], "vanilla.png", {type:"image/png"}),
      new File(["two"], "mint.webp", {type:"image/webp"}),
    ];
    fireEvent.change(screen.getByLabelText("Add product images"), {target:{files}});
    expect(screen.getByAltText("Preview of vanilla.png")).toHaveAttribute("src", "blob:vanilla.png");
    expect(screen.getByAltText("Preview of mint.webp")).toHaveAttribute("src", "blob:mint.webp");
    expect(screen.getByText("2 new images selected")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Alt text for vanilla.png"), {target:{value:"Vanilla cone"}});
    fireEvent.click(screen.getByRole("button", {name:"Update product"}));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].newImageAlts).toEqual(["Vanilla cone", ""]);
    expect(onSave.mock.calls[0][1]).toEqual(files);
    expect(await screen.findByText("Uploading 64%" )).toBeInTheDocument();
  });

  it("removes a retained image without uploading it again", async () => {
    const onSave = vi.fn(async () => {});
    render(<ProductModal product={{...product,images:[{url:"https://cdn.test/old.png",publicId:"icytales/products/old",alt:"Old cone"}]}} onClose={vi.fn()} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", {name:"Remove Old cone"}));
    fireEvent.click(screen.getByRole("button", {name:"Update product"}));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].images).toEqual([]);
  });
});
