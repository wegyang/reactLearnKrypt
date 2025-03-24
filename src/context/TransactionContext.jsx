import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddresses } from "../utils/constants";
import chains from "../utils/chainsConfig.jsx";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = async (chainId) => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const contractAddress = contractAddresses[chainId];
  return new ethers.Contract(contractAddress, contractABI, signer);
};

const infura_key = "e47ec5bdf03745efa2c8fb36ae8a0a64";
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4MTUzNWI0LTE2NjItNGFjZS1hNDlmLTc4ZGM0YTgzMTljNyIsIm9yZ0lkIjoiNDMyNTYzIiwidXNlcklkIjoiNDQ0OTU3IiwidHlwZUlkIjoiNzlhZWVjNjYtY2YxYi00YjY3LWIzNDAtYWJhMDIwOTBkNjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAwMzg0MzgsImV4cCI6NDg5NTc5ODQzOH0.a3wwAv2uFHkYE6qTEmcbrjI5hEtsDxKhFDoQ2AMMmIU';

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [chain, setChain] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState("0");
  const [chooseLoading, setChooseLoading] = useState(false);
  const [selected, setSelected] = useState('Choose your token');
  const [gasFees, setGasFees] = useState([
    { fee: "--", name: "gasPrice", icon: "" },
    { fee: "--", name: "maxFeePerGas", icon: "" },
    { fee: "--", name: "maxPriorityFeePerGas", icon: "" },
  ]);

  const cachedData = useRef({}); // 缓存所有链的数据



  const preloadChainData = async (account, rpcUrl, chainId) => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const network = await provider.getNetwork();
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei);
      const tokenBalances = await fetchTokenBalances(account, chainId);
      return { network, balanceEth, tokenBalances };
    } catch (error) {
      console.error("Error preloading chain data:", error);
      return null;
    }
  };

  const displayRpcUrl = chain && chain.rpcUrl
      ? chain.rpcUrl.split(infura_key)[0]
      : '';

  const handleOptionClick = (option) => {
    setSelected(option);
  };

  // 获取 Gas Fee 的函数
  const fetchGasFees = async () => {
      // 获取 Gas Fee 数据
    const url = `https://site1.moralis-nodes.com/${chain.mName}`;
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl);

      // 获取 Gas Fee 数据
      const feeData = await provider.getFeeData();
      // 更新 gasFees
      setGasFees([
        {
          fee: ethers.formatUnits(feeData.gasPrice, "gwei"),
          name: "gasPrice",
          icon: "",
        },
        {
          fee: ethers.formatUnits(feeData.maxFeePerGas, "gwei"),
          name: "maxFeePerGas",
          icon: "",
        },
        {
          fee: ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"),
          name: "maxPriorityFeePerGas",
          icon: "",
        },
      ]);
      console.log("gasFees", feeData, gasFees)
    } catch (error) {
      console.error("Error fetching gas fees:", error);
    }
  };

  // 使用 useEffect 实现轮询
  useEffect(() => {
    if (!chain) {
      return;
    }
    // 初始加载
    fetchGasFees();
    // 设置轮询间隔（10 秒）
    const intervalId = setInterval(fetchGasFees, 10000);

    // 清除定时器
    return () => clearInterval(intervalId);
  }, [chain]);

  const handleChainSelect = async (selectedChain) => {
    setIsOpen(false);
    console.log("selectedChain", selectedChain);
    try {
      const cachedChainData = cachedData.current[selectedChain.id];
      if (cachedChainData) {
        setChain(selectedChain);
        setBalance(cachedChainData.balanceEth);
        setTokens(cachedChainData.tokenBalances);
      } else {
        const data = await preloadChainData(currentAccount, selectedChain.rpcUrl, selectedChain.id);
        if (data) {
          setChain(selectedChain);
          setBalance(data.balanceEth);
          setTokens(data.tokenBalances);
          cachedData.current[selectedChain.id] = data;
        }
      }
      console.log("selectedChain222", selectedChain);
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  const initWallet = async (account, selectedChain) => {
    try {
      const data = await preloadChainData(account, selectedChain.rpcUrl, selectedChain.id);
      console.log("data:", data);
      if (data) {
        setChain(selectedChain);
        setBalance(data.balanceEth);
        setTokens(data.tokenBalances);
        cachedData.current[selectedChain.id] = data;
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  };

  const fetchTokenBalances = async (userAddress, chainId) => {
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${userAddress}/tokens?chain=${chainId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json", "X-API-Key": apiKey },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.result.filter((token) => token.balance >= 0);
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        const chainId = await ethereum.request({ method: "eth_chainId" });
        const selectedChain = chains.find((chain) => chain.id === chainId) || chains[0];
        await initWallet(accounts[0], selectedChain);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      await initWallet(accounts[0], chain ? chain : chains[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      await ethereum.request({ method: "wallet_revokePermissions", params: [{eth_accounts: accounts[0]}] });
      setCurrentAccount("");
      setChain(null);
      setBalance("0");
      setTokens([]);
      cachedData.current = {};
      window.location.reload()
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  const sendTransaction = async (addresses, amounts) => {
    try {
      if (!ethereum) throw new Error("Please install Web3Wallet.");
      const provider = new ethers.BrowserProvider(ethereum);
      const chainId = await ethereum.request({ method: "eth_chainId" });
      const transactionsContract = await createEthereumContract(chainId);

      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
      const balance = await provider.getBalance(currentAccount);
      if (balance < totalAmount) throw new Error("Insufficient balance");

      const transactionResponse = await transactionsContract.batchTransfer(addresses, amounts, {
        gasLimit: ethers.parseUnits("1000000", "wei"),
        value: totalAmount,
      });

      setIsLoading(true);
      await transactionResponse.wait();
      setIsLoading(false);

      const selectedChain = chains.find((chain) => chain.id === chainId);
      if (selectedChain) {
        const data = await preloadChainData(currentAccount, selectedChain.rpcUrl, selectedChain.id);
        if (data) {
          setBalance(data.balanceEth);
          setTokens(data.tokenBalances);
          cachedData.current[chainId] = data;
        }
      }

      return { success: true, transactionHash: transactionResponse.hash };
    } catch (error) {
      console.error("Error during batch transfer:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedInput = formData.replace(/\s+/g, " ").trim();
      const pairs = cleanedInput.split(" ").map((pair) => pair.trim());

      const addresses = [];
      const amounts = [];

      for (const pair of pairs) {
        if (!pair) continue;
        const [address, amount] = pair.split(",");
        if (!ethers.isAddress(address)) throw new Error(`Invalid Ethereum address: ${address}`);
        if (isNaN(Number(amount)) || Number(amount) <= 0) throw new Error(`Invalid amount: ${amount}`);
        addresses.push(address);
        amounts.push(ethers.parseEther(amount));
      }

      const result = await sendTransaction(addresses, amounts);
      alert(result.success ? `Success! Transaction Hash: ${result.transactionHash}` : `Failed: ${result.error}`);
    } catch (error) {
      console.error("Error during handleSubmit:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleChainChanged = async (chainId) => {
    console.log("Chain changed to:", chainId);
    const selectedChain = chains.find((chain) => chain.id === chainId);
    if (selectedChain) {
      setChain(selectedChain);
      if (currentAccount) {
        const data = await preloadChainData(currentAccount, selectedChain.rpcUrl, selectedChain.id);
        if (data) {
          setBalance(data.balanceEth);
          setTokens(data.tokenBalances);
          cachedData.current[chainId] = data;
        }
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    if (ethereum) {
      ethereum.on("chainChanged", handleChainChanged);
    }
    return () => {
      if (ethereum) {
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [currentAccount]);

  return (
      <TransactionContext.Provider
          value={{
            connectWallet,
            currentAccount,
            isLoading,
            sendTransaction,
            handleChange: (e, name) => setFormData((prev) => ({ ...prev, [name]: e.target.value })),
            formData,
            tokens,
            balance,
            changeTextArea: (e) => setFormData(e.target.value),
            handleSubmit,
            handleChainSelect,
            chain,
            chains,
            displayRpcUrl,
            isOpen,
            setIsOpen,
            chooseLoading,
            selected,
            setSelected,
            gasFees,
            handleOptionClick,
            disconnectWallet,
          }}
      >
        {children}
      </TransactionContext.Provider>
  );
};