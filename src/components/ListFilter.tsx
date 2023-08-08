import React from 'react'
import { Button} from "antd";
import { useNavigate } from "react-router-dom";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// @ts-ignore
export default function ListFilter ({ name, value, list, onChange = (value) => {} }) {
  const navigate = useNavigate()
  const {isConnected} = useAccount();
  const { openConnectModal } = useConnectModal()

  // 判断是否登录了钱包
  const isLogin = () => {
    if(isConnected){
      return true;
    }else{
      openConnectModal && openConnectModal();
      return false;
    }
  }

  // 处理函数
  const handlerNavigate = (path: string, params?: any) => {
    if (isLogin()) {
      params ? navigate(path, params) : navigate(path)
    }
  }

  return (
    <div className='flex text-base pt-6 pb-5'>
      <div className='text-[#7F8FA3]'>{name}:</div>
      <div className='flex'>
        {list.map((item:any, index:number) => {
          return (
            <button
              onClick={() => onChange(item.value)}
              type='button'
              key={index}
              className={`ml-[20px]  hover:text-blue-300 cursor-pointer relative ${value === item.value
                  ? 'text-white before:absolute before:inset-x-0 before:-top-6 before:h-1 before:bg-[#2DA1F7]'
              : 'text-[#7F8FA3]'}`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
