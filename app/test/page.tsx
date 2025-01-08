import React from "react";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
function Page() {
  return (
    <>
      <ConnectWallet />
    </>
  );
}

export default Page;
