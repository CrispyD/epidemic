export interface DataSet {
    label: string,
    channels: {
        [id:string]:Channel
    }
}

interface Channel {
    label:string
    value: number[] | Date[] | string[]
}