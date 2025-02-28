import React, {useContext} from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import {AiFillWallet, AiOutlineClose} from "react-icons/ai";

import { DownOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd'

import logo from "../../images/logo.png";
import { shortenAddress } from "../utils/shortenAddress";
import {TransactionContext} from "../context/TransactionContext.jsx";

const NavBarItem = ({ title, classprops }) => (
  <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>
);

const items = [
    {
        key: '1',
        label: '断开连接',
        icon: <LogoutOutlined />,
        // extra: '⌘S',
    }]

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false);
  const { currentAccount, connectWallet } = useContext(TransactionContext);

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
      <div className="md:flex-[0.8] flex-initial justify-center items-center">
        <img src={logo} alt="logo" className="w-32 cursor-pointer" />
      </div>
        <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
        {/*{["Market", "Exchange", "Tutorials", "Wallets"].map((item, index) => (*/}
        {/*  <NavBarItem key={item + index} title={item} />*/}
        {/*))}*/}
        <li className={`bg-[#2952e3] py-2 px-4 mx-4 rounded-full ${currentAccount? '' : 'cursor-pointer'} hover:bg-[#2546bd]`}>
            {currentAccount ? (
                // <p className="cursor-pointer">{shortenAddress(currentAccount)}</p>
                <Dropdown
                    menu={{
                        items,
                    }}
                >
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            {shortenAddress(currentAccount)}
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
                ) : (
                <button
                    type="button"
                    onClick={connectWallet}
                    className="flex w-full"
                >
                    <AiFillWallet className="text-white mt-1 mr-2" />
                    <p className="text-white text-base font-semibold">
                        Connect Wallet
                    </p>
                </button>
                )
            }
        </li>
      </ul>
      <div className="flex relative">
        {!toggleMenu && (
          <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
        )}
        {toggleMenu && (
          <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
        )}
        {toggleMenu && (
          <ul
            className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in"
          >
            <li className="text-xl w-full my-2"><AiOutlineClose onClick={() => setToggleMenu(false)} /></li>
            {["Market", "Exchange", "Tutorials", "Wallets"].map(
              (item, index) => <NavBarItem key={item + index} title={item} classprops="my-2 text-lg" />,
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
