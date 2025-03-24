import {ethers} from "ethers";
import {useContext} from "react";
import {TransactionContext} from "../context/TransactionContext.jsx";


const InputS = ({placeholder, name, type, value, handleChange}) => (
    <input
        placeholder={placeholder}
        type={type}
        step="0.0001"
        value={value}
        onChange={(e) => handleChange(e, name)}
        className="my-3 w-full rounded-sm p-2 outline-none bg-transparent border-none text-xs white-glassmorphism"
    />
);

const SelectChain = () => {
    const {
        chain,
        isOpen,
        setIsOpen,
        handleChainSelect,
        chains,
        tokens,
        selected,
        setSelected,
        handleOptionClick,
    } = useContext(TransactionContext);

    return (<>
        {!tokens || tokens.length === 0 ? (
        <div className="w-full flex-col justify-start items-center ">
            <div className="w-0.3 mr-3 flex items-start justify-start flex-row">
                <label className="block text-sm font-medium ml-2">选择链</label>
                <label className="block text-sm font-medium ml-25">代币合约地址</label>
            </div>
            <div className="flex items-center justify-center flex-row">
                <div className="w-0.3 mr-3">
                    {/* 自定义下拉菜单触发器 */}
                    <div
                        className="my-3 w-30 flex rounded-sm p-2 pl-3 whitespace-nowrap overflow-hidden text-ellipsis outline-none bg-transparent border-none text-xs white-glassmorphism cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >

                        {chain && (<div className="flex font-bold">
                            <img src={chain.icon} alt={chain.name}
                                 className="w-4 h-4 mr-1"/> {chain.name}
                        </div>) || "请选择链"}
                    </div>
                    {/* 自定义下拉菜单 */}
                    {isOpen && (
                        <ul className="absolute w-3/12 bg-customGreen opacity-100 border border-gray-300 rounded-sm shadow-lg z-50">
                            {chains.map((chain) => (
                                <li
                                    key={chain.id}
                                    className="flex p-1.5 text-xs hover:bg-gray-100 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                                    onClick={() => handleChainSelect(chain)}
                                >
                                    <img src={chain.icon} alt={chain.name}
                                         className="w-4 h-4 mr-1"/>
                                    {chain.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="w-full">
                    <InputS placeholder="" name="chooseToken" type="text"/>
                </div>
            </div>
        </div>) : (
        <div className="w-full flex-col justify-start items-center ">
            <div className="w-0.3 mr-3 flex items-start justify-start flex-row">
                <label className="block text-sm font-medium mb-2 ml-2">选择链</label>
                <label
                    className="block text-sm font-medium mb-2 ml-25">代币合约地址(不输入为{chain.name}归集)</label>
            </div>
            <div className="flex items-center justify-center flex-row">
                <div className="w-0.3 mr-3">
                    {/* 自定义下拉菜单触发器 */}
                    <div
                        className="my-3 w-30 flex rounded-sm p-2 pl-3 whitespace-nowrap overflow-hidden text-ellipsis outline-none bg-transparent border-none text-xs white-glassmorphism cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >

                        {chain && (<div className="flex font-bold">
                            <img src={chain.icon} alt={chain.name}
                                 className="w-4 h-4 mr-1"/> {chain.name}
                        </div>) || "请选择链"}
                    </div>
                    {/* 自定义下拉菜单 */}
                    {isOpen && (
                        <ul className="absolute w-3/12 bg-customGreen opacity-100 border border-gray-300 rounded-sm shadow-lg z-10">
                            {chains.map((chain) => (
                                <li
                                    key={chain.id}
                                    className="flex p-1.5 text-xs hover:bg-gray-100 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                                    onClick={() => handleChainSelect(chain)}
                                >
                                    <img src={chain.icon} alt={chain.name}
                                         className="w-4 h-4 mr-1"/>
                                    {chain.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="w-full">
                    <div className="custom-select relative">
                        <div
                            className="select-selected my-3 w-full rounded-sm p-1.5 outline-none bg-transparent border-none text-sm white-glassmorphism cursor-pointer"
                            onClick={() => setSelected(selected === 'Choose your token' ? 'open' : 'Choose your token')}
                        >
                            {selected === 'open' ? 'Choose your token' : selected}
                        </div>
                        {selected === 'open' && (
                            <div
                                className="select-items absolute text-sm bg-white border border-gray-300 w-full rounded-sm">
                                {tokens.map((token, index) => (
                                    <div
                                        key={index}
                                        className="h-8 option p-2 bg-customGreen rounded-sm shadow-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleOptionClick(`(${token.symbol || chain.symbol}) : ${ethers.formatUnits(token.balance, 'ether')}`)}
                                    >
                                        ({token.symbol || chain.symbol})
                                        : {ethers.formatUnits(token.balance, 'ether')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )}</>
    )
}

export default SelectChain;