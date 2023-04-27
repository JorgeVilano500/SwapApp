import React from 'react'

const PageButton = ({name, isBold}) => {
    return (
        <div className='btn'>
            <span className={isBold ? "pageButtonBold hoverBold" : "hoverBold"}>
                {name}
            </span>
        </div>
    )
}

export default PageButton; 