import type { DataConnection } from 'peerjs';

export interface DialogItem {
    me: boolean,
    name: string,
    peerID: string,
    contentID: string,
    content: string,
    time: string
}

export interface MessageItem {
    name: string,
    peerID: string,
    content: string,
    time: string,
    command: string,
    friendNodeList?: NodeItem[]
}

export interface ConnectionItem {
    name: string,
    id: string,
    selected: boolean,
    conn: DataConnection,
    online: boolean
}

export interface NodeItem {
    name: string,
    id: string
}