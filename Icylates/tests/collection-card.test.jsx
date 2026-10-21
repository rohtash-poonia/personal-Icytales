import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {test, expect, vi} from 'vitest';
const toggle = vi.hoisted(()=>vi.fn());
vi.mock('@/components/context/WishlistContext',()=>({useWishlist:()=>({wishlist:[],toggleWishlist:toggle})}));
vi.mock('@/components/context/CartContext',()=>({useCart:()=>({addItem:vi.fn()})}));
vi.mock('next/image',()=>({default:({unoptimized, ...props})=>React.createElement('img', props)}));
import ProductDetailsCard from '@/components/common/ProductDetailsCard';
test.each(['Vegan','Gelato'])('%s cards retain wishlist actions', category=>{
  render(<ProductDetailsCard _id="123" title="Sample cone" category={category} price={5} stock={3} images={['/images/classicVanilla.png']}/>);
  fireEvent.click(screen.getByRole('button',{name:'Save Sample cone to wishlist'}));
  expect(toggle).toHaveBeenCalled();
});
