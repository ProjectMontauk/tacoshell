"use client";

import React, { useEffect, useState } from "react";
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { client } from "../src/client";
import { useRouter } from "next/navigation";
import { tokenContract, marketContract } from "../constants/contracts";
import { fetchTrades } from "../src/utils/tradeApi";

// TODO: Replace this with the actual ThirdWeb inAppWallet import
// import { InAppWalletButton } from "thirdweb-package-path";

function formatBalance(balance: bigint | undefined): string {
  if (!balance) return "--";
  // Divide by 10^18 and show whole numbers only
  return (Number(balance) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const Navbar = () => {
  const router = useRouter();
  const account = useActiveAccount();
  const [portfolioValue, setPortfolioValue] = useState<string>("--");
  const { data: balance, isPending, refetch } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [account?.address ?? "0x0000000000000000000000000000000000000000"],
  });
  const { data: oddsYes } = useReadContract({
    contract: marketContract,
    method: "function odds(uint256 _outcome) view returns (int128)",
    params: [0n],
  });
  const { data: oddsNo } = useReadContract({
    contract: marketContract,
    method: "function odds(uint256 _outcome) view returns (int128)",
    params: [1n],
  });

  // Polling mechanism for cash balance updates
  useEffect(() => {
    if (!account?.address) return;

    // Initial fetch
    refetch();

    // Set up polling interval (check every 3 seconds)
    const interval = setInterval(() => {
      refetch();
    }, 3000);

    // Cleanup interval on unmount or account change
    return () => clearInterval(interval);
  }, [account?.address, refetch]);

  // Fetch and calculate portfolio value
  useEffect(() => {
    const loadPortfolioValue = async () => {
      if (!account?.address) {
        setPortfolioValue("--");
        return;
      }
      try {
        const trades = await fetchTrades(account.address);
        const cash = balance ? Number(balance) / 1e18 : 0;
        const getCurrentPriceNumber = (outcome: string) => {
          if (outcome.toLowerCase().includes('yes') && oddsYes !== undefined) {
            return Number(oddsYes) / Math.pow(2, 64);
          } else if (outcome.toLowerCase().includes('no') && oddsNo !== undefined) {
            return Number(oddsNo) / Math.pow(2, 64);
          }
          return 0;
        };
        const totalPositionsValue = trades.reduce((sum: number, trade: any) => sum + trade.shares * getCurrentPriceNumber(trade.outcome), 0);
        const totalPortfolio = cash + totalPositionsValue;
        setPortfolioValue(totalPortfolio.toFixed(2));
      } catch {
        setPortfolioValue("--");
      }
    };
    loadPortfolioValue();
    // Only update when account, odds, or balance changes
  }, [account?.address, oddsYes, oddsNo, balance]);

  return (
    <nav className="w-full flex items-center justify-between px-8 py-1 border-b border-gray-200 bg-white">
      <div className="ml-32 flex flex-col items-start">
        <h1 className="text-3xl font-bold text-[#171A22] mt-4">Tinfoil</h1>
        <div className="flex gap-0 mt-1 -ml-2">
          <button
            className="py-1 px-3 bg-white text-[#171A22] rounded-md text-xs font-semibold hover:bg-gray-100 transition border-none shadow-none text-left"
            style={{ fontSize: 12, minWidth: 0 }}
            onClick={() => router.push("/")}
          >
            All Markets
          </button>
          <button
            className="py-1 px-3 bg-white text-[#171A22] rounded-md text-xs font-semibold hover:bg-gray-100 transition border-none shadow-none text-left"
            style={{ fontSize: 12, minWidth: 0 }}
          >
            History
          </button>
          <button
            className="py-1 px-3 bg-white text-[#171A22] rounded-md text-xs font-semibold hover:bg-gray-100 transition border-none shadow-none text-left"
            style={{ fontSize: 12, minWidth: 0 }}
          >
            Science
          </button>
          <button
            className="py-1 px-3 bg-white text-[#171A22] rounded-md text-xs font-semibold hover:bg-gray-100 transition border-none shadow-none text-left"
            style={{ fontSize: 12, minWidth: 0 }}
          >
            New
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="flex flex-col items-center justify-center bg-white px-2 py-1 rounded transition-colors duration-200 cursor-pointer focus:outline-none hover:bg-gray-200"
          style={{ boxShadow: "none", minWidth: 0 }}
          onClick={() => router.push("/portfolio")}
        >
          <span className="text-[#171A22] font-medium text-sm">Portfolio</span>
          <span className="text-green-600 font-semibold text-sm">{portfolioValue === "--" ? "--" : `$${Number(portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
        </button>
        <button
          className="flex flex-col items-center justify-center bg-white px-2 py-1 rounded transition-colors duration-200 cursor-pointer focus:outline-none hover:bg-gray-200 text-center"
          style={{ boxShadow: "none", minWidth: 0 }}
          onClick={() => router.push("/deposit")}
        >
          <span className="text-[#171A22] font-medium text-sm">Cash</span>
          <span className="text-green-600 font-semibold text-sm">${isPending ? "..." : formatBalance(balance)}</span>
        </button>
        <ConnectButton client={client} />
        {/* Example: <InAppWalletButton /> */}
      </div>
    </nav>
  );
};

export default Navbar;
