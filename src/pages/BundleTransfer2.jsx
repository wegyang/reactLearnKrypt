// src/components/BundleTransaction.jsx
import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import {
    Button, Form, Input, Select, List, Card, message, InputNumber
} from 'antd';
import { PlusOutlined, SendOutlined } from '@ant-design/icons';

const { Option } = Select;

const BundleTransaction2 = () => {
    const [form] = Form.useForm();
    const [transactions, setTransactions] = useState([]);
    const [txType, setTxType] = useState('transfer');
    const [signing, setSigning] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        console.log('交易队列更新:', transactions);
    }, [transactions]);

    // 增强版钱包连接方法
    const connectWallet = async () => {
        try {
            if (!window.ethereum) throw new Error('请安装MetaMask钱包');
            return new ethers.BrowserProvider(window.ethereum);
        } catch (error) {
            throw new Error(`钱包连接失败: ${error.message}`);
        }
    };

    // 交易数据生成器
    const generateTransactionData = (values) => {
        const baseTx = { type: values.txType, params: {} };
        // 各类型交易参数处理（保持原有逻辑）
        return baseTx;
    };

    // 改进的签名处理方法
    const handleAddTransaction = async (values) => {
        setSigning(true);
        try {
            const provider = await connectWallet();
            const accounts = await provider.send("eth_requestAccounts");
            if (!accounts[0]) throw new Error('未获取到可用账户');

            const signer = await provider.getSigner();
            const txData = generateTransactionData(values);
            const address = await signer.getAddress();

            const replacer = (key, value) => {
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                return value;
            };

            // 构造带防重放攻击的签名消息
            const txMessage = JSON.stringify({
                ...txData,
                chainId: (await provider.getNetwork()).chainId,
                nonce: Date.now()
            }, replacer);

            // 显示钱包交互提示
            message.info('请在钱包中确认签名', 5);

            // 签名处理（带超时检测）
            const signature = await Promise.race([
                signer.signMessage(txMessage),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('签名超时')), 30000)
                )
            ]);
            console.log("signature", signature, "zhix", txData, "signer", signer);
            setTransactions(prev => [...prev, {
                ...txData,
                txMessage,
                signature,
                from: address
            }]);
            console.log("signature2", transactions);
            form.resetFields(['to', 'value', 'tokenAddress', 'recipient', 'amount']);
            message.success('签名成功！交易已加入队列');
        } catch (error) {
            console.log("error", error);
            handleSignatureError(error);
        } finally {
            setSigning(false);
        }
    };

    // 专用错误处理器
    const handleSignatureError = (error) => {
        console.error('签名过程错误:', error);
        const errorMap = {
            'user rejected signing': '用户取消签名',
            'MetaMask Message Signature: User denied message signature.': '用户拒绝签名',
            '签名超时': '签名操作超时，请重试'
        };
        message.error(errorMap[error.message] || `签名失败: ${error.message}`);
    };

    // 交易执行逻辑
    const executeBundle = async () => {
        setSending(true);
        try {
            const provider = await connectWallet();
            const results = [];

            for (const tx of transactions) {
                try {
                    const signer = await provider.getSigner(tx.from);
                    const txResponse = await signer.sendTransaction(
                        await buildTransaction(tx)
                    );
                    results.push(txResponse.hash);
                    message.success(`交易已发送: ${txResponse.hash.slice(0,12)}...`);
                } catch (error) {
                    console.error('交易发送失败:', error);
                    results.push({ error: error.message });
                }
            }

            message.success(`已提交${results.length}笔交易`);
            setTransactions([]);
        } catch (error) {
            message.error(`执行失败: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const zhName = (type) => {
        switch (type) {
            case 'transfer':
                return '转账交易';
            case 'erc20':
                return 'erc20';
            case 'contract':
                return '合约调用';
            case 'dex':
                return 'dex';
            default:
                return type;
        }
    };

    // 交易构造器
    const buildTransaction = async (tx) => {
        const provider = await connectWallet();
        // 交易构造逻辑（保持原有核心逻辑）
        return {
            to: '0x...',
            value: ethers.parseEther('0.1'),
            gasLimit: 21000
        };
    };

    return (
        <div className="container">
            <Card
                title="多签交易管理器"
                style={{ maxWidth: 800, margin: '20px auto' }}
                actions={[
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={executeBundle}
                        disabled={!transactions.length || sending}
                        loading={sending}
                    >
                        {sending ? `发送中...` : `批量执行 (${transactions.length})`}
                    </Button>
                ]}
            >
                <Form form={form} onFinish={handleAddTransaction} layout="vertical">
                    {/* 交易类型选择器 */}
                    <Form.Item
                        name="txType"
                        label="交易类型"
                        initialValue="transfer"
                        rules={[{ required: true }]}
                    >
                        <Select onChange={setTxType}>
                            <Option value="transfer">ETH转账</Option>
                            <Option value="erc20">ERC20转账</Option>
                            <Option value="contract">合约调用</Option>
                            <Option value="dex">DEX交易</Option>
                        </Select>
                    </Form.Item>

                    {/* 动态表单字段 */}
                    {txType === 'transfer' && (
                        <>
                            <Form.Item
                                name="to"
                                label="接收地址"
                                rules={[{
                                    required: true,
                                    pattern: /^0x[a-fA-F0-9]{40}$/,
                                    message: '无效的以太坊地址'
                                }]}
                            >
                                <Input placeholder="0x..." />
                            </Form.Item>
                            <Form.Item
                                name="value"
                                label="金额 (ETH)"
                                rules={[{
                                    required: true,
                                    message: '最小转账金额为0.0001 ETH'
                                }]}
                            >
                                <InputNumber
                                    min={0.0001}
                                    step={0.001}
                                    style={{ width: '100%' }}
                                    addonAfter="ETH"
                                />
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

                    {/* 提交按钮 */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<PlusOutlined />}
                            loading={signing}
                            disabled={sending}
                        >
                            {signing ? '等待钱包响应...' : '添加交易'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* 交易队列展示 */}
                <List
                    locale={{ emptyText: "暂无已签名交易" }}
                    dataSource={transactions}
                    renderItem={(tx, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    danger
                                    onClick={() => setTransactions(prev => prev.filter((_, i) => i !== index))}
                                    disabled={sending}
                                >
                                    移除
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={`交易 #${index + 1} - ${zhName(tx.type)}`}
                                description={
                                    <>
                                        <div>发起地址: {tx.from?.slice(0,8)}...</div>
                                        {tx.params.to && <div>目标地址: {tx.params.to.slice(0,8)}...</div>}
                                        {tx.params.value && <div>金额: {tx.params.value} ETH</div>}
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default BundleTransaction2;