"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [newMessage, setNewMessage] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("0");
  const [delegateAddress, setDelegateAddress] = useState<string>("");

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    // args: [""],
  });

  const { data: greetingCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress],
  });

  const { data: currentDelegate } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "delegate",
  });

  const {
    data: events,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    fromBlock: 31231n,
    watch: true,
    // filters: { greetingSetter: "0x9eB2C4866aAe575bC88d00DE5061d5063a1bb3aF" },
    blockData: true,
    transactionData: true,
    receiptData: true,
  });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <hr className="my-4" />
          <span className="block text-2xl font-bold">Set new greeting </span>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Greeting:</p>
            <p className="my-2 font-medium">{greeting}</p>
          </div>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Greeting counter:</p>
            <p className="my-2 font-medium">{greetingCounter?.toString()}</p>
          </div>
          <InputBase placeholder="Enter new message here" value={newMessage} onChange={setNewMessage} />
          <br />
          <EtherInput placeholder="Enter ether value here" value={newValue} onChange={setNewValue} />

          <br />
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  functionName: "setGreeting",
                  args: [newMessage],
                  value: parseEther(newValue),
                });
              } catch (e) {
                console.error(e);
              }
            }}
          >
            setGreeting
          </button>
          <hr className="my-4" />
          <span className="block text-2xl font-bold">Set new delegate </span>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p>Current delegate: </p>
            <Address address={currentDelegate} />
          </div>
          <AddressInput
            placeholder="Enter new delegate address here"
            value={delegateAddress}
            onChange={setDelegateAddress}
          />
          <br />
          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  functionName: "setDelegate",
                  args: [delegateAddress],
                });
              } catch (e) {
                console.error(e);
              }
            }}
          >
            setDelegate
          </button>
          <hr className="my-4" />
          <span className="block text-2xl font-bold">Events </span>
          <p className="text-center text-lg">
            {isLoadingEvents && <span>Loading...</span>}
            {errorReadingEvents && <span>Error: {errorReadingEvents.message}</span>}

            {events ? (
              events.length > 0 ? (
                <ul>
                  {events.map((event, i) => {
                    const { greetingSetter, newGreeting } = event.args;
                    return (
                      <li key={i}>
                        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
                          <Address address={greetingSetter} /> set greeting to {newGreeting}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span>No events to display.</span>
              )
            ) : (
              ""
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
