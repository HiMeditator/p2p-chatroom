export interface ChatLog {
    me: boolean,
    name?: string,
    peerID: string,
    contentID: string,
    content: string
}

export interface ChatData {
    name?: string,
    content: string
}