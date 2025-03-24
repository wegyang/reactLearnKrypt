import React, {useContext, useState} from "react";
import {TransactionContext} from "../context/TransactionContext";
import {Loader} from ".";
import SelectChain from "./SelectChain.jsx";
// import {Steps} from "antd";

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
        chain,
        formData,
        isLoading,
        changeTextArea,
        handleSubmit,
    } = useContext(TransactionContext);
    const [current, setCurrent] = useState(0);
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
    console.log("current", chain);

    return (
        <div className="flex w-full justify-center items-center mt-0">
            <div className="flex flex-[0.9] w-full md:flex-row flex-col items-start justify-between md:p-10 py-12 px-4">
                <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10">
                    <h1 className="text-2xl font-bold mb-4">批量转账工具</h1>
                    {/*<Steps
                        size="small"
                        current={current}
                        items={items}
                    />*/}
                    {current === 0 && (
                        <div
                            className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism"
                            style={{width: '900px'}}>
                           <SelectChain></SelectChain>
                            <p className="w-full  text-xs text-left mt-3 ml-2">收款地址列表（每行一个 价格用,分开）</p>
                            <textarea value={formData} name="sendData" onChange={changeTextArea}
                                      className="my-3 h-70 w-full rounded-sm p-2 outline-none bg-transparent border-none text-xs white-glassmorphism"></textarea>
                            <div className="h-[1px] w-full bg-gray-400 my-2"/>
                            {isLoading
                                ? <Loader/>
                                : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className=" w-full mt-2 border-[1px] p-2 border-[#3d4f7c] bg-[#2982e3] hover:bg-[#2556bd] text-white rounded-full cursor-pointer"
                                    >
                                        发送
                                    </button>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
        ;
};

export default Welcome;
