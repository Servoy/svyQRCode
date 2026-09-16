import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ServoyApiTesting, ServoyPublicTestingModule } from '@servoy/public';

import { SvyQRCodeScanner } from './scanner';

describe('SvyQRCodeScanner', () => {
    let component: SvyQRCodeScanner;
    let fixture: ComponentFixture<SvyQRCodeScanner>;

    beforeEach(async () => {
        Object.defineProperty(navigator, 'mediaDevices', {
            value: { getUserMedia: jasmine.createSpy('getUserMedia').and.returnValue(new Promise(() => { /* never resolves */ })) },
            configurable: true
        });

        await TestBed.configureTestingModule({
            declarations: [SvyQRCodeScanner],
            imports: [ServoyPublicTestingModule],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SvyQRCodeScanner);
        component = fixture.componentInstance;
        component.servoyApi = new ServoyApiTesting();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return a valid native element from getNativeElement()', () => {
        fixture.detectChanges();
        expect(component.getNativeElement()).not.toBeNull();
        expect(component.getNativeElement()).toBeInstanceOf(HTMLElement);
    });

    it('fireCodeDetected calls the handler and throttles by callbackMethodTimeout', () => {
        fixture.componentRef.setInput('callbackMethodTimeout', 1000);
        const detectedHandler = jasmine.createSpy('onCodeDetected');
        fixture.componentRef.setInput('onCodeDetected', detectedHandler);

        const jsEvent = new Event('click');
        spyOn<any>(component, 'createJSEvent').and.returnValue(jsEvent);

        const nowSpy = spyOn<any>(Date.prototype, 'getTime');

        nowSpy.and.returnValue(0);
        (component as any).fireCodeDetected('CODE');
        nowSpy.and.returnValue(500);
        (component as any).fireCodeDetected('CODE');
        nowSpy.and.returnValue(2000);
        (component as any).fireCodeDetected('CODE');

        expect(detectedHandler).toHaveBeenCalledTimes(2);
        expect(detectedHandler.calls.argsFor(0)[0]).toBe(jsEvent);
        expect(detectedHandler.calls.argsFor(0)[1]).toBe('CODE');
    });

    it('stops the camera tracks and cancels the animation frame on destroy', () => {
        const stop = jasmine.createSpy('stop');
        const track = { stop } as unknown as MediaStreamTrack;
        const stream = { getTracks: () => [track] } as unknown as MediaStream;
        const cancelSpy = spyOn(window, 'cancelAnimationFrame');

        const internal = component as unknown as { localStream: MediaStream | null; requestId: number | null };
        internal.localStream = stream;
        internal.requestId = 42;

        component.ngOnDestroy();

        expect(cancelSpy).toHaveBeenCalledWith(42);
        expect(stop).toHaveBeenCalledTimes(1);
    });
});
