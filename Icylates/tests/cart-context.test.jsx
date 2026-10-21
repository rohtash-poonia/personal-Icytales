import {expect,it} from "vitest";
import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {CartProvider,useCart} from "@/components/context/CartContext";
const product={_id:"507f1f77bcf86cd799439011",title:"Vanilla",price:4.5,images:["/vanilla.png"],stock:5};
function Harness(){const {cartItems,addItem,updateQty,removeItem,hydrated,subtotal}=useCart();return <div><p>{hydrated ? "ready" : "loading"}</p><output data-testid="cart">{JSON.stringify(cartItems)}</output><output data-testid="subtotal">{subtotal}</output><button onClick={()=>addItem(product,1)}>Add</button><button onClick={()=>updateQty(cartItems[0].key,3)}>Quantity</button><button onClick={()=>removeItem(cartItems[0].key)}>Remove</button></div>;}
it("hydrates a saved cart before persistence and uses shared quantity/remove state",async()=>{
  localStorage.setItem("icytales_cart",JSON.stringify([{...product,qty:2}]));
  render(<CartProvider><Harness/></CartProvider>);
  await screen.findByText("ready");
  expect(screen.getByTestId("subtotal")).toHaveTextContent("9");
  expect(JSON.parse(localStorage.getItem("icytales_cart"))[0].qty).toBe(2);
  fireEvent.click(screen.getByRole("button",{name:"Quantity"}));
  expect(screen.getByTestId("subtotal")).toHaveTextContent("13.5");
  fireEvent.click(screen.getByRole("button",{name:"Add"}));
  expect(screen.getByTestId("subtotal")).toHaveTextContent("18");
  fireEvent.click(screen.getByRole("button",{name:"Remove"}));
  await waitFor(()=>expect(localStorage.getItem("icytales_cart")).toBe("[]"));
});
it("recovers safely from malformed local storage",async()=>{
  localStorage.setItem("icytales_cart","{invalid");
  render(<CartProvider><Harness/></CartProvider>);
  await screen.findByText("ready");
  expect(screen.getByTestId("cart")).toHaveTextContent("[]");
  fireEvent.click(screen.getByRole("button",{name:"Add"}));
  expect(screen.getByTestId("subtotal")).toHaveTextContent("4.5");
});
