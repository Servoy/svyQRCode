import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ServoyApiTesting, ServoyPublicTestingModule } from '@servoy/public';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { SvyQRCodeScanner } from './scanner';

describe('SvyQRCodeScanner', () => {
    let component: SvyQRCodeScanner;
    let fixture: ComponentFixture<SvyQRCodeScanner>;

    beforeEach(async () => {
        Object.defineProperty(navigator, 'mediaDevices', {
            value: { getUserMedia: vi.fn(() => new Promise<MediaStream>(() => { /* never resolves in tests */ })) },
            configurable: true
        });

        await TestBed.configureTestingModule({
            imports: [ServoyPublicTestingModule, SvyQRCodeScanner],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyQRCodeScanner);
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

    it('does not start scanning when getUserMedia is unavailable', () => {
        const originalMediaDevices = navigator.mediaDevices;
        Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });

        expect(() => component.svyOnInit()).not.toThrow();

        Object.defineProperty(navigator, 'mediaDevices', { value: originalMediaDevices, configurable: true });
    });

    it('fireCodeDetected calls the handler and throttles by callbackMethodTimeout', () => {
        fixture.componentRef.setInput('callbackMethodTimeout', 1000);
        const detectedHandler = vi.fn();
        fixture.componentRef.setInput('onCodeDetected', detectedHandler);

        const jsEvent = new Event('click');
        vi.spyOn(component as unknown as { createJSEvent(): Event }, 'createJSEvent').mockReturnValue(jsEvent);

        const nowSpy = vi.spyOn(Date.prototype, 'getTime');

        nowSpy.mockReturnValue(0);
        (component as unknown as { fireCodeDetected(d: string): void }).fireCodeDetected('CODE');
        nowSpy.mockReturnValue(500);
        (component as unknown as { fireCodeDetected(d: string): void }).fireCodeDetected('CODE');
        nowSpy.mockReturnValue(2000);
        (component as unknown as { fireCodeDetected(d: string): void }).fireCodeDetected('CODE');

        expect(detectedHandler).toHaveBeenCalledTimes(2);
        expect(detectedHandler.mock.calls[0][0]).toBe(jsEvent);
        expect(detectedHandler.mock.calls[0][1]).toBe('CODE');
    });

    it('stops the camera tracks and cancels the animation frame on destroy', () => {
        const stop = vi.fn();
        const track = { stop } as unknown as MediaStreamTrack;
        const stream = { getTracks: () => [track] } as unknown as MediaStream;
        const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

        const internal = component as unknown as { localStream: MediaStream | null; requestId: number | null };
        internal.localStream = stream;
        internal.requestId = 42;

        component.ngOnDestroy();

        expect(cancelSpy).toHaveBeenCalledWith(42);
        expect(stop).toHaveBeenCalledTimes(1);
    });
});
