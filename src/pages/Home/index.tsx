import React, { useEffect, useState } from "react"
import { Spin, Pagination, Empty } from "antd"
import ListFilter from "../../components/ListFilter"
import EllipsisMiddle from "../../components/EllipsisMiddle"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useNavigate } from "react-router-dom"
import { useStaictContract } from "../../hooks";
import { filecoin } from "wagmi/chains";
import {
  ALL_STATUS,
  IN_PROGRESS_STATUS,
  VOTE_COUNTING_STATUS,
  COMPLETED_STATUS,
  SINGLE_VOTE,
} from '../../utils/definitions/consts';
import axios from "axios"
// @ts-ignore
import nftStorage from "../../utils/storeNFT.js";
import { useAccount, useNetwork } from "wagmi";
import './index.less';


export default function Home() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const navigate = useNavigate();
  const [originVotingList, setOriginVotingList] = useState<any>([])
  const [votingList, setVotingList] = useState<any>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [filterList, setFilterList] = useState([
    {
      label: "All",
      value: ALL_STATUS
    }
  ])

  const [voteStatus, setVoteStatus] = useState(0);

  const { getVotingList } = useStaictContract(chain?.id === filecoin.id);

  useEffect(() => {
    getVoteList();
  }, [page, pageSize])

  // 获取投票数据
  const getVoteList = async () => {
    setLoading(true);
    const net = chain?.id === filecoin.id ? 1 : 2;
    try {
      const { proposalList, totalSize } = await getVotingList(page, pageSize, net);
      setTotal(totalSize.toNumber());
      const list = await getList(proposalList) || [];
      setLoading(false);
      setFilterList(
          [
            {
              label: "All",
              value: ALL_STATUS
            },
            {
              label: "In Progress",
              value: IN_PROGRESS_STATUS
            },
            {
              label: "Vote Counting",
              value: VOTE_COUNTING_STATUS
            },
            {
              label: "Completed",
              value: COMPLETED_STATUS
            }
          ]
      )
      setOriginVotingList(list);
      setVotingList(list);
    } catch (e: any) {
      console.log(e);
      setLoading(false);
    }
  }
  // 获取投票项目列表
  const getList = async (prop: any) => {
    const ipfsUrls = prop.map(
      (_item: any) => `https://${_item.cid}.ipfs.nftstorage.link/`
    );
    try {
      const responses = await axios.all(ipfsUrls.map((url: string) => axios.get(url)));
      const results = [];
      for (let i = 0; i < responses.length; i++) {
        const res: any = responses[i];
        const now = new Date().getTime();
        let voteStatus = null;
        if (now <= res.data.string.Time) {
          voteStatus = IN_PROGRESS_STATUS;
        } else if (prop[i].isCounted) {
          voteStatus = COMPLETED_STATUS;
        } else {
          voteStatus = VOTE_COUNTING_STATUS;
        }
        const option = res.data.string.option?.map((item: string, index: number) => {
          const bigNumberCount = prop[i].voteResults[index]?.votes;
          const count = bigNumberCount ? bigNumberCount.toNumber() / 100 : 0;
          return {
            name: item,
            count
          }
        })
        results.push({
          ...res.data.string,
          option,
          cid: prop[i].cid,
          voteStatus
        })
      }
      return results;
    } catch (error) {
      console.error(error);
    }
  }

  const onVoteStatusChange = (value: number) => {
    setVoteStatus(value)
    const now = new Date().getTime();
    switch (value) {
      case ALL_STATUS:
        setVotingList(originVotingList);
        break
      case IN_PROGRESS_STATUS:
        setVotingList(originVotingList.filter((item: any) => item.voteStatus === IN_PROGRESS_STATUS));
        break
      case VOTE_COUNTING_STATUS:
        setVotingList(originVotingList.filter((item: any) => item.voteStatus === VOTE_COUNTING_STATUS));
        break
      case COMPLETED_STATUS:
        setVotingList(originVotingList.filter((item: any) => item.voteStatus === COMPLETED_STATUS));
        break
    }
  }

  // 判断是否登录了钱包
  const isLogin = () => {
    if (isConnected) {
      return true
    } else {
      openConnectModal && openConnectModal()
      return false
    }
  }

  // 处理函数
  const handlerNavigate = (path: string, params?: any) => {
    if (isLogin()) {
      params ? navigate(path, params) : navigate(path)
    }
  }

  /**
   * 跳转处理
   * @param item
   */
  const handleJump = (item: any) => {

    const router = `/${item.voteStatus === COMPLETED_STATUS ? "votingResults" : "vote"}/${item.cid}`;
    handlerNavigate(router, { state: item });
  }

  const renderList = (item: any) => {

    const total = item.option.reduce(((acc: number, current: any) => acc + current.count), 0);
    const max = Math.max(...item.option?.map((option: any) => option.count));
    return (
      <div
        key={item.cid}
        className="rounded-xl border border-[#313D4F] bg-[#273141] px-[30px] py-[12px] mb-8"
      >
        <div className="flex justify-between mb-3">
          <a
            target='_blank'
            rel="noopener"
            href={`https://imfil.io/address/${item.Address}`}
            className="flex justify-center items-center"
          >
            <svg className="icon mr-2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              p-id="1475" width="1.2em" height="1.2em">
              <path
                d="M512 32c-265.094 0-480 214.925-480 480s214.906 480 480 480 480-214.925 480-480-214.906-480-480-480zM512 944.998c-239.146 0-432.998-193.853-432.998-432.998s193.853-432.998 432.998-432.998 432.998 193.853 432.998 432.998-193.853 432.998-432.998 432.998zM773.581 530.605l0.154-8.871h160.234c0.211-3.206 0.413-6.442 0.413-9.725s-0.202-6.48-0.413-9.725h-160.234l-0.154-8.832c-1.277-69.216-9.619-135.322-24.826-196.435l-1.977-8.064 7.814-2.659c38.314-13.085 67.277-27.197 86.726-38.045-4.205-5.203-8.525-10.301-12.941-15.322-23.203 12.729-49.411 24.115-77.971 34.032l-8.851 3.043-2.736-8.957c-16.128-53.049-37.037-99.36-62.237-137.597-11.289-4.819-22.857-9.101-34.579-12.931 31.277 39.859 57.706 93.341 77.232 156.652l2.736 8.871-8.957 2.468c-55.632 15.36-116.88 23.846-182.074 25.277l-9.245 0.192v-213.908c-3.188-0.231-6.412-0.461-9.696-0.461s-6.489 0.231-9.715 0.461v213.917l-9.245-0.192c-65.002-1.421-126.24-9.994-182.026-25.421l-8.966-2.468 2.736-8.88c19.546-63.283 45.974-116.678 77.194-156.461-11.741 3.792-23.289 8.064-34.598 12.892-25.143 38.16-46.032 84.384-62.16 137.405l-2.755 8.995-8.842-3.091c-28.474-9.869-54.643-21.293-77.923-33.994-4.454 5.088-8.823 10.224-13.037 15.475 19.44 10.838 48.413 24.96 86.717 38.045l7.814 2.659-1.968 8.064c-15.188 61.075-23.549 127.181-24.845 196.435l-0.173 8.832h-160.176c-0.221 3.235-0.413 6.432-0.413 9.715s0.202 6.518 0.413 9.725h160.205l0.173 8.871c1.315 69.869 9.802 136.551 25.219 198.134l2.045 8.064-7.872 2.659c-37.872 12.922-66.682 26.851-86.054 37.584 4.205 5.212 8.544 10.301 12.979 15.322 23.059-12.499 49.075-23.808 77.395-33.6l8.842-3.052 2.717 8.909c16.080 52.397 36.816 98.131 61.728 135.936 11.309 4.781 22.857 9.101 34.608 12.892-30.989-39.437-57.216-92.294-76.685-154.886l-2.794-8.909 9.014-2.468c55.459-15.235 116.534-23.692 181.497-25.123l9.245-0.192v212.103c3.226 0.202 6.432 0.394 9.715 0.394s6.509-0.192 9.715-0.394v-212.103l9.245 0.192c64.762 1.421 125.808 9.917 181.459 25.277l8.976 2.468-2.774 8.909c-19.469 62.506-45.706 115.334-76.617 154.733 11.741-3.792 23.309-8.112 34.608-12.892 24.874-37.805 45.609-83.463 61.671-135.744l2.736-8.957 8.842 3.082c28.253 9.763 54.211 21.024 77.299 33.532 4.522-5.049 8.88-10.186 13.094-15.428-19.354-10.732-48.125-24.653-86.035-37.584l-7.863-2.659 2.016-8.064c15.417-61.574 23.904-128.256 25.2-198.125zM502.285 702.416l-8.851 0.202c-67.181 1.383-130.195 10.023-187.306 25.651l-8.889 2.468-2.246-8.909c-15.331-60.384-23.779-124.589-25.143-190.877l-0.173-9.216h232.608v180.682zM502.285 502.275h-232.608l0.173-9.216c1.373-65.664 9.677-129.293 24.691-189.149l2.246-8.909 8.889 2.429c57.254 15.783 120.423 24.471 187.766 25.814l8.851 0.231v178.8zM521.715 323.475l8.851-0.231c67.344-1.354 130.512-10.032 187.766-25.814l8.889-2.429 2.246 8.909c15.024 59.846 23.337 123.475 24.663 189.149l0.202 9.216h-232.608v-178.8zM729.008 721.828l-2.266 8.909-8.871-2.468c-57.111-15.629-120.125-24.269-187.306-25.661l-8.851-0.202v-180.682h232.608l-0.202 9.216c-1.363 66.326-9.802 130.579-25.114 190.886z"
                fill="#7F8FA3" p-id="1476"></path>
            </svg>
            <div className="truncate text-white">
              {EllipsisMiddle({ suffixCount: 4, children: item.Address })}
            </div>
          </a>
          <div
            className={`${["bg-green-700", "bg-yellow-700", "bg-[#6D28D9]"][item.voteStatus - 1]} h-[26px] px-[12px] text-white rounded-xl`}>
            {
              ["In Progress", "Vote Counting", "Completed"][item.voteStatus - 1]
            }
          </div>
        </div>
        <div className="relative mb-4 line-clamp-2 break-words text-lg pr-[80px] leading-7  cursor-pointer" onClick={() => {
          handleJump(item)
        }}>
          <h3 className="inline pr-2 text-2xl font-semibold text-white">
            {item.Name}
          </h3>
        </div>
        <div className="mb-2 line-clamp-2 break-words text-lg cursor-pointer" onClick={() => {
          handleJump(item)
        }}>
          {item.Descriptions}
        </div>
        {
          item.voteStatus === COMPLETED_STATUS &&
          <div>
            {
              item.option?.map((option: any) => {
                const percent = option.count ? ((option.count / total) * 100).toFixed(2) : 0;
                return (
                  <div className="relative mt-1 w-full" key={option.name}>
                    <div className="absolute ml-3 flex items-center leading-[43px] text-white">
                      {
                        item.VoteType === SINGLE_VOTE && option.count > 0 && option.count === max &&
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="-ml-1 mr-2 text-sm">
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 13l4 4L19 7"></path>
                        </svg>
                      }
                      {option.name} <span className="ml-2 text-[#8b949e]">{option.count} tFIL Vote</span></div>
                    <div className="absolute right-0 mr-3 leading-[40px] text-white">{percent}%</div>
                    <div className="h-[40px] rounded-md bg-[#1b2331]" style={{ width: `${percent}%` }}></div>
                  </div>
                )
              })
            }
          </div>
        }
        <div className="text-[#8B949E] text-sm mt-4">

          <span className="mr-2">Expiration Time:</span>

          {new Date(item.Time).toLocaleString()}
        </div>
      </div>
    )
  }

  // 分页
  const handleChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }

  return (
    <div className="home_container main">
      <h3 className="mb-6 text-2xl text-[#7F8FA3]">Proposal List</h3>
      <div className="flex justify-between items-center rounded-xl border border-[#313D4F] bg-[#273141] mb-8 px-[30px]">
        <div className="flex justify-between">
          <ListFilter
            name="Status"
            value={voteStatus}
            list={filterList}
            onChange={onVoteStatusChange}
          />
        </div>
        <button
          className="h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl"
          onClick={() => {
            handlerNavigate("/createpoll")
          }}
        >
          Create A Proposal
        </button>
      </div>
      {
        loading ?
          <div className="h-[120px] flex justify-center items-center">
            <Spin />
          </div> :
          votingList.length > 0 ?
              <div className='home-table'>
                {
                  votingList.map((item: any) => renderList(item))
                }
                <Pagination
                    className='float-right'
                    showTitle={false}
                    showSizeChanger={false}
                    current={page}
                    total={total}
                    onChange={handleChange}
                />
              </div> :
              <Empty
                  className='mt-12'
                  description={
                    <span className='text-white'>No Data</span>
                  }
              />
      }
    </div>
  )
}
