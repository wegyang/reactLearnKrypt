import {ethers} from "ethers";
import React, {useContext, useState, useRef} from "react";
import {TransactionContext} from "../context/TransactionContext.jsx";
import {InputNumber, Switch, Tooltip, Button, Table, Drawer, Flex, Radio } from 'antd';
import {QuestionCircleOutlined, SafetyCertificateOutlined} from '@ant-design/icons'
import MyCodeMirror from "../components/CodeMirror.jsx";
import SelectChain from "../components/SelectChain.jsx";

const { Column } = Table;
const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
        disabled: record.name === 'Disabled User',
        // Column configuration not to be checked
        name: record.name,
    }),
};

const MulTransfer = () => {
    const {
        chain,
        displayRpcUrl,
        gasFees,
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
    const [openDrawer, setOpenDrawer] = useState(false);
    const [amountType, setAmountType] = useState("all");
    const showDrawer = () => {
        setOpenDrawer(true);
    };
    const onCloseDrawer = () => {
        setOpenDrawer(false);
    };
    const onChange = (timeValue) => {
        setWaitTime(timeValue)
    }
    const onChangeMinRandomTime = (timeValue) => {
        setMinRandomTime(timeValue)
    }
    const onChangeMaxRandomTime = (timeValue) => {
        setMaxRandomTime(timeValue)
    }
    // 选择文件
    const privateKeyInputRef = useRef(null);
    const [privateKeyContent, setPrivateKeyContent] = useState('');
    const addressInputRef = useRef(null);
    const [addressContent, setAddressContent] = useState('');
    const [invalidAddressLines, setInvalidAddressLines] = useState([]);
    const [invalidPrivateKeyLines, setInvalidPrivateKeyLines] = useState([]);
    const [gasType, setGasType] = useState('fixed');
    const [gasLimitType, setGasLimitType] = useState('auto');
    const [gasFee, setGasFee] = useState(0);
    const [minGasFee, setMinGasFee] = useState(0);
    const [maxGasFee, setMaxGasFee] = useState(0);
    const [gasLimit, setGasLimit] = useState(21000);
    const [minGasLimit, setMinGasLimit] = useState(200000);
    const [maxGasLimit, setMaxGasLimit] = useState(300000);
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
        invalidCheck('address', value)
        setAddressContent(value);
    }, []);
    // 表格数据
    const addressData = [
        {"address": "0x11111"},
        {"address": "0x11112"}
    ]
    const invalidCheck = (type, content) => {
        const invalidLines = [];
        const lines = content.split('\n').filter(line => line.trim()!== '');
        // 如果没有有效行，直接清空对应无效项状态
        if (lines.length === 0) {
            type === 'address'
                ? setInvalidAddressLines([])
                : setInvalidPrivateKeyLines([]);
            return;
        }
        // 遍历每一行进行有效性检查
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            let isValid;

            if (type === 'address') {
                // 检查是否为有效的以太坊地址
                isValid = ethers.isAddress(trimmedLine);
            } else {
                try {
                    // 尝试使用私钥创建一个钱包实例
                    new ethers.Wallet(trimmedLine);
                    isValid = true;
                } catch {
                    isValid = false;
                }
            }
            // 如果无效，记录行号和内容
            if (!isValid) {
                invalidLines.push({ line: index + 1, content: trimmedLine });
            }
        });
        // 根据类型更新对应的无效项状态
        type === 'address'
            ? setInvalidAddressLines(invalidLines)
            : setInvalidPrivateKeyLines(invalidLines);
    };

    // 通用逻辑
    const createOnChangeHandler = (setter) => (value) => setter(value);
    const onChangeGasFee = createOnChangeHandler(setGasFee);
    const onChangeMinGasFee = createOnChangeHandler(setMinGasFee);
    const onChangeMaxGasFee = createOnChangeHandler(setMaxGasFee);
    const onChangeGasLimit = createOnChangeHandler(setGasLimit);
    const onChangeMinGasLimit = createOnChangeHandler(setMinGasLimit);
    const onChangeMaxGasLimit = createOnChangeHandler(setMaxGasLimit);

    // 通用组件
    const GasInput = ({ min, max, onChangeMin, onChangeMax, defaultValueMin, defaultValueMax }) => (
        <div className="flex justify-around items-center align-middle">
            <InputNumber
                style={{ width: 120, marginTop: 10 }}
                defaultValue={defaultValueMin}
                stringMode
                min="0"
                onChange={onChangeMin}
            />
            <p className="mt-2 mx-2">-</p>
            <InputNumber
                style={{ width: 120, marginTop: 10 }}
                defaultValue={defaultValueMax}
                stringMode
                min="0"
                onChange={onChangeMax}
            />
        </div>
    );

    // Gas Fee 和 Gas Limit 的组件映射
    const gasTypeComponents = {
        fixed: (
            <div className="flex flex-col justify-end items-start">
                <InputNumber min={0} onChange={onChangeGasFee} />
            </div>
        ),
        auto: <div></div>,
        random: (
            <GasInput
                onChangeMin={onChangeMinGasFee}
                onChangeMax={onChangeMaxGasFee}
                defaultValueMin={0}
                defaultValueMax={0}
            />
        ),
    };

    const gasLimitTypeComponents = {
        fixed: (
            <div className="flex flex-col justify-end items-start">
                <InputNumber min={0} defaultValue={21000} onChange={onChangeGasLimit} />
            </div>
        ),
        auto: <div></div>,
        random: (
            <GasInput
                onChangeMin={onChangeMinGasLimit}
                onChangeMax={onChangeMaxGasLimit}
                defaultValueMin={200000}
                defaultValueMax={300000}
            />
        ),
    };

    const GasSettingSection = ({ title, radioGroup, inputComponent }) => (
        <div className="flex w-full justify-around mt-3">
            <div className="flex flex-col justify-center items-center w-1/2 flex-shrink-0">
                <p className="mb-2 text-xl font-medium">{title}</p>
                {radioGroup}
            </div>
            <div className="flex w-1/2 flex-shrink-0 justify-center items-end">
                {inputComponent}
            </div>
        </div>
    );

    const [amountRandomMin, setAmountRandomMin] = useState(0);
    const [amountRandomMax, setAmountRandomMax] = useState(3);
    const [amountPercentRandomMin, setAmountPercentRandomMin] = useState(40);
    const [amountPercentRandomMax, setAmountPercentRandomMax] = useState(50);
    const [fixedAmount, setFixedAmount] = useState(0);
    const [keepFixed, setKeepFixed] = useState(0);
    const [keepRandomAmountMin, setKeepRandomAmountMin] = useState(0.05);
    const [keepRandomAmountMax, setKeepRandomAmountMax] = useState(40);


    const changeRandomAmountMin = (value) => {
        setAmountRandomMin(value)
    }
    const changeRandomAmountMax = (value) => {
        setAmountRandomMax(value)
    }
    const changeAmountPercentMin = (value) => {
        setAmountPercentRandomMin(value)
    }
    const changeAmountPercentMax = (value) => {
        setAmountPercentRandomMax(value)
    }
    const changeFixedAmount = (value) => {
        setFixedAmount(value)
    }
    const changeKeepFixed =(value) => {
        setKeepFixed(value)
    }
    const changeKeepRandomAmountMin = (value) => {
        setKeepRandomAmountMin(value)
    }

    const changeKeepRandomAmountMax = (value) => {
        setKeepRandomAmountMax(value)
    }

    const amountComponents = {
        randomAmount: (
            <div className="flex flex-col justify-center items-center mt-2.5">
                <label className="font-bold font-sm">随机金额</label>
                <div className="flex">
                    <InputNumber
                        style={{ width: 200, marginTop: 10 }}
                        value={amountRandomMin}
                        defaultValue="0"
                        stringMode
                        min="0"
                        onChange={changeRandomAmountMin}
                    />
                    <p className="mt-3.5 mx-2">-</p>
                    <InputNumber
                        style={{ width: 200, marginTop: 10 }}
                        value={amountRandomMax}
                        defaultValue="1"
                        stringMode
                        min="0"
                        onChange={changeRandomAmountMax}
                    />
                </div>
            </div>
        ),
        randomPercent: (
            <div className="flex flex-col justify-center items-center mt-2.5">
                <label className="font-bold font-sm">随机百分比%</label>
                <div className="flex">
                    <InputNumber
                        style={{ width: 200, marginTop: 10 }}
                        value={amountPercentRandomMin}
                        defaultValue="40"
                        stringMode
                        min="0"
                        onChange={changeAmountPercentMin}
                    />
                    <p className="mt-3.5 mx-2">-</p>
                    <InputNumber
                        style={{ width: 200, marginTop: 10 }}
                        value={amountPercentRandomMax}
                        defaultValue="50"
                        stringMode
                        min="0"
                        onChange={changeAmountPercentMax}
                    />
                </div>
            </div>
        ),
        fixedAmount: (
            <div className="flex flex-col justify-center items-center mt-2.5">
                <label className="font-bold font-sm">固定金额</label>
                <div className="flex">
                    <InputNumber
                        style={{ width: 400, marginTop: 10 }}
                        value={fixedAmount}
                        stringMode
                        min="0"
                        onChange={changeFixedAmount}
                    />
                </div>
            </div>
        ),
        keepFixed: (
            <div className="flex flex-col justify-center items-center mt-2.5">
                <label className="font-bold font-sm">固定金额</label>
                <div className="flex">
                    <InputNumber
                        style={{ width: 400, marginTop: 10 }}
                        value={keepFixed}
                        defaultValue="0"
                        stringMode
                        min="0"
                        onChange={changeKeepFixed}
                    />
                </div>
            </div>
        ),
        keepRandom: (
            <div className="flex flex-col justify-center items-center mt-2.5">
            <label className="font-bold font-sm">保留随机金额</label>
            <div className="flex">
                <InputNumber
                    style={{ width: 200, marginTop: 10 }}
                    value={keepRandomAmountMin}
                    defaultValue="0.05"
                    stringMode
                    min="0"
                    onChange={changeKeepRandomAmountMin}
                />
                <p className="mt-3.5 mx-2">-</p>
                <InputNumber
                    style={{ width: 200, marginTop: 10 }}
                    value={keepRandomAmountMax}
                    defaultValue="50"
                    stringMode
                    min="0"
                    onChange={changeKeepRandomAmountMax}
                />
            </div>
        </div>)
    }

    const submitDrawer = () => {
        setOpenDrawer(false)
    }

    return (
        <div className="flex w-full justify-center items-center mt-0">
            <div className="flex flex-[0.9] w-full md:flex-row flex-col items-start justify-between md:p-10 py-12 px-4">
                <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-10">
                    <h1 className="text-2xl font-bold mb-8">钱包多对多转账</h1>
                    <div
                        className="p-5 mt-10 sm:w-200 w-full flex flex-col justify-start items-center blue-glassmorphism"
                        style={{width: '900px'}}>
                        <SelectChain></SelectChain>
                        <div className="w-full my-3 flex flex-row justify-start items-center ">
                            <div className="w-2/5 flex flex-col items-start justify-start flex-shrink-0">
                                <div className="flex justify-between items-center w-full">
                                    <label className="w-full block text-sm font-medium">任务执行间隔
                                        <Tooltip className="ml-2" title={<span>每个任务间隔执行时间</span>}>
                                            <QuestionCircleOutlined/>
                                        </Tooltip>
                                    </label>

                                    <div className="w-full ml-8">
                                        {selected !== 'open' && (
                                        <Switch checked={isRandomTime} className={"z-0"}
                                                onChange={(checked) => setIsRandomTime(checked)}/>
                                        )}
                                        <label className="text-sm font-medium ml-2">随机时间</label>
                                    </div>

                                </div>

                                {!isRandomTime ? (<InputNumber style={{width: 300, marginTop: 10}} defaultValue={0} step="0.1" min="0.0" stringMode
                                                               onChange={onChange}></InputNumber>)
                                    : (<div className="flex justify-around items-center align-middle">
                                            <InputNumber
                                                style={{width: 120,  marginTop: 10}}
                                                defaultValue={0} step="0.1" stringMode min="0.0"
                                                onChange={onChangeMinRandomTime}></InputNumber> <p className={"mt-2 mx-2"}>-</p>
                                            <InputNumber
                                                style={{width: 120,  marginTop: 10}}
                                                defaultValue={0} step="0.1" stringMode min="0.0"
                                                onChange={onChangeMaxRandomTime} ></InputNumber>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="w-3/5 flex flex-col items-start justify-start flex-shrink-0">
                                <label className="w-full block text-sm font-medium">RPC节点</label>
                                <input
                                    className=" w-full rounded-sm mt-3 p-1.5 outline-none bg-transparent border-none text-sm white-glassmorphism"
                                    value={displayRpcUrl} type="text"></input>
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
                                                <p>4.在使用该功能造成的任何资产被盗, 与本站无关。</p></div>}>
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
                        </div>
                        <div><Button color="green" variant="solid" onClick={showDrawer}>
                            下一步
                        </Button></div>
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

                                    <div className="w-full text-red-500 text-sm font-medium whitespace-nowrap overflow-hidden">
                                        {invalidAddressLines.map((item) => (
                                            <p key={item.line} className="mt-1">
                                                第 {item.line} 行: {item.content} 无效的钱包地址
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <Drawer title="转账设置" onClose={onCloseDrawer} open={openDrawer} size="large">
                            <div className="flex">
                                {gasFees.map((item) => (
                                    <div key={item.name} className="mt-1 w-full flex flex-col text-sm justify-center items-center">
                                        <div>{item.icon}</div><div className="text-xl">{item.name}</div><div>{item.fee}</div>
                                    </div>
                                ))}
                            </div>
                            <GasSettingSection
                                title="Gas Price(gwei)"
                                radioGroup={
                                    <Radio.Group defaultValue="fixed" value={gasType} onChange={(e) => setGasType(e.target.value)}>
                                        <Radio.Button value="fixed">固定</Radio.Button>
                                        <Radio.Button value="auto">自动</Radio.Button>
                                        <Radio.Button value="random">随机</Radio.Button>
                                    </Radio.Group>
                                }
                                inputComponent={gasTypeComponents[gasType]}
                            />
                            <GasSettingSection
                                title="Gas Limit"
                                radioGroup={
                                    <Radio.Group defaultValue="auto" value={gasLimitType} onChange={(e) => setGasLimitType(e.target.value)}>
                                        <Radio.Button value="fixed">固定</Radio.Button>
                                        <Radio.Button value="auto">自动</Radio.Button>
                                        <Radio.Button value="random">随机</Radio.Button>
                                    </Radio.Group>
                                }
                                inputComponent={gasLimitTypeComponents[gasLimitType]}
                            />
                            <div className=" w-full  mt-4" style={{backgroundColor:'rgb(248,248,248)'}}>
                                <div className="flex flex-col justify-center items-center ml-4">
                                <p className="text-sm font-bold my-2">发送数量({chain?chain.mName:"eth"})</p>
                                <div className="mb-2">
                                    <Radio.Group defaultValue="auto" value={amountType} onChange={(e) => setAmountType(e.target.value)}>
                                        <Radio.Button value="all">全部金额</Radio.Button>
                                        <Radio.Button value="randomAmount">随机金额</Radio.Button>
                                        <Radio.Button value="randomPercent">随机百分比%</Radio.Button>
                                        <Radio.Button value="fixedAmount">固定金额</Radio.Button>
                                        <Radio.Button value="keepFixed">保留固定金额</Radio.Button>
                                        <Radio.Button value="keepRandom">保留随机</Radio.Button>
                                    </Radio.Group>
                                    {amountComponents[amountType]}
                                </div>
                                </div>
                            </div>
                            <div className="w-full flex mt-5">
                                <Button className="w-1/2 mr-2" onClick={onCloseDrawer}>取消</Button><Button color="green" variant="solid" onClick={submitDrawer} className="ml-2 w-1/2 flex justify-end" >确定</Button>
                            </div>

                        </Drawer>
                        {/*<div>*/}
                        {/*    /!*表格*!/*/}
                        {/*    <Table*/}
                        {/*        rowSelection={{*/}
                        {/*            ...rowSelection,*/}
                        {/*        }}*/}
                        {/*        dataSource={addressData}*/}
                        {/*    >*/}
                        {/*        <Column title="地址" dataIndex="address" key="address" />*/}
                        {/*        <Column title="接收地址" dataIndex="address" key="address" />*/}
                        {/*    </Table>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MulTransfer;
