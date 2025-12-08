type WebSocketMessageHandler = (message: any) => void

class WebSocketService {
    private socket: WebSocket | null = null
    private url: string
    private listeners: WebSocketMessageHandler[] = []
    private reconnectInterval: number = 3000
    private shouldReconnect: boolean = true

    constructor(url: string) {
        this.url = url
    }

    connect() {
        this.shouldReconnect = true
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
            console.log('WebSocket connected')
        }

        this.socket.onmessage = (event) => {
            const message = event.data
            this.listeners.forEach(listener => listener(message))
        }

        this.socket.onclose = () => {
            console.log('WebSocket disconnected')
            if (this.shouldReconnect) {
                setTimeout(() => this.connect(), this.reconnectInterval)
            }
        }

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error)
            this.socket?.close()
        }
    }

    disconnect() {
        this.shouldReconnect = false
        this.socket?.close()
    }

    addListener(listener: WebSocketMessageHandler) {
        this.listeners.push(listener)
    }

    removeListener(listener: WebSocketMessageHandler) {
        this.listeners = this.listeners.filter(l => l !== listener)
    }
}

// Create a singleton instance for logs
// In production, this URL should be dynamic based on environment
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const wsUrl = `${wsProtocol}//${window.location.hostname}:8000/ws/logs`

export const logWebSocket = new WebSocketService(wsUrl)
export default WebSocketService
