import BaseNode from "./BaseNode";

export default function CtoNode({ data }: any) {
    return (
        <BaseNode
            title="CTO"
            subtitle={data.modelo}
            power={data.power}
            status={data.status}
            inputs={1}
            outputs={16}
        />
    );
}