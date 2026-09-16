import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, inject, input, model, viewChild } from '@angular/core';
import { ServoyBaseComponent, ServoyPublicModule } from '@servoy/public';
import jsQR from 'jsqr';

@Component({
    selector: 'svyqrcode-svyqrcode',
    templateUrl: './scanner.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ServoyPublicModule]
})
export class SvyQRCodeScanner extends ServoyBaseComponent<HTMLDivElement> {

    readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

    readonly dataProviderID = model<string>(undefined as unknown as string);
    readonly showCodeFrame = input(true);
    readonly codeFrameColor = input('#FF3B58');
    readonly callbackMethodTimeout = input(1000);
    readonly onCodeDetected = input<((e: Event, code: string) => void) | undefined>(undefined);

    private readonly doc = inject(DOCUMENT);

    private video: HTMLVideoElement | null = null;
    private localStream: MediaStream | null = null;
    private requestId: number | null = null;
    private methodLastFired: number | null = null;

    override svyOnInit() {
        super.svyOnInit();
        if (this.servoyApi().isInDesigner()) {
            this.drawDesignerPlaceholder();
            return;
        }
        this.start();
    }

    override ngOnDestroy() {
        this.stop();
        super.ngOnDestroy();
    }

    private drawDesignerPlaceholder() {
        const canvas = this.canvasRef()?.nativeElement;
        if (!canvas) {
            return;
        }
        const dimension = 240;
        canvas.width = dimension;
        canvas.height = dimension;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, dimension, dimension);
        ctx.strokeStyle = this.codeFrameColor();
        ctx.lineWidth = 6;
        const inset = dimension * 0.2;
        ctx.strokeRect(inset, inset, dimension - inset * 2, dimension - inset * 2);
        canvas.hidden = false;
    }

    private start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return;
        }
        this.video = document.createElement('video');
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
            this.localStream = stream;
            if (!this.video) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            this.video.srcObject = stream;
            this.video.setAttribute('playsinline', 'true');
            void this.video.play();
            this.requestId = requestAnimationFrame(() => this.tick());
        }).catch(() => {
            // camera not available or permission denied
        });
    }

    private tick() {
        const canvasElement = this.canvasRef()?.nativeElement;
        const video = this.video;
        if (canvasElement && video && video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = canvasElement.getContext('2d');
            if (canvas) {
                canvasElement.hidden = false;
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;

                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert'
                });

                if (code) {
                    if (this.showCodeFrame()) {
                        const color = this.codeFrameColor();
                        this.drawLine(canvas, code.location.topLeftCorner, code.location.topRightCorner, color);
                        this.drawLine(canvas, code.location.topRightCorner, code.location.bottomRightCorner, color);
                        this.drawLine(canvas, code.location.bottomRightCorner, code.location.bottomLeftCorner, color);
                        this.drawLine(canvas, code.location.bottomLeftCorner, code.location.topLeftCorner, color);
                    }

                    const data = code.data;
                    if (data && this.dataProviderID() !== data) {
                        this.dataProviderID.set(data);
                        this.servoyApi().apply('dataProviderID', data);
                        this.fireCodeDetected(data);
                    }
                }
            }
        }
        this.requestId = requestAnimationFrame(() => this.tick());
    }

    private fireCodeDetected(data: string) {
        const handler = this.onCodeDetected();
        if (!handler) {
            return;
        }
        const timeout = this.callbackMethodTimeout() >= 0 ? this.callbackMethodTimeout() : 1000;
        const now = new Date().getTime();
        if (this.methodLastFired === null || (now - this.methodLastFired > timeout)) {
            handler(this.createJSEvent(), data);
            this.methodLastFired = now;
        }
    }

    private createJSEvent(): Event {
        const element = this.getNativeElement();
        const x = element.offsetLeft;
        const y = element.offsetTop;

        const event = this.doc.createEvent('MouseEvents');
        event.initMouseEvent('click', false, true, this.doc.defaultView ?? window, 1, x, y, x, y, false, false, false, false, 0, null);
        return event;
    }

    private drawLine(canvas: CanvasRenderingContext2D, begin: { x: number; y: number }, end: { x: number; y: number }, color: string) {
        canvas.beginPath();
        canvas.moveTo(begin.x, begin.y);
        canvas.lineTo(end.x, end.y);
        canvas.lineWidth = 4;
        canvas.strokeStyle = color;
        canvas.stroke();
    }

    private stop() {
        if (this.requestId !== null) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }
        this.video = null;
    }
}
