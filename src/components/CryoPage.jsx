import React from 'react';
import StatusCard from './StatusCard';


function CryoPage(props) {

    const cryoResult = props.cryoResult;
    const atsmTemp = cryoResult ? cryoResult.atsm.temperature : 0;
    const cryoStatus = [[{id: "cryo-temp-main",
                          variant:"secondary",
                          text:`ATSM Temperature: ${atsmTemp}k`}]];

    return (
        <>
        <h1>Cryostat</h1>
        <StatusCard id="cryo-temp-main"
            title="Cryostat Temperature"
            statuses={cryoStatus}
        />
        </>
    )
}


export default CryoPage;