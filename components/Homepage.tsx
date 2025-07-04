"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useReadContract } from "thirdweb/react";
import { marketContract } from "../constants/contracts";
import { getAllMarkets } from "../src/data/markets";

const Homepage = () => {
  const router = useRouter();
  
  // Fetch current odds for Yes (0) and No (1) positions
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

  // Convert odds to probabilities
  const yesProbability = oddsYes !== undefined ? Number(oddsYes) / Math.pow(2, 64) : 0;
  const noProbability = oddsNo !== undefined ? Number(oddsNo) / Math.pow(2, 64) : 0;

  // Get all markets
  const markets = getAllMarkets();
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center w-full pt-20">
      <h1 className="text-4xl font-bold mb-4 text-center w-full">Welcome to Tinfoil</h1>
      <div className="text-xl text-gray-600 mb-8 text-center w-full">
        A home for honest debate about anything on the internet. <br />
        Bet on what you believe, challenge convention, and earn for being right.
      </div>
      {/* Active Markets Section */}
      <div className="w-full flex flex-col items-center mt-10">
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-5xl">
          {markets.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-5 w-1/2 cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(`/markets/${market.id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={e => { if (e.key === 'Enter') router.push(`/markets/${market.id}`); }}
            >
              <div className="mb-4">
                <Image
                  src={market.image}
                  alt={market.title}
                  width={400}
                  height={200}
                  className="w-full h-48 rounded-lg object-cover"
                />
              </div>
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900">{market.title}</h3>
              </div>
              <div className="mb-0">
                <div className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-sm font-semibold text-black col-span-3">{market.outcomes[0]}:</div>
                  <div className="text-lg font-bold text-green-600 text-right bg-green-100 rounded pr-7 px-1">
                    {yesProbability > 0 ? `${Math.round(yesProbability * 100)}%` : '--'}
                  </div>
                  <div className="text-sm font-semibold text-black col-span-3">{market.outcomes[1]}:</div>
                  <div className="text-lg font-bold text-red-600 text-right bg-red-100 rounded pr-7 px-1">
                    {noProbability > 0 ? `${Math.round(noProbability * 100)}%` : '--'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage; 