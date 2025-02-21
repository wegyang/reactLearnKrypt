// import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
//
// import { contractABI, contractAddress } from "../utils/constants";
//
// export const TransactionContext = React.createContext(undefined);
//
// const { ethereum } = window;
//
// const createEthereumContract = () => {
//   const provider = new ethers.BrowserProvider(ethereum);
//   const signer = provider.getSigner();
//   const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
//   return transactionsContract;
// };
//
// const getChainName = async () => {
//   const provider = new ethers.BrowserProvider(ethereum);
//   const network = await provider.getNetwork();
//   return network.name
// };
//
// export const TransactionsProvider = ({ children }) => {
//   const [formData, setformData] = useState("");
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
//   const [transactions, setTransactions] = useState([]);
//   const [tokens, setTokens] = useState([]);
//   const [chainName, setChainName] = useState("");
//   const [selectedToken, setSelectedToken] = useState('');
//
//   const handleChange = (e, name) => {
//     setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
//   };
//
//   const changeTextArea = (e) => {
//     setformData(e.target.value);
//   };
//
//   const getAllTransactions = async () => {
//     try {
//       if (ethereum) {
//         const transactionsContract = createEthereumContract();
//
//         const availableTransactions = await transactionsContract.getAllTransactions();
//
//         const structuredTransactions = availableTransactions.map((transaction) => ({
//           addressTo: transaction.receiver,
//           addressFrom: transaction.sender,
//           timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
//           message: transaction.message,
//           keyword: transaction.keyword,
//           amount: parseInt(transaction.amount._hex) / (10 ** 18)
//         }));
//
//         console.log(structuredTransactions);
//
//         setTransactions(structuredTransactions);
//       } else {
//         console.log("Ethereum is not present");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };
//
//   const handleTokenSelect = (e) => {
//     const selectedAddress = e.target.value;
//     setSelectedToken(selectedAddress);
//
//     if (selectedAddress) {
//       const selectedToken = tokens.find(token => token.address === selectedAddress);
//       console.log("Selected Token:", selectedToken);
//     } else {
//       console.log("No token selected.");
//     }
//   };
//
//   const initWallet = async (accounts) => {
//     await getChainName().then(chainName => {
//       console.log("chainName", chainName);
//       setChainName(chainName)
//     });
//     setCurrentAccount(accounts[0]);
//     const balances = await fetchTokenBalances(accounts[0]);
//     setTokens(balances);
//     console.log('tokens', tokens);
//   }
//
//   const welToEther = (balanceInWei) => {
//     return ethers.formatUnits(balanceInWei, 'ether');
//   }
//
//   const checkIfWalletIsConnect = async () => {
//     try {
//       if (!ethereum) return alert("Please install Web3Wallet.");
//       const accounts = await ethereum.request({ method: "eth_accounts" });
//       if (accounts.length) {
//         await initWallet(accounts)
//       }
//
//       // await getAllTransactions();
//     } catch (error) {
//       console.log(error);
//     }
//   };
//
//   // const checkIfTransactionsExists = async () => {
//   //   try {
//   //     if (ethereum) {
//   //       const transactionsContract = createEthereumContract();
//   //       const currentTransactionCount = await transactionsContract.getTransactionCount();
//   //
//   //       window.localStorage.setItem("transactionCount", currentTransactionCount);
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //
//   //     throw new Error("No ethereum object2");
//   //   }
//   // };
//
//   const fetchTokenBalances = async (userAddress) => {
//     const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjQ4MTUzNWI0LTE2NjItNGFjZS1hNDlmLTc4ZGM0YTgzMTljNyIsIm9yZ0lkIjoiNDMyNTYzIiwidXNlcklkIjoiNDQ0OTU3IiwidHlwZUlkIjoiNzlhZWVjNjYtY2YxYi00YjY3LWIzNDAtYWJhMDIwOTBkNjg5IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NDAwMzg0MzgsImV4cCI6NDg5NTc5ODQzOH0.a3wwAv2uFHkYE6qTEmcbrjI5hEtsDxKhFDoQ2AMMmIU';
//     const chain = chainName ? chainName : 'eth';
//     const url = `https://deep-index.moralis.io/api/v2.2/wallets/${userAddress}/tokens?chain=${chain}`;
//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'accept': 'application/json',
//           'X-API-Key': apiKey,
//         },
//       });
//       if (!response.ok) {
//          console.error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("data_____", data)
//       return data.result.filter(token => token.balance > 0); // 过滤出余额大于 0 的代币
//     } catch (error) {
//       console.error("Error fetching token balances:", error);
//       return [];
//     }
//   };
//
//
//   const connectWallet = async () => {
//     try {
//       if (!ethereum) return alert("Please install Web3Wallet.");
//       const accounts = await ethereum.request({ method: "eth_requestAccounts", });
//       await initWallet(accounts);
//       // setCurrentAccount(accounts[0]);
//       // const balances = await fetchTokenBalances(accounts[0]);
//       // setTokens(balances);
//       // console.log('tokens', tokens);
//       // await getChainName().then(chainName => {
//       //   console.log("chainName", chainName);
//       //   setChainName(chainName)
//       // });
//       // window.location.reload();
//     } catch (error) {
//       console.log(error);
//
//       throw new Error("No ethereum object1");
//     }
//   };
//
//   const sendTransaction = async (addresses, amounts) => {
//     try {
//       if (ethereum) {
//         const transactionsContract = createEthereumContract();
//         const parsedAmount = ethers.utils.parseEther(amount);
//
//         await ethereum.request({
//           method: "eth_sendTransaction",
//           params: [{
//             from: currentAccount,
//             to: addressTo,
//             gas: "0x5208",
//             value: parsedAmount._hex,
//           }],
//         });
//
//         const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
//
//         setIsLoading(true);
//         console.log(`Loading - ${transactionHash.hash}`);
//         await transactionHash.wait();
//         console.log(`Success - ${transactionHash.hash}`);
//         setIsLoading(false);
//
//         const transactionsCount = await transactionsContract.getTransactionCount();
//
//         setTransactionCount(transactionsCount.toNumber());
//         window.location.reload();
//       } else {
//         console.log("No ethereum object3");
//       }
//     } catch (error) {
//       console.log(error);
//
//       throw new Error("No ethereum object4");
//     }
//   };
//
//   const handleSubmit = async (e) => {
//     console.log("handleSubmitFormData", formData);
//     // 移除多余的空格和换行符
//     const cleanedInput = formData.replace(/\s+/g, ' ').trim();
//
//     // 按空格或换行符分割
//     const pairs = cleanedInput.split(/[\n,]/).map(pair => pair.trim());
//
//     const addresses = [];
//     const amounts = [];
//
//     for (const pair of pairs) {
//       if (!pair) continue; // 跳过空行
//
//       const [address, amount] = pair.split(',');
//
//       // 检查地址是否有效
//       if (!ethers.isAddress(address)) {
//         throw new Error(`Invalid Ethereum address: ${address}`);
//       }
//
//       // 检查数值是否有效
//       if (isNaN(Number(amount)) || Number(amount) <= 0) {
//         throw new Error(`Invalid amount: ${amount}`);
//       }
//
//       addresses.push(address);
//       amounts.push(ethers.formatUnits(amount, 'wei')); // 将数值转换为 Wei
//     }
//     try {
//       const result = sendTransaction(addresses, amounts);
//       console.log(result);
//     } catch (error) {
//       console.error(error);
//     }
//     e.preventDefault();
//   };
//
//   useEffect(() => {
//     checkIfWalletIsConnect().then(r => console.log("r1", r));
//     // checkIfTransactionsExists().then(r => console.log("r2", r));
//     localStorage.setItem('chainName', JSON.stringify(chainName));
//   }, [chainName]);
//
//   return (
//     <TransactionContext.Provider
//       value={{
//         transactionCount,
//         connectWallet,
//         transactions,
//         currentAccount,
//         isLoading,
//         sendTransaction,
//         handleChange,
//         formData,
//         tokens,
//         chainName,
//         welToEther,
//         changeTextArea,
//         handleSubmit,
//       }}
//     >
//       {children}
//     </TransactionContext.Provider>
//   );
// };
