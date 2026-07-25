import BaseNode from "./BaseNode";

export default function OltNode({ data }: any) {
    return (
        <BaseNode
            title="OLT Huawei"
            subtitle={data.label}
            power={data.tx}
            status="ok"
            inputs={0}
            outputs={16}
        />
    );
}