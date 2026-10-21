import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {test,expect,vi,beforeEach} from 'vitest';
const mocks=vi.hoisted(()=>({user:{_id:'owner'},get:vi.fn(),save:vi.fn(),remove:vi.fn()}));
vi.mock('@/components/context/AuthContext',()=>({useAuth:()=>({user:mocks.user,loading:false})}));
vi.mock('@/lib/api',()=>({getWishlist:mocks.get,saveWishlistProduct:mocks.save,removeWishlistProduct:mocks.remove}));
import {WishlistProvider,useWishlist} from '@/components/context/WishlistContext';
const product={_id:'123456789012345678901234',title:'Vanilla',price:5,stock:2};
function View(){const {wishlist,toggleWishlist,loading}=useWishlist();return <><p>{loading?'Loading':wishlist.map(item=>item.name).join(',')||'Empty'}</p><button onClick={()=>toggleWishlist(product)}>Toggle</button></>;}
beforeEach(()=>{mocks.user={_id:'owner'};mocks.get.mockResolvedValue({items:[product]});mocks.remove.mockResolvedValue({});mocks.save.mockResolvedValue({});});
test('loads authenticated wishlist and retains saved state when removal fails',async()=>{
  mocks.remove.mockRejectedValueOnce(new Error('Network unavailable'));
  render(<WishlistProvider><View/></WishlistProvider>);
  await screen.findByText('Vanilla');
  fireEvent.click(screen.getByText('Toggle'));
  await screen.findByText('Network unavailable');
  expect(screen.getByText('Vanilla')).toBeVisible();
  fireEvent.click(screen.getByText('Toggle'));
  await screen.findByText('Empty');
  expect(mocks.remove).toHaveBeenCalledWith(product._id);
});
test('hides prior account wishlist immediately when the session changes',async()=>{
  const view=render(<WishlistProvider><View/></WishlistProvider>);
  await screen.findByText('Vanilla');
  mocks.user=null;
  view.rerender(<WishlistProvider><View/></WishlistProvider>);
  expect(screen.queryByText('Vanilla')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Toggle'));
  await waitFor(()=>expect(screen.getByRole('link',{name:'Sign in'})).toBeVisible());
});
