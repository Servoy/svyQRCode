import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ServoyApiTesting, ServoyPublicTestingModule } from '@servoy/public';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { SvyQRCodeGenerator } from './generator';

const qrToCanvas = vi.fn<(canvas: HTMLCanvasElement, text: string, opts: unknown) => Promise<void>>(() => Promise.resolve());

vi.mock('qrcode', () => ({
    default: {
        toCanvas: (canvas: HTMLCanvasElement, text: string, opts: unknown) => qrToCanvas(canvas, text, opts)
    }
}));

describe('SvyQRCodeGenerator', () => {
    let component: SvyQRCodeGenerator;
    let fixture: ComponentFixture<SvyQRCodeGenerator>;

    beforeEach(async () => {
        qrToCanvas.mockClear();
        qrToCanvas.mockResolvedValue(undefined);

        await TestBed.configureTestingModule({
            imports: [ServoyPublicTestingModule, SvyQRCodeGenerator],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyQRCodeGenerator);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('servoyApi', new ServoyApiTesting());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return a valid native element from getNativeElement()', () => {
        fixture.detectChanges();
        expect(component.getNativeElement()).not.toBeNull();
        expect(component.getNativeElement()).toBeInstanceOf(HTMLElement);
    });

    it('encodes the dataProviderID value onto the canvas with the configured options', () => {
        fixture.componentRef.setInput('dataProviderID', 'https://servoy.com');
        fixture.componentRef.setInput('qrSize', 128);
        fixture.componentRef.setInput('errorCorrectionLevel', 'H');
        fixture.componentRef.setInput('foregroundColor', '#111111');
        fixture.componentRef.setInput('backgroundColor', '#EEEEEE');
        fixture.componentRef.setInput('margin', 2);
        fixture.detectChanges();

        expect(qrToCanvas).toHaveBeenCalledTimes(1);
        const [, text, opts] = qrToCanvas.mock.calls[0];
        expect(text).toBe('https://servoy.com');
        expect(opts).toEqual({
            width: 128,
            errorCorrectionLevel: 'H',
            margin: 2,
            color: { dark: '#111111', light: '#EEEEEE' }
        });
    });

    it('does not render when there is no value', () => {
        fixture.detectChanges();
        expect(qrToCanvas).not.toHaveBeenCalled();
    });

    it('calls onError handler with a DOM event when encoding fails', async () => {
        qrToCanvas.mockReset();
        qrToCanvas.mockRejectedValue(new Error('too much data'));
        const errorHandler = vi.fn();
        fixture.componentRef.setInput('onError', errorHandler);

        fixture.componentRef.setInput('dataProviderID', 'x'.repeat(10000));
        fixture.detectChanges();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(errorHandler).toHaveBeenCalledTimes(1);
        expect(errorHandler.mock.calls[0][0]).toBeInstanceOf(Event);
        expect(errorHandler.mock.calls[0][1]).toBe('too much data');
    });

    it('getImageDataUrl returns a data url from the canvas', () => {
        fixture.detectChanges();
        const canvas = component.canvasRef()!.nativeElement;
        vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,AAAA');
        expect(component.getImageDataUrl()).toBe('data:image/png;base64,AAAA');
    });
});
