import React from "react";
import { Handle, Position } from "reactflow";


interface SplitterNodeProps {

    data: {

        label?: string;

        portasSaida?:
        2 |
        4 |
        8 |
        16 |
        32 |
        64;

        loss?: number;

    };

}



const SPLITTER_LOSS = {

    2: 3.5,
    4: 7.2,
    8: 10.5,
    16: 13.5,
    32: 17,
    64: 20.5,

};



export default function SplitterNode({
    data
}: SplitterNodeProps) {


    const ratio =
        data.portasSaida ?? 8;



    const loss =
        data.loss ??
        SPLITTER_LOSS[ratio];



    return (

        <div
            style={{

                width: 160,

                padding: 12,

                borderRadius: 10,

                background: "#111827",

                color: "#fff",

                border: "2px solid #22c55e",

                textAlign: "center"

            }}
        >


            <Handle
                type="target"
                position={Position.Left}
            />



            <strong>
                {data.label ?? "Splitter"}
            </strong>



            <div>

                1:{ratio}

            </div>



            <div>

                Loss:
                {" "}
                -{loss} dB

            </div>



            <Handle

                type="source"

                position={Position.Right}

            />


        </div>

    );

}
