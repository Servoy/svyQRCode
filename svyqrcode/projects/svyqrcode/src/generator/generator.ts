import { ChangeDetectionStrategy, Component, ChangeDetectorRef, ElementRef, input, Renderer2, SimpleChanges, viewChild } from '@angular/core';
import { ServoyBaseComponent } from '@servoy/public';
import QRCode, { QRCodeErrorCorrectionLevel } from 'qrcode';

@Component({
    selector: 'svyqrcode-svyqrcodegenerator',
    templateUrl: './generator.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SvyQRCodeGenerator extends ServoyBaseComponent<HTMLDivElement> {

    readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

    readonly dataProviderID = input<string>(undefined as unknown as string);
    readonly qrSize = input(256);
    readonly errorCorrectionLevel = input<QRCodeErrorCorrectionLevel>('M');
    readonly foregroundColor = input('#000000');
    readonly backgroundColor = input('#FFFFFF');
    readonly margin = input(4);
    readonly onError = input<((e: Event, message: string) => void) | undefined>(undefined);

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
    }

    override svyOnInit() {
        super.svyOnInit();
        if (this.servoyApi.isInDesigner()) {
            const canvas = this.canvasRef()?.nativeElement;
            if (canvas && !this.dataProviderID()) {
                this.drawDesignerPlaceholder(canvas);
            }
        }
    }

    override svyOnChanges(changes: SimpleChanges) {
        super.svyOnChanges(changes);
        this.render();
    }

    private render() {
        const canvas = this.canvasRef()?.nativeElement;
        if (!canvas) {
            return;
        }
        const value = this.dataProviderID();
        if (!value) {
            if (this.servoyApi.isInDesigner()) {
                this.drawDesignerPlaceholder(canvas);
            } else {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
            return;
        }
        QRCode.toCanvas(canvas, value, {
            width: this.qrSize(),
            errorCorrectionLevel: this.errorCorrectionLevel(),
            margin: this.margin(),
            color: {
                dark: this.foregroundColor(),
                light: this.backgroundColor()
            }
        }).catch((err: Error) => {
            const handler = this.onError();
            if (handler) {
                handler(new Event('error'), err.message);
            }
        });
    }

    private drawDesignerPlaceholder(canvas: HTMLCanvasElement) {
        const dimension = this.qrSize() > 0 ? this.qrSize() : 256;
        canvas.width = dimension;
        canvas.height = dimension;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.fillStyle = this.backgroundColor();
        ctx.fillRect(0, 0, dimension, dimension);

        const cells = 9;
        const cell = dimension / cells;
        ctx.fillStyle = this.foregroundColor();
        for (let row = 0; row < cells; row++) {
            for (let col = 0; col < cells; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(col * cell, row * cell, cell, cell);
                }
            }
        }
    }

    getImageDataUrl(): string | null {
        const canvas = this.canvasRef()?.nativeElement;
        return canvas ? canvas.toDataURL('image/png') : null;
    }
}
