
export interface SerialDevice {
  port: SerialPort;
  reader: ReadableStreamDefaultReader<string> | null;
  writer: WritableStreamDefaultWriter<string> | null;
  connected: boolean;
}

// Global declaration for Web Serial API types if not present in environment
declare global {
    interface Navigator {
        serial: {
            requestPort(options?: any): Promise<SerialPort>;
        };
    }
    interface SerialPort {
        open(options: { baudRate: number }): Promise<void>;
        close(): Promise<void>;
        readable: ReadableStream<Uint8Array>;
        writable: WritableStream<Uint8Array>;
    }
}

export class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private textDecoder: TextDecoderStream | null = null;
  private textEncoder: TextEncoderStream | null = null;
  private readableStreamClosed: Promise<void> | null = null;
  private writableStreamClosed: Promise<void> | null = null;

  public isConnected = false;
  private onDataCallback: ((data: string) => void) | null = null;

  constructor() {}

  async connect(onData: (data: string) => void): Promise<boolean> {
    if (!navigator.serial) {
      alert("Web Serial API not supported in this browser. Please use Chrome or Edge.");
      return false;
    }

    try {
      // Request user to select a port
      this.port = await navigator.serial.requestPort();
      
      // Open port - ESP32 usually uses 115200 baud
      await this.port!.open({ baudRate: 115200 });
      this.isConnected = true;
      this.onDataCallback = onData;

      // Setup Read Stream
      this.textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port!.readable.pipeTo(this.textDecoder.writable);
      this.reader = this.textDecoder.readable.getReader();

      // Setup Write Stream
      this.textEncoder = new TextEncoderStream();
      this.writableStreamClosed = this.textEncoder.readable.pipeTo(this.port!.writable);
      this.writer = this.textEncoder.writable.getWriter();

      // Start reading loop
      this.readLoop();
      
      return true;
    } catch (error) {
      console.error("Serial Connection Error:", error);
      return false;
    }
  }

  private async readLoop() {
    while (this.port?.readable && this.isConnected) {
      try {
        const { value, done } = await this.reader!.read();
        if (done) {
          // Reader has been canceled.
          break;
        }
        if (value && this.onDataCallback) {
          this.onDataCallback(value);
        }
      } catch (error) {
        console.error("Read Error:", error);
        break;
      }
    }
  }

  async sendCommand(command: string) {
    if (!this.writer || !this.isConnected) return;
    try {
        // Append newline as is standard for CLI interactions
        await this.writer.write(command + "\n");
    } catch (error) {
        console.error("Write Error:", error);
    }
  }

  async setWifi(ssid: string, pass: string) {
    // Assuming a standard CLI command structure for the device
    await this.sendCommand(`wifi_set "${ssid}" "${pass}"`);
  }
  
  async getDeviceInfo() {
      // Send command to request info, assume device responds to 'info' or 'status'
      await this.sendCommand("info");
  }

  async disconnect() {
    this.isConnected = false;

    try {
        // Close reader
        if (this.reader) {
            await this.reader.cancel();
            await this.readableStreamClosed?.catch(() => {});
        }
        
        // Close writer
        if (this.writer) {
            await this.writer.close();
            await this.writableStreamClosed;
        }

        // Close port
        if (this.port) {
            await this.port.close();
        }
    } catch (e) {
        console.error("Error closing serial port", e);
    }

    this.port = null;
    this.reader = null;
    this.writer = null;
  }
}

export const serialService = new SerialService();
