import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { InputNumber } from "antd";
// @ts-ignore
import nftStorage from "../../utils/storeNFT";
import axios from 'axios';
import { useDynamicContract } from "../../hooks";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import MDEditor from "../../components/MDEditor";
import EllipsisMiddle from "../../components/EllipsisMiddle";
import {
  IN_PROGRESS_STATUS,
  SINGLE_VOTE,
  MULTI_VOTE,
  COMPLETED_STATUS,
  VOTE_COUNTING_STATUS
} from "../../utils/definitions/consts"
import "./index.less"

const totalPercentValue = 100;

const Vote = () => {
  const { isConnected } = useAccount();
  const { id } = useParams();
  const { state } = useLocation() || null;
  const [votingData, setVotingData] = useState(state);
  const { openConnectModal } = useConnectModal();

  const navigate = useNavigate()
  const [options, setOptions] = useState([] as any)

  useEffect(() => {
    initState()
  }, [])


  async function initState() {
    if (isConnected) {
      if (!votingData) {
        const { getVoteApi } = useDynamicContract(isConnected);
        // @ts-ignore
        const voteData = await getVoteApi(id);
        const res = await axios.get(`https://${id}.ipfs.nftstorage.link/`);
        const now = new Date().getTime();
        let voteStatus = null;
        if (now <= res.data.string.Time) {
          voteStatus = IN_PROGRESS_STATUS;
        } else if (voteData.isCounted) {
          voteStatus = COMPLETED_STATUS;
        } else {
          voteStatus = VOTE_COUNTING_STATUS;
        }
        const option = res.data.string.option?.map((item: string, index: number) => {
          return {
            name: item,
            count: 0,
          }
        });
        setVotingData({
          ...res.data.string,
          option,
          cid: id,
          voteStatus
        })
        setOptions(option);
      } else {
        setOptions(votingData.option);
      }
    } else {
      // @ts-ignore
      openConnectModal && openConnectModal();
    }
  }

  const [loading, setLoading] = useState(false);

  const {
    formState: { errors }
  } = useForm({
    defaultValues: {
      option: votingData?.VoteType === MULTI_VOTE ? [] : null
    }
  })

  const startVoting = async () => {
    const countIndex = options.findIndex((item: any) => item.count > 0);
    if (countIndex < 0) {
      message.warning("Please choose a option to vote");
    } else {
      // 调取接口发送数据
      setLoading(true);
      let params = [];
      if (votingData?.VoteType === SINGLE_VOTE) {
        params.push([`${countIndex}`, `${options[countIndex].count}`])
      } else {
        options.map((item: any, index: number) => {
          params.push([`${index}`, `${item.count}`])
        })
      }
      if (isConnected) {
        const { voteApi } = useDynamicContract(isConnected);
        // @ts-ignore
        voteApi(votingData?.cid, params)
          ?.then((result) => {
            setLoading(false)
            message.success("Vote successful!", 3);
            setTimeout(() => {
              navigate("/")
            }, 3000)
          })
          ?.catch((error) => {
            console.log(error)
            setLoading(false)
            message.warning("Vote fail!", 3)
            setTimeout(() => {
              navigate("/")
            }, 3000)
          })
      } else {
        // @ts-ignore
        openConnectModal && openConnectModal()
      }
    }
  }

  const handleOptionChange = (index: number, count: number) => {
    setOptions((prevState: any[]) => {
      return prevState.map((item: any, preIndex) => {
        let currentTotal = 0
        currentTotal += count
        if (preIndex === index) {
          return {
            ...item,
            count
          }
        } else {
          return {
            ...item,
            disabled: votingData?.VoteType === SINGLE_VOTE && count > 0 || votingData?.VoteType === MULTI_VOTE && currentTotal === 100
          }
        }
      })
    })
  }

  const handleCountChange = (type: string, index: number, item: any) => {
    if (item.disabled) return false
    let currentCount = 0
    const restTotal = options.reduce(((acc: number, current: any) => acc + current.count), 0) - item.count
    const max = totalPercentValue - restTotal
    const min = 0
    if (type === "decrease") {
      currentCount = item.count - 1 < min ? min : item.count - 1
    } else {
      currentCount = item.count + 1 > max ? max : item.count + 1
    }
    handleOptionChange(index, currentCount)
  }

  const countMax = (options: any, count: number) => {
    const restTotal = options.reduce(((acc: number, current: any) => acc + current.count), 0) - count
    return totalPercentValue - restTotal
  }

  return (
    <>
      <div className="flex voting">
        <div className="relative w-full pr-5 lg:w-8/12">
          <div className="px-3 mb-6 md:px-0">
            <button>
              <div className="inline-flex items-center gap-1 text-skin-text hover:text-skin-link">
                <Link to="/" className="flex items-center">
                  <svg className="mr-1" viewBox="0 0 24 24" width="1.2em" height="1.2em">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="m11 17l-5-5m0 0l5-5m-5 5h12"></path>
                  </svg>
                  Back
                </Link>
              </div>
            </button>
          </div>
          <div className="px-3 md:px-0 ">
            <h1 className="mb-6 text-3xl text-white mbreak-words leading-12" style={{overflowWrap: 'break-word'}}>
              {votingData?.Name}
            </h1>
            <div className="flex justify-between mb-6">
              <div className="flex items-center justify-between w-full mb-1 sm:mb-0">
                <button
                  className={`${votingData?.voteStatus === IN_PROGRESS_STATUS ? "bg-green-700" : "bg-yellow-700"} bg-[#6D28D9] h-[26px] px-[12px] text-white rounded-xl mr-4`}>
                  {votingData?.voteStatus === IN_PROGRESS_STATUS ? "In Progress" : "Vote Counting"}
                </button>
                <div className="flex items-center justify-center">
                  <svg className="mr-2 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="1475" width="1.2em" height="1.2em">
                    <path
                      d="M512 32c-265.094 0-480 214.925-480 480s214.906 480 480 480 480-214.925 480-480-214.906-480-480-480zM512 944.998c-239.146 0-432.998-193.853-432.998-432.998s193.853-432.998 432.998-432.998 432.998 193.853 432.998 432.998-193.853 432.998-432.998 432.998zM773.581 530.605l0.154-8.871h160.234c0.211-3.206 0.413-6.442 0.413-9.725s-0.202-6.48-0.413-9.725h-160.234l-0.154-8.832c-1.277-69.216-9.619-135.322-24.826-196.435l-1.977-8.064 7.814-2.659c38.314-13.085 67.277-27.197 86.726-38.045-4.205-5.203-8.525-10.301-12.941-15.322-23.203 12.729-49.411 24.115-77.971 34.032l-8.851 3.043-2.736-8.957c-16.128-53.049-37.037-99.36-62.237-137.597-11.289-4.819-22.857-9.101-34.579-12.931 31.277 39.859 57.706 93.341 77.232 156.652l2.736 8.871-8.957 2.468c-55.632 15.36-116.88 23.846-182.074 25.277l-9.245 0.192v-213.908c-3.188-0.231-6.412-0.461-9.696-0.461s-6.489 0.231-9.715 0.461v213.917l-9.245-0.192c-65.002-1.421-126.24-9.994-182.026-25.421l-8.966-2.468 2.736-8.88c19.546-63.283 45.974-116.678 77.194-156.461-11.741 3.792-23.289 8.064-34.598 12.892-25.143 38.16-46.032 84.384-62.16 137.405l-2.755 8.995-8.842-3.091c-28.474-9.869-54.643-21.293-77.923-33.994-4.454 5.088-8.823 10.224-13.037 15.475 19.44 10.838 48.413 24.96 86.717 38.045l7.814 2.659-1.968 8.064c-15.188 61.075-23.549 127.181-24.845 196.435l-0.173 8.832h-160.176c-0.221 3.235-0.413 6.432-0.413 9.715s0.202 6.518 0.413 9.725h160.205l0.173 8.871c1.315 69.869 9.802 136.551 25.219 198.134l2.045 8.064-7.872 2.659c-37.872 12.922-66.682 26.851-86.054 37.584 4.205 5.212 8.544 10.301 12.979 15.322 23.059-12.499 49.075-23.808 77.395-33.6l8.842-3.052 2.717 8.909c16.080 52.397 36.816 98.131 61.728 135.936 11.309 4.781 22.857 9.101 34.608 12.892-30.989-39.437-57.216-92.294-76.685-154.886l-2.794-8.909 9.014-2.468c55.459-15.235 116.534-23.692 181.497-25.123l9.245-0.192v212.103c3.226 0.202 6.432 0.394 9.715 0.394s6.509-0.192 9.715-0.394v-212.103l9.245 0.192c64.762 1.421 125.808 9.917 181.459 25.277l8.976 2.468-2.774 8.909c-19.469 62.506-45.706 115.334-76.617 154.733 11.741-3.792 23.309-8.112 34.608-12.892 24.874-37.805 45.609-83.463 61.671-135.744l2.736-8.957 8.842 3.082c28.253 9.763 54.211 21.024 77.299 33.532 4.522-5.049 8.88-10.186 13.094-15.428-19.354-10.732-48.125-24.653-86.035-37.584l-7.863-2.659 2.016-8.064c15.417-61.574 23.904-128.256 25.2-198.125zM502.285 702.416l-8.851 0.202c-67.181 1.383-130.195 10.023-187.306 25.651l-8.889 2.468-2.246-8.909c-15.331-60.384-23.779-124.589-25.143-190.877l-0.173-9.216h232.608v180.682zM502.285 502.275h-232.608l0.173-9.216c1.373-65.664 9.677-129.293 24.691-189.149l2.246-8.909 8.889 2.429c57.254 15.783 120.423 24.471 187.766 25.814l8.851 0.231v178.8zM521.715 323.475l8.851-0.231c67.344-1.354 130.512-10.032 187.766-25.814l8.889-2.429 2.246 8.909c15.024 59.846 23.337 123.475 24.663 189.149l0.202 9.216h-232.608v-178.8zM729.008 721.828l-2.266 8.909-8.871-2.468c-57.111-15.629-120.125-24.269-187.306-25.661l-8.851-0.202v-180.682h232.608l-0.202 9.216c-1.363 66.326-9.802 130.579-25.114 190.886z"
                      fill="#7F8FA3" p-id="1476"></path>
                  </svg>
                  <a
                    className="text-white"
                    target="_blank"
                    rel="noopener"
                    href={`https://imfil.io/address/${votingData?.Address}`}
                  >
                    {EllipsisMiddle({ suffixCount: 4, children: votingData?.Address })}
                  </a>
                </div>
              </div>
            </div>
            <div className="MDEditor">
              <MDEditor
                className="border-none rounded-[16px] bg-transparent"
                style={{ height: 'auto' }}
                moreButton={true}
                value={votingData?.Descriptions}
                readOnly={true}
                view={{ menu: false, md: false, html: true, both: false, fullScreen: true, hideMenu: false }}
                onChange={() => {
                }}
              />
            </div>
            {
              votingData?.voteStatus === IN_PROGRESS_STATUS &&
              <div
                className=" !border-[#313D4F] mt-6 border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border border-solid">
                <div className="group flex h-[57px] !border-[#313D4F] justify-between items-center border-b px-4 pb-[12px] pt-3 border-solid">
                  <h4 className="text-xl">
                    Cast your vote
                  </h4>
                  <div className='text-base'>{totalPercentValue} %</div>
                </div>
                <div className="p-4 text-center">
                  {
                    options.map((item: any, index: number) => {

                      return (
                        <div className="mb-4 space-y-3 leading-10" key={item.name}>
                          <div
                            className="w-full h-[45px] !border-[#313D4F] flex justify-between items-center pl-4 md:border border-solid rounded-full">
                            <div className="text-ellipsis h-[100%] overflow-hidden">{item.name}</div>
                            <div className="w-[180px] h-[45px] flex items-center">
                              <div onClick={() => {
                                handleCountChange("decrease", index, item)
                              }}
                                className={`w-[35px] border-x border-solid !border-[#313D4F] text-white font-semibold ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>-
                              </div>
                              <InputNumber
                                disabled={item.disabled}
                                className="text-white bg-transparent focus:outline-none"
                                controls={false}
                                min={0}
                                max={countMax(options, item.count)}
                                precision={0}
                                value={item.count}
                                onChange={(value) => {
                                  handleOptionChange(index, Number(value))
                                }}
                              />
                              <div onClick={() => {
                                handleCountChange("increase", index, item)
                              }}
                                className={`w-[35px] border-x border-solid !border-[#313D4F] text-white font-semibold ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>+
                              </div>
                              <div className="w-[40px] text-center">%</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  <button onClick={startVoting}
                    className="w-full h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-6 rounded-full"
                    type="submit" disabled={loading}>
                    Vote
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="w-full lg:w-4/12 lg:min-w-[321px]">
          <div className="mt-4 space-y-4 lg:mt-0">
            <div
              className="text-base border-solid border-y border-skin-border bg-skin-block-bg md:rounded-xl md:border">
              <div
                className="group flex h-[57px] justify-between rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg">
                <h4 className="flex items-center text-xl">
                  <div>Message</div>
                </h4>
              </div>
              <div className="p-4 leading-6 sm:leading-8">
                <div className="space-y-1">
                  <div>
                    <b>Vote Type</b>
                    <span
                      className="float-right text-white">{["Single", "Multiple"][votingData?.VoteType - 1]} choice voting</span>
                  </div>
                  <div>
                    <b>Exp. Time</b>
                    <span className="float-right text-white">{new Date(votingData?.Time).toLocaleString()}</span>
                  </div>
                  <div>
                    <b>Snapshot</b>
                    <span className="float-right text-white">Takes at Exp. Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Vote
