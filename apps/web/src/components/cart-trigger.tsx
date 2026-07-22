"use client";

import { useState } from "react";
import { CartIcon } from "@/components/cart-icon";
import { CartPanel } from "@/components/cart-panel";

export function CartTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CartIcon onClick={() => setOpen(true)} />
      <CartPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
