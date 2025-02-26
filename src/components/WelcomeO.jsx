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
    const { Option } = Select;
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
    return (
        <div className="flex w-full justify-center items-center mt-10">
            <div className="flex flex-[0.9] w-full md:flex-row flex-col items-start justify-between md:p-10 py-12 px-4">
                <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10">
                    <h1 className="text-2xl font-bold mb-8">批量转账工具</h1>
                    {/*<div
              className="p-3 flex justify-end items-start flex-col rounded-xl h-40 sm:w-72 w-full my-5 eth-card .white-glassmorphism ">
            <div className="flex justify-between flex-col w-full h-full">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
                  <SiEthereum fontSize={21} color="#fff"/>
                </div>
                <BsInfoCircle fontSize={17} color="#fff"/>
              </div>
              <div>
                <p className="text-white font-light text-sm">
                  {shortenAddress(currentAccount)}
                </p>
                <p className="text-white font-semibold text-lg mt-1">
                  {chainName}
                </p>
              </div>
            </div>
          </div> */}
                    <Steps
                        size="small"
                        current={current}
                        items={items}
                    />
                    {current === 0 && (
                        <div
                            className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism"
                            style={{width: '900px'}}>
                            {!tokens || tokens.length === 0 ? (
                                    <div className="w-full flex flex-row justify-start items-center ">
                                        <div className="w-0.3 mr-3">
                                            <label className="block text-sm font-medium mb-2">选择链</label>
                                            <select
                                                value={chain}
                                                onChange={handleChainChange}
                                                className="my-3 w-full rounded-sm p-1.5 outline-none bg-transparent border-none text-xs white-glassmorphism">
                                                {chains.map((chain) => (
                                                    <option key={chain.id} value={chain.id} className="my-3 w-full rounded-sm p-1.5 outline-none bg-transparent border-none text-xs white-glassmorphism">
                                                        {chain.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/*<div className="w-0.3 mr-3">
                                            <label className="block text-sm font-medium mb-2">选择链</label>
                                            <Select
                                                value={chain}
                                                onChange={handleChainChange}
                                                className="my-3 w-full rounded-sm p-1.5 outline-none bg-transparent border-none text-xs white-glassmorphism"
                                                popupClassName="white-glassmorphism"
                                                style={{
                                                    // marginTop: '0.75rem',
                                                    // marginBottom: '0.75rem',
                                                    // 对应 w-full
                                                    // width: '100%',
                                                    // 对应 rounded-sm
                                                    borderRadius: '16px',
                                                    // 对应 p-1.5
                                                    // padding: '0.375rem',
                                                    // 对应 outline-none
                                                    // outline: 'none',
                                                    // 对应 bg-transparent
                                                    // backgroundColor: 'transparent',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    // 对应 border-none
                                                    // border: 'none',
                                                    // 对应 text-xs
                                                    fontSize: '0.75rem',
                                                    // color: 'white',
                                                }}
                                                dropdownStyle={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                    backdropFilter: "blur(10px)",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                }}
                                            >
                                                {chains.map((chain) => (
                                                    <Option key={chain.id} value={chain.id}>
                                                        <div className="flex items-center">
                                                            <img src={chain.icon} alt={chain.name} className="w-4 h-4 mr-2" />
                                                            <span>{chain.name}</span>
                                                        </div>
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>*/}
                                        <div className="w-full">
                                            <label className="block text-sm font-medium mb-2">代币合约地址</label>
                                            <Input placeholder="Choose your token" name="chooseToken" type="text"/>
                                        </div>
                                    </div>) : (
                                    <select defaultValue="" required
                                            className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-sm white-glassmorphism">
                                        <option disabled hidden value="" className="">Choose your token</option>
                                        {tokens.map((token, index) => (
                                            <option key={index} value={token.address} className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-sm white-glassmorphism">
                                                {chainName} - ({token.symbol}) : {welToEther(token.balance)}
                                            </option>
                                        ))}
                                    </select>
                            )}
                            <p className="w-full text-white text-xs text-left mt-3 ml-2">address,amounts</p>
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
                    {current === 1 && (
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
                        </div>)}
                </div>
            </div>
        </div>
    );
};

export default Welcome;
