import React, {useContext} from "react";
import {HiMenuAlt4, HiChevronDown} from "react-icons/hi";
import {AiFillWallet, AiOutlineClose} from "react-icons/ai";

import {DownOutlined, LogoutOutlined} from '@ant-design/icons';
import {Dropdown, Space, Popover, Divider} from 'antd'
import {useNavigate} from 'react-router-dom';
import logo from "../../images/logo.png";
import {shortenAddress} from "../utils/shortenAddress";
import {TransactionContext} from "../context/TransactionContext";

const NavBarItem = ({title, classprops}) => (
    <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>
);


const Navbar = () => {
    const [toggleMenu, setToggleMenu] = React.useState(false);
    const {currentAccount, connectWallet, disconnectWallet} = useContext(TransactionContext);

    const items = [
        {
            key: '1',
            label: '断开连接',
            icon: <LogoutOutlined/>,
            onClick: disconnectWallet,
            // extra: '⌘S',
        }]

    const ToolDropdown = ({title, options}) => {
        const navigate = useNavigate();

        const handleClick = (path) => {
            navigate(path);
        };
        return (
            <div className="mx-2 w-32">
                <div>{title}</div>
                <Divider style={{margin: "5px"}}/>
                {options.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => handleClick(option.path)}
                        // to={option.path} // 跳转到指定路径
                        className="block cursor-pointer"
                    >
                        <div key={index}>{option.label}</div>
                    </div>
                ))}
            </div>
        )
    };
    const web3ToolsData = [
        {
            title: "一对多",
            options: [
                {label: "evm批量", path: "/"},
                {label: "xxxx", path: "/xxxx"},
                {label: "yyyy", path: "/yyyy"}
            ]
        },
        {
            title: "多对多",
            options: [
                {label: "多对多转账", path: "/mulTransfer"},
                {label: "zzzz", path: "/zzzz"}
            ]
        }
    ];

    const exchangeData = [
        {
            title: "NFT",
            options: [
                {label: "ssss3", path: "/ssss3"},
                {label: "xxxx3", path: "/xxxx3"},
                {label: "yyyy3", path: "/yyyy3"}
            ]
        },
        {
            title: "EVM",
            options: [
                {label: "uuuu3", path: "/uuuu3"},
                {label: "zzzz3", path: "/zzzz3"}
            ]
        }
    ];
    const toolsDiv = (toolsData) => (
        <div className="tool-dropdown">
            {toolsData.map((item, index) => (
                <ToolDropdown key={index} title={item.title} options={item.options}/>
            ))}
        </div>
    )

    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div
                className="md:flex-[0.8] md:flex flex flex-initial justify-start items-center flex-row list-none text-sm ">
                <img src={logo} alt="logo" className="w-32 cursor-pointer"/>
                {/*<ul className="font-bold ml-5 md:flex hidden list-none flex-row justify-between items-center flex-initial">*/}
                {/*    {["链上工具集", "交易所批量提现"].map((item, index) => (*/}
                {/*        <NavBarItem key={item + index} title={item} />*/}
                {/*    ))}*/}
                {/*</ul>*/}
                <Popover content={toolsDiv(web3ToolsData)}>
                    <div className="ml-5 flex items-center" type="primary">链上工具集<HiChevronDown
                        style={{fontSize: '18px'}}/></div>
                </Popover>
                <Popover content={toolsDiv(exchangeData)}>
                    <div className="ml-5 flex items-center" type="primary">交易所工具<HiChevronDown
                        style={{fontSize: '18px'}}/></div>
                </Popover>
            </div>
            <div>
                <div
                    className={`bg-[#2952e3] py-2 px-6 mx-4 rounded-full ${currentAccount ? '' : 'cursor-pointer'} hover:bg-[#2546bd]`}>
                    {currentAccount ? (
                        <Dropdown
                            menu={{
                                items,
                            }}
                        >
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    {shortenAddress(currentAccount)}
                                    <DownOutlined/>
                                </Space>
                            </a>
                        </Dropdown>
                    ) : (
                        <button
                            type="button"
                            onClick={connectWallet}
                            className="flex w-full"
                        >
                            <AiFillWallet className="text-white mt-1 mr-2"/>
                            <p className="text-white text-base font-semibold">
                                {/*Connect Wallet*/}
                                连接钱包
                            </p>
                        </button>
                    )
                    }
                </div>
            </div>
            <div className="flex relative">
                {!toggleMenu && (
                    <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer"
                                onClick={() => setToggleMenu(true)}/>
                )}
                {toggleMenu && (
                    <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer"
                                    onClick={() => setToggleMenu(false)}/>
                )}
                {toggleMenu && (
                    <ul
                        className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in"
                    >
                        <li className="text-xl w-full my-2"><AiOutlineClose onClick={() => setToggleMenu(false)}/></li>
                        {["Market", "Exchange", "Tutorials", "Wallets"].map(
                            (item, index) => <NavBarItem key={item + index} title={item} classprops="my-2 text-lg"/>,
                        )}
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
