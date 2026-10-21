import {expect,it,vi} from "vitest";
import {render,screen} from "@testing-library/react";
const mocks=vi.hoisted(()=>({me:vi.fn()}));
vi.mock("@/lib/api",()=>({getCurrentUser:mocks.me,loginUser:vi.fn(),registerUser:vi.fn(),logoutUser:vi.fn()}));
import {AuthProvider,useAuth} from "@/components/context/AuthContext";
function Harness(){const {user,loading}=useAuth();return <p>{loading ? "loading" : user ? `Signed in as ${user.name}` : "signed out"}</p>;}
it("ignores a forged local-storage admin identity and restores the HttpOnly session",async()=>{
  localStorage.setItem("icytales_user",JSON.stringify({name:"Forged",role:"admin"}));
  mocks.me.mockResolvedValue({id:"real",name:"Real customer",role:"user"});
  render(<AuthProvider><Harness/></AuthProvider>);
  await screen.findByText("Signed in as Real customer");
  expect(screen.queryByText(/Forged/)).not.toBeInTheDocument();
  expect(localStorage.getItem("icytales_user")).toBeNull();
});
it("shows signed out when the cookie session has expired",async()=>{
  mocks.me.mockRejectedValue(Object.assign(new Error("Sign in required"),{status:401}));
  render(<AuthProvider><Harness/></AuthProvider>);
  await screen.findByText("signed out");
});
