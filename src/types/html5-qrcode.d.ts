declare module 'html5-qrcode' {
  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: {
        fps: number;
        qrbox: number;
      },
      verbose: boolean
    );
    render: (
      successCallback: (decodedText: string) => void,
      errorCallback: (error: any) => void
    ) => void;
    clear: () => void;
  }
} 