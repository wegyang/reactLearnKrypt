// src/components/BundleTransaction.jsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
    Button, Form, Input, Select, List, Card, Tabs, Switch, message, InputNumber
} from 'antd';
import {
    WalletOutlined, DeleteOutlined, PlusOutlined, SendOutlined
} from '@ant-design/icons';
import chains from "../utils/chainsConfig.jsx";

const { TabPane } = Tabs;
const { Option } = Select;

const BundleTransaction = () => {
    const [form] = Form.useForm();
    const [operationType, setOperationType] = useState('wallet');
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [txType, setTxType] = useState('transfer');

    // 添加钱包（私钥或连接钱包）
    const handleAddWallet = async (values) => {
        if (operationType === 'privateKey') {
            try {
                const wallet = new ethers.Wallet(values.privateKey);
                setWallets([...wallets, {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    type: 'privateKey'
                }]);
                message.success('私钥钱包添加成功');
            } catch (error) {
                message.error('无效的私钥');
            }
        } else {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await provider.send('eth_requestAccounts', []);
            setWallets([...wallets, {
                address: accounts[0],
                type: 'web3'
            }]);
            message.success('Web3 钱包已连接');
        }
    };

    const deleteWallet = (address) => {
        const updatedWallets = wallets.filter(wallet => wallet.address!== address);
        setWallets(updatedWallets);
        message.success('钱包删除成功').then(r => (r));
    };

    // 添加交易到队列
    const addTransaction = (values) => {
        let transactionData = {
            wallet: values.wallet,
            type: values.txType,
        };

        switch(values.txType) {
            case 'transfer':
                transactionData = {
                    ...transactionData,
                    to: values.to,
                    value: values.value,
                    data: '0x' // 普通转账
                };
                break;

            case 'erc20':
                // 生成 ERC20 transfer 调用数据
                const erc20Interface = new ethers.Interface([
                    'function transfer(address to, uint256 amount)'
                ]);
                transactionData = {
                    ...transactionData,
                    to: values.tokenAddress,
                    value: 0,
                    data: erc20Interface.encodeFunctionData('transfer', [
                        values.recipient,
                        ethers.parseUnits(values.amount.toString(), 18)
                    ])
                };
                break;

            case 'contract':
                // 处理自定义合约调用
                const contractInterface = new ethers.utils.Interface([`function ${values.functionName}`]);
                const params = JSON.parse(values.parameters);
                transactionData = {
                    ...transactionData,
                    to: values.contractAddress,
                    value: 0,
                    data: contractInterface.encodeFunctionData(values.functionName, params)
                };
                break;

            case 'dex':
                // 生成 DEX 交换调用数据（示例使用 Uniswap V2）
                const uniswapInterface = new ethers.utils.Interface([
                    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)'
                ]);
                transactionData = {
                    ...transactionData,
                    to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap Router
                    value: values.tokenIn === 'ETH' ? values.swapAmount : 0,
                    data: uniswapInterface.encodeFunctionData('swapExactETHForTokens', [
                        ethers.utils.parseUnits(values.amountOutMin.toString(), 18),
                        [values.tokenIn, values.tokenOut],
                        values.wallet,
                        Math.floor(Date.now() / 1000) + 60 * 20 // 20分钟过期
                    ])
                };
                break;
        }

        setTransactions([...transactions, transactionData]);
        form.resetFields();
    };

    // const addTransaction = (values) => {
    //     const newTransaction = {
    //         wallet: values.wallet,
    //         to: values.to,
    //         value: values.value,
    //         data: values.data || '0x'
    //     };
    //     setTransactions([...transactions, newTransaction]);
    //     form.resetFields(['to', 'value', 'data']);
    // };

    // 执行捆绑交易
    const executeBundle = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signers = {};

        // 收集所有签名
        const signedTxs = await Promise.all(
            transactions.map(async (tx) => {
                const wallet = wallets.find(w => w.address === tx.wallet);

                if (wallet.type === 'privateKey') {
                    const signer = new ethers.Wallet(wallet.privateKey, provider);
                    return signer.sendTransaction({
                        to: tx.to,
                        value: ethers.utils.parseEther(tx.value),
                        data: tx.data
                    });
                } else {
                    const signer = provider.getSigner(tx.wallet);
                    return signer.sendTransaction({
                        to: tx.to,
                        value: ethers.utils.parseEther(tx.value),
                        data: tx.data
                    });
                }
            })
        );

        // 创建 Safe 多签钱包并提交交易
        const safeFactory = await SafeFactory.create({ provider });
        const safeAccountConfig = {
            owners: transactions.map(tx => tx.wallet),
            threshold: 1
        };
        const safe = await safeFactory.deploySafe({ safeAccountConfig });

        const safeApiKit = new SafeApiKit({ chainId: 1 });
        const safeTransaction = await safe.createTransaction({
            transactions: signedTxs.map(tx => ({
                to: tx.to,
                value: tx.value.toString(),
                data: tx.data
            }))
        });

        await safeApiKit.proposeTransaction(safe.getAddress(), safeTransaction);
        message.success('交易捆绑提交成功');
    };

    return (

        <div className="flex w-full justify-center items-center mt-0">
            <div className="flex flex-col flex-1 items-center justify-start w-full md:mt-0 mt-2">
                <div className="listTitle flex justify-center">
                    <h1 className="text-2xl font-bold mb-2">捆绑交易</h1>
                </div>
                <ul className="qualification text-sm flex justify-center">
                    <li>通过捆绑交易，让你的交易在同一区块中完成，实现无损防夹</li>
                    {/*<li>如需添加其他网络或者其他 DEX请联系我们。</li>*/}
                </ul>
                <div className="p-5 mt-4 sm:w-220 w-full flex flex-col justify-start items-center blue-glassmorphism">
            <Tabs defaultActiveKey="1" rootClassName="w-full">
                {/* 钱包管理 */}
                <TabPane tab={<span><WalletOutlined />钱包管理</span>} key="1">
                    <Card title="添加钱包" style={{ marginBottom: 24 }}>
                        <div style={{ marginBottom: 16 }}>
                            <Switch
                                checkedChildren="私钥导入"
                                unCheckedChildren="钱包连接"
                                onChange={(checked) => setOperationType(checked ? 'privateKey' : 'wallet')}
                            />
                        </div>
                        <Form onFinish={handleAddWallet}>
                            {operationType === 'privateKey' ? (
                                <Form.Item
                                    name="privateKey"
                                    label="私钥"
                                    rules={[{ required: true, message: '请输入私钥' }]}
                                >
                                    <Input.Password placeholder="输入钱包私钥" />
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    label="Web3 钱包"
                                    help="请确保已安装 MetaMask 或其他 Web3 钱包"
                                >
                                    <Button icon={<WalletOutlined />} htmlType="submit">
                                        连接钱包
                                    </Button>
                                </Form.Item>
                            )}
                        </Form>

                        {/*<Form onFinish={handleAddWallet}>*/}
                        {/*    <Form.Item*/}
                        {/*        name="privateKey"*/}
                        {/*        label="私钥"*/}
                        {/*        rules={[{ required: true, message: '请输入私钥' }]}*/}
                        {/*    >*/}
                        {/*        <Input.Password placeholder="输入钱包私钥(每次导入一个)" />*/}
                        {/*    </Form.Item>*/}
                        {/*</Form>*/}

                        <List
                            header="已添加钱包"
                            dataSource={wallets}
                            renderItem={item => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type='default'
                                            onClick={() => deleteWallet(item.address)}
                                        >
                                            <DeleteOutlined />删除
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={item.address}
                                        description={`类型: ${item.type === 'privateKey' ? '私钥钱包' : 'Web3 钱包'}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>

                {/* 交易编排 */}
                <TabPane tab={<span><SendOutlined />交易编排</span>} key="2">
                    <Card title="添加交易" style={{ marginBottom: 24 }}>
                        <Form form={form} onFinish={addTransaction} layout="vertical">
                            <Form.Item
                                name="txType"
                                label="交易类型"
                                initialValue="transfer"
                                rules={[{ required: true }]}
                            >
                                <Select onChange={(value) => setTxType(value)}>
                                    <Select.Option value="transfer">ETH 转账</Select.Option>
                                    <Select.Option value="erc20">ERC20 转账</Select.Option>
                                    <Select.Option value="contract">合约调用</Select.Option>
                                    <Select.Option value="dex">DEX 交易</Select.Option>
                                </Select>
                            </Form.Item>

                            {/* 通用字段 */}
                            <Form.Item
                                name="wallet"
                                label="发起钱包"
                                rules={[{ required: true, message: '请选择钱包' }]}
                            >
                                <Select placeholder="选择已添加的钱包">
                                    {wallets.map(wallet => (
                                        <Option key={wallet.address} value={wallet.address}>
                                            {wallet.address}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* 动态字段 */}
                            {txType === 'transfer' && (
                                <>
                                    <Form.Item
                                        name="to"
                                        label="接收地址"
                                        rules={[{ required: true, message: '请输入接收地址', pattern: /^0x[a-fA-F0-9]{40}$/ }]}
                                    >
                                        <Input placeholder="0x..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="value"
                                        label="金额 (ETH)"
                                        rules={[{ required: true, message: '请输入金额' }]}
                                    >
                                        <InputNumber step="0.001" style={{ width: '100%' }} />
                                    </Form.Item>
                                </>
                            )}

                            {txType === 'erc20' && (
                                <>
                                    <Form.Item
                                        name="tokenAddress"
                                        label="代币合约地址"
                                        rules={[{ required: true, pattern: /^0x[a-fA-F0-9]{40}$/ }]}
                                    >
                                        <Input placeholder="0x..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="recipient"
                                        label="接收地址"
                                        rules={[{ required: true, pattern: /^0x[a-fA-F0-9]{40}$/ }]}
                                    >
                                        <Input placeholder="0x..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="amount"
                                        label="代币数量"
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </>
                            )}

                            {txType === 'contract' && (
                                <>
                                    <Form.Item
                                        name="contractAddress"
                                        label="合约地址"
                                        rules={[{ required: true, pattern: /^0x[a-fA-F0-9]{40}$/ }]}
                                    >
                                        <Input placeholder="0x..." />
                                    </Form.Item>
                                    <Form.Item
                                        name="functionName"
                                        label="方法名称"
                                        rules={[{ required: true }]}
                                    >
                                        <Input placeholder="transfer(address,uint256)" />
                                    </Form.Item>
                                    <Form.Item
                                        name="parameters"
                                        label="参数 (JSON 数组)"
                                        rules={[{ required: true }]}
                                    >
                                        <Input.TextArea placeholder='["0x...", "100000000"]' rows={3} />
                                    </Form.Item>
                                </>
                            )}

                            {txType === 'dex' && (
                                <>
                                    <Form.Item
                                        name="tokenIn"
                                        label="输入代币"
                                        rules={[{ required: true }]}
                                    >
                                        <Select placeholder="选择代币">
                                            <Option value="ETH">ETH</Option>
                                            <Option value="0x...">DAI</Option>
                                            <Option value="0x...">USDC</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="tokenOut"
                                        label="输出代币"
                                        rules={[{ required: true }]}
                                    >
                                        <Select placeholder="选择代币">
                                            <Option value="0x...">UNI</Option>
                                            <Option value="0x...">AAVE</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        name="swapAmount"
                                        label="交易数量"
                                        rules={[{ required: true }]}
                                    >
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item
                                        name="slippage"
                                        label="滑点容差 (%)"
                                        initialValue="0.5"
                                    >
                                        <InputNumber min={0} max={100} step={0.1} />
                                    </Form.Item>
                                </>
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<PlusOutlined />}
                                >
                                    添加交易
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    <Card title="交易队列">
                        <List
                            dataSource={transactions}
                            renderItem={(tx, index) => (
                                <List.Item
                                    actions={[
                                        <Button danger onClick={() => {
                                            const newTx = [...transactions];
                                            newTx.splice(index, 1);
                                            setTransactions(newTx);
                                        }}>
                                            删除
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={`交易 #${index + 1}`}
                                        description={
                                            <>
                                                <div>发送钱包: {tx.wallet}</div>
                                                <div>接收地址: {tx.to}</div>
                                                <div>金额: {tx.value} ETH</div>
                                                {tx.data !== '0x' && <div>数据: {tx.data}</div>}
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        <Button
                            type="primary"
                            size="large"
                            onClick={executeBundle}
                            style={{ marginTop: 24 }}
                            icon={<SendOutlined />}
                        >
                            执行捆绑交易
                        </Button>
                    </Card>
                </TabPane>
            </Tabs>
                </div></div></div>
    );
};

export default BundleTransaction;