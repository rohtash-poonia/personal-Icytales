import { expect, test } from "@playwright/test";
import {expectActionCursors} from './cursor-helper';

test("customer checkout reaches MongoDB and admin records COD collection", async ({ browser, page }) => {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Browser Customer");
  await page.getByLabel("Email").fill("customer@e2e.test");
  await page.getByLabel("Password").fill("Customer-Password-589");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/products?search=Vanilla%20Journey");
  await expect(page.getByRole("heading", { name: "Vanilla Journey" })).toBeVisible();
  await page.getByRole("button", { name: "Add Vanilla Journey to cart" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Added to cart" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText("Vanilla Journey", { exact: true })).toBeVisible();
  await expectActionCursors(page);
  await page.getByRole("link", { name: "Proceed to checkout" }).click();
  await page.getByLabel("Full name").fill("Browser Customer");
  await expectActionCursors(page);
  await page.getByLabel("Street address").fill("10 Test Street");
  await page.getByLabel("City").fill("Pune");
  await page.getByLabel("Postal code").fill("411001");
  await page.getByLabel("Country").fill("India");
  await page.getByRole("button", { name: "Review order total" }).click();
  await expect(page.getByRole("status")).toContainText("confirmed total");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmation" })).toBeVisible();
  await expect(page.getByText("Status: pending · Payment: pending")).toBeVisible();
  const orderUrl=page.url();

  await page.goto("/contact");
  await page.getByLabel("First Name").fill("Browser");
  await page.getByLabel("Last Name").fill("Customer");
  await page.getByLabel("Email address").fill("customer@e2e.test");
  await page.getByLabel("Message").fill("This is an isolated browser integration message.");
  await page.getByRole("button", { name: "Submit Now" }).click();
  await expect(page.getByRole("status")).toContainText("received");

  const admin = await browser.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill("admin@e2e.test");
  await admin.getByLabel("Password").fill("Admin-Password-589");
  await admin.getByRole("button", { name: "Sign In" }).click();
  await expect(admin).toHaveURL(/\/admin$/);
  await expect(admin.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await admin.goto("/admin/orders");
  await expect(admin.getByText("Browser Customer")).toBeVisible();
  await admin.getByRole("combobox", { name: /Status for order/ }).selectOption("processing");
  await expect(admin.getByRole("button", { name: "Cash collected" })).toBeVisible();
  admin.on("dialog", (dialog) => dialog.accept());
  await admin.getByRole("button", { name: "Cash collected" }).click();
  await expect(admin.getByText("paid", { exact: true })).toBeVisible();
  await admin.getByRole("combobox", { name: /Status for order/ }).selectOption("completed");
  await page.goto(orderUrl);
  await page.getByRole("button",{name:"Review Vanilla Journey"}).click();
  await page.getByLabel("Your review",{exact:true}).fill("A lovely vanilla flavor from my completed order.");
  await page.getByRole("button",{name:"Submit review",exact:true}).click();
  await expect(page.getByRole("status").filter({hasText:"Your review was saved."})).toBeVisible();
  await expect(page.getByLabel("Rating summary")).toContainText("5.0 out of 5");
  await page.getByLabel("Review rating").selectOption("4");
  await page.getByRole("button",{name:"Update review",exact:true}).click();
  await expect(page.getByLabel("Rating summary")).toContainText("4.0 out of 5");
  await page.reload();
  await page.getByRole("button",{name:"Review Vanilla Journey"}).click();
  await expect(page.getByLabel("Review rating")).toHaveValue("4");
  await page.getByRole("button",{name:"Delete my review"}).click();
  await expect(page.getByLabel("Rating summary")).toContainText("No reviews yet.");

  await admin.goto("/admin/messages");
  await expect(admin.getByText("This is an isolated browser integration message.")).toBeVisible();
  await admin.setViewportSize({width:390,height:844});
  expect(await admin.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
