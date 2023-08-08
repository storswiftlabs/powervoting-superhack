import classNames from 'classnames';
import React, { useState } from "react";

export default function MyButton(props: any) {
  const { startCounting, handlerNavigate } = props
  const [buttonState, setButtonState] = useState(true);
  const [buttonText,setButtonText] = useState('Vote Counting');

  function handleClick() {
    if (buttonState) {
      setButtonText('View');
      setButtonState(false);
      startCounting();
    } else {
      setButtonState(true);
      handlerNavigate();
    }
  }

  return (
    <button
      className={classNames(
        buttonState
          ? 'border-[#52463a] bg-[#52463a]'
          : 'border-[#245534] bg-[#213A33] ',
        'px-8 py-3 rounded-xl border text-base text-white hover:opacity-80'
      )}
      onClick={handleClick}
    >
      {buttonText}
    </button>
  )
}
