import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext(undefined);

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionsContract;
};

const getChainName = async () => {
  debugger
  const provider = new ethers.BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  return network.name
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [chainName, setChainName] = useState("");

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };



  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        await getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const checkIfTransactionsExists = async () => {
  //   try {
  //     if (ethereum) {
  //       const transactionsContract = createEthereumContract();
  //       const currentTransactionCount = await transactionsContract.getTransactionCount();
  //
  //       window.localStorage.setItem("transactionCount", currentTransactionCount);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //
  //     throw new Error("No ethereum object2");
  //   }
  // };

  const fetchTokenBalances = async (userAddress) => {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4MTUzNWI0LTE2NjItNGFjZS1hNDlmLTc4ZGM0YTgzMTljNyIsIm9yZ0lkIjoiNDMyNTYzIiwidXNlcklkIjoiNDQ0OTU3IiwidHlwZUlkIjoiNzlhZWVjNjYtY2YxYi00YjY3LWIzNDAtYWJhMDIwOTBkNjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAwMzg0MzgsImV4cCI6NDg5NTc5ODQzOH0.a3wwAv2uFHkYE6qTEmcbrjI5hEtsDxKhFDoQ2AMMmIU';
    const chain = 'sepolia';
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${userAddress}/tokens?chain=${chain}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
      if (!response.ok) {
         console.error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.filter(token => token.balance > 0); // 过滤出余额大于 0 的代币
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };


  const connectWallet = async () => {
    try {
      debugger
      if (!ethereum) return alert("Please install Web3Wallet.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts", });
      console.log("web3_account________", accounts)
      setCurrentAccount(accounts[0]);
      const balances = await fetchTokenBalances(accounts[0]); // 或者使用 fetchBalancesFromAPI
      setTokens(balances);
      console.log('tokens', tokens);
      await getChainName().then(chainName => {
        debugger
        console.log("chainName", chainName);
        setChainName(chainName)
      });
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object1");
    }
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object3");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object4");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect().then(r => console.log("r1", r));
    // checkIfTransactionsExists().then(r => console.log("r2", r));
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
        tokens,
        chainName,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
