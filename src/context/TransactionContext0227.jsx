import React, {useEffect, useState} from "react";
import {ethers, JsonRpcProvider} from "ethers";
// import Web3 form "web3"
import {contractABI, contractAddress} from "../utils/constants";

export const TransactionContext = React.createContext(undefined);

const { ethereum } = window;

const createEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

const getChainName = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const network = await provider.getNetwork();
  return network.name
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [chainName, setChainName] = useState("");
  const [chain, setChain] = useState(""); // 当前选择的链
  const [isOpen, setIsOpen] = useState(false); // 控制下拉菜单的显示/隐藏
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState("");

  // 支持的链列表(自己维护)
  const chains = [
    { id: "ethereum", name: "Ethereum", "icon": "https://cryptologos.cc/logos/ethereum-eth-logo.png", rpcUrl: "https://mainnet.infura.io/" },
    { id: "bsc", name: "Binance Smart Chain", "icon": "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", rpcUrl: "https://bsc-dataseed.binance.org/"},
    { id: "polygon", name: "Polygon", "icon": "https://cryptologos.cc/logos/polygon-matic-logo.png"},
    { id: "sepolia", name: "Sepolia", "icon": "https://cryptologos.cc/logos/ethereum-pow-ethw-logo.png"},
    { id: "bnbT", name: "BnbT", "icon": "https://cryptologos.cc/logos/bnb-bnb-logo.png"}
  ];

  // 处理链选择
  const handleChainSelect = (chain) => {
    setChain(chain);
    // setChain(chain.name);
    setIsOpen(false); // 选择后关闭下拉菜单
  };

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const changeTextArea = (e) => {
    setformData(e.target.value);
  };

  const initWallet = async (accounts) => {
    const newProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(newProvider);
    const name = await getChainName(newProvider);
    await getChainName().then(chainName => {
      console.log("chainName", chainName);
      setChainName(chainName)
    });
    setChainName(name);
    setCurrentAccount(accounts[0]);
    const balances = await fetchTokenBalances(accounts[0], name);
    setTokens(balances);
    const ethBalance = await newProvider.getBalance(accounts[0]);
    setBalance(ethers.formatEther(ethBalance));
    // setCurrentAccount(accounts[0]);
    // const balances = await fetchTokenBalances(accounts[0]);
    // setTokens(balances);
    console.log('tokens', tokens);
  }

  const welToEther = (balanceInWei) => {
    return ethers.formatUnits(balanceInWei, 'ether');
  }

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        await initWallet(accounts)
      }

      // await getAllTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAccountData = async (provider) => {
    try {
      // 获取账户地址（假设钱包已连接）
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setCurrentAccount(address);

      // 获取账户余额
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatUnits(balanceWei, 'ether');
      setTokens(balanceEth);

      // 获取代币余额
      // const tokens = await fetchTokenBalances(address, chain.chainName);
      // setTokens(tokens);
    } catch (error) {
      console.error("Failed to fetch account data:", error);
    }
  };

  const fetchTokenBalances = async (userAddress) => {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4MTUzNWI0LTE2NjItNGFjZS1hNDlmLTc4ZGM0YTgzMTljNyIsIm9yZ0lkIjoiNDMyNTYzIiwidXNlcklkIjoiNDQ0OTU3IiwidHlwZUlkIjoiNzlhZWVjNjYtY2YxYi00YjY3LWIzNDAtYWJhMDIwOTBkNjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAwMzg0MzgsImV4cCI6NDg5NTc5ODQzOH0.a3wwAv2uFHkYE6qTEmcbrjI5hEtsDxKhFDoQ2AMMmIU';
    const chain = chainName ? chainName : 'eth';
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
      return data.result.filter(token => token.balance > 0); // 过滤出余额大于 0 的代币
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };


  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install Web3Wallet.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts", });
      await initWallet(accounts);
      // setCurrentAccount(accounts[0]);
      // const balances = await fetchTokenBalances(accounts[0]);
      // setTokens(balances);
      // console.log('tokens', tokens);
      // await getChainName().then(chainName => {
      //   console.log("chainName", chainName);
      //   setChainName(chainName)
      // });
      // window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object1");
    }
  };

  const sendTransaction = async (addresses, amounts) => {
    try {
      if (ethereum) {
        console.log("amounts",amounts)
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        // 初始化调用合约
        const transactionsContract = await createEthereumContract();
        // gas
        const gasLimit = ethers.parseUnits('1000000', 'wei');
        // 金额计算
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
        const balance = await provider.getBalance(signerAddress);
        if (balance < totalAmount) {
          console.error("Insufficient balance");
          return { success: false, error: "Insufficient balance" };
        }
        // 调用合约的批量转账方法
        const transactionResponse = await transactionsContract.batchTransfer(addresses, amounts, {
          gasLimit: gasLimit,
          value: totalAmount
        });
        console.log('transactionResponse', transactionResponse)

        setIsLoading(true);
        console.log(`Loading - ${transactionResponse.hash}`);

        // 等待交易确认
        await transactionResponse.wait();
        console.log(`Success - ${transactionResponse.hash}`);
        setIsLoading(false);

        // 返回发送成功通知
        return { success: true, transactionHash: transactionResponse.hash };
      } else {
        console.log("No Ethereum object detected");
        return { success: false, error: "No Ethereum object detected" };
      }
    } catch (error) {
      console.error("Error during batch transfer:", error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("handleSubmitFormData", formData);

      // 移除多余的空格和换行符
      const cleanedInput = formData.replace(/\s+/g, ' ').trim();
      console.log('cleanedInput', cleanedInput);

      // 按换行符后跟空格分割
      const pairs = cleanedInput.split(' ').map(pair => pair.trim());

      const addresses = [];
      const amounts = [];

      console.log("pairs", pairs);

      for (const pair of pairs) {
        if (!pair) continue; // 跳过空行

        const [address, amount] = pair.split(',');
        console.log('pair', pair);
        // 检查地址是否有效
        if (!ethers.isAddress(address)) {
          throw new Error(`Invalid Ethereum address: ${address}`);
        }

        // 检查数值是否有效
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
          throw new Error(`Invalid amount: ${amount}`);
        }
        addresses.push(address);
        amounts.push(ethers.parseEther(amount)); // 将数值转换为 Wei
      }

      // 调用批量转账函数
      const result = await sendTransaction(addresses, amounts);

      if (result.success) {
        alert(`Batch transfer successful! Transaction Hash: ${result.transactionHash}`);
      } else {
        alert(`Batch transfer failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during handleSubmit:", error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect().then(r => console.log("r1", r));
    // checkIfTransactionsExists().then(r => console.log("r2", r));
    if (chain) {
      console.log('chain', chain);
      const newProvider  = new JsonRpcProvider(chain.rpcUrl);
      setProvider(provider);
      if (currentAccount) {
        newProvider.getBalance(currentAccount).then(ethBalance => {
          setBalance(ethers.formatEther(ethBalance));
        });
        fetchTokenBalances(currentAccount, chain.name).then(balances => {
          setTokens(balances);
        });
      }
    }
    localStorage.setItem('chainName', JSON.stringify(chainName));
  }, [chain]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
        tokens,
        chainName,
        welToEther,
        changeTextArea,
        handleSubmit,
        handleChainSelect,
        chain,
        setChain,
        chains,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
