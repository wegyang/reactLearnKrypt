import React, {useContext, useState} from "react";
import {AiFillPlayCircle} from "react-icons/ai";
import {SiEthereum} from "react-icons/si";
import {BsInfoCircle} from "react-icons/bs";

import {TransactionContext} from "../context/TransactionContext";
import {shortenAddress} from "../utils/shortenAddress";
import {Loader} from ".";
import {Steps, Select} from "antd";

const companyCommonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";

// eslint-disable-next-line react/prop-types
const Input = ({placeholder, name, type, value, handleChange}) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e) => handleChange(e, name)}
        className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-xs white-glassmorphism"
    />
);

const steps = [
    {
        title: 'First',
        content: 'First-content',
    },
    {
        title: 'Second',
        content: 'Second-content',
    },
    {
        title: 'Last',
        content: 'Last-content',
    },
];

const Welcome = () => {
    const {
        handleChange,
        chain,
        chains,
        formData,
        isLoading,
        tokens,
        chainName,
        welToEther,
        changeTextArea,
        handleChainChange,
        handleSubmit
    } = useContext(TransactionContext);
    const [current, setCurrent] = useState(0);
    const {Option} = Select;
    const next = () => {
        setCurrent(current + 1);
    };
    const prev = () => {
        setCurrent(current - 1);
    };
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));
    const [isOpen, setIsOpen] = useState(false); // 控制下拉菜单的显示/隐藏
    const [selectedChain, setSelectedChain] = useState(""); // 当前选中的链
    // 处理链选择
    const handleChainSelect = (chain) => {
        setSelectedChain(chain.name);
        setIsOpen(false); // 选择后关闭下拉菜单
    };

    return (
        <div className="flex w-full justify-center items-center mt-10">
            <div className="flex flex-[0.9] w-full md:flex-row flex-col items-start justify-between md:p-10 py-12 px-4">
                <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10">
                    <h1 className="text-2xl font-bold mb-8">批量转账工具</h1>
                    {/*<Steps
                        size="small"
                        current={current}
                        items={items}
                    />*/}
                    {current === 0 && (
                        <div
                            className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism"
                            style={{width: '900px'}}>
                            {!tokens || tokens.length === 0 ? (
                                <div className="w-full flex-col justify-start items-center ">
                                    <div className="w-0.3 mr-3 flex items-start justify-start flex-row">
                                        <label className="block text-sm font-medium mb-2 ml-2">选择链</label>
                                        <label className="block text-sm font-medium mb-2 ml-25">代币合约地址</label>
                                    </div>
                                    <div className="flex items-center justify-center flex-row">
                                        <div className="w-0.3 mr-3">
                                            {/* 自定义下拉菜单触发器 */}
                                            <div
                                                className="my-3 w-30 rounded-sm p-2 pl-3 whitespace-nowrap overflow-hidden text-ellipsis outline-none bg-transparent border-none text-xs white-glassmorphism cursor-pointer"
                                                onClick={() => setIsOpen(!isOpen)}
                                            >
                                                {selectedChain || "请选择链"}
                                            </div>
                                            {/* 自定义下拉菜单 */}
                                            {isOpen && (
                                                <ul className="absolute w-3/12 bg-customGreen opacity-100 border border-gray-300 rounded-sm shadow-lg z-10">
                                                    {chains.map((chain) => (
                                                        <li
                                                            key={chain.id}
                                                            className="p-1.5 text-xs hover:bg-gray-100 cursor-pointer "
                                                            onClick={() => handleChainSelect(chain)}
                                                        >
                                                            {chain.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <Input placeholder="" name="chooseToken" type="text"/>
                                        </div>
                                    </div>
                                </div>) : (
                                <select defaultValue="" required
                                        className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-sm white-glassmorphism">
                                    <option disabled hidden value="" className="">Choose your token</option>
                                    {tokens.map((token, index) => (
                                        <option key={index} value={token.address}
                                                className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-sm white-glassmorphism">
                                            {chainName} - ({token.symbol}) : {welToEther(token.balance)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="w-full text-white text-xs text-left mt-3 ml-2">收款地址列表（每行一个,价格用,分开）</p>
                            <textarea value={formData} name="sendData" onChange={changeTextArea}
                                      className="my-3 h-70 w-full rounded-sm p-2 outline-none bg-transparent border-none text-xs white-glassmorphism"></textarea>
                            <div className="h-[1px] w-full bg-gray-400 my-2"/>
                            {isLoading
                                ? <Loader/>
                                : (
                                    <button
                                        type="button"
                                        onClick={next}
                                        className=" w-full mt-2 border-[1px] p-2 border-[#3d4f7c] bg-[#2982e3] hover:bg-[#2556bd] text-white rounded-full cursor-pointer"
                                    >
                                        下一步
                                    </button>
                                )}
                        </div>
                    )}
                    {/*{current === 1 && (
                        <div
                            className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism">
                            {!tokens || tokens.length === 0 ? (
                                <Input placeholder="Choose your token" name="chooseToken" type="text"/>) : (
                                <select defaultValue="" required
                                        className="my-2 w-full rounded-sm p-2 outline-none bg-transparent border-none text-sm">
                                    <option disabled hidden value="" className="">Choose your token</option>
                                    {tokens.map((token, index) => (
                                        <option key={index} value={token.address}>
                                            {chainName} - ({token.symbol}) : {welToEther(token.balance)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <p className="w-full text-white text-xs text-left mt-3 ml-2">address,amounts</p>
                            <textarea value={formData} name="sendData" onChange={changeTextArea}
                                      className="my-2 h-70 w-full rounded-sm p-2 outline-none bg-transparent border-none text-xs white-glassmorphism"></textarea>
                            <div className="h-[1px] w-full bg-gray-400 my-2"/>
                            {isLoading
                                ? <Loader/>
                                : (
                                    <button
                                        type="button"
                                        onClick={next}
                                        className=" w-full mt-2 border-[1px] p-2 border-[#3d4f7c] bg-[#2982e3] hover:bg-[#2556bd] rounded-full cursor-pointer"
                                    >
                                        Send now
                                    </button>
                                )}
                        </div>)}*/}
                </div>
            </div>
        </div>
    )
        ;
};

export default Welcome;
