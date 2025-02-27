import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

const infura_key = "e47ec5bdf03745efa2c8fb36ae8a0a64";

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [chain, setChain] = useState(null); // 当前选择的链
  const [isOpen, setIsOpen] = useState(false); // 控制下拉菜单的显示/隐藏
  const [balance, setBalance] = useState("0"); // 账户余额
  const [chooseLoading, setChooseLoading] = useState(false);

  // 支持的链列表
  const chains = [
    { id: "0x1", name: "Ethereum", rpcUrl: `https://mainnet.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { id: "0x38", name: "Binance Smart Chain", rpcUrl: "https://bsc.rpc.blxrbdn.com", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
    { id: "0x89", name: "Polygon", rpcUrl: "https://polygon-rpc.com/", icon: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
    { id: "0xaa36a7", name: "Sepolia", rpcUrl: `https://sepolia.infura.io/v3/${infura_key}`, icon: "https://cryptologos.cc/logos/ethereum-pow-ethw-logo.png" },
    { id: "0x61", name: "BnbT", rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/", icon: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
  ];

  // 处理链选择
  const handleChainSelect = async (selectedChain) => {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: selectedChain.id }],
      });
      console.log("selectedChain", selectedChain);
      setChain(selectedChain);
      setIsOpen(false);

      if (ethereum && currentAccount) {
        setChooseLoading(true);
        await initWallet(currentAccount, selectedChain.rpcUrl);
        setChooseLoading(false);
      }
    } catch (error) {
      console.error("Error switching chain:", error);
    }
  };

  // 初始化钱包
  const initWallet = async (account, rpcUrl) => {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const network = await provider.getNetwork();
      console.log("network", network);

      // 获取代币余额
      const balances = await fetchTokenBalances(account, chain?.id || chains[0].id);
      setTokens(balances);

      // 获取账户余额
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  };

  // 获取代币余额
  const fetchTokenBalances = async (userAddress, chainId) => {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4MTUzNWI0LTE2NjItNGFjZS1hNDlmLTc4ZGM0YTgzMTljNyIsIm9yZ0lkIjoiNDMyNTYzIiwidXNlcklkIjoiNDQ0OTU3IiwidHlwZUlkIjoiNzlhZWVjNjYtY2YxYi00YjY3LWIzNDAtYWJhMDIwOTBkNjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAwMzg0MzgsImV4cCI6NDg5NTc5ODQzOH0.a3wwAv2uFHkYE6qTEmcbrjI5hEtsDxKhFDoQ2AMMmIU';
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${userAddress}/tokens?chain=${chainId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json", "X-API-Key": apiKey },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.result.filter((token) => token.balance >= 0); // 过滤出余额大于等于 0 的代币
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };

  // 检查钱包是否已连接
  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        const chainId = await ethereum.request({ method: "eth_chainId" });
        const selectedChain = chains.find((chain) => chain.id === chainId) || chains[0]; // 默认使用第一条链
        setChain(selectedChain);
        await initWallet(accounts[0], selectedChain.rpcUrl);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      await initWallet(accounts[0], chain?.rpcUrl || chains[0].rpcUrl);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // 发送交易
  const sendTransaction = async (addresses, amounts) => {
    try {
      if (!ethereum) throw new Error("Please install Web3Wallet.");

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const transactionsContract = await createEthereumContract();

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

      return { success: true, transactionHash: transactionResponse.hash };
    } catch (error) {
      console.error("Error during batch transfer:", error);
      return { success: false, error: error.message };
    }
  };

  // 表单提交
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

  // 监听链变化
  const handleChainChanged = async (chainId) => {
    console.log("Chain changed to:", chainId);
    const selectedChain = chains.find((chain) => chain.id === chainId);
    if (selectedChain) {
      setChain(selectedChain);
      if (currentAccount) {
        await initWallet(currentAccount, selectedChain.rpcUrl);
      }
    }
  };

  // 初始化
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
  }, []);

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
            isOpen,
            setIsOpen,
            chooseLoading,
          }}
      >
        {children}
      </TransactionContext.Provider>
  );
};