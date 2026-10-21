import React from 'react';
import {render, waitFor} from '@testing-library/react';
import {test, expect, vi} from 'vitest';
const mocks = vi.hoisted(() => ({getProducts: vi.fn().mockResolvedValue({items:[], categories:[], pagination:{total:0,pages:0}})}));
vi.mock('next/navigation', () => {
  const params = new URLSearchParams('category=Vegan');
  return {useSearchParams: () => params};
});
vi.mock('@/lib/api', () => ({getProducts:mocks.getProducts}));
vi.mock('@/components/shop/Sidebar', () => ({default:()=>null}));
vi.mock('@/components/common/ProductDetailsCard', () => ({default:()=>null}));
import Products from '@/components/shop/Products';
test('collection links request the selected MongoDB category', async () => {
  render(<Products/>);
  await waitFor(()=>expect(mocks.getProducts).toHaveBeenCalledWith(expect.objectContaining({category:'Vegan'})));
});
