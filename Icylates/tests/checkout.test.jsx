import {beforeEach,describe,expect,it,vi} from "vitest";
import {fireEvent,render,screen,waitFor} from "@testing-library/react";
const mocks=vi.hoisted(()=>({push:vi.fn(),quote:vi.fn(),create:vi.fn(),clearCart:vi.fn(),user:{id:"507f1f77bcf86cd799439012",name:"Ada"},items:[{id:"507f1f77bcf86cd799439011",_id:"507f1f77bcf86cd799439011",key:"vanilla",name:"Vanilla",price:4.5,qty:2}]}));
vi.mock("next/navigation",()=>({useRouter:()=>({push:mocks.push})}));
vi.mock("@/components/context/AuthContext",()=>({useAuth:()=>({user:mocks.user,loading:false})}));
vi.mock("@/components/context/CartContext",()=>({useCart:()=>({cartItems:mocks.items,clearCart:mocks.clearCart,subtotal:9,hydrated:true})}));
vi.mock("@/lib/api",()=>({quoteOrder:mocks.quote,createOrder:mocks.create}));
import Form from "@/app/(user)/checkout/Form";
beforeEach(()=>{vi.clearAllMocks();sessionStorage.clear();mocks.user={id:"507f1f77bcf86cd799439012",name:"Ada"};mocks.quote.mockResolvedValue({itemsPrice:9,shippingPrice:20,totalPrice:29});});
function fillAddress(){for(const [label,value] of [["Full name","Ada Test"],["Street address","1 Road"],["City","Town"],["Postal code","12345"]])fireEvent.change(screen.getByLabelText(label),{target:{value}});}
describe("checkout order journey",()=>{
  it("requires a session before exposing the order form",()=>{
    mocks.user=null;render(<Form/>);
    expect(screen.getByRole("link",{name:"Sign in and return to checkout"})).toHaveAttribute("href","/login?returnTo=%2Fcheckout");
    expect(screen.queryByRole("button",{name:"Review order total"})).not.toBeInTheDocument();
  });
  it("reviews trusted totals, sends the correct schema and preserves the cart on failure then retries the same order",async()=>{
    mocks.create.mockRejectedValueOnce(new Error("Connection interrupted")).mockResolvedValueOnce({_id:"507f1f77bcf86cd799439013"});
    render(<Form/>);fillAddress();
    fireEvent.click(screen.getByRole("button",{name:"Review order total"}));
    await screen.findByRole("button",{name:"Place order — cash on delivery"});
    expect(mocks.quote).toHaveBeenCalledWith({items:[{product:"507f1f77bcf86cd799439011",quantity:2}],shippingAddress:{fullName:"Ada Test",address:"1 Road",city:"Town",postalCode:"12345",country:"India"},paymentMethod:"cod"});
    expect(screen.getByText("$29.00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Place order — cash on delivery"}));
    await screen.findByRole("alert");
    expect(mocks.clearCart).not.toHaveBeenCalled();
    const key=mocks.create.mock.calls[0][1].idempotencyKey;
    fireEvent.click(screen.getByRole("button",{name:"Place order — cash on delivery"}));
    await waitFor(()=>expect(mocks.clearCart).toHaveBeenCalledTimes(1));
    expect(mocks.create.mock.calls[1][1].idempotencyKey).toBe(key);
    expect(mocks.push).toHaveBeenCalledWith("/orders/507f1f77bcf86cd799439013?placed=1");
    expect(sessionStorage.getItem("icytales_checkout_attempt")).toBeNull();
  });
  it("invalidates a quote when shipping details change and never collects card data",async()=>{
    render(<Form/>);fillAddress();fireEvent.click(screen.getByRole("button",{name:"Review order total"}));
    await screen.findByRole("button",{name:"Place order — cash on delivery"});
    fireEvent.change(screen.getByLabelText("City"),{target:{value:"New Town"}});
    expect(screen.getByRole("button",{name:"Review order total"})).toBeInTheDocument();
    expect(screen.queryByLabelText(/Card number|Security Code|UPI ID/)).not.toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
