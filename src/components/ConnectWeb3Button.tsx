import React, {useEffect} from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWeb3Button = () => {

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('chainChanged', handleAccountsChanged);

      return () => {
        window.ethereum.off('chainChanged', handleAccountsChanged);
      };
    }

  }, []);

  return (
    <div
      style={{
        color: "#fff",
        padding: "8px 8px",
        textAlign: "center",
        borderRadius: "8px",
      }}
      className="connect flex items-center sm:mx-4 "
    >
      {/*<ConnectButton.Custom>
        {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
          console.log(mounted);
          const ready = mounted;
          const connected =
            ready &&
            account &&
            chain
          return (
            <div
              className='flex items-center'
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      className='bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl'
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </button>
                  )
                }
                if (chain.unsupported) {
                  return (
                    <div className='flex items-center'>
                      <button
                        className='bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-xl'
                        onClick={openChainModal}
                      >
                        Wrong network
                      </button>
                    </div>
                  )
                }
                return (
                  <a>
                    <div
                      className="bg-sky-500 hover:bg-sky-700 cursor-pointer text-white py-2 px-4 rounded-xl"
                      onClick={openAccountModal}
                      style={{
                        fontSize: "16px",
                        display: "flex",
                        gap: 12,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      <Row gutter={[8, 8]}>
                        <Col>
                          <i className="iconfont icon-qianbao"></i>
                        </Col>
                        <Col>
                          {" "}
                          <span>
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ""}
                          </span>
                        </Col>
                      </Row>
                    </div>
                  </a>
                )
              })()}
              <div className='ml-4'>
                <img
                  className='h-[24px] w-[24px] cursor-pointer'
                  src="/images/net.svg"
                  alt="net"
                  onClick={() => {
                    !connected ? openConnectModal() : openChainModal()
                  }}
                />
              </div>
            </div>
          )
        }}
      </ConnectButton.Custom>*/}
      <ConnectButton showBalance={true} />
    </div>
  )
}

export default ConnectWeb3Button