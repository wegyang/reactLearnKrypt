import {ethers} from "ethers";
import React, {useContext, useState, useRef} from "react";
import {TransactionContext} from "../context/TransactionContext.jsx";
import {InputNumber, Switch, Tooltip} from 'antd';
import {QuestionCircleOutlined, SafetyCertificateOutlined} from '@ant-design/icons'
import MyCodeMirror from "../components/CodeMirror.jsx";


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

const MulTransfer = () => {
    const {
        chain,
        isOpen,
        setIsOpen,
        handleChainSelect,
        chains,
        formData,
        isLoading,
        tokens,
        changeTextArea,
        handleSubmit,
        selected,
        setSelected,
        handleOptionClick,
    } = useContext(TransactionContext);
    const [waitTime, setWaitTime] = useState(false)
    const [isRandomTime, setIsRandomTime] = useState(false)
    const [minRandomTime, setMinRandomTime] = useState(0)
    const [maxRandomTime, setMaxRandomTime] = useState(2)
    const onChange = (timeValue) => {
        setWaitTime(timeValue)
    }
    // 选择文件
    const privateKeyInputRef = useRef(null);
    const [privateKeyContent, setPrivateKeyContent] = useState('');
    const addressInputRef = useRef(null);
    const [addressContent, setAddressContent] = useState('');
    const [invalidAddressLines, setInvalidAddressLines] = useState([]);
    const [invalidPrivateKeyLines, setInvalidPrivateKeyLines] = useState([]);
    // 处理文件选择
    const handlePrivateKeyFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // 将内容按换行符拆分，并过滤掉空行
                const lines = content.split('\n').filter((line) => line.trim() !== ''); // 按行拆分并过滤空行
                // 更新地址内容和无效行号
                invalidCheck('private', lines.join('\n'));
                setPrivateKeyContent(lines.join('\n'));
            };
            reader.readAsText(file); // 以文本形式读取文件
        }
    };
    // 通过ref引用fileInputRef输入框，以便在点击“上传文件”时触发文件选择
    const handlePrivateKeyUploadClick = () => {
        privateKeyInputRef.current.click();
    };
    const handlePrivateKeyCodeMirrorChange = React.useCallback((value) => {
        invalidCheck('privateKey', value);
        setPrivateKeyContent(value);
    }, []);
    // 地址
    const handleAddressFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n').filter((line) => line.trim() !== ''); // 按行拆分并过滤空行
                // 更新地址内容和无效行号
                invalidCheck('address', lines.join('\n'));
                setAddressContent(lines.join('\n'));
            }
            reader.readAsText(file); // 以文本形式读取文件
        }
    };
    const handleAddressUploadClick = () => {
        addressInputRef.current.click();
    };
    const handleAddressCodeMirrorChange = React.useCallback((value) => {
        console.log(value);
        invalidCheck('address', value)
        setAddressContent(value);
    }, []);

    const invalidCheck = (type, content) => {
        const invalidLines = []; // 存储无效地址的行号
        const lines = content.split('\n').filter((line) => line.trim() !== '');
        // 检查每一行是否是有效的钱包地址
        lines.forEach((line, index) => {
            if (type === 'address') {
                if (!ethers.isAddress(line.trim())) {
                    invalidLines.push({line: index + 1, content: line.trim()}); // 记录无效地址的行号和内容
                    setInvalidAddressLines(invalidLines);
                } else {
                    setInvalidAddressLines([]);
                }
            } else {
                // 检查是否为正确的私钥
                // 检查是否为正确的私钥
                try {
                    // 尝试使用私钥创建一个钱包实例
                    new ethers.Wallet(line.trim());
                    setInvalidPrivateKeyLines([]);
                } catch {
                    // 如果创建失败，说明私钥无效
                    invalidLines.push({line: index + 1, content: line.trim()});
                    setInvalidPrivateKeyLines(invalidLines);
                }

            }
        });
    }

    return (
        <div className="flex w-full justify-center items-center mt-0">
            <div className="flex flex-[0.9] w-full md:flex-row flex-col items-start justify-between md:p-10 py-12 px-4">
                <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10">
                    <h1 className="text-2xl font-bold mb-8">钱包多对多转账</h1>
                    <div
                        className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism"
                        style={{width: '900px'}}>
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

                        )}
                        <div className="w-full my-3 flex flex-row justify-start items-center ">
                            <div className="w-2/5 flex flex-col items-start justify-start flex-shrink-0">
                                <div className="flex justify-between items-center w-full">
                                    <label className="w-full block text-sm font-medium">任务执行间隔
                                        <Tooltip className="ml-2" title={<span>每个任务间隔执行时间</span>}>
                                            <QuestionCircleOutlined/>
                                        </Tooltip>
                                    </label>
                                    <div className="w-full ml-8">
                                        <Switch checked={isRandomTime}
                                                onChange={(checked) => setIsRandomTime(checked)}/>
                                        <label className="text-sm font-medium ml-2">随机时间</label>
                                    </div>
                                </div>

                                {!isRandomTime ? (<InputNumber style={{width: 300, marginTop: 10}} defaultValue={0}
                                                               onChange={onChange}></InputNumber>)
                                    : (<div className="flex justify-around items-center align-middle mt-2">
                                            <input
                                                className=" w-32 rounded-sm mx-3 ml-0 p-1.5 outline-none bg-transparent border-none text-sm white-glassmorphism"
                                                value={minRandomTime} type="text"></input> <p>—</p>
                                            <input
                                                className=" w-32 rounded-sm mx-3 p-1.5 outline-none bg-transparent border-none text-sm white-glassmorphism"
                                                value={maxRandomTime} type="text"></input>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="w-3/5 flex flex-col items-start justify-start flex-shrink-0">
                                <label className="w-full block text-sm font-medium">RPC节点</label>
                                <input
                                    className=" w-full rounded-sm mt-3 p-1.5 outline-none bg-transparent border-none text-sm white-glassmorphism"
                                    value={chain ? chain.rpcUrl : ''} type="text"></input>
                            </div>
                        </div>
                        <div className="w-full flex mt-2">
                            <div className="w-1/2 mr-2.5 flex flex-col justify-center items-center">
                                <div className="w-full mb-2 flex flex-row text-sm justify-between align-middle">
                                    <div>
                                        <span>私钥列表</span>
                                        <span className="ml-2 bg-green-200 text-green-500 text-xs"> <Tooltip
                                            title={<div><p className="my-3">1.纯前端调用，不会保存、记录您任何的数据。</p>
                                                <p>2.请使用小额钱包，勿存放大额资金。</p>
                                                <p>3.养成良好的钱包操作习惯，提高自我钱包安全意识！</p>
                                                <p>4.操作不当、黑客攻击等造成的损失，本网站概不负责！</p></div>}>
                                                <SafetyCertificateOutlined className="mx-0.5"/>安全提示
                                            </Tooltip></span>
                                    </div>
                                    <span className="text-gray-400 underline cursor-pointer"
                                          onClick={handlePrivateKeyUploadClick}>上传文件</span>
                                    <input
                                        type="file"
                                        ref={privateKeyInputRef}
                                        style={{display: 'none'}}
                                        onChange={handlePrivateKeyFileUpload}
                                    />
                                </div>
                                <MyCodeMirror value={privateKeyContent} onChange={handlePrivateKeyCodeMirrorChange}/>
                                <div style={{color: '#aec2e3'}} className="text-sm">每行输入一个私钥</div>
                            </div>
                            <div className="w-1/2 ml-2.5 flex flex-col justify-center items-center">
                                <div className="w-full mb-2 text-sm flex flex-row justify-between align-middle">
                                    <div>
                                        <span>地址列表</span>
                                    </div>
                                    <span className="text-gray-400 underline cursor-pointer"
                                          onClick={handleAddressUploadClick}>上传文件</span>
                                    <input
                                        type="file"
                                        ref={addressInputRef}
                                        style={{display: 'none'}}
                                        onChange={handleAddressFileUpload}
                                    />
                                </div>
                                <MyCodeMirror value={addressContent} onChange={handleAddressCodeMirrorChange}/>
                                <div style={{color: '#aec2e3'}} className="text-sm">每行输入一个地址</div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                    <div className="w-full p-5 px-40 mt-2 mx-32 flex justify-around items-center ">
                        {invalidPrivateKeyLines.length > 0 && (
                            <div>
                                <p className={"text-red-500 text-sm"}>以下私钥无效</p>
                                <div
                                    className={"error-glassmorphism sm:w-100  flex-shrink-0 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis"}>
                                    <div className="w-full text-red-500 text-sm ">
                                        {invalidPrivateKeyLines.map((item) => (
                                            <p key={item.line} className="mt-1 w-full">
                                                第 {item.line} 行: {item.content} 无效的私钥
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {invalidAddressLines.length > 0 && (
                            <div>
                                <p className={"text-red-500 text-sm"}>以下钱包地址无效</p>
                                <div className="error-glassmorphism sm:w-100 flex-shrink-0 px-4 py-2">

                                    <div className="w-full text-red-500 text-sm whitespace-nowrap overflow-hidden">
                                        {invalidAddressLines.map((item) => (
                                            <p key={item.line} className="mt-1">
                                                第 {item.line} 行: {item.content} 无效的钱包地址
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default MulTransfer;
