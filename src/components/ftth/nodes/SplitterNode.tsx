import BaseNode from "./BaseNode";

export default function SplitterNode({ data }: any) {
    return (
        <BaseNode
            title="Splitter"
            subtitle={data.modelo}
            power={data.power}
            status={data.status}
            inputs={1}
            outputs={8}
        />
    );
}